<?php

namespace Database\Factories;

use App\Models\Attendance;
use App\Models\Gym;
use App\Models\Member;
use App\Models\Membership;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class AttendanceFactory extends Factory
{
    protected $model = Attendance::class;

    public function definition(): array
    {
        $checkIn = Carbon::instance(fake()->dateTimeBetween('-7 days', 'now'));
        $isCheckedOut = fake()->boolean(80);
        $checkOut = $isCheckedOut ? (clone $checkIn)->addMinutes(fake()->numberBetween(35, 120)) : null;

        return [
            'gym_id' => fn (array $attrs) => Member::find($attrs['member_id'])?->gym_id ?? Gym::factory(),
            'member_id' => Member::factory(),
            'membership_id' => fn (array $attrs) => Member::find($attrs['member_id'])?->activeMembership?->id ?? Membership::factory(),
            'check_in_at' => $checkIn,
            'check_out_at' => $checkOut,
            'status' => $isCheckedOut ? 'checked_out' : 'in_gym',
            'source' => fake()->randomElement(['kiosk', 'kiosk', 'kiosk', 'admin', 'app']),
            'device_identifier' => 'kiosk_main_turnstile',
            'notes' => null,
        ];
    }
}