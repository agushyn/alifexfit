<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Gym extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'name',
        'slug',
        'code',
        'phone',
        'email',
        'address',
        'logo',
        'timezone',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($gym) {
            if (empty($gym->slug)) {
                $gym->slug = Str::slug($gym->name);
            }
            if (empty($gym->code)) {
                $gym->code = 'EXF-' . strtoupper(Str::random(5));
            }
        });
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(Member::class);
    }

    public function membershipPlans(): HasMany
    {
        return $this->hasMany(MembershipPlan::class);
    }

    public function memberships(): HasMany
    {
        return $this->hasMany(Membership::class);
    }

    public function workoutTypes(): HasMany
    {
        return $this->hasMany(WorkoutType::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function trainingSessions(): HasMany
    {
        return $this->hasMany(TrainingSession::class);
    }

    public function trainers(): HasMany
    {
        return $this->hasMany(Trainer::class);
    }

    public function trainerSchedules(): HasMany
    {
        return $this->hasMany(TrainerSchedule::class);
    }

    public function settings(): HasMany
    {
        return $this->hasMany(GymSetting::class);
    }

    public function websitePages(): HasMany
    {
        return $this->hasMany(WebsitePage::class);
    }

    public function websiteFaqs(): HasMany
    {
        return $this->hasMany(WebsiteFaq::class);
    }

    public function websiteFacilities(): HasMany
    {
        return $this->hasMany(WebsiteFacility::class);
    }

    public function websiteSections(): HasMany
    {
        return $this->hasMany(WebsiteSection::class);
    }

    public function membershipRegistrations(): HasMany
    {
        return $this->hasMany(MembershipRegistration::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
