<?php

namespace Database\Factories;

use App\Models\Attendance;
use App\Models\Gym;
use App\Models\Member;
use App\Models\Membership;
use App\Models\TrainingSession;
use App\Models\WorkoutType;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class TrainingSessionFactory extends Factory
{
    protected $model = TrainingSession::class;

    public function definition(): array
    {
        $startedAt = Carbon::instance(fake()->dateTimeBetween('-7 days', 'now'));
        $isCompleted = fake()->boolean(80);
        $completedAt = $isCompleted ? (clone $startedAt)->addMinutes(fake()->numberBetween(25, 75)) : null;

        return [
            'gym_id' => fn (array $attrs) => Attendance::find($attrs['attendance_id'])?->gym_id ?? Gym::factory(),
            'attendance_id' => Attendance::factory(),
            'member_id' => fn (array $attrs) => Attendance::find($attrs['attendance_id'])?->member_id ?? Member::factory(),
            'membership_id' => fn (array $attrs) => Attendance::find($attrs['attendance_id'])?->membership_id ?? Membership::factory(),
            'workout_type_id' => fn (array $attrs) => WorkoutType::where('gym_id', $attrs['gym_id'] ?? 1)->first()?->id ?? WorkoutType::factory(),
            'trainer_id' => null,
            'started_at' => $startedAt,
            'completed_at' => $completedAt,
            'status' => $isCompleted ? 'completed' : 'in_progress',
            'notes' => fake()->optional(0.3)->sentence(),
        ];
    }
}