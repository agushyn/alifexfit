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
use Illuminate\Support\Str;

class MembershipPlan extends Model
{
    use HasFactory, BelongsToGym, Auditable, SoftDeletes;

    protected $fillable = [
        'gym_id',
        'name',
        'slug',
        'description',
        'price',
        'billing_period',
        'duration',
        'joining_fee',
        'trainer_quota',
        'benefits',
        'status',
        'featured',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'joining_fee' => 'decimal:2',
        'duration' => 'integer',
        'trainer_quota' => 'integer',
        'benefits' => 'array',
        'featured' => 'boolean',
        'sort_order' => 'integer',
        'status' => 'string',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function (MembershipPlan $plan) {
            if (empty($plan->slug)) {
                $baseSlug = Str::slug($plan->name);
                $plan->slug = $baseSlug;
            }
        });
    }

    public function gym(): BelongsTo
    {
        return $this->belongsTo(Gym::class);
    }

    public function memberships(): HasMany
    {
        return $this->hasMany(Membership::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('featured', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('price');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}