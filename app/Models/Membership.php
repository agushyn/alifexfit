<?php

namespace App\Models;

use App\Traits\Auditable;
use App\Traits\BelongsToGym;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Membership extends Model
{
    use HasFactory, BelongsToGym, Auditable, SoftDeletes;

    protected $fillable = [
        'gym_id',
        'member_id',
        'membership_plan_id',
        'start_date',
        'end_date',
        'status',
        'price',
        'payment_status',
        'trainer_quota_total',
        'trainer_quota_used',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'price' => 'decimal:2',
        'trainer_quota_total' => 'integer',
        'trainer_quota_used' => 'integer',
        'status' => 'string',
        'payment_status' => 'string',
    ];

    protected $appends = [
        'remaining_trainer_quota',
    ];

    public function gym(): BelongsTo
    {
        return $this->belongsTo(Gym::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function membershipPlan(): BelongsTo
    {
        return $this->belongsTo(MembershipPlan::class, 'membership_plan_id');
    }

    public function membershipRegistration(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(MembershipRegistration::class);
    }

    public function attendances(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Attendance::class)->latest('check_in_at');
    }

    public function trainingSessions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TrainingSession::class)->latest('started_at');
    }

    public function getRemainingTrainerQuotaAttribute(): int
    {
        return max(0, $this->trainer_quota_total - $this->trainer_quota_used);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopeExpired(Builder $query): Builder
    {
        return $query->where('status', 'expired');
    }

    public function scopeSuspended(Builder $query): Builder
    {
        return $query->where('status', 'suspended');
    }

    public function scopeCancelled(Builder $query): Builder
    {
        return $query->where('status', 'cancelled');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isExpired(): bool
    {
        return $this->status === 'expired' || ($this->end_date && $this->end_date->isPast());
    }
}