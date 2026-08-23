<?php

use App\Http\Controllers\Admin\AttendanceController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\GymController;
use App\Http\Controllers\Admin\MemberController;
use App\Http\Controllers\Admin\MembershipController;
use App\Http\Controllers\Admin\MembershipPlanController;
use App\Http\Controllers\Admin\PlaceholderController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\StorageController;
use App\Http\Controllers\Admin\TrainerController;
use App\Http\Controllers\Admin\TrainerScheduleController;
use App\Http\Controllers\Admin\WorkoutSessionController;
use App\Http\Controllers\Admin\WorkoutTypeController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Admin\LeadController;
use App\Http\Controllers\Admin\MembershipRegistrationController;
use App\Http\Controllers\Admin\Website\WebsiteController;
use App\Http\Controllers\Admin\Website\WebsiteFacilityController;
use App\Http\Controllers\Admin\Website\WebsiteFaqController;
use App\Http\Controllers\Admin\Website\WebsiteHeroController;
use App\Http\Controllers\Admin\Website\WebsitePageController;
use App\Http\Controllers\Admin\Website\WebsiteSectionController;
use App\Http\Controllers\Admin\Website\WebsiteSettingsController;
use App\Http\Controllers\PublicLeadController;
use App\Http\Controllers\PublicMembershipRegistrationController;
use App\Http\Controllers\PublicWebsiteController;
use App\Http\Middleware\ResolvePublicGymContext;

// Public Website Routes (Phase 5, 5B, 5D)
Route::middleware([ResolvePublicGymContext::class])->group(function () {
    Route::get('/', [PublicWebsiteController::class, 'home'])->name('public.home');
    Route::get('membership', [PublicWebsiteController::class, 'membership'])->name('public.membership');
    Route::get('membership/register', [PublicMembershipRegistrationController::class, 'create'])->name('public.membership.register');
    Route::post('membership/register', [PublicMembershipRegistrationController::class, 'store'])->name('public.membership.register.store');
    Route::get('membership/register/payment/{registration}', [PublicMembershipRegistrationController::class, 'payment'])->name('public.membership.register.payment');
    Route::post('membership/register/payment/{registration}', [PublicMembershipRegistrationController::class, 'storePayment'])->name('public.membership.register.payment.store');
    Route::get('membership/register/payment/{registration}/status', [PublicMembershipRegistrationController::class, 'paymentStatus'])->name('public.membership.register.payment.status');
    Route::get('membership/register/success', [PublicMembershipRegistrationController::class, 'success'])->name('public.membership.register.success');
    
    // Public Lead Capture & Consultation (Phase 5D)
    Route::get('lead', [PublicLeadController::class, 'create'])->name('public.leads.create');
    Route::post('lead', [PublicLeadController::class, 'store'])->name('public.leads.store')->middleware('throttle:10,1');
    Route::get('lead/success', [PublicLeadController::class, 'success'])->name('public.leads.success');

    Route::get('trainers', [PublicWebsiteController::class, 'trainers'])->name('public.trainers');
    Route::get('trainers/{trainer}', [PublicWebsiteController::class, 'trainerDetail'])->name('public.trainers.show');
    Route::get('workouts', [PublicWebsiteController::class, 'workouts'])->name('public.workouts');
    Route::get('facilities', [PublicWebsiteController::class, 'facilities'])->name('public.facilities');
    Route::get('about', [PublicWebsiteController::class, 'about'])->name('public.about');
    Route::get('faq', [PublicWebsiteController::class, 'faq'])->name('public.faq');
    Route::get('contact', [PublicWebsiteController::class, 'contact'])->name('public.contact');
    Route::get('p/{slug}', [PublicWebsiteController::class, 'page'])->name('public.pages.show');
    Route::post('branch/switch', [PublicWebsiteController::class, 'switchBranch'])->name('public.branch.switch');
});

// Guest Authentication Routes
Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
});

// Authenticated Admin Routes
Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Members Management (Phase 2)
    Route::resource('members', MemberController::class);

    // Online & Onsite Membership Registrations (Phase 5B & 5C)
    Route::get('membership-registrations', [MembershipRegistrationController::class, 'index'])->name('membership-registrations.index');
    Route::get('membership-registrations/onsite/create', [MembershipRegistrationController::class, 'createOnsite'])->name('membership-registrations.onsite.create');
    Route::post('membership-registrations/onsite', [MembershipRegistrationController::class, 'storeOnsite'])->name('membership-registrations.onsite.store');
    Route::get('membership-registrations/onsite/{registration}/success', [MembershipRegistrationController::class, 'successOnsite'])->name('membership-registrations.onsite.success');
    Route::get('membership-registrations/{registration}', [MembershipRegistrationController::class, 'show'])->name('membership-registrations.show');
    Route::get('membership-registrations/{registration}/ktp', [MembershipRegistrationController::class, 'showKtp'])->name('membership-registrations.ktp');
    Route::post('membership-registrations/{registration}/approve', [MembershipRegistrationController::class, 'approve'])->name('membership-registrations.approve');
    Route::post('membership-registrations/{registration}/retry-activation', [MembershipRegistrationController::class, 'retryActivation'])->name('membership-registrations.retry-activation');
    Route::post('membership-registrations/{registration}/reject', [MembershipRegistrationController::class, 'reject'])->name('membership-registrations.reject');
    Route::post('membership-registrations/{registration}/cancel', [MembershipRegistrationController::class, 'cancel'])->name('membership-registrations.cancel');

    // Lead Management & CRM (Phase 5D)
    Route::get('leads', [LeadController::class, 'index'])->name('leads.index');
    Route::get('leads/create', [LeadController::class, 'create'])->name('leads.create');
    Route::post('leads', [LeadController::class, 'store'])->name('leads.store');
    Route::get('leads/{lead}', [LeadController::class, 'show'])->name('leads.show');
    Route::put('leads/{lead}', [LeadController::class, 'update'])->name('leads.update');
    Route::post('leads/{lead}/assign', [LeadController::class, 'assign'])->name('leads.assign');
    Route::post('leads/{lead}/status', [LeadController::class, 'updateStatus'])->name('leads.status');
    Route::post('leads/{lead}/contact', [LeadController::class, 'recordContact'])->name('leads.contact');
    Route::post('leads/{lead}/convert', [LeadController::class, 'convert'])->name('leads.convert');

    // Attendance & Kiosk Check-In (Phase 4)
    Route::get('attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::get('attendance/kiosk', [AttendanceController::class, 'kiosk'])->name('attendance.kiosk');
    Route::post('attendance/check-in', [AttendanceController::class, 'checkIn'])->name('attendance.checkin');
    Route::get('attendance/{attendance}', [AttendanceController::class, 'show'])->name('attendance.show');
    Route::post('attendance/{attendance}/check-out', [AttendanceController::class, 'checkOut'])->name('attendance.checkout');
    Route::post('attendance/{attendance}/cancel', [AttendanceController::class, 'cancel'])->name('attendance.cancel');

    // Workout Sessions & Tracking (Phase 4B)
    Route::get('workout-sessions', [WorkoutSessionController::class, 'index'])->name('workout-sessions.index');
    Route::get('workout-sessions/{workout_session}', [WorkoutSessionController::class, 'show'])->name('workout-sessions.show');
    Route::post('workout-sessions/{workout_session}/complete', [WorkoutSessionController::class, 'complete'])->name('workout-sessions.complete');
    Route::post('workout-sessions/{workout_session}/cancel', [WorkoutSessionController::class, 'cancel'])->name('workout-sessions.cancel');

    // Membership Plans & Subscriptions (Phase 3)
    Route::resource('membership-plans', MembershipPlanController::class);
    Route::resource('memberships', MembershipController::class);

    // Workout Types (Phase 3)
    Route::resource('workout-types', WorkoutTypeController::class);

    // Trainers & Schedules (Phase 4C & 6.5)
    Route::post('trainers/reorder', [TrainerController::class, 'reorder'])->name('trainers.reorder');
    Route::post('trainers/{trainer}/toggle-status', [TrainerController::class, 'toggleStatus'])->name('trainers.toggle-status');
    Route::resource('trainers', TrainerController::class);
    Route::get('trainers/{trainer}/schedules', [TrainerScheduleController::class, 'index'])->name('trainers.schedules.index');
    Route::post('trainers/{trainer}/schedules', [TrainerScheduleController::class, 'store'])->name('trainers.schedules.store');
    Route::put('trainer-schedules/{schedule}', [TrainerScheduleController::class, 'update'])->name('trainers.schedules.update');
    Route::delete('trainer-schedules/{schedule}', [TrainerScheduleController::class, 'destroy'])->name('trainers.schedules.destroy');

    // Website CMS & Public Branding (Phase 5 & 6.5)
    Route::prefix('website')->name('website.')->group(function () {
        Route::get('/', [WebsiteController::class, 'overview'])->name('overview');
        Route::get('settings', [WebsiteSettingsController::class, 'edit'])->name('settings.edit');
        Route::post('settings', [WebsiteSettingsController::class, 'update'])->name('settings.update');

        // Home Hero CMS (Phase 6.5)
        Route::post('heroes/reorder', [WebsiteHeroController::class, 'reorder'])->name('heroes.reorder');
        Route::post('heroes/{hero}/toggle-status', [WebsiteHeroController::class, 'toggleStatus'])->name('heroes.toggle-status');
        Route::resource('heroes', WebsiteHeroController::class)->except(['show'])->where(['hero' => '[0-9]+']);

        Route::resource('pages', WebsitePageController::class);
        Route::resource('faqs', WebsiteFaqController::class);
        Route::resource('facilities', WebsiteFacilityController::class);

        Route::get('sections', [WebsiteSectionController::class, 'index'])->name('sections.index');
        Route::get('sections/{sectionKey}/edit', [WebsiteSectionController::class, 'edit'])->name('sections.edit');
        Route::put('sections/{sectionKey}', [WebsiteSectionController::class, 'update'])->name('sections.update');
    });

    // Gyms Management (Super Admin & Authorized users)
    Route::get('gyms', [GymController::class, 'index'])->name('gyms.index');
    Route::get('gyms/create', [GymController::class, 'create'])->name('gyms.create');
    Route::post('gyms', [GymController::class, 'store'])->name('gyms.store');
    Route::get('gyms/{gym}/edit', [GymController::class, 'edit'])->name('gyms.edit');
    Route::put('gyms/{gym}', [GymController::class, 'update'])->name('gyms.update');
    Route::delete('gyms/{gym}', [GymController::class, 'destroy'])->name('gyms.destroy');
    Route::post('gyms/{gym}/switch', [GymController::class, 'switchContext'])->name('gyms.switch');

    // Settings
    Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('settings', [SettingController::class, 'update'])->name('settings.update');

    // Audit Logs
    Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');

    // Secure Private Storage Inspection
    Route::get('storage/private', [StorageController::class, 'showPrivate'])->name('storage.private');

    // Future Phase Placeholders
    Route::get('modules/{module}', [PlaceholderController::class, 'show'])->name('modules.show');
});
