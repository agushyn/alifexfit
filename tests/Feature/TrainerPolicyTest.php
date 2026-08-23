<?php

namespace Tests\Feature;

use App\Models\Trainer;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrainerPolicyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_super_admin_can_view_and_manage_any_trainer(): void
    {
        $superAdmin = User::where('email', 'superadmin@exfits.com')->first();
        $surabayaTrainer = Trainer::withoutGymScope()->whereHas('gym', fn ($q) => $q->where('code', 'EXF-SBY-02'))->first();

        $response = $this->actingAs($superAdmin)
            ->withSession(['active_gym_id' => $surabayaTrainer->gym_id])
            ->get(route('admin.trainers.show', $surabayaTrainer->id));
        $response->assertStatus(200);

        $response = $this->actingAs($superAdmin)
            ->withSession(['active_gym_id' => $surabayaTrainer->gym_id])
            ->put(route('admin.trainers.update', $surabayaTrainer->id), [
                'name' => 'Updated by SuperAdmin',
                'status' => 'active',
            ]);
        $response->assertRedirect();
    }

    public function test_gym_admin_cannot_access_other_gym_trainer(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $surabayaTrainer = Trainer::withoutGymScope()->whereHas('gym', fn ($q) => $q->where('code', 'EXF-SBY-02'))->first();

        // Direct Policy Gate authorization checks
        $this->assertFalse($flagshipAdmin->can('view', $surabayaTrainer));
        $this->assertFalse($flagshipAdmin->can('update', $surabayaTrainer));
        $this->assertFalse($flagshipAdmin->can('delete', $surabayaTrainer));
        $this->assertFalse($flagshipAdmin->can('manageSchedule', $surabayaTrainer));

        // HTTP layer scoping checks (tenant scope & policy prevent cross-tenant access)
        $response = $this->actingAs($flagshipAdmin)->get(route('admin.trainers.show', $surabayaTrainer->id));
        $this->assertContains($response->getStatusCode(), [403, 404]);

        $response = $this->actingAs($flagshipAdmin)->put(route('admin.trainers.update', $surabayaTrainer->id), [
            'name' => 'Hacked Name',
            'status' => 'active',
        ]);
        $this->assertContains($response->getStatusCode(), [403, 404]);

        $response = $this->actingAs($flagshipAdmin)->delete(route('admin.trainers.destroy', $surabayaTrainer->id));
        $this->assertContains($response->getStatusCode(), [403, 404]);
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $trainer = Trainer::first();
        $response = $this->get(route('admin.trainers.index'));
        $response->assertRedirect(route('login'));

        $response = $this->get(route('admin.trainers.show', $trainer->id));
        $response->assertRedirect(route('login'));
    }
}
