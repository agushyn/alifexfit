<?php

namespace App\Models;

use App\Traits\Auditable;
use App\Traits\BelongsToGym;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Attendance extends Model
{
    use HasFactory, BelongsToGym, Auditable, SoftDeletes;

    protected $fillable = [
        'gym_id',
        'member_id',
        'membership_id',
        'check_in_at',
        'check_out_at',
        'status',
        'source',
        'device_identifier',
        'notes',
    ];

    protected $casts = [
        'check_in_at' => 'datetime',
        'check_out_at' => 'datetime',
        'status' => 'string',
        'source' => 'string',
    ];

    protected $appends = [
        'duration_in_minutes',
        'duration_formatted',
    ];

    public function gym(): BelongsTo
    {
        return $this->belongsTo(Gym::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function membership(): BelongsTo
    {
        return $this->belongsTo(Membership::class);
    }

    public function trainingSessions(): HasMany
    {
        return $this->hasMany(TrainingSession::class);
    }

    public function activeTrainingSession(): HasOne
    {
        return $this->hasOne(TrainingSession::class)->where('status', 'in_progress')->latestOfMany();
    }

    public function latestTrainingSession(): HasOne
    {
        return $this->hasOne(TrainingSession::class)->latestOfMany();
    }

    public function scopeInGym(Builder $query): Builder
    {
        return $query->where('status', 'in_gym')->whereNull('check_out_at');
    }

    public function scopeCheckedOut(Builder $query): Builder
    {
        return $query->where('status', 'checked_out');
    }

    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('check_in_at', Carbon::today());
    }

    public function getDurationInMinutesAttribute(): ?int
    {
        if (!$this->check_in_at) {
            return null;
        }

        $endTime = $this->check_out_at ?? now();
        return (int) $this->check_in_at->diffInMinutes($endTime);
    }

    public function getDurationFormattedAttribute(): string
    {
        $minutes = $this->duration_in_minutes;
        if ($minutes === null) {
            return '—';
        }

        $hours = floor($minutes / 60);
        $remMinutes = $minutes % 60;

        if ($hours > 0) {
            return "{$hours}h {$remMinutes}m";
        }

        return "{$remMinutes}m";
    }
}