<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class RbacTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_super_admin_has_all_permissions_automatically(): void
    {
        $superAdmin = User::where('email', 'superadmin@exfits.com')->first();

        $this->assertTrue($superAdmin->isSuperAdmin());
        $this->assertTrue($superAdmin->hasPermission('gyms.create'));
        $this->assertTrue($superAdmin->hasPermission('gyms.delete'));
        $this->assertTrue($superAdmin->hasPermission('settings.manage'));
        $this->assertTrue($superAdmin->hasPermission('non_existent_permission_test'));

        $this->assertTrue(Gate::forUser($superAdmin)->allows('gyms.create'));
    }

    public function test_gym_admin_has_assigned_permissions_only(): void
    {
        $gymAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $this->assertFalse($gymAdmin->isSuperAdmin());
        $this->assertTrue($gymAdmin->hasRole('gym_admin'));
        $this->assertTrue($gymAdmin->hasPermission('dashboard.view'));
        $this->assertTrue($gymAdmin->hasPermission('members.view'));
        $this->assertTrue($gymAdmin->hasPermission('settings.view'));

        // Gym Admin does not have gym creation or deletion permissions
        $this->assertFalse($gymAdmin->hasPermission('gyms.create'));
        $this->assertFalse($gymAdmin->hasPermission('gyms.delete'));
    }

    public function test_staff_has_restricted_permissions(): void
    {
        $staff = User::where('email', 'staff.flagship@exfits.com')->first();

        $this->assertTrue($staff->hasRole('staff'));
        $this->assertTrue($staff->hasPermission('members.view'));
        $this->assertFalse($staff->hasPermission('settings.manage'));
        $this->assertFalse($staff->hasPermission('gyms.create'));
    }
}