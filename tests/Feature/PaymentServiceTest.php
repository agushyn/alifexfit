<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\MembershipPlan;
use App\Models\MembershipRegistration;
use App\Models\Payment;
use App\Services\Payments\PaymentService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PaymentServiceTest extends TestCase
{
    use RefreshDatabase;

    protected Gym $gym;
    protected MembershipPlan $plan;
    protected MembershipRegistration $registration;
    protected PaymentService $paymentService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->gym = Gym::where('code', 'EXF-JKT-01')->firstOrFail();
        $this->plan = MembershipPlan::withoutGymScope()
            ->where('gym_id', $this->gym->id)
            ->where('status', 'active')
            ->firstOrFail();

        $this->registration = MembershipRegistration::create([
            'gym_id' => $this->gym->id,
            'membership_plan_id' => $this->plan->id,
            'registration_number' => 'REG-2026-TEST01',
            'source' => 'website',
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'full_name' => 'Dimas Anggara',
            'email' => 'dimas@example.com',
            'phone' => '081298765432',
            'address' => 'Jl. Kemang Raya No. 45',
        ]);

        $this->paymentService = app(PaymentService::class);
    }

    public function test_retrieves_available_payment_channels(): void
    {
        $channels = $this->paymentService->getAvailableChannels();

        $this->assertIsArray($channels);
        $this->assertArrayHasKey('qris', $channels);
        $this->assertArrayHasKey('bca_va', $channels);
        $this->assertArrayHasKey('mandiri_bill', $channels);
    }

    public function test_creates_payment_record_with_db_authoritative_price(): void
    {
        Http::fake([
            'https://api.sandbox.midtrans.com/v2/charge' => Http::response([
                'status_code' => '201',
                'status_message' => 'QRIS transaction is created',
                'transaction_id' => 'tx-mid-12345',
                'order_id' => 'EXF-JKT-1-123456',
                'gross_amount' => (string) $this->plan->price,
                'payment_type' => 'qris',
                'transaction_status' => 'pending',
                'qr_string' => '00020101021226590014ID.LINKAJA...',
                'actions' => [
                    [
                        'name' => 'generate-qr-code',
                        'method' => 'GET',
                        'url' => 'https://api.sandbox.midtrans.com/v2/qris/tx-mid-12345/qr-code',
                    ],
                ],
                'expiry_time' => now()->addMinutes(60)->format('Y-m-d H:i:s'),
            ], 200),
        ]);

        $payment = $this->paymentService->createPaymentForRegistration(
            registration: $this->registration,
            channelKey: 'qris'
        );

        $this->assertInstanceOf(Payment::class, $payment);
        $this->assertSame($this->gym->id, $payment->gym_id);
        $this->assertSame($this->registration->id, $payment->membership_registration_id);
        $this->assertEquals((float) $this->plan->price, (float) $payment->amount);
        $this->assertSame('qris', $payment->payment_channel);
        $this->assertSame('pending', $payment->status);
        $this->assertNotNull($payment->qr_string);

        $this->registration->refresh();
        $this->assertSame('pending', $this->registration->payment_status);
        $this->assertNotNull($this->registration->expires_at);
    }

    public function test_cannot_create_payment_for_already_paid_registration(): void
    {
        $this->registration->update([
            'payment_status' => 'paid',
            'status' => 'approved',
        ]);

        $this->expectException(\Illuminate\Validation\ValidationException::class);

        $this->paymentService->createPaymentForRegistration(
            registration: $this->registration,
            channelKey: 'qris'
        );
    }
}
