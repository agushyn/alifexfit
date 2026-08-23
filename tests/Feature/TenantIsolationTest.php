<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\GymSetting;
use App\Models\User;
use App\Services\Tenancy\GymContext;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_models_using_belongs_to_gym_are_scoped_to_active_gym(): void
    {
        $flagshipGym = Gym::where('code', 'EXF-JKT-01')->first();
        $surabayaGym = Gym::where('code', 'EXF-SBY-02')->first();

        // Create specific settings for each gym
        GymSetting::withoutGymScope()->create([
            'gym_id' => $flagshipGym->id,
            'group' => 'test',
            'key' => 'secret_key_flagship',
            'value' => 'FLAGSHIP_SECRET_123',
        ]);

        GymSetting::withoutGymScope()->create([
            'gym_id' => $surabayaGym->id,
            'group' => 'test',
            'key' => 'secret_key_surabaya',
            'value' => 'SURABAYA_SECRET_456',
        ]);

        /** @var GymContext $context */
        $context = app(GymContext::class);

        // Scope to Flagship Gym
        $context->setGym($flagshipGym);
        $flagshipResults = GymSetting::all();

        $this->assertTrue($flagshipResults->contains('key', 'secret_key_flagship'));
        $this->assertFalse($flagshipResults->contains('key', 'secret_key_surabaya'));

        // Scope to Surabaya Gym
        $context->setGym($surabayaGym);
        $surabayaResults = GymSetting::all();

        $this->assertTrue($surabayaResults->contains('key', 'secret_key_surabaya'));
        $this->assertFalse($surabayaResults->contains('key', 'secret_key_flagship'));
    }

    public function test_user_a_cannot_access_gym_b_data(): void
    {
        $surabayaGym = Gym::where('code', 'EXF-SBY-02')->first();
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        // Flagship admin tries to update Surabaya Gym
        $response = $this->actingAs($flagshipAdmin)->put(route('admin.gyms.update', $surabayaGym->id), [
            'name' => 'Hacked Surabaya Name',
            'code' => $surabayaGym->code,
            'timezone' => 'Asia/Jakarta',
            'status' => 'active',
        ]);

        $response->assertStatus(403);
    }

    public function test_super_admin_can_switch_gym_context(): void
    {
        $superAdmin = User::where('email', 'superadmin@exfits.com')->first();
        $surabayaGym = Gym::where('code', 'EXF-SBY-02')->first();

        $response = $this->actingAs($superAdmin)->post(route('admin.gyms.switch', $surabayaGym->id));

        $response->assertSessionHas('active_gym_id', $surabayaGym->id);
        $this->assertEquals($surabayaGym->id, session('active_gym_id'));
    }

    public function test_normal_gym_user_cannot_switch_gym_context(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $surabayaGym = Gym::where('code', 'EXF-SBY-02')->first();

        $response = $this->actingAs($flagshipAdmin)->post(route('admin.gyms.switch', $surabayaGym->id));

        $response->assertStatus(403);
    }
}