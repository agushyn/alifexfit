<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\MembershipPlan;
use App\Models\MembershipRegistration;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class OnlineMembershipRegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected Gym $flagshipGym;
    protected Gym $surabayaGym;
    protected User $flagshipAdmin;
    protected User $surabayaAdmin;
    protected MembershipPlan $plan;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->flagshipGym = Gym::where('code', 'EXF-JKT-01')->firstOrFail();
        $this->surabayaGym = Gym::where('code', 'EXF-SBY-02')->firstOrFail();

        $this->flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->firstOrFail();
        $this->surabayaAdmin = User::where('email', 'admin.surabaya@exfits.com')->firstOrFail();

        $this->plan = MembershipPlan::withoutGymScope()
            ->where('gym_id', $this->flagshipGym->id)
            ->where('status', 'active')
            ->firstOrFail();
    }

    public function test_ktp_is_mandatory_for_online_registration(): void
    {
        $response = $this->post(route('public.membership.register.store', ['gym' => $this->flagshipGym->slug]), [
            'membership_plan_id' => $this->plan->id,
            'full_name' => 'Budi No KTP',
            'email' => 'budi.noktp@test.com',
            'phone' => '081299990001',
            'address' => 'Jl. Kebon Jeruk No. 12',
            // Missing ktp
        ]);

        $response->assertSessionHasErrors('ktp');
    }

    public function test_invalid_ktp_mime_is_rejected(): void
    {
        $response = $this->post(route('public.membership.register.store', ['gym' => $this->flagshipGym->slug]), [
            'membership_plan_id' => $this->plan->id,
            'full_name' => 'Budi Fake KTP',
            'email' => 'budi.fakektp@test.com',
            'phone' => '081299990002',
            'address' => 'Jl. Kebon Jeruk No. 12',
            'ktp' => UploadedFile::fake()->create('malicious.exe', 100, 'application/x-msdownload'),
        ]);

        $response->assertSessionHasErrors('ktp');
    }

    public function test_oversized_ktp_is_rejected(): void
    {
        $response = $this->post(route('public.membership.register.store', ['gym' => $this->flagshipGym->slug]), [
            'membership_plan_id' => $this->plan->id,
            'full_name' => 'Budi Big KTP',
            'email' => 'budi.bigktp@test.com',
            'phone' => '081299990003',
            'address' => 'Jl. Kebon Jeruk No. 12',
            'ktp' => UploadedFile::fake()->create('huge.jpg', 6000, 'image/jpeg'), // > 5MB
        ]);

        $response->assertSessionHasErrors('ktp');
    }

    public function test_successful_online_registration_stores_ktp_privately_and_redirects_to_payment(): void
    {
        Storage::fake('local');

        $ktpFile = UploadedFile::fake()->create('official_ktp.jpg', 800, 'image/jpeg');

        $response = $this->post(route('public.membership.register.store', ['gym' => $this->flagshipGym->slug]), [
            'membership_plan_id' => $this->plan->id,
            'full_name' => 'Citra Lestari',
            'email' => 'citra.lestari@test.com',
            'phone' => '081299990004',
            'gender' => 'female',
            'date_of_birth' => '1998-08-20',
            'address' => 'Jl. Senopati No. 88, Jakarta Selatan',
            'ktp' => $ktpFile,
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        /** @var MembershipRegistration $reg */
        $reg = MembershipRegistration::withoutGymScope()
            ->where('gym_id', $this->flagshipGym->id)
            ->where('email', 'citra.lestari@test.com')
            ->firstOrFail();

        $this->assertSame('pending', $reg->status);
        $this->assertSame('unpaid', $reg->payment_status);
        $this->assertNotNull($reg->ktp_document_path);
        $this->assertSame('official_ktp.jpg', $reg->ktp_original_filename);

        // Verify file stored on private local disk
        Storage::disk('local')->assertExists($reg->ktp_document_path);

        // Verify redirect to payment page
        $response->assertRedirect(route('public.membership.register.payment', [
            'registration' => $reg->registration_number,
            'gym' => $this->flagshipGym->slug,
        ]));
    }

    public function test_admin_can_securely_view_uploaded_ktp(): void
    {
        Storage::fake('local');

        $ktpFile = UploadedFile::fake()->create('valid_ktp.jpg', 500, 'image/jpeg');
        $storedPath = $ktpFile->storeAs("tenants/{$this->flagshipGym->id}/ktp", 'uuid-ktp-1.jpg', 'local');

        $reg = MembershipRegistration::create([
            'gym_id' => $this->flagshipGym->id,
            'membership_plan_id' => $this->plan->id,
            'registration_number' => 'REG-2026-KTP01',
            'source' => 'website',
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'full_name' => 'Citra KTP Test',
            'email' => 'citra.ktp@test.com',
            'phone' => '081299990005',
            'address' => 'Jl. Senopati No. 88',
            'ktp_document_path' => $storedPath,
            'ktp_original_filename' => 'valid_ktp.jpg',
            'ktp_uploaded_at' => now(),
        ]);

        // Same gym admin can view
        $response = $this->actingAs($this->flagshipAdmin)
            ->get(route('admin.membership-registrations.ktp', $reg->id));

        $response->assertOk();
    }

    public function test_cross_tenant_admin_cannot_view_ktp(): void
    {
        Storage::fake('local');

        $ktpFile = UploadedFile::fake()->create('valid_ktp.jpg', 500, 'image/jpeg');
        $storedPath = $ktpFile->storeAs("tenants/{$this->flagshipGym->id}/ktp", 'uuid-ktp-2.jpg', 'local');

        $reg = MembershipRegistration::create([
            'gym_id' => $this->flagshipGym->id,
            'membership_plan_id' => $this->plan->id,
            'registration_number' => 'REG-2026-KTP02',
            'source' => 'website',
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'full_name' => 'Citra Cross Test',
            'email' => 'citra.cross@test.com',
            'phone' => '081299990006',
            'address' => 'Jl. Senopati No. 88',
            'ktp_document_path' => $storedPath,
            'ktp_original_filename' => 'valid_ktp.jpg',
            'ktp_uploaded_at' => now(),
        ]);

        // Surabaya admin cannot view Flagship registration KTP
        $response = $this->actingAs($this->surabayaAdmin)
            ->get(route('admin.membership-registrations.ktp', $reg->id));

        $response->assertForbidden();
    }
}
