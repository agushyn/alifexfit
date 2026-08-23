<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\Trainer;
use App\Models\TrainerSchedule;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrainerTenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_trainers_index_scoped_to_current_admin_gym(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $surabayaAdmin = User::where('email', 'admin.surabaya@exfits.com')->first();

        // Flagship admin sees Jakarta trainers
        $response = $this->actingAs($flagshipAdmin)->get(route('admin.trainers.index'));
        $response->assertStatus(200);
        $response->assertSee('Budi Pratama');
        $response->assertDontSee('Siti Rahmawati');

        // Surabaya admin sees Surabaya trainers
        $response = $this->actingAs($surabayaAdmin)->get(route('admin.trainers.index'));
        $response->assertStatus(200);
        $response->assertSee('Siti Rahmawati');
        $response->assertDontSee('Budi Pratama');
    }

    public function test_cannot_access_or_modify_other_gym_trainer_schedule(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $surabayaTrainer = Trainer::withoutGymScope()->whereHas('gym', fn ($q) => $q->where('code', 'EXF-SBY-02'))->first();
        $surabayaSchedule = TrainerSchedule::withoutGymScope()->where('trainer_id', $surabayaTrainer->id)->first();

        // Direct Policy Gate check
        $this->assertFalse($flagshipAdmin->can('manageSchedule', $surabayaTrainer));

        // HTTP layer scoping check (policy & tenant scope prevent cross-tenant schedule management)
        $response = $this->actingAs($flagshipAdmin)->get(route('admin.trainers.schedules.index', $surabayaTrainer->id));
        $this->assertContains($response->getStatusCode(), [403, 404]);

        // Attempting to delete Surabaya schedule
        $response = $this->actingAs($flagshipAdmin)->delete(route('admin.trainers.schedules.destroy', $surabayaSchedule->id));
        $this->assertContains($response->getStatusCode(), [403, 404]);
    }
}
