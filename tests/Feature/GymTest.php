<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GymTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_super_admin_can_view_gyms_list(): void
    {
        $superAdmin = User::where('email', 'superadmin@exfits.com')->first();

        $response = $this->actingAs($superAdmin)->get(route('admin.gyms.index'));
        $response->assertStatus(200);
    }

    public function test_super_admin_can_create_new_gym(): void
    {
        $superAdmin = User::where('email', 'superadmin@exfits.com')->first();

        $gymData = [
            'name' => 'Exfits Bali Branch',
            'code' => 'EXF-BALI-01',
            'slug' => 'exfits-bali-branch',
            'phone' => '+62 361 888 777',
            'email' => 'bali@exfits.com',
            'address' => 'Jl. Sunset Road No. 100, Kuta, Bali',
            'timezone' => 'Asia/Makassar',
            'status' => 'active',
        ];

        $response = $this->actingAs($superAdmin)->post(route('admin.gyms.store'), $gymData);
        $response->assertRedirect(route('admin.gyms.index'));

        $this->assertDatabaseHas('gyms', [
            'code' => 'EXF-BALI-01',
            'name' => 'Exfits Bali Branch',
        ]);
    }

    public function test_gym_admin_cannot_create_gym(): void
    {
        $gymAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $response = $this->actingAs($gymAdmin)->post(route('admin.gyms.store'), [
            'name' => 'Unauthorized Gym',
            'code' => 'EXF-UNAUTH-01',
            'timezone' => 'Asia/Jakarta',
            'status' => 'active',
        ]);

        $response->assertStatus(403);
    }

    public function test_super_admin_can_update_gym(): void
    {
        $superAdmin = User::where('email', 'superadmin@exfits.com')->first();
        $gym = Gym::first();

        $response = $this->actingAs($superAdmin)->put(route('admin.gyms.update', $gym->id), [
            'name' => 'Updated Flagship Name',
            'code' => $gym->code,
            'timezone' => 'Asia/Jakarta',
            'status' => 'active',
        ]);

        $response->assertRedirect(route('admin.gyms.index'));
        $this->assertDatabaseHas('gyms', [
            'id' => $gym->id,
            'name' => 'Updated Flagship Name',
        ]);
    }

    public function test_super_admin_can_delete_gym(): void
    {
        $superAdmin = User::where('email', 'superadmin@exfits.com')->first();
        $gym = Gym::factory()->create();

        $response = $this->actingAs($superAdmin)->delete(route('admin.gyms.destroy', $gym->id));
        $response->assertRedirect(route('admin.gyms.index'));

        $this->assertDatabaseMissing('gyms', [
            'id' => $gym->id,
        ]);
    }
}