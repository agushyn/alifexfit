<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\Trainer;
use App\Models\TrainerSchedule;
use App\Services\Tenancy\GymContext;
use App\Services\Trainer\TrainerAvailabilityService;
use App\Services\Trainer\TrainerQuotaService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrainerApiController extends Controller
{
    public function __construct(
        protected TrainerAvailabilityService $availabilityService,
        protected TrainerQuotaService $quotaService,
        protected GymContext $gymContext
    ) {}

    /**
     * Get active trainers for current gym (sanitized public profile).
     */
    public function index(): JsonResponse
    {
        $trainers = Trainer::where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'gym_id', 'name', 'specialization', 'bio', 'profile_photo']);

        $data = $trainers->map(function ($trainer) {
            return [
                'id' => $trainer->id,
                'name' => $trainer->name,
                'specialization' => $trainer->specialization,
                'bio' => $trainer->bio,
                'status' => $trainer->status,
                'profile_photo_url' => $trainer->profile_photo_url,
                'is_available' => $this->availabilityService->isTrainerAvailable($trainer),
            ];
        });

        return response()->json([
            'success' => true,
            'count' => $data->count(),
            'data' => $data,
        ]);
    }

    /**
     * Get trainers currently available according to schedule & active status.
     */
    public function available(Request $request): JsonResponse
    {
        $dateTime = Carbon::now();

        if ($request->filled('date') || $request->filled('time')) {
            $dateStr = $request->input('date', Carbon::today()->format('Y-m-d'));
            $timeStr = $request->input('time', Carbon::now()->format('H:i:s'));
            try {
                $dateTime = Carbon::parse("{$dateStr} {$timeStr}");
            } catch (\Exception $e) {
                $dateTime = Carbon::now();
            }
        }

        $workoutTypeId = $request->filled('workout_type_id') ? (int) $request->input('workout_type_id') : null;

        $trainers = $this->availabilityService->getAvailableTrainers(
            dateTime: $dateTime,
            workoutTypeId: $workoutTypeId
        );

        $data = $trainers->map(function ($trainer) {
            return [
                'id' => $trainer->id,
                'name' => $trainer->name,
                'specialization' => $trainer->specialization,
                'bio' => $trainer->bio,
                'profile_photo_url' => $trainer->profile_photo_url,
                'available' => true,
                'today_schedules' => $trainer->activeSchedules->map(fn ($s) => [
                    'day_of_week' => $s->day_of_week,
                    'start_time' => substr((string) $s->start_time, 0, 5),
                    'end_time' => substr((string) $s->end_time, 0, 5),
                    'time_range' => $s->formatted_time_range,
                ]),
            ];
        });

        return response()->json([
            'success' => true,
            'count' => $data->count(),
            'check_timestamp' => $dateTime->toIso8601String(),
            'data' => $data,
        ]);
    }

    /**
     * Get trainer public profile detail.
     */
    public function show(Trainer $trainer): JsonResponse
    {
        if ($trainer->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Trainer tidak aktif atau tidak ditemukan.',
            ], 404);
        }

        $trainer->load(['activeSchedules']);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $trainer->id,
                'name' => $trainer->name,
                'specialization' => $trainer->specialization,
                'bio' => $trainer->bio,
                'profile_photo_url' => $trainer->profile_photo_url,
                'is_available' => $this->availabilityService->isTrainerAvailable($trainer),
                'weekly_schedules' => $trainer->activeSchedules->map(fn ($s) => [
                    'day_of_week' => $s->day_of_week,
                    'day_name' => $s->day_name,
                    'start_time' => substr((string) $s->start_time, 0, 5),
                    'end_time' => substr((string) $s->end_time, 0, 5),
                    'time_range' => $s->formatted_time_range,
                ]),
            ],
        ]);
    }

    /**
     * Get trainer quota summary for current authenticated member or specific member.
     */
    public function quota(Request $request): JsonResponse
    {
        /** @var \App\Models\Member|null $authMember */
        $authMember = $request->attributes->get('member');

        $memberId = $request->input('member_id');

        if ($authMember) {
            $member = $authMember;
        } else {
            $query = Member::query();
            if ($memberId) {
                $query->where('id', $memberId);
            }
            $member = $query->first();
        }

        if (! $member) {
            return response()->json([
                'success' => false,
                'message' => 'Data member tidak ditemukan.',
            ], 404);
        }

        $activeMembership = $member->activeMembership;

        if (! $activeMembership) {
            return response()->json([
                'success' => true,
                'data' => [
                    'has_active_membership' => false,
                    'total' => 0,
                    'used' => 0,
                    'remaining' => 0,
                    'has_available' => false,
                ],
            ]);
        }

        $summary = $this->quotaService->getQuotaSummary($activeMembership);

        return response()->json([
            'success' => true,
            'data' => array_merge($summary, [
                'has_active_membership' => true,
                'membership_id' => $activeMembership->id,
                'plan_name' => $activeMembership->membershipPlan?->name,
            ]),
        ]);
    }

    /**
     * Get active trainer schedules in current gym.
     */
    public function schedules(): JsonResponse
    {
        $schedules = TrainerSchedule::where('status', 'active')
            ->with(['trainer:id,gym_id,name,specialization,profile_photo'])
            ->whereHas('trainer', fn ($q) => $q->where('status', 'active'))
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'success' => true,
            'count' => $schedules->count(),
            'data' => $schedules->map(fn ($s) => [
                'id' => $s->id,
                'trainer_id' => $s->trainer_id,
                'trainer_name' => $s->trainer?->name,
                'specialization' => $s->trainer?->specialization,
                'day_of_week' => $s->day_of_week,
                'day_name' => $s->day_name,
                'start_time' => substr((string) $s->start_time, 0, 5),
                'end_time' => substr((string) $s->end_time, 0, 5),
                'time_range' => $s->formatted_time_range,
            ]),
        ]);
    }
}
