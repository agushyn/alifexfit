<?php

namespace App\Models;

use App\Traits\Auditable;
use App\Traits\BelongsToGym;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Trainer extends Model
{
    use HasFactory, BelongsToGym, Auditable, SoftDeletes;

    protected $fillable = [
        'gym_id',
        'name',
        'role',
        'email',
        'phone',
        'bio',
        'profile_photo',
        'status',
        'specialization',
        'certification',
        'sort_order',
        'hire_date',
        'notes',
    ];

    protected $casts = [
        'hire_date' => 'date',
        'status' => 'string',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'profile_photo_url',
        'is_active',
    ];

    public function gym(): BelongsTo
    {
        return $this->belongsTo(Gym::class);
    }

    public function trainingSessions(): HasMany
    {
        return $this->hasMany(TrainingSession::class)->latest('started_at');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(TrainerSchedule::class)->orderBy('day_of_week')->orderBy('start_time');
    }

    public function activeSchedules(): HasMany
    {
        return $this->hasMany(TrainerSchedule::class)
            ->where('status', 'active')
            ->orderBy('day_of_week')
            ->orderBy('start_time');
    }

    public function getProfilePhotoUrlAttribute(): ?string
    {
        if (! $this->profile_photo) {
            return null;
        }

        if (Str::startsWith($this->profile_photo, ['http://', 'https://'])) {
            return $this->profile_photo;
        }

        return Storage::disk('public')->url($this->profile_photo);
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }

    public function setIsActiveAttribute($value): void
    {
        $this->attributes['status'] = filter_var($value, FILTER_VALIDATE_BOOLEAN) ? 'active' : 'inactive';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('status', 'inactive');
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('name', 'asc');
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (empty($search)) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('role', 'like', "%{$search}%")
                ->orWhere('specialization', 'like', "%{$search}%")
                ->orWhere('certification', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%");
        });
    }
}
