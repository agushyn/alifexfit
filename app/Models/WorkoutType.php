<?php

namespace App\Models;

use App\Traits\Auditable;
use App\Traits\BelongsToGym;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class WorkoutType extends Model
{
    use HasFactory, BelongsToGym, Auditable, SoftDeletes;

    protected $fillable = [
        'gym_id',
        'name',
        'slug',
        'description',
        'category',
        'status',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'status' => 'string',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function (WorkoutType $type) {
            if (empty($type->slug)) {
                $type->slug = Str::slug($type->name);
            }
        });
    }

    public function gym(): BelongsTo
    {
        return $this->belongsTo(Gym::class);
    }

    public function trainingSessions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TrainingSession::class);
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