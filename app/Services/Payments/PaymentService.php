<?php

namespace App\Services\Payments;

use App\Models\MembershipRegistration;
use App\Models\Payment;
use App\Services\Audit\AuditService;
use App\Services\Memberships\MembershipActivationService;
use App\Services\Payments\DTO\CreatePaymentRequest;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    public function __construct(
        protected PaymentGatewayInterface $gateway,
        protected MembershipActivationService $activationService,
        protected AuditService $auditService
    ) {}

    /**
     * Get list of enabled payment channels.
     */
    public function getAvailableChannels(): array
    {
        return config('midtrans.enabled_channels', []);
    }

    /**
     * Create a new payment transaction for a membership registration.
     */
    public function createPaymentForRegistration(
        MembershipRegistration $registration,
        string $channelKey
    ): Payment {
        $channels = $this->getAvailableChannels();

        if (! isset($channels[$channelKey])) {
            throw ValidationException::withMessages([
                'payment_channel' => 'Metode pembayaran yang dipilih tidak valid atau belum tersedia.',
            ]);
        }

        $channelConfig = $channels[$channelKey];

        // Ensure registration is in valid state for payment
        if ($registration->is_paid || $registration->is_approved) {
            throw ValidationException::withMessages([
                'status' => 'Pendaftaran ini sudah dibayar dan aktif.',
            ]);
        }

        $plan = $registration->membershipPlan;
        if (! $plan || $plan->status !== 'active') {
            throw ValidationException::withMessages([
                'membership_plan_id' => 'Paket membership tidak aktif atau tidak ditemukan.',
            ]);
        }

        // Server-side authoritative price
        $amount = (float) $plan->price;

        // Reusable / unique order ID
        $orderId = sprintf(
            'EXF-%s-%d-%s',
            strtoupper(substr($registration->gym->code ?? 'GYM', 0, 4)),
            $registration->id,
            strtoupper(Str::random(6))
        );

        $expiryMinutes = (int) config('midtrans.expiry_duration', 60);

        $createRequest = new CreatePaymentRequest(
            registration: $registration,
            orderId: $orderId,
            paymentMethod: $channelConfig['method'],
            paymentChannel: $channelConfig['channel'],
            amount: $amount,
            customerName: $registration->full_name,
            customerEmail: $registration->email,
            customerPhone: $registration->phone,
            itemName: "Membership: {$plan->name} ({$registration->gym->name})",
            expiryMinutes: $expiryMinutes
        );

        // Call Gateway
        $result = $this->gateway->createPayment($createRequest);

        if (! $result->success && $result->status === 'failed') {
            throw ValidationException::withMessages([
                'payment' => $result->errorMessage ?? 'Gagal membuat sesi pembayaran. Silakan coba lagi atau pilih metode lain.',
            ]);
        }

        return DB::transaction(function () use ($registration, $channelConfig, $amount, $result, $orderId, $expiryMinutes) {
            $expiresAt = $result->expiresAt ?? now()->addMinutes($expiryMinutes);

            $payment = Payment::create([
                'gym_id' => $registration->gym_id,
                'membership_registration_id' => $registration->id,
                'order_id' => $orderId,
                'provider' => 'midtrans',
                'provider_transaction_id' => $result->providerTransactionId,
                'provider_reference' => $result->providerReference,
                'payment_method' => $channelConfig['method'],
                'payment_channel' => $channelConfig['channel'],
                'amount' => $amount,
                'currency' => 'IDR',
                'status' => $result->status,
                'payment_url' => $result->paymentUrl,
                'qr_string' => $result->qrString,
                'va_number' => $result->vaNumber,
                'bill_key' => $result->billKey,
                'biller_code' => $result->billerCode,
                'expires_at' => $expiresAt,
                'paid_at' => $result->paidAt,
                'raw_response' => $result->rawResponse,
            ]);

            $registration->update([
                'payment_status' => $result->status === 'paid' ? 'paid' : 'pending',
                'expires_at' => $expiresAt,
            ]);

            $this->auditService->log(
                action: 'payment.created',
                entityType: Payment::class,
                entityId: $payment->id,
                metadata: [
                    'order_id' => $payment->order_id,
                    'registration_number' => $registration->registration_number,
                    'channel' => $payment->payment_channel,
                    'amount' => $payment->amount,
                ],
                gymId: $registration->gym_id
            );

            // If immediately paid, activate
            if ($result->status === 'paid') {
                $this->activationService->activateRegistration($registration);
            }

            return $payment->fresh(['registration.membershipPlan', 'gym']);
        });
    }

    /**
     * Check payment status against provider and update records.
     */
    public function checkPaymentStatus(Payment $payment): Payment
    {
        if ($payment->is_paid) {
            return $payment;
        }

        $result = $this->gateway->getPaymentStatus($payment);

        return DB::transaction(function () use ($payment, $result) {
            /** @var Payment $lockedPayment */
            $lockedPayment = Payment::withoutGymScope()
                ->where('id', $payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($result->status === 'paid' && ! $lockedPayment->is_paid) {
                $lockedPayment->update([
                    'status' => 'paid',
                    'provider_transaction_id' => $result->providerTransactionId ?? $lockedPayment->provider_transaction_id,
                    'paid_at' => $result->paidAt ?? now(),
                    'raw_response' => $result->rawResponse,
                ]);

                $lockedPayment->registration->update([
                    'payment_status' => 'paid',
                ]);

                $this->activationService->activateRegistration($lockedPayment->registration);
            } elseif ($result->status === 'expired' && ! $lockedPayment->is_paid) {
                $lockedPayment->update([
                    'status' => 'expired',
                    'raw_response' => $result->rawResponse,
                ]);

                $lockedPayment->registration->update([
                    'payment_status' => 'expired',
                ]);
            } elseif (in_array($result->status, ['failed', 'cancelled'], true) && ! $lockedPayment->is_paid) {
                $lockedPayment->update([
                    'status' => $result->status,
                    'raw_response' => $result->rawResponse,
                ]);
            }

            return $lockedPayment->fresh(['registration.membershipPlan', 'gym']);
        });
    }

    /**
     * Process incoming webhook notification from Midtrans.
     */
    public function handleWebhookNotification(array $payload): Payment
    {
        Log::info('Midtrans Webhook Received', ['order_id' => $payload['order_id'] ?? null]);

        // 1. Signature Verification
        if (! $this->gateway->verifyWebhookSignature($payload)) {
            Log::warning('Midtrans Webhook Signature Failed', ['payload' => $payload]);
            throw new \InvalidArgumentException('Invalid Midtrans notification signature.');
        }

        $result = $this->gateway->parseWebhookNotification($payload);

        return DB::transaction(function () use ($result, $payload) {
            /** @var Payment $payment */
            $payment = Payment::withoutGymScope()
                ->where('order_id', $result->orderId)
                ->lockForUpdate()
                ->first();

            if (! $payment) {
                Log::warning('Midtrans Webhook: Payment not found for order_id', ['order_id' => $result->orderId]);
                throw new \RuntimeException("Payment not found for order #{$result->orderId}");
            }

            // 2. Amount Verification
            if ($result->grossAmount !== null && abs($payment->amount - $result->grossAmount) > 0.01) {
                Log::error('Midtrans Webhook Amount Mismatch', [
                    'order_id' => $payment->order_id,
                    'expected' => $payment->amount,
                    'received' => $result->grossAmount,
                ]);
                $payment->update([
                    'raw_response' => array_merge($payload, ['_error' => 'Amount mismatch']),
                ]);
                throw new \RuntimeException('Payment gross amount does not match expected order amount.');
            }

            // 3. Process Status Change
            if ($result->status === 'paid') {
                if ($payment->status !== 'paid') {
                    $payment->update([
                        'status' => 'paid',
                        'provider_transaction_id' => $result->providerTransactionId ?? $payment->provider_transaction_id,
                        'provider_reference' => $result->providerReference,
                        'paid_at' => $result->paidAt ?? now(),
                        'raw_response' => $payload,
                    ]);

                    $payment->registration->update([
                        'payment_status' => 'paid',
                    ]);

                    $this->auditService->log(
                        action: 'payment.paid',
                        entityType: Payment::class,
                        entityId: $payment->id,
                        metadata: [
                            'order_id' => $payment->order_id,
                            'registration_number' => $payment->registration->registration_number,
                            'amount' => $payment->amount,
                        ],
                        gymId: $payment->gym_id
                    );
                }

                // Automatic Member Activation (Idempotent)
                $this->activationService->activateRegistration($payment->registration);
            } elseif ($result->status === 'expired') {
                if ($payment->status !== 'paid') {
                    $payment->update([
                        'status' => 'expired',
                        'raw_response' => $payload,
                    ]);

                    $payment->registration->update([
                        'payment_status' => 'expired',
                    ]);
                }
            } elseif (in_array($result->status, ['failed', 'cancelled'], true)) {
                if ($payment->status !== 'paid') {
                    $payment->update([
                        'status' => $result->status,
                        'raw_response' => $payload,
                    ]);

                    $payment->registration->update([
                        'payment_status' => $result->status,
                    ]);
                }
            }

            return $payment->fresh(['registration.membershipPlan', 'gym']);
        });
    }
}
