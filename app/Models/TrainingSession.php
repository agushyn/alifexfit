<?php

namespace App\Models;

use App\Traits\Auditable;
use App\Traits\BelongsToGym;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrainingSession extends Model
{
    use HasFactory, BelongsToGym, Auditable, SoftDeletes;

    protected $fillable = [
        'gym_id',
        'attendance_id',
        'member_id',
        'membership_id',
        'workout_type_id',
        'trainer_id',
        'started_at',
        'completed_at',
        'trainer_quota_consumed_at',
        'status',
        'notes',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'trainer_quota_consumed_at' => 'datetime',
    ];

    protected $appends = [
        'duration_in_minutes',
        'duration_formatted',
    ];

    public function gym(): BelongsTo
    {
        return $this->belongsTo(Gym::class);
    }

    public function attendance(): BelongsTo
    {
        return $this->belongsTo(Attendance::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function membership(): BelongsTo
    {
        return $this->belongsTo(Membership::class);
    }

    public function workoutType(): BelongsTo
    {
        return $this->belongsTo(WorkoutType::class);
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(Trainer::class);
    }

    public function hasTrainer(): bool
    {
        return $this->trainer_id !== null;
    }

    public function hasConsumedQuota(): bool
    {
        return $this->trainer_quota_consumed_at !== null;
    }

    public function scopeInProgress(Builder $query): Builder
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'completed');
    }

    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('started_at', Carbon::today());
    }

    public function getDurationInMinutesAttribute(): int
    {
        if (! $this->started_at) {
            return 0;
        }

        $endTime = $this->completed_at ?? Carbon::now();

        return (int) $this->started_at->diffInMinutes($endTime);
    }

    public function getDurationFormattedAttribute(): string
    {
        $minutes = $this->duration_in_minutes;
        $hours = intdiv($minutes, 60);
        $remainingMinutes = $minutes % 60;

        if ($hours > 0) {
            return $remainingMinutes > 0 ? "{$hours}h {$remainingMinutes}m" : "{$hours}h";
        }

        return "{$remainingMinutes}m";
    }
}