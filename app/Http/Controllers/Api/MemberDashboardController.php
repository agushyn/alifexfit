<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TrainingSession;
use App\Services\Trainer\TrainerQuotaService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberDashboardController extends Controller
{
    public function __construct(
        protected TrainerQuotaService $quotaService
    ) {}

    /**
     * Aggregated Member Dashboard data.
     */
    public function dashboard(Request $request): JsonResponse
    {
        /** @var \App\Models\Member $member */
        $member = $request->attributes->get('member');

        $activeMembership = $member->activeMembership;
        if ($activeMembership) {
            $activeMembership->load('membershipPlan');
        }

        $quotaSummary = $activeMembership
            ? $this->quotaService->getQuotaSummary($activeMembership)
            : ['total' => 0, 'used' => 0, 'remaining' => 0, 'has_available' => false];

        // Active Attendance
        $activeAttendance = $member->activeAttendance;

        // Active Workout Session
        $activeWorkoutSession = TrainingSession::where('member_id', $member->id)
            ->where('status', 'in_progress')
            ->with([
                'workoutType:id,gym_id,name,category',
                'trainer:id,gym_id,name,specialization,profile_photo',
                'attendance:id,gym_id,check_in_at',
            ])
            ->latest('started_at')
            ->first();

        // Recent attendances (last 5)
        $recentAttendances = $member->attendances()
            ->with(['trainingSessions.workoutType', 'trainingSessions.trainer'])
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'member' => [
                    'id' => $member->id,
                    'member_number' => $member->member_number,
                    'first_name' => $member->first_name,
                    'last_name' => $member->last_name,
                    'full_name' => $member->full_name,
                    'email' => $member->email,
                    'phone' => $member->phone,
                    'status' => $member->status,
                    'profile_photo_url' => $member->profile_photo_url,
                ],
                'gym' => [
                    'id' => $member->gym->id,
                    'name' => $member->gym->name,
                    'slug' => $member->gym->slug,
                    'code' => $member->gym->code,
                    'phone' => $member->gym->phone,
                    'address' => $member->gym->address,
                ],
                'membership' => $activeMembership ? [
                    'id' => $activeMembership->id,
                    'plan_name' => $activeMembership->membershipPlan?->name,
                    'status' => $activeMembership->status,
                    'start_date' => $activeMembership->start_date->format('Y-m-d'),
                    'end_date' => $activeMembership->end_date->format('Y-m-d'),
                    'remaining_days' => max(0, (int) Carbon::today()->diffInDays($activeMembership->end_date, false)),
                    'trainer_quota' => $quotaSummary,
                ] : null,
                'active_attendance' => $activeAttendance ? [
                    'id' => $activeAttendance->id,
                    'check_in_at' => $activeAttendance->check_in_at->toIso8601String(),
                    'source' => $activeAttendance->source,
                    'status' => $activeAttendance->status,
                ] : null,
                'active_workout_session' => $activeWorkoutSession ? [
                    'id' => $activeWorkoutSession->id,
                    'attendance_id' => $activeWorkoutSession->attendance_id,
                    'workout_type' => $activeWorkoutSession->workoutType,
                    'trainer' => $activeWorkoutSession->trainer ? [
                        'id' => $activeWorkoutSession->trainer->id,
                        'name' => $activeWorkoutSession->trainer->name,
                        'specialization' => $activeWorkoutSession->trainer->specialization,
                        'profile_photo_url' => $activeWorkoutSession->trainer->profile_photo_url,
                    ] : null,
                    'started_at' => $activeWorkoutSession->started_at->toIso8601String(),
                    'status' => $activeWorkoutSession->status,
                    'notes' => $activeWorkoutSession->notes,
                ] : null,
                'recent_attendances' => $recentAttendances,
            ],
        ]);
    }

    /**
     * Get detailed Membership information.
     */
    public function membership(Request $request): JsonResponse
    {
        /** @var \App\Models\Member $member */
        $member = $request->attributes->get('member');

        $activeMembership = $member->activeMembership;
        if ($activeMembership) {
            $activeMembership->load(['membershipPlan', 'gym']);
        }

        $latestMembership = $activeMembership ?: $member->latestMembership;
        if ($latestMembership && ! $latestMembership->relationLoaded('membershipPlan')) {
            $latestMembership->load(['membershipPlan', 'gym']);
        }

        $quotaSummary = $activeMembership
            ? $this->quotaService->getQuotaSummary($activeMembership)
            : ['total' => 0, 'used' => 0, 'remaining' => 0, 'has_available' => false];

        return response()->json([
            'success' => true,
            'data' => [
                'has_active' => (bool) $activeMembership,
                'membership' => $latestMembership ? [
                    'id' => $latestMembership->id,
                    'plan' => $latestMembership->membershipPlan ? [
                        'id' => $latestMembership->membershipPlan->id,
                        'name' => $latestMembership->membershipPlan->name,
                        'description' => $latestMembership->membershipPlan->description,
                        'duration' => $latestMembership->membershipPlan->duration,
                        'billing_period' => $latestMembership->membershipPlan->billing_period,
                        'benefits' => $latestMembership->membershipPlan->benefits,
                    ] : null,
                    'price' => $latestMembership->price,
                    'status' => $latestMembership->status,
                    'payment_status' => $latestMembership->payment_status,
                    'start_date' => $latestMembership->start_date?->format('Y-m-d'),
                    'end_date' => $latestMembership->end_date?->format('Y-m-d'),
                    'remaining_days' => $latestMembership->end_date ? max(0, (int) Carbon::today()->diffInDays($latestMembership->end_date, false)) : 0,
                    'trainer_quota' => $quotaSummary,
                ] : null,
            ],
        ]);
    }

    /**
     * Get member QR payload for attendance kiosk verification.
     */
    public function qr(Request $request): JsonResponse
    {
        /** @var \App\Models\Member $member */
        $member = $request->attributes->get('member');

        $issuedAt = now()->timestamp;
        $gymCode = $member->gym->code;

        // Structured QR payload verifiable by kiosk
        $payload = [
            'type' => 'EXFITS_MEMBER_QR',
            'gym' => $gymCode,
            'member' => $member->member_number,
            'issued_at' => $issuedAt,
            'hash' => hash_hmac('sha256', "{$member->member_number}:{$gymCode}:{$issuedAt}", config('app.key')),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'member_number' => $member->member_number,
                'member_name' => $member->full_name,
                'gym_name' => $member->gym->name,
                'gym_code' => $gymCode,
                'status' => $member->status,
                'qr_raw' => $member->member_number,
                'qr_payload' => json_encode($payload),
                'generated_at' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Paginated attendance history for the authenticated member.
     */
    public function attendanceHistory(Request $request): JsonResponse
    {
        /** @var \App\Models\Member $member */
        $member = $request->attributes->get('member');

        $attendances = $member->attendances()
            ->with([
                'trainingSessions.workoutType:id,name,category',
                'trainingSessions.trainer:id,name,specialization',
            ])
            ->latest('check_in_at')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $attendances,
        ]);
    }

    /**
     * Paginated workout session history for the authenticated member.
     */
    public function workoutHistory(Request $request): JsonResponse
    {
        /** @var \App\Models\Member $member */
        $member = $request->attributes->get('member');

        $sessions = $member->trainingSessions()
            ->with([
                'workoutType:id,name,category',
                'trainer:id,name,specialization,profile_photo',
                'attendance:id,check_in_at,check_out_at',
            ])
            ->latest('started_at')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $sessions,
        ]);
    }
}
