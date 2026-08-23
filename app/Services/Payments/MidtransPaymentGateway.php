<?php

namespace App\Services\Payments;

use App\Models\Payment;
use App\Services\Payments\DTO\CreatePaymentRequest;
use App\Services\Payments\DTO\PaymentResult;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MidtransPaymentGateway implements PaymentGatewayInterface
{
    protected string $serverKey;
    protected string $clientKey;
    protected string $merchantId;
    protected bool $isProduction;
    protected string $baseUrl;
    protected int $defaultExpiryMinutes;

    public function __construct()
    {
        $this->serverKey = (string) config('midtrans.server_key', '');
        $this->clientKey = (string) config('midtrans.client_key', '');
        $this->merchantId = (string) config('midtrans.merchant_id', '');
        $this->isProduction = (bool) config('midtrans.is_production', false);
        $this->defaultExpiryMinutes = (int) config('midtrans.expiry_duration', 60);

        $this->baseUrl = $this->isProduction
            ? 'https://api.midtrans.com/v2'
            : 'https://api.sandbox.midtrans.com/v2';
    }

    /**
     * Create a charge or payment transaction with Midtrans Core API.
     */
    public function createPayment(CreatePaymentRequest $request): PaymentResult
    {
        $payload = $this->buildChargePayload($request);

        try {
            $response = Http::withBasicAuth($this->serverKey, '')
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])
                ->timeout(15)
                ->post("{$this->baseUrl}/charge", $payload);

            $data = $response->json() ?? [];

            if ($response->failed() || empty($data['status_code']) || ! in_array($data['status_code'], ['200', '201'], true)) {
                $errorMsg = $data['status_message'] ?? 'Midtrans charge creation failed.';
                Log::error('Midtrans Charge Failed', [
                    'order_id' => $request->orderId,
                    'status_code' => $response->status(),
                    'response' => $data,
                ]);

                return new PaymentResult(
                    success: false,
                    status: 'failed',
                    orderId: $request->orderId,
                    errorMessage: $errorMsg,
                    rawResponse: $data
                );
            }

            return $this->parseMidtransResponse($data, $request->orderId);
        } catch (\Throwable $e) {
            Log::error('Midtrans Charge Exception', [
                'order_id' => $request->orderId,
                'error' => $e->getMessage(),
            ]);

            return new PaymentResult(
                success: false,
                status: 'failed',
                orderId: $request->orderId,
                errorMessage: $e->getMessage(),
                rawResponse: []
            );
        }
    }

    /**
     * Query Midtrans for latest transaction status.
     */
    public function getPaymentStatus(Payment $payment): PaymentResult
    {
        try {
            $response = Http::withBasicAuth($this->serverKey, '')
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])
                ->timeout(10)
                ->get("{$this->baseUrl}/{$payment->order_id}/status");

            $data = $response->json() ?? [];

            if ($response->failed() || empty($data['status_code'])) {
                return new PaymentResult(
                    success: false,
                    status: $payment->status,
                    orderId: $payment->order_id,
                    errorMessage: $data['status_message'] ?? 'Status check query failed.',
                    rawResponse: $data
                );
            }

            return $this->parseMidtransResponse($data, $payment->order_id);
        } catch (\Throwable $e) {
            Log::error('Midtrans Status Query Exception', [
                'order_id' => $payment->order_id,
                'error' => $e->getMessage(),
            ]);

            return new PaymentResult(
                success: false,
                status: $payment->status,
                orderId: $payment->order_id,
                errorMessage: $e->getMessage(),
                rawResponse: []
            );
        }
    }

    /**
     * Verify incoming webhook notification signature and authenticity.
     */
    public function verifyWebhookSignature(array $payload): bool
    {
        $orderId = $payload['order_id'] ?? null;
        $statusCode = $payload['status_code'] ?? null;
        $grossAmount = $payload['gross_amount'] ?? null;
        $signatureKey = $payload['signature_key'] ?? null;

        if (! $orderId || ! $statusCode || ! $grossAmount || ! $signatureKey) {
            return false;
        }

        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $this->serverKey);

        return hash_equals($expectedSignature, (string) $signatureKey);
    }

    /**
     * Parse webhook notification payload into normalized PaymentResult.
     */
    public function parseWebhookNotification(array $payload): PaymentResult
    {
        $orderId = $payload['order_id'] ?? '';
        return $this->parseMidtransResponse($payload, $orderId);
    }

    /**
     * Build standard Midtrans charge request payload based on selected channel.
     */
    protected function buildChargePayload(CreatePaymentRequest $request): array
    {
        $expiryMinutes = $request->expiryMinutes > 0 ? $request->expiryMinutes : $this->defaultExpiryMinutes;

        $payload = [
            'transaction_details' => [
                'order_id' => $request->orderId,
                'gross_amount' => (int) round($request->amount),
            ],
            'item_details' => [
                [
                    'id' => (string) $request->registration->membership_plan_id,
                    'price' => (int) round($request->amount),
                    'quantity' => 1,
                    'name' => substr($request->itemName, 0, 50),
                ],
            ],
            'customer_details' => [
                'first_name' => substr($request->customerName, 0, 50),
                'email' => $request->customerEmail,
                'phone' => $request->customerPhone,
            ],
            'custom_expiry' => [
                'expiry_duration' => $expiryMinutes,
                'unit' => 'minute',
            ],
        ];

        $channel = strtolower(trim($request->paymentChannel));

        if ($channel === 'qris') {
            $payload['payment_type'] = 'qris';
            $payload['qris'] = [
                'acquirer' => 'gopay',
            ];
        } elseif ($channel === 'mandiri' || $request->paymentMethod === 'echannel') {
            $payload['payment_type'] = 'echannel';
            $payload['echannel'] = [
                'bill_info1' => 'Registration #:',
                'bill_info2' => substr($request->registration->registration_number, 0, 30),
            ];
        } else {
            // Virtual Account Bank Transfer
            $payload['payment_type'] = 'bank_transfer';
            $payload['bank_transfer'] = [
                'bank' => $channel, // bca, bni, bri, permata, cimb
            ];
        }

        return $payload;
    }

    /**
     * Normalize Midtrans response structure into PaymentResult.
     */
    protected function parseMidtransResponse(array $data, string $orderId): PaymentResult
    {
        $transactionStatus = $data['transaction_status'] ?? 'pending';
        $fraudStatus = $data['fraud_status'] ?? 'accept';
        $paymentType = $data['payment_type'] ?? null;
        $transactionId = $data['transaction_id'] ?? null;
        $grossAmount = isset($data['gross_amount']) ? (float) $data['gross_amount'] : null;

        // Extract QRIS string or URL
        $qrString = $data['qr_string'] ?? null;
        $paymentUrl = null;

        if (isset($data['actions']) && is_array($data['actions'])) {
            foreach ($data['actions'] as $action) {
                if (($action['name'] ?? '') === 'generate-qr-code') {
                    $paymentUrl = $action['url'] ?? null;
                }
            }
        }

        // Extract VA number
        $vaNumber = null;
        $paymentChannel = $paymentType;

        if (isset($data['va_numbers']) && is_array($data['va_numbers']) && ! empty($data['va_numbers'][0])) {
            $vaNumber = $data['va_numbers'][0]['va_number'] ?? null;
            $paymentChannel = $data['va_numbers'][0]['bank'] ?? $paymentType;
        } elseif (isset($data['permata_va_number'])) {
            $vaNumber = $data['permata_va_number'];
            $paymentChannel = 'permata';
        }

        // Extract Mandiri Bill Key
        $billKey = $data['bill_key'] ?? null;
        $billerCode = $data['biller_code'] ?? null;
        if ($billKey) {
            $paymentChannel = 'mandiri';
        }

        // Expiry time
        $expiresAt = null;
        if (! empty($data['expiry_time'])) {
            try {
                $expiresAt = Carbon::parse($data['expiry_time']);
            } catch (\Throwable) {
                $expiresAt = null;
            }
        }

        // Settlement / Paid time
        $paidAt = null;
        if (! empty($data['settlement_time'])) {
            try {
                $paidAt = Carbon::parse($data['settlement_time']);
            } catch (\Throwable) {
                $paidAt = now();
            }
        }

        // Map status
        $status = $this->mapMidtransStatus($transactionStatus, $fraudStatus);
        if ($status === 'paid' && ! $paidAt) {
            $paidAt = now();
        }

        return new PaymentResult(
            success: in_array($status, ['pending', 'paid'], true),
            status: $status,
            orderId: $orderId,
            providerTransactionId: $transactionId,
            providerReference: $transactionStatus,
            paymentMethod: $paymentType,
            paymentChannel: $paymentChannel,
            grossAmount: $grossAmount,
            paymentUrl: $paymentUrl,
            qrString: $qrString,
            vaNumber: $vaNumber,
            billKey: $billKey,
            billerCode: $billerCode,
            expiresAt: $expiresAt,
            paidAt: $paidAt,
            errorMessage: null,
            rawResponse: $data
        );
    }

    /**
     * Map Midtrans transaction_status to EXFIT standard payment status.
     */
    protected function mapMidtransStatus(string $transactionStatus, string $fraudStatus = 'accept'): string
    {
        if ($transactionStatus === 'capture') {
            return $fraudStatus === 'accept' ? 'paid' : 'pending';
        }

        if ($transactionStatus === 'settlement') {
            return 'paid';
        }

        if ($transactionStatus === 'pending') {
            return 'pending';
        }

        if (in_array($transactionStatus, ['deny', 'cancel'], true)) {
            return 'cancelled';
        }

        if ($transactionStatus === 'expire') {
            return 'expired';
        }

        if (in_array($transactionStatus, ['refund', 'partial_refund'], true)) {
            return 'refunded';
        }

        return 'pending';
    }
}
