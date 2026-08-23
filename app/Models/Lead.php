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

class Lead extends Model
{
    use HasFactory, BelongsToGym, Auditable, SoftDeletes;

    public const STATUS_NEW = 'new';
    public const STATUS_CONTACTED = 'contacted';
    public const STATUS_QUALIFIED = 'qualified';
    public const STATUS_INTERESTED = 'interested';
    public const STATUS_NOT_INTERESTED = 'not_interested';
    public const STATUS_LOST = 'lost';
    public const STATUS_CONVERTED = 'converted';

    public const SOURCE_WEBSITE = 'website';
    public const SOURCE_WHATSAPP = 'whatsapp';
    public const SOURCE_WALK_IN = 'walk_in';
    public const SOURCE_INSTAGRAM = 'instagram';
    public const SOURCE_FACEBOOK = 'facebook';
    public const SOURCE_REFERRAL = 'referral';
    public const SOURCE_OTHER = 'other';

    public const INTEREST_MEMBERSHIP = 'membership';
    public const INTEREST_TRIAL = 'trial';
    public const INTEREST_PERSONAL_TRAINING = 'personal_training';
    public const INTEREST_WORKOUT = 'workout';
    public const INTEREST_GENERAL_INQUIRY = 'general_inquiry';
    public const INTEREST_OTHER = 'other';

    protected $fillable = [
        'gym_id',
        'lead_number',
        'name',
        'email',
        'phone',
        'whatsapp',
        'membership_plan_id',
        'interest_type',
        'message',
        'source',
        'source_detail',
        'status',
        'assigned_to',
        'last_contacted_at',
        'next_follow_up_at',
        'converted_at',
        'membership_registration_id',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'last_contacted_at' => 'datetime',
        'next_follow_up_at' => 'datetime',
        'converted_at' => 'datetime',
        'metadata' => 'array',
    ];

    protected $appends = [
        'is_terminal',
    ];

    // Scopes
    public function scopeNew(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_NEW);
    }

    public function scopeContacted(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_CONTACTED);
    }

    public function scopeQualified(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_QUALIFIED);
    }

    public function scopeInterested(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_INTERESTED);
    }

    public function scopeConverted(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_CONVERTED);
    }

    public function scopeLost(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_LOST);
    }

    public function scopeNotInterested(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_NOT_INTERESTED);
    }

    public function scopeFollowUpDue(Builder $query): Builder
    {
        return $query->whereNotNull('next_follow_up_at')
            ->where('next_follow_up_at', '<=', now())
            ->whereNotIn('status', [self::STATUS_CONVERTED, self::STATUS_LOST, self::STATUS_NOT_INTERESTED]);
    }

    // Accessors
    public function getIsTerminalAttribute(): bool
    {
        return in_array($this->status, [self::STATUS_CONVERTED, self::STATUS_LOST, self::STATUS_NOT_INTERESTED], true);
    }

    // Relationships
    public function gym(): BelongsTo
    {
        return $this->belongsTo(Gym::class);
    }

    public function membershipPlan(): BelongsTo
    {
        return $this->belongsTo(MembershipPlan::class, 'membership_plan_id');
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function membershipRegistration(): BelongsTo
    {
        return $this->belongsTo(MembershipRegistration::class, 'membership_registration_id');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(LeadActivity::class, 'lead_id')->latest('contacted_at');
    }
}
