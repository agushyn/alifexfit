<?php

namespace App\Models;

use App\Traits\Auditable;
use App\Traits\BelongsToGym;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, BelongsToGym, Auditable, SoftDeletes;

    protected $fillable = [
        'gym_id',
        'membership_registration_id',
        'order_id',
        'provider',
        'provider_transaction_id',
        'provider_reference',
        'payment_method',
        'payment_channel',
        'amount',
        'currency',
        'status',
        'payment_url',
        'qr_string',
        'va_number',
        'bill_key',
        'biller_code',
        'expires_at',
        'paid_at',
        'raw_response',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expires_at' => 'datetime',
        'paid_at' => 'datetime',
        'raw_response' => 'array',
    ];

    protected $appends = [
        'is_paid',
        'is_pending',
        'is_expired',
        'is_failed',
    ];

    // Scopes
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid(Builder $query): Builder
    {
        return $query->where('status', 'paid');
    }

    public function scopeFailed(Builder $query): Builder
    {
        return $query->where('status', 'failed');
    }

    public function scopeExpired(Builder $query): Builder
    {
        return $query->where('status', 'expired');
    }

    // Accessors
    public function getIsPaidAttribute(): bool
    {
        return $this->status === 'paid';
    }

    public function getIsPendingAttribute(): bool
    {
        return $this->status === 'pending';
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->status === 'expired' || ($this->status === 'pending' && $this->expires_at && $this->expires_at->isPast());
    }

    public function getIsFailedAttribute(): bool
    {
        return in_array($this->status, ['failed', 'cancelled', 'expired'], true);
    }

    // Relationships
    public function gym(): BelongsTo
    {
        return $this->belongsTo(Gym::class);
    }

    public function registration(): BelongsTo
    {
        return $this->belongsTo(MembershipRegistration::class, 'membership_registration_id');
    }
}
