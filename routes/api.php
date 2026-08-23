<?php

use App\Http\Controllers\Api\AttendanceApiController;
use App\Http\Controllers\Api\MemberAuthController;
use App\Http\Controllers\Api\MemberDashboardController;
use App\Http\Controllers\Api\PaymentWebhookController;
use App\Http\Controllers\Api\TrainerApiController;
use App\Http\Controllers\Api\WorkoutSessionApiController;
use App\Http\Middleware\AuthenticateMemberToken;
use Illuminate\Support\Facades\Route;

// Public Midtrans Payment Webhook (Phase 7 - Idempotent, Rate Limited, Signature Verified)
Route::middleware(['throttle:120,1'])->post('payments/midtrans/notification', [PaymentWebhookController::class, 'handleMidtransNotification'])->name('api.payments.midtrans.notification');

// Public Member Authentication (Phase 6 & 7 Hardened)
Route::middleware(['throttle:5,1'])->post('member/login', [MemberAuthController::class, 'login'])->name('api.member.login');

// Authenticated Member Mobile App APIs (Phase 6 & 7 Protected)
Route::middleware(['throttle:60,1', AuthenticateMemberToken::class])->prefix('member')->group(function () {
    Route::post('logout', [MemberAuthController::class, 'logout'])->name('api.member.logout');
    Route::get('me', [MemberAuthController::class, 'me'])->name('api.member.me');
    Route::get('dashboard', [MemberDashboardController::class, 'dashboard'])->name('api.member.dashboard');
    Route::get('membership', [MemberDashboardController::class, 'membership'])->name('api.member.membership');
    Route::get('qr', [MemberDashboardController::class, 'qr'])->name('api.member.qr');
    Route::get('attendance-history', [MemberDashboardController::class, 'attendanceHistory'])->name('api.member.attendance.history');
    Route::get('workout-history', [MemberDashboardController::class, 'workoutHistory'])->name('api.member.workout.history');
});

// Member Mobile App Operation APIs (Protected by AuthenticateMemberToken & Throttle)
Route::middleware(['throttle:60,1', AuthenticateMemberToken::class])->group(function () {
    // Member Attendance APIs
    Route::post('attendance/check-in', [AttendanceApiController::class, 'checkIn'])->name('api.member.attendance.checkin');
    Route::post('attendance/check-out', [AttendanceApiController::class, 'checkOut'])->name('api.member.attendance.checkout');
    Route::get('attendance/active', [AttendanceApiController::class, 'active'])->name('api.member.attendance.active');

    // Member Workout Session APIs
    Route::get('workout-types', [WorkoutSessionApiController::class, 'workoutTypes'])->name('api.member.workout-types');
    Route::post('workout-sessions', [WorkoutSessionApiController::class, 'store'])->name('api.member.workout-sessions.store');
    Route::get('workout-sessions/active', [WorkoutSessionApiController::class, 'active'])->name('api.member.workout-sessions.active');
    Route::get('workout-sessions/history', [WorkoutSessionApiController::class, 'history'])->name('api.member.workout-sessions.history');
    Route::patch('workout-sessions/{workoutSession}/complete', [WorkoutSessionApiController::class, 'complete'])->name('api.member.workout-sessions.complete');
    Route::patch('workout-sessions/{workoutSession}/cancel', [WorkoutSessionApiController::class, 'cancel'])->name('api.member.workout-sessions.cancel');

    // Member Trainer & Quota APIs
    Route::get('trainers', [TrainerApiController::class, 'index'])->name('api.member.trainers.index');
    Route::get('trainers/available', [TrainerApiController::class, 'available'])->name('api.member.trainers.available');
    Route::get('trainers/{trainer}', [TrainerApiController::class, 'show'])->name('api.member.trainers.show');
    Route::get('trainer/quota', [TrainerApiController::class, 'quota'])->name('api.member.trainer.quota');
    Route::get('trainer/schedules', [TrainerApiController::class, 'schedules'])->name('api.member.trainer.schedules');
});

// Backward-compatible Web/Auth API Routes (Phases 1–4C)
Route::middleware(['web', 'auth'])->prefix('admin-api')->group(function () {
    Route::post('attendance/check-in', [AttendanceApiController::class, 'checkIn'])->name('api.attendance.checkin');
    Route::post('attendance/check-out', [AttendanceApiController::class, 'checkOut'])->name('api.attendance.checkout');
    Route::get('attendance/active', [AttendanceApiController::class, 'active'])->name('api.attendance.active');
    Route::get('workout-types', [WorkoutSessionApiController::class, 'workoutTypes'])->name('api.workout-types');
    Route::post('workout-sessions', [WorkoutSessionApiController::class, 'store'])->name('api.workout-sessions.store');
    Route::get('workout-sessions/active', [WorkoutSessionApiController::class, 'active'])->name('api.workout-sessions.active');
    Route::get('workout-sessions/history', [WorkoutSessionApiController::class, 'history'])->name('api.workout-sessions.history');
    Route::patch('workout-sessions/{workoutSession}/complete', [WorkoutSessionApiController::class, 'complete'])->name('api.workout-sessions.complete');
    Route::patch('workout-sessions/{workoutSession}/cancel', [WorkoutSessionApiController::class, 'cancel'])->name('api.workout-sessions.cancel');
    Route::get('trainers', [TrainerApiController::class, 'index'])->name('api.trainers.index');
    Route::get('trainers/available', [TrainerApiController::class, 'available'])->name('api.trainers.available');
    Route::get('trainers/{trainer}', [TrainerApiController::class, 'show'])->name('api.trainers.show');
    Route::get('trainer/quota', [TrainerApiController::class, 'quota'])->name('api.trainer.quota');
    Route::get('trainer/schedules', [TrainerApiController::class, 'schedules'])->name('api.trainer.schedules');
});