<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TrainingSession;
use App\Models\WorkoutType;
use App\Services\Workouts\WorkoutSessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkoutSessionApiController extends Controller
{
    public function __construct(
        protected WorkoutSessionService $sessionService
    ) {}

    /**
     * Get active workout types available for the current gym.
     */
    public function workoutTypes(): JsonResponse
    {
        $types = WorkoutType::where('status', 'active')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'category', 'description', 'status']);

        return response()->json([
            'success' => true,
            'data' => $types,
        ]);
    }

    /**
     * Create a workout session linked to an active attendance.
     */
    public function store(Request $request): JsonResponse
    {
        /** @var \App\Models\Member|null $member */
        $member = $request->attributes->get('member');

        $attendanceId = $request->input('attendance_id') ?? $member?->activeAttendance?->id;

        if (! $attendanceId) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance aktif tidak ditemukan. Silakan lakukan check-in terlebih dahulu.',
            ], 422);
        }

        $request->validate([
            'workout_type_id' => ['required', 'integer'],
            'trainer_id' => ['nullable', 'integer'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $session = $this->sessionService->createSession(
            attendanceId: (int) $attendanceId,
            workoutTypeId: (int) $request->input('workout_type_id'),
            trainerId: $request->input('trainer_id') ? (int) $request->input('trainer_id') : null,
            notes: $request->input('notes')
        );

        $session->load(['workoutType', 'trainer']);

        return response()->json([
            'success' => true,
            'message' => 'Sesi workout berhasil dimulai.',
            'data' => $session,
        ], 201);
    }

    /**
     * Get current active (in_progress) workout session.
     */
    public function active(Request $request): JsonResponse
    {
        /** @var \App\Models\Member|null $member */
        $member = $request->attributes->get('member');

        if ($member) {
            $session = TrainingSession::where('member_id', $member->id)
                ->where('status', 'in_progress')
                ->with([
                    'member:id,gym_id,first_name,last_name,full_name,member_number',
                    'workoutType:id,gym_id,name,category',
                    'trainer:id,gym_id,name,specialization,profile_photo',
                    'attendance:id,gym_id,check_in_at',
                ])
                ->latest('started_at')
                ->first();

            return response()->json([
                'success' => true,
                'data' => $session,
            ]);
        }

        $sessions = TrainingSession::with([
            'member:id,gym_id,first_name,last_name,full_name,member_number',
            'workoutType:id,gym_id,name,category',
            'trainer:id,gym_id,name,specialization,profile_photo',
            'attendance:id,gym_id,check_in_at',
        ])
            ->where('status', 'in_progress')
            ->latest('started_at')
            ->get();

        return response()->json([
            'success' => true,
            'count' => $sessions->count(),
            'data' => $sessions,
        ]);
    }

    /**
     * Get workout history for a member or current gym.
     */
    public function history(Request $request): JsonResponse
    {
        /** @var \App\Models\Member|null $member */
        $member = $request->attributes->get('member');

        $query = TrainingSession::with([
            'member:id,gym_id,first_name,last_name,full_name,member_number',
            'workoutType:id,gym_id,name,category',
            'trainer:id,gym_id,name,specialization,profile_photo',
            'attendance:id,gym_id,check_in_at,check_out_at',
        ]);

        if ($member) {
            $query->where('member_id', $member->id);
        } elseif ($request->filled('member_id')) {
            $query->where('member_id', $request->input('member_id'));
        }

        $sessions = $query->latest('started_at')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $sessions,
        ]);
    }

    /**
     * Complete an active workout session.
     */
    public function complete(Request $request, TrainingSession $workoutSession): JsonResponse
    {
        /** @var \App\Models\Member|null $member */
        $member = $request->attributes->get('member');

        if ($member && (int) $workoutSession->member_id !== (int) $member->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke sesi workout ini.',
            ], 403);
        }

        $request->validate([
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $completedSession = $this->sessionService->completeSession($workoutSession, $request->input('notes'));
        $completedSession->load(['workoutType', 'trainer', 'member.activeMembership']);

        return response()->json([
            'success' => true,
            'message' => 'Sesi workout berhasil diselesaikan.',
            'data' => $completedSession,
        ]);
    }

    /**
     * Cancel a workout session.
     */
    public function cancel(Request $request, TrainingSession $workoutSession): JsonResponse
    {
        /** @var \App\Models\Member|null $member */
        $member = $request->attributes->get('member');

        if ($member && (int) $workoutSession->member_id !== (int) $member->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke sesi workout ini.',
            ], 403);
        }

        $request->validate([
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $cancelledSession = $this->sessionService->cancelSession($workoutSession, $request->input('reason'));

        return response()->json([
            'success' => true,
            'message' => 'Sesi workout berhasil dibatalkan.',
            'data' => $cancelledSession,
        ]);
    }
}