<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\Trainer;
use App\Models\TrainerSchedule;
use App\Services\Trainer\TrainerAvailabilityService;
use Carbon\Carbon;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class TrainerAvailabilityServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_detects_trainer_available_during_scheduled_shift(): void
    {
        /** @var TrainerAvailabilityService $service */
        $service = app(TrainerAvailabilityService::class);

        $flagshipGym = Gym::where('code', 'EXF-JKT-01')->first();
        $budi = Trainer::withoutGymScope()->where('gym_id', $flagshipGym->id)->where('name', 'Budi Pratama')->first();

        // Check Monday at 09:30 (Monday is day 1, schedule is 08:00 - 12:00)
        $mondayMorning = Carbon::parse('2026-08-24 09:30:00'); // 2026-08-24 is a Monday
        $this->assertEquals(1, $mondayMorning->dayOfWeek);

        $isAvailable = $service->isTrainerAvailable($budi, $mondayMorning, $flagshipGym->id);
        $this->assertTrue($isAvailable);
    }

    public function test_detects_trainer_unavailable_outside_scheduled_shift(): void
    {
        /** @var TrainerAvailabilityService $service */
        $service = app(TrainerAvailabilityService::class);

        $flagshipGym = Gym::where('code', 'EXF-JKT-01')->first();
        $budi = Trainer::withoutGymScope()->where('gym_id', $flagshipGym->id)->where('name', 'Budi Pratama')->first();

        // Monday at 13:00 (Break between 12:00 and 14:00)
        $mondayLunch = Carbon::parse('2026-08-24 13:00:00');
        $this->assertFalse($service->isTrainerAvailable($budi, $mondayLunch, $flagshipGym->id));

        // Monday at 23:00 (Night time)
        $mondayNight = Carbon::parse('2026-08-24 23:00:00');
        $this->assertFalse($service->isTrainerAvailable($budi, $mondayNight, $flagshipGym->id));
    }

    public function test_inactive_trainer_is_never_available(): void
    {
        /** @var TrainerAvailabilityService $service */
        $service = app(TrainerAvailabilityService::class);

        $flagshipGym = Gym::where('code', 'EXF-JKT-01')->first();
        $dimas = Trainer::withoutGymScope()->where('gym_id', $flagshipGym->id)->where('name', 'Dimas Setiawan')->first();
        $this->assertEquals('inactive', $dimas->status);

        $checkTime = Carbon::parse('2026-08-24 09:30:00');
        $this->assertFalse($service->isTrainerAvailable($dimas, $checkTime, $flagshipGym->id));
    }

    public function test_get_available_trainers_returns_only_active_trainers_on_shift(): void
    {
        /** @var TrainerAvailabilityService $service */
        $service = app(TrainerAvailabilityService::class);

        $flagshipGym = Gym::where('code', 'EXF-JKT-01')->first();
        $mondayMorning = Carbon::parse('2026-08-24 09:30:00');

        $availableTrainers = $service->getAvailableTrainers($mondayMorning, null, $flagshipGym->id);

        $this->assertGreaterThan(0, $availableTrainers->count());
        foreach ($availableTrainers as $trainer) {
            $this->assertEquals('active', $trainer->status);
            $this->assertEquals($flagshipGym->id, $trainer->gym_id);
        }
    }

    public function test_validate_trainer_selection_throws_for_inactive_or_wrong_gym(): void
    {
        /** @var TrainerAvailabilityService $service */
        $service = app(TrainerAvailabilityService::class);

        $flagshipGym = Gym::where('code', 'EXF-JKT-01')->first();
        $surabayaGym = Gym::where('code', 'EXF-SBY-02')->first();

        $sbyTrainer = Trainer::withoutGymScope()->where('gym_id', $surabayaGym->id)->first();
        $dimasInactive = Trainer::withoutGymScope()->where('gym_id', $flagshipGym->id)->where('name', 'Dimas Setiawan')->first();

        // 1. Wrong gym tenant mismatch
        $this->expectException(ValidationException::class);
        $service->validateTrainerSelection($sbyTrainer->id, $flagshipGym->id);
    }
}
