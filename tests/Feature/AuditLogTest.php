<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_login_creates_audit_log_record(): void
    {
        $this->post('/login', [
            'email' => 'superadmin@exfits.com',
            'password' => 'password',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'auth.login',
        ]);
    }

    public function test_gym_creation_creates_audit_log_record(): void
    {
        $superAdmin = User::where('email', 'superadmin@exfits.com')->first();

        $this->actingAs($superAdmin)->post(route('admin.gyms.store'), [
            'name' => 'Audit Gym Branch',
            'code' => 'EXF-AUDIT-01',
            'timezone' => 'Asia/Jakarta',
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'gym.created',
        ]);
    }
}