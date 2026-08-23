<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CancelAttendanceRequest;
use App\Http\Requests\Admin\CheckInRequest;
use App\Http\Requests\Admin\CheckOutRequest;
use App\Models\Attendance;
use App\Services\Attendance\AttendanceService;
use App\Services\Audit\AuditService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Attendance::class);

        $search = $request->query('search');
        $date = $request->query('date');
        $status = $request->query('status');
        $source = $request->query('source');

        $query = Attendance::query()
            ->with([
                'member:id,gym_id,first_name,last_name,full_name,member_number,profile_photo,status',
                'membership:id,gym_id,membership_plan_id,start_date,end_date,price,trainer_quota_total,trainer_quota_used',
                'membership.membershipPlan:id,name,billing_period,duration',
                'gym:id,name,code',
            ])
            ->when($search, function ($q) use ($search) {
                $q->whereHas('member', function ($sub) use ($search) {
                    $sub->where('member_number', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('full_name', 'like', "%{$search}%");
                });
            })
            ->when($date, fn ($q) => $q->whereDate('check_in_at', $date))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($source, fn ($q) => $q->where('source', $source))
            ->latest('check_in_at');

        $attendances = $query->paginate(15)->withQueryString();

        $stats = [
            'in_gym' => Attendance::inGym()->count(),
            'today' => Attendance::today()->count(),
            'checked_out_today' => Attendance::today()->checkedOut()->count(),
            'total' => Attendance::count(),
        ];

        return Inertia::render('Admin/Attendance/Index', [
            'attendances' => $attendances,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'date' => $date,
                'status' => $status,
                'source' => $source,
            ],
        ]);
    }

    public function kiosk(): Response
    {
        Gate::authorize('kiosk', Attendance::class);

        $stats = [
            'in_gym' => Attendance::inGym()->count(),
            'today' => Attendance::today()->count(),
        ];

        return Inertia::render('Admin/Attendance/Kiosk', [
            'stats' => $stats,
        ]);
    }

    public function show(Attendance $attendance): Response
    {
        Gate::authorize('view', $attendance);

        $attendance->load([
            'member:id,gym_id,first_name,last_name,full_name,member_number,email,phone,address,profile_photo,status',
            'membership:id,gym_id,membership_plan_id,start_date,end_date,price,trainer_quota_total,trainer_quota_used,payment_status',
            'membership.membershipPlan:id,name,billing_period,duration,trainer_quota',
            'gym:id,name,code,address',
            'trainingSessions.workoutType:id,name,category,description',
        ]);

        return Inertia::render('Admin/Attendance/Show', [
            'attendance' => $attendance,
        ]);
    }

    public function checkIn(
        CheckInRequest $request,
        AttendanceService $attendanceService,
        AuditService $auditService
    ): JsonResponse|RedirectResponse {
        Gate::authorize('create', Attendance::class);

        $attendance = $attendanceService->checkIn(
            memberIdentifier: $request->validated('member_number'),
            source: $request->validated('source', 'kiosk'),
            deviceIdentifier: $request->validated('device_identifier')
        );

        $auditService->log(
            action: 'attendance.check_in',
            entityType: Attendance::class,
            entityId: $attendance->id,
            metadata: [
                'member_id' => $attendance->member_id,
                'member_number' => $attendance->member->member_number,
                'membership_id' => $attendance->membership_id,
                'check_in_at' => $attendance->check_in_at->toIso8601String(),
                'source' => $attendance->source,
                'status' => $attendance->status,
            ],
            gymId: $attendance->gym_id
        );

        if ($request->wantsJson() || $request->expectsJson() || $request->header('X-Inertia') === null) {
            return response()->json([
                'success' => true,
                'message' => 'Check-in berhasil! Selamat berlatih.',
                'data' => [
                    'attendance' => $attendance,
                    'member' => $attendance->member,
                    'membership' => $attendance->membership,
                    'gym' => $attendance->gym,
                    'remaining_trainer_quota' => $attendance->membership?->remaining_trainer_quota ?? 0,
                ],
            ]);
        }

        return redirect()->back()->with('success', "Check-in berhasil untuk {$attendance->member->full_name} ({$attendance->member->member_number}).");
    }

    public function checkOut(
        CheckOutRequest $request,
        Attendance $attendance,
        AttendanceService $attendanceService,
        AuditService $auditService
    ): JsonResponse|RedirectResponse {
        Gate::authorize('update', $attendance);

        $updated = $attendanceService->checkOut($attendance, $request->validated('notes'));

        $auditService->log(
            action: 'attendance.check_out',
            entityType: Attendance::class,
            entityId: $updated->id,
            metadata: [
                'member_id' => $updated->member_id,
                'check_in_at' => $updated->check_in_at->toIso8601String(),
                'check_out_at' => $updated->check_out_at->toIso8601String(),
                'duration_minutes' => $updated->duration_in_minutes,
                'status' => $updated->status,
            ],
            gymId: $updated->gym_id
        );

        if ($request->wantsJson() || $request->expectsJson() || $request->header('X-Inertia') === null) {
            return response()->json([
                'success' => true,
                'message' => 'Check-out berhasil. Sampai jumpa kembali!',
                'data' => $updated,
            ]);
        }

        return redirect()->back()->with('success', "Check-out berhasil untuk {$updated->member?->full_name}.");
    }

    public function cancel(
        CancelAttendanceRequest $request,
        Attendance $attendance,
        AttendanceService $attendanceService,
        AuditService $auditService
    ): RedirectResponse {
        Gate::authorize('delete', $attendance);

        $updated = $attendanceService->cancelAttendance($attendance, $request->validated('reason'));

        $auditService->log(
            action: 'attendance.cancelled',
            entityType: Attendance::class,
            entityId: $updated->id,
            metadata: [
                'member_id' => $updated->member_id,
                'reason' => $request->validated('reason'),
                'status' => 'cancelled',
            ],
            gymId: $updated->gym_id
        );

        return redirect()->route('admin.attendance.index')
            ->with('success', "Kunjungan #{$updated->id} telah dibatalkan.");
    }
}