<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipPlan;
use App\Models\MembershipRegistration;
use App\Models\Payment;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class PaymentWebhookTest extends TestCase
{
    use RefreshDatabase;

    protected Gym $gym;
    protected User $admin;
    protected MembershipPlan $plan;
    protected MembershipRegistration $registration;
    protected Payment $payment;
    protected string $serverKey = 'SB-Mid-server-TESTKEY123';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        Config::set('midtrans.server_key', $this->serverKey);
        Config::set('midtrans.is_production', false);

        $this->gym = Gym::where('code', 'EXF-JKT-01')->firstOrFail();
        $this->admin = User::where('email', 'admin.flagship@exfits.com')->firstOrFail();

        $this->plan = MembershipPlan::withoutGymScope()
            ->where('gym_id', $this->gym->id)
            ->where('status', 'active')
            ->firstOrFail();

        $this->registration = MembershipRegistration::create([
            'gym_id' => $this->gym->id,
            'membership_plan_id' => $this->plan->id,
            'registration_number' => 'REG-2026-WH01',
            'source' => 'website',
            'status' => 'pending',
            'payment_status' => 'pending',
            'full_name' => 'Faisal Rahman',
            'email' => 'faisal.rahman@test.com',
            'phone' => '081255556666',
            'address' => 'Jl. Tebet Raya No. 10',
        ]);

        $this->payment = Payment::create([
            'gym_id' => $this->gym->id,
            'membership_registration_id' => $this->registration->id,
            'order_id' => 'EXF-JKT-1-ORDER01',
            'provider' => 'midtrans',
            'provider_transaction_id' => 'tx-mid-001',
            'payment_method' => 'qris',
            'payment_channel' => 'qris',
            'amount' => (float) $this->plan->price,
            'currency' => 'IDR',
            'status' => 'pending',
            'expires_at' => now()->addMinutes(60),
        ]);
    }

    public function test_valid_settlement_notification_activates_member_and_membership(): void
    {
        $orderId = $this->payment->order_id;
        $statusCode = '200';
        $grossAmount = number_format((float) $this->plan->price, 2, '.', '');
        $signatureKey = hash('sha512', $orderId . $statusCode . $grossAmount . $this->serverKey);

        $payload = [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'transaction_status' => 'settlement',
            'payment_type' => 'qris',
            'transaction_id' => 'tx-mid-001',
            'signature_key' => $signatureKey,
            'settlement_time' => now()->format('Y-m-d H:i:s'),
        ];

        $response = $this->postJson(route('api.payments.midtrans.notification'), $payload);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'message' => 'Notification processed successfully.',
            'status' => 'paid',
        ]);

        // Verify Payment is marked paid
        $this->payment->refresh();
        $this->assertSame('paid', $this->payment->status);
        $this->assertNotNull($this->payment->paid_at);

        // Verify Registration is approved and paid
        $this->registration->refresh();
        $this->assertSame('approved', $this->registration->status);
        $this->assertSame('paid', $this->registration->payment_status);
        $this->assertNotNull($this->registration->member_id);
        $this->assertNotNull($this->registration->membership_id);

        // Verify Member created
        $member = Member::withoutGymScope()->find($this->registration->member_id);
        $this->assertNotNull($member);
        $this->assertSame('Faisal Rahman', $member->full_name);
        $this->assertSame('faisal.rahman@test.com', $member->email);
        $this->assertSame('active', $member->status);
        $this->assertStringStartsWith('MEM-', $member->member_number);

        // Verify Membership created
        $membership = Membership::withoutGymScope()->find($this->registration->membership_id);
        $this->assertNotNull($membership);
        $this->assertSame($member->id, $membership->member_id);
        $this->assertSame('active', $membership->status);
        $this->assertSame('paid', $membership->payment_status);
        $this->assertEquals((float) $this->plan->price, (float) $membership->price);
        $this->assertSame($this->plan->trainer_quota, $membership->trainer_quota_total);

        // Verify Flutter Member App Authentication works
        $loginResponse = $this->postJson(route('api.member.login'), [
            'identifier' => $member->member_number,
            'password' => 'password',
        ]);

        $loginResponse->assertOk();
        $loginResponse->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'token',
                'member' => ['id', 'member_number', 'full_name', 'email'],
            ],
        ]);
    }

    public function test_duplicate_notification_is_idempotent(): void
    {
        $orderId = $this->payment->order_id;
        $statusCode = '200';
        $grossAmount = number_format((float) $this->plan->price, 2, '.', '');
        $signatureKey = hash('sha512', $orderId . $statusCode . $grossAmount . $this->serverKey);

        $payload = [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'transaction_status' => 'settlement',
            'payment_type' => 'qris',
            'transaction_id' => 'tx-mid-001',
            'signature_key' => $signatureKey,
        ];

        // 1st notification
        $res1 = $this->postJson(route('api.payments.midtrans.notification'), $payload);
        $res1->assertOk();

        $memberCount1 = Member::withoutGymScope()->where('gym_id', $this->gym->id)->count();
        $membershipCount1 = Membership::withoutGymScope()->where('gym_id', $this->gym->id)->count();

        // 2nd duplicate notification
        $res2 = $this->postJson(route('api.payments.midtrans.notification'), $payload);
        $res2->assertOk();

        $memberCount2 = Member::withoutGymScope()->where('gym_id', $this->gym->id)->count();
        $membershipCount2 = Membership::withoutGymScope()->where('gym_id', $this->gym->id)->count();

        // Assert no duplicate member or membership created
        $this->assertSame($memberCount1, $memberCount2);
        $this->assertSame($membershipCount1, $membershipCount2);
    }

    public function test_invalid_signature_is_rejected(): void
    {
        $payload = [
            'order_id' => $this->payment->order_id,
            'status_code' => '200',
            'gross_amount' => '350000.00',
            'transaction_status' => 'settlement',
            'signature_key' => 'invalid-tampered-signature',
        ];

        $response = $this->postJson(route('api.payments.midtrans.notification'), $payload);

        $response->assertStatus(400);
        $response->assertJson([
            'success' => false,
            'message' => 'Invalid Midtrans notification signature.',
        ]);
    }

    public function test_amount_mismatch_is_rejected(): void
    {
        $orderId = $this->payment->order_id;
        $statusCode = '200';
        $tamperedAmount = '1000.00'; // Tampered amount
        $signatureKey = hash('sha512', $orderId . $statusCode . $tamperedAmount . $this->serverKey);

        $payload = [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $tamperedAmount,
            'transaction_status' => 'settlement',
            'signature_key' => $signatureKey,
        ];

        $response = $this->postJson(route('api.payments.midtrans.notification'), $payload);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'message' => 'Payment gross amount does not match expected order amount.',
        ]);
    }

    public function test_expired_notification_updates_status(): void
    {
        $orderId = $this->payment->order_id;
        $statusCode = '202';
        $grossAmount = number_format((float) $this->plan->price, 2, '.', '');
        $signatureKey = hash('sha512', $orderId . $statusCode . $grossAmount . $this->serverKey);

        $payload = [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'transaction_status' => 'expire',
            'signature_key' => $signatureKey,
        ];

        $response = $this->postJson(route('api.payments.midtrans.notification'), $payload);

        $response->assertOk();

        $this->payment->refresh();
        $this->assertSame('expired', $this->payment->status);

        $this->registration->refresh();
        $this->assertSame('expired', $this->registration->payment_status);
    }

    public function test_admin_can_retry_activation_for_paid_registration(): void
    {
        // Setup registration with paid payment but missing member (simulating unexpected recovery state)
        $this->payment->update(['status' => 'paid', 'paid_at' => now()]);
        $this->registration->update(['payment_status' => 'paid', 'status' => 'pending']);

        $response = $this->actingAs($this->admin)
            ->post(route('admin.membership-registrations.retry-activation', $this->registration->id));

        $response->assertRedirect(route('admin.membership-registrations.show', $this->registration->id));
        $response->assertSessionHas('success');

        $this->registration->refresh();
        $this->assertSame('approved', $this->registration->status);
        $this->assertNotNull($this->registration->member_id);
    }
}
