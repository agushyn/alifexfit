<?php

namespace App\Providers;

use App\Models\Attendance;
use App\Models\AuditLog;
use App\Models\Gym;
use App\Models\GymSetting;
use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipPlan;
use App\Models\TrainingSession;
use App\Models\User;
use App\Models\WorkoutType;
use App\Policies\AttendancePolicy;
use App\Policies\AuditLogPolicy;
use App\Policies\GymPolicy;
use App\Policies\GymSettingPolicy;
use App\Policies\MemberPolicy;
use App\Policies\MembershipPlanPolicy;
use App\Policies\MembershipPolicy;
use App\Policies\TrainingSessionPolicy;
use App\Policies\WorkoutTypePolicy;
use App\Services\Tenancy\GymContext;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(GymContext::class, function () {
            return new GymContext();
        });

        $this->app->bind(
            \App\Services\Payments\PaymentGatewayInterface::class,
            \App\Services\Payments\MidtransPaymentGateway::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Gym::class, GymPolicy::class);
        Gate::policy(GymSetting::class, GymSettingPolicy::class);
        Gate::policy(AuditLog::class, AuditLogPolicy::class);
        Gate::policy(Member::class, MemberPolicy::class);
        Gate::policy(MembershipPlan::class, MembershipPlanPolicy::class);
        Gate::policy(Membership::class, MembershipPolicy::class);
        Gate::policy(WorkoutType::class, WorkoutTypePolicy::class);
        Gate::policy(Attendance::class, AttendancePolicy::class);
        Gate::policy(\App\Models\Trainer::class, \App\Policies\TrainerPolicy::class);
        Gate::policy(\App\Models\WebsiteHero::class, \App\Policies\WebsitePolicy::class);
        Gate::policy(\App\Models\WebsitePage::class, \App\Policies\WebsitePolicy::class);
        Gate::policy(\App\Models\WebsiteFaq::class, \App\Policies\WebsitePolicy::class);
        Gate::policy(\App\Models\WebsiteFacility::class, \App\Policies\WebsitePolicy::class);
        Gate::policy(\App\Models\WebsiteSection::class, \App\Policies\WebsitePolicy::class);
        Gate::policy(\App\Models\MembershipRegistration::class, \App\Policies\MembershipRegistrationPolicy::class);
        Gate::policy(\App\Models\Lead::class, \App\Policies\LeadPolicy::class);

        // Super Admin can perform any action
        Gate::before(function (User $user, string $ability) {
            if ($user->isSuperAdmin()) {
                return true;
            }
        });

        // Dynamic Gate resolution based on permissions
        Gate::after(function (User $user, string $ability, ?bool $result) {
            if ($result !== null) {
                return $result;
            }

            return $user->hasPermission($ability);
        });
    }
}
