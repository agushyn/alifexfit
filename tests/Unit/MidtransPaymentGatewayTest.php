<?php

namespace Tests\Unit;

use App\Models\Gym;
use App\Models\MembershipPlan;
use App\Models\MembershipRegistration;
use App\Services\Payments\DTO\CreatePaymentRequest;
use App\Services\Payments\MidtransPaymentGateway;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MidtransPaymentGatewayTest extends TestCase
{
    protected MidtransPaymentGateway $gateway;
    protected string $serverKey = 'SB-Mid-server-TESTKEY123';

    protected function setUp(): void
    {
        parent::setUp();

        Config::set('midtrans.server_key', $this->serverKey);
        Config::set('midtrans.client_key', 'SB-Mid-client-TESTKEY123');
        Config::set('midtrans.is_production', false);
        Config::set('midtrans.expiry_duration', 60);

        $this->gateway = new MidtransPaymentGateway();
    }

    public function test_verifies_valid_webhook_signature(): void
    {
        $orderId = 'EXF-JKT-101-ABCDEF';
        $statusCode = '200';
        $grossAmount = '350000.00';
        $signatureKey = hash('sha512', $orderId . $statusCode . $grossAmount . $this->serverKey);

        $payload = [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'signature_key' => $signatureKey,
        ];

        $this->assertTrue($this->gateway->verifyWebhookSignature($payload));
    }

    public function test_rejects_invalid_webhook_signature(): void
    {
        $payload = [
            'order_id' => 'EXF-JKT-101-ABCDEF',
            'status_code' => '200',
            'gross_amount' => '350000.00',
            'signature_key' => 'invalid-signature-hash-here',
        ];

        $this->assertFalse($this->gateway->verifyWebhookSignature($payload));
    }

    public function test_creates_qris_charge_successfully(): void
    {
        Http::fake([
            'https://api.sandbox.midtrans.com/v2/charge' => Http::response([
                'status_code' => '201',
                'status_message' => 'QRIS transaction is created',
                'transaction_id' => 'tx-mid-qris-001',
                'order_id' => 'EXF-JKT-1-QRIS01',
                'gross_amount' => '350000.00',
                'payment_type' => 'qris',
                'transaction_status' => 'pending',
                'qr_string' => '00020101021226590014ID.LINKAJA.WWW011893600911002231268302091234567895204581253033605802ID5910EXFITS GYM6007JAKARTA61051234562070703A016304ABCD',
                'actions' => [
                    [
                        'name' => 'generate-qr-code',
                        'method' => 'GET',
                        'url' => 'https://api.sandbox.midtrans.com/v2/qris/tx-mid-qris-001/qr-code',
                    ],
                ],
                'expiry_time' => now()->addMinutes(60)->format('Y-m-d H:i:s'),
            ], 200),
        ]);

        $reg = new MembershipRegistration([
            'id' => 1,
            'gym_id' => 1,
            'membership_plan_id' => 2,
            'registration_number' => 'REG-2026-0001',
        ]);

        $request = new CreatePaymentRequest(
            registration: $reg,
            orderId: 'EXF-JKT-1-QRIS01',
            paymentMethod: 'qris',
            paymentChannel: 'qris',
            amount: 350000.00,
            customerName: 'Budi Santoso',
            customerEmail: 'budi@example.com',
            customerPhone: '081234567890',
            itemName: 'Membership: Gold Plan'
        );

        $result = $this->gateway->createPayment($request);

        $this->assertTrue($result->success);
        $this->assertSame('pending', $result->status);
        $this->assertSame('EXF-JKT-1-QRIS01', $result->orderId);
        $this->assertSame('tx-mid-qris-001', $result->providerTransactionId);
        $this->assertStringContainsString('ID.LINKAJA', $result->qrString);
        $this->assertSame('https://api.sandbox.midtrans.com/v2/qris/tx-mid-qris-001/qr-code', $result->paymentUrl);
    }

    public function test_creates_va_charge_successfully(): void
    {
        Http::fake([
            'https://api.sandbox.midtrans.com/v2/charge' => Http::response([
                'status_code' => '201',
                'status_message' => 'Success, Bank Transfer transaction is created',
                'transaction_id' => 'tx-mid-va-002',
                'order_id' => 'EXF-JKT-1-VA01',
                'gross_amount' => '350000.00',
                'payment_type' => 'bank_transfer',
                'transaction_status' => 'pending',
                'va_numbers' => [
                    [
                        'bank' => 'bca',
                        'va_number' => '9101234567890123',
                    ],
                ],
                'expiry_time' => now()->addMinutes(60)->format('Y-m-d H:i:s'),
            ], 200),
        ]);

        $reg = new MembershipRegistration([
            'id' => 1,
            'gym_id' => 1,
            'membership_plan_id' => 2,
            'registration_number' => 'REG-2026-0001',
        ]);

        $request = new CreatePaymentRequest(
            registration: $reg,
            orderId: 'EXF-JKT-1-VA01',
            paymentMethod: 'bank_transfer',
            paymentChannel: 'bca',
            amount: 350000.00,
            customerName: 'Budi Santoso',
            customerEmail: 'budi@example.com',
            customerPhone: '081234567890',
            itemName: 'Membership: Gold Plan'
        );

        $result = $this->gateway->createPayment($request);

        $this->assertTrue($result->success);
        $this->assertSame('pending', $result->status);
        $this->assertSame('9101234567890123', $result->vaNumber);
        $this->assertSame('bca', $result->paymentChannel);
    }

    public function test_creates_mandiri_bill_successfully(): void
    {
        Http::fake([
            'https://api.sandbox.midtrans.com/v2/charge' => Http::response([
                'status_code' => '201',
                'status_message' => 'Success, Mandiri Bill transaction is created',
                'transaction_id' => 'tx-mid-mandiri-003',
                'order_id' => 'EXF-JKT-1-MANDIRI01',
                'gross_amount' => '350000.00',
                'payment_type' => 'echannel',
                'transaction_status' => 'pending',
                'bill_key' => '99912345678',
                'biller_code' => '70012',
                'expiry_time' => now()->addMinutes(60)->format('Y-m-d H:i:s'),
            ], 200),
        ]);

        $reg = new MembershipRegistration([
            'id' => 1,
            'gym_id' => 1,
            'membership_plan_id' => 2,
            'registration_number' => 'REG-2026-0001',
        ]);

        $request = new CreatePaymentRequest(
            registration: $reg,
            orderId: 'EXF-JKT-1-MANDIRI01',
            paymentMethod: 'echannel',
            paymentChannel: 'mandiri',
            amount: 350000.00,
            customerName: 'Budi Santoso',
            customerEmail: 'budi@example.com',
            customerPhone: '081234567890',
            itemName: 'Membership: Gold Plan'
        );

        $result = $this->gateway->createPayment($request);

        $this->assertTrue($result->success);
        $this->assertSame('pending', $result->status);
        $this->assertSame('99912345678', $result->billKey);
        $this->assertSame('70012', $result->billerCode);
        $this->assertSame('mandiri', $result->paymentChannel);
    }
}
