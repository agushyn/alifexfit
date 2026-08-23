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

class WebsitePage extends Model
{
    use HasFactory, BelongsToGym, Auditable, SoftDeletes;

    protected $fillable = [
        'gym_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'status',
        'published_at',
        'meta_title',
        'meta_description',
        'og_image',
        'sort_order',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'og_image_url',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($page) {
            if (empty($page->slug)) {
                $page->slug = Str::slug($page->title);
            }
            if ($page->status === 'published' && empty($page->published_at)) {
                $page->published_at = now();
            }
        });

        static::updating(function ($page) {
            if ($page->isDirty('status') && $page->status === 'published' && empty($page->published_at)) {
                $page->published_at = now();
            }
        });
    }

    public function gym(): BelongsTo
    {
        return $this->belongsTo(Gym::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('status', 'draft');
    }

    public function scopeArchived(Builder $query): Builder
    {
        return $query->where('status', 'archived');
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('title', 'asc');
    }

    public function getOgImageUrlAttribute(): ?string
    {
        if (! $this->og_image) {
            return null;
        }

        if (Str::startsWith($this->og_image, ['http://', 'https://'])) {
            return $this->og_image;
        }

        return asset('storage/' . $this->og_image);
    }
}
