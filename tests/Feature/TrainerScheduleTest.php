<?php

namespace Tests\Feature;

use App\Models\Trainer;
use App\Models\TrainerSchedule;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrainerScheduleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_authorized_user_can_view_schedule_management(): void
    {
        $admin = User::where('email', 'admin.flagship@exfits.com')->first();
        $trainer = Trainer::where('gym_id', $admin->gym_id)->first();

        $response = $this->actingAs($admin)->get(route('admin.trainers.schedules.index', $trainer->id));
        $response->assertOk();
    }

    public function test_authorized_user_can_create_schedule_slot(): void
    {
        $admin = User::where('email', 'admin.flagship@exfits.com')->first();
        $trainer = Trainer::where('gym_id', $admin->gym_id)->first();

        $response = $this->actingAs($admin)->post(route('admin.trainers.schedules.store', $trainer->id), [
            'day_of_week' => 2, // Tuesday
            'start_time' => '10:00',
            'end_time' => '14:00',
            'status' => 'active',
            'notes' => 'Mid-day strength slot',
        ]);

        $response->assertRedirect();

        $schedule = TrainerSchedule::where('trainer_id', $trainer->id)
            ->where('day_of_week', 2)
            ->where('start_time', 'like', '10:00%')
            ->first();

        $this->assertNotNull($schedule);
        $this->assertEquals((int) $admin->gym_id, (int) $schedule->gym_id);
    }

    public function test_rejects_schedule_with_end_time_before_or_equal_to_start_time(): void
    {
        $admin = User::where('email', 'admin.flagship@exfits.com')->first();
        $trainer = Trainer::where('gym_id', $admin->gym_id)->first();

        $response = $this->actingAs($admin)->post(route('admin.trainers.schedules.store', $trainer->id), [
            'day_of_week' => 1,
            'start_time' => '14:00',
            'end_time' => '12:00', // Invalid: end_time < start_time
            'status' => 'active',
        ]);

        $response->assertSessionHasErrors(['end_time']);
    }

    public function test_rejects_schedule_with_invalid_day_of_week(): void
    {
        $admin = User::where('email', 'admin.flagship@exfits.com')->first();
        $trainer = Trainer::where('gym_id', $admin->gym_id)->first();

        $response = $this->actingAs($admin)->post(route('admin.trainers.schedules.store', $trainer->id), [
            'day_of_week' => 7, // Invalid (only 0-6 allowed)
            'start_time' => '08:00',
            'end_time' => '12:00',
            'status' => 'active',
        ]);

        $response->assertSessionHasErrors(['day_of_week']);
    }

    public function test_authorized_user_can_update_schedule_slot(): void
    {
        $admin = User::where('email', 'admin.flagship@exfits.com')->first();
        $trainer = Trainer::where('gym_id', $admin->gym_id)->first();
        $schedule = $trainer->schedules()->first();

        $response = $this->actingAs($admin)->put(route('admin.trainers.schedules.update', $schedule->id), [
            'day_of_week' => $schedule->day_of_week,
            'start_time' => '07:30',
            'end_time' => '11:30',
            'status' => 'inactive',
            'notes' => 'Adjusted morning slot',
        ]);

        $response->assertRedirect();

        $schedule->refresh();
        $this->assertTrue(str_starts_with($schedule->start_time, '07:30'));
        $this->assertEquals('inactive', $schedule->status);
    }

    public function test_authorized_user_can_delete_schedule_slot(): void
    {
        $admin = User::where('email', 'admin.flagship@exfits.com')->first();
        $trainer = Trainer::where('gym_id', $admin->gym_id)->first();
        $schedule = $trainer->schedules()->first();

        $response = $this->actingAs($admin)->delete(route('admin.trainers.schedules.destroy', $schedule->id));
        $response->assertRedirect();

        $this->assertSoftDeleted('trainer_schedules', ['id' => $schedule->id]);
    }
}
