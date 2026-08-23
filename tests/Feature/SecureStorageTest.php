<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\User;
use App\Services\Storage\SecureStorageService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecureStorageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_user_cannot_access_private_document_belonging_to_another_gym(): void
    {
        $flagshipGym = Gym::where('code', 'EXF-JKT-01')->first();
        $surabayaGym = Gym::where('code', 'EXF-SBY-02')->first();

        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $superAdmin = User::where('email', 'superadmin@exfits.com')->first();

        $surabayaDocPath = "tenants/{$surabayaGym->id}/documents/ktp_verification.jpg";

        $storageService = app(SecureStorageService::class);

        // Flagship admin is rejected from accessing Surabaya private document
        $this->assertFalse($storageService->canUserAccessPrivateFile($flagshipAdmin, $surabayaDocPath));

        // Super Admin is allowed access across all gyms
        $this->assertTrue($storageService->canUserAccessPrivateFile($superAdmin, $surabayaDocPath));
    }
}