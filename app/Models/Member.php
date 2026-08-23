<?php

namespace App\Models;

use App\Traits\Auditable;
use App\Traits\BelongsToGym;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Member extends Model
{
    use HasFactory, BelongsToGym, Auditable, SoftDeletes;

    protected $fillable = [
        'gym_id',
        'member_number',
        'first_name',
        'last_name',
        'full_name',
        'email',
        'phone',
        'password',
        'date_of_birth',
        'gender',
        'address',
        'emergency_contact',
        'profile_photo',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'password' => 'hashed',
        'emergency_contact' => 'array',
        'status' => 'string',
    ];

    protected $appends = [
        'profile_photo_url',
    ];

    protected static function boot()
    {
        parent::boot();

        static::saving(function (Member $member) {
            $member->full_name = trim("{$member->first_name} {$member->last_name}");
        });
    }

    public function gym(): BelongsTo
    {
        return $this->belongsTo(Gym::class);
    }

    public function memberships(): HasMany
    {
        return $this->hasMany(Membership::class)->latest('start_date');
    }

    public function activeMembership(): HasOne
    {
        return $this->hasOne(Membership::class)
            ->where('status', 'active')
            ->whereDate('start_date', '<=', now())
            ->whereDate('end_date', '>=', now())
            ->latest('id');
    }

    public function latestMembership(): HasOne
    {
        return $this->hasOne(Membership::class)->latestOfMany();
    }

    public function membershipRegistration(): HasOne
    {
        return $this->hasOne(MembershipRegistration::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class)->latest('check_in_at');
    }

    public function activeAttendance(): HasOne
    {
        return $this->hasOne(Attendance::class)
            ->where('status', 'in_gym')
            ->whereNull('check_out_at')
            ->latest('id');
    }

    public function latestAttendance(): HasOne
    {
        return $this->hasOne(Attendance::class)->latestOfMany('check_in_at');
    }

    public function trainingSessions(): HasMany
    {
        return $this->hasMany(TrainingSession::class)->latest('started_at');
    }

    public function tokens(): HasMany
    {
        return $this->hasMany(MemberToken::class);
    }

    /**
     * Issue a new token for this member.
     *
     * @return array{plainTextToken: string, token: MemberToken}
     */
    public function createToken(string $name = 'mobile_app', ?\Carbon\Carbon $expiresAt = null): array
    {
        return MemberToken::createToken($this, $name, $expiresAt);
    }

    public function getProfilePhotoUrlAttribute(): ?string
    {
        if (!$this->profile_photo) {
            return null;
        }

        return Storage::disk('public')->url($this->profile_photo);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('status', 'inactive');
    }

    public function scopeSuspended(Builder $query): Builder
    {
        return $query->where('status', 'suspended');
    }

    public function scopeExpired(Builder $query): Builder
    {
        return $query->where('status', 'expired');
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (empty($search)) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('member_number', 'like', "%{$search}%")
                ->orWhere('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%")
                ->orWhere('full_name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%");
        });
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}