<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CheckInRequest;
use App\Http\Requests\Admin\CheckOutRequest;
use App\Models\Attendance;
use App\Services\Attendance\AttendanceService;
use App\Services\Audit\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceApiController extends Controller
{
    public function checkIn(
        CheckInRequest $request,
        AttendanceService $attendanceService,
        AuditService $auditService
    ): JsonResponse {
        $attendance = $attendanceService->checkIn(
            memberIdentifier: $request->validated('member_number'),
            source: $request->validated('source', 'app'),
            deviceIdentifier: $request->validated('device_identifier')
        );

        $auditService->log(
            action: 'attendance.api_check_in',
            entityType: Attendance::class,
            entityId: $attendance->id,
            metadata: [
                'member_id' => $attendance->member_id,
                'member_number' => $attendance->member->member_number,
                'source' => $attendance->source,
            ],
            gymId: $attendance->gym_id
        );

        return response()->json([
            'success' => true,
            'message' => 'Check-in berhasil.',
            'data' => [
                'attendance' => $attendance,
                'member' => $attendance->member,
                'membership' => $attendance->membership,
                'gym' => $attendance->gym,
            ],
        ], 201);
    }

    public function checkOut(
        CheckOutRequest $request,
        AttendanceService $attendanceService,
        AuditService $auditService
    ): JsonResponse {
        if ($request->filled('attendance_id')) {
            $updated = $attendanceService->checkOut((int) $request->validated('attendance_id'), $request->validated('notes'));
        } elseif ($request->filled('member_number')) {
            $updated = $attendanceService->checkOutMember($request->validated('member_number'));
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Harus menyertakan attendance_id atau member_number.',
            ], 422);
        }

        $auditService->log(
            action: 'attendance.api_check_out',
            entityType: Attendance::class,
            entityId: $updated->id,
            metadata: [
                'member_id' => $updated->member_id,
                'check_out_at' => $updated->check_out_at?->toIso8601String(),
            ],
            gymId: $updated->gym_id
        );

        return response()->json([
            'success' => true,
            'message' => 'Check-out berhasil.',
            'data' => $updated,
        ]);
    }

    public function active(): JsonResponse
    {
        $activeAttendances = Attendance::inGym()
            ->with([
                'member:id,gym_id,first_name,last_name,full_name,member_number,profile_photo',
                'membership.membershipPlan:id,name',
            ])
            ->latest('check_in_at')
            ->get();

        return response()->json([
            'success' => true,
            'count' => $activeAttendances->count(),
            'data' => $activeAttendances,
        ]);
    }
}