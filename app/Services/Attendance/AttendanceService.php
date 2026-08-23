<?php

namespace App\Services\Attendance;

use App\Models\Attendance;
use App\Models\Member;
use App\Models\Membership;
use App\Services\Tenancy\GymContext;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AttendanceService
{
    public function __construct(
        protected GymContext $gymContext
    ) {}

    public function checkIn(
        string $memberIdentifier,
        string $source = 'kiosk',
        ?string $deviceIdentifier = null,
        ?int $gymId = null
    ): Attendance {
        $effectiveGymId = $gymId ?? $this->gymContext->getGymId();

        if (!$effectiveGymId) {
            throw ValidationException::withMessages([
                'member_number' => 'Sesi gym aktif tidak ditemukan.',
            ]);
        }

        return DB::transaction(function () use ($memberIdentifier, $source, $deviceIdentifier, $effectiveGymId) {
            $rawInput = trim($memberIdentifier);
            $identifier = $rawInput;

            // Handle structured JSON QR payload verification
            if (str_starts_with($rawInput, '{') && str_ends_with($rawInput, '}')) {
                $decoded = json_decode($rawInput, true);
                if (is_array($decoded) && ($decoded['type'] ?? '') === 'EXFITS_MEMBER_QR') {
                    $memberNum = $decoded['member'] ?? '';
                    $gymCode = $decoded['gym'] ?? '';
                    $issuedAt = $decoded['issued_at'] ?? 0;
                    $providedHash = $decoded['hash'] ?? '';

                    $expectedHash = hash_hmac('sha256', "{$memberNum}:{$gymCode}:{$issuedAt}", config('app.key'));
                    if (! hash_equals($expectedHash, $providedHash)) {
                        throw ValidationException::withMessages([
                            'member_number' => 'Kode QR member tidak valid atau telah dipalsukan.',
                        ]);
                    }

                    $identifier = $memberNum;
                }
            }

            // 1. Resolve Member with row locking
            $member = Member::withoutGymScope()
                ->where('member_number', $identifier)
                ->orWhere('id', is_numeric($identifier) ? (int) $identifier : 0)
                ->lockForUpdate()
                ->first();

            if (!$member) {
                throw ValidationException::withMessages([
                    'member_number' => 'Member tidak ditemukan.',
                ]);
            }

            // 2. Verify Tenant Isolation
            if ((int) $member->gym_id !== (int) $effectiveGymId) {
                throw ValidationException::withMessages([
                    'member_number' => 'Member tidak terdaftar pada gym ini.',
                ]);
            }

            // 3. Verify Member Status
            if ($member->status === 'inactive') {
                throw ValidationException::withMessages([
                    'member_number' => 'Member tidak aktif.',
                ]);
            }

            if ($member->status === 'suspended') {
                throw ValidationException::withMessages([
                    'member_number' => 'Membership/member sedang ditangguhkan.',
                ]);
            }

            if ($member->status === 'expired') {
                throw ValidationException::withMessages([
                    'member_number' => 'Member expired.',
                ]);
            }

            // 4. Duplicate Active Check-in Prevention
            $activeAttendance = Attendance::withoutGymScope()
                ->where('member_id', $member->id)
                ->where('status', 'in_gym')
                ->whereNull('check_out_at')
                ->lockForUpdate()
                ->first();

            if ($activeAttendance) {
                throw ValidationException::withMessages([
                    'member_number' => 'Member masih berada di dalam gym.',
                ]);
            }

            // 5. Verify Active Membership
            $today = Carbon::today()->format('Y-m-d');

            $activeMembership = Membership::withoutGymScope()
                ->where('gym_id', $effectiveGymId)
                ->where('member_id', $member->id)
                ->where('status', 'active')
                ->whereDate('start_date', '<=', $today)
                ->whereDate('end_date', '>=', $today)
                ->latest('id')
                ->first();

            if (!$activeMembership) {
                // Check if any expired membership exists for clear error feedback
                $hasExpired = Membership::withoutGymScope()
                    ->where('gym_id', $effectiveGymId)
                    ->where('member_id', $member->id)
                    ->whereDate('end_date', '<', $today)
                    ->exists();

                if ($hasExpired) {
                    throw ValidationException::withMessages([
                        'member_number' => 'Membership member sudah expired.',
                    ]);
                }

                throw ValidationException::withMessages([
                    'member_number' => 'Member tidak memiliki membership aktif.',
                ]);
            }

            // 6. Create Attendance Record
            $attendance = Attendance::withoutGymScope()->create([
                'gym_id' => $effectiveGymId,
                'member_id' => $member->id,
                'membership_id' => $activeMembership->id,
                'check_in_at' => Carbon::now(),
                'status' => 'in_gym',
                'source' => in_array($source, ['kiosk', 'app', 'admin']) ? $source : 'kiosk',
                'device_identifier' => $deviceIdentifier,
            ]);

            $attendance->load([
                'member:id,gym_id,first_name,last_name,full_name,member_number,profile_photo,status',
                'membership:id,gym_id,membership_plan_id,start_date,end_date,status,price,trainer_quota_total,trainer_quota_used',
                'membership.membershipPlan:id,name,billing_period,duration',
                'gym:id,name,code',
            ]);

            return $attendance;
        });
    }

    public function checkOut(int|Attendance $attendance, ?string $notes = null): Attendance
    {
        return DB::transaction(function () use ($attendance, $notes) {
            $attendanceModel = $attendance instanceof Attendance
                ? Attendance::withoutGymScope()->lockForUpdate()->findOrFail($attendance->id)
                : Attendance::withoutGymScope()->lockForUpdate()->findOrFail($attendance);

            if ($attendanceModel->status !== 'in_gym' || $attendanceModel->check_out_at !== null) {
                throw ValidationException::withMessages([
                    'attendance' => 'Kunjungan ini sudah selesai atau tidak aktif.',
                ]);
            }

            $now = Carbon::now();
            $attendanceModel->update([
                'check_out_at' => $now,
                'status' => 'checked_out',
                'notes' => $notes ? ($attendanceModel->notes ? "{$attendanceModel->notes} | {$notes}" : $notes) : $attendanceModel->notes,
            ]);

            // Auto-complete any in-progress training sessions under this attendance through WorkoutSessionService
            $inProgressSessions = \App\Models\TrainingSession::withoutGymScope()
                ->where('attendance_id', $attendanceModel->id)
                ->where('status', 'in_progress')
                ->get();

            /** @var \App\Services\Workouts\WorkoutSessionService $workoutSessionService */
            $workoutSessionService = app(\App\Services\Workouts\WorkoutSessionService::class);
            foreach ($inProgressSessions as $inProgressSession) {
                $workoutSessionService->completeSession($inProgressSession, 'Auto-completed upon attendance checkout');
            }

            $attendanceModel->load([
                'member:id,gym_id,first_name,last_name,full_name,member_number',
                'membership.membershipPlan:id,name',
                'gym:id,name,code',
                'trainingSessions.workoutType',
            ]);

            return $attendanceModel;
        });
    }

    public function checkOutMember(string $memberIdentifier, ?int $gymId = null): Attendance
    {
        $effectiveGymId = $gymId ?? $this->gymContext->getGymId();
        $identifier = trim($memberIdentifier);

        $member = Member::withoutGymScope()
            ->where('member_number', $identifier)
            ->orWhere('id', is_numeric($identifier) ? (int) $identifier : 0)
            ->first();

        if (!$member) {
            throw ValidationException::withMessages([
                'member_number' => 'Member tidak ditemukan.',
            ]);
        }

        $activeAttendance = Attendance::withoutGymScope()
            ->where('member_id', $member->id)
            ->where('status', 'in_gym')
            ->whereNull('check_out_at')
            ->first();

        if (!$activeAttendance) {
            throw ValidationException::withMessages([
                'member_number' => 'Tidak ada kunjungan aktif untuk member ini.',
            ]);
        }

        return $this->checkOut($activeAttendance);
    }

    public function cancelAttendance(Attendance $attendance, ?string $reason = null): Attendance
    {
        return DB::transaction(function () use ($attendance, $reason) {
            $attendanceModel = Attendance::withoutGymScope()->lockForUpdate()->findOrFail($attendance->id);

            $notes = $reason
                ? ($attendanceModel->notes ? "{$attendanceModel->notes} | Cancelled: {$reason}" : "Cancelled: {$reason}")
                : ($attendanceModel->notes ?? 'Cancelled by staff');

            $attendanceModel->update([
                'status' => 'cancelled',
                'notes' => $notes,
            ]);

            return $attendanceModel;
        });
    }
}