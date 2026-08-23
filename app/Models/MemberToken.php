<?php

namespace App\Models;

use App\Traits\BelongsToGym;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class MemberToken extends Model
{
    use HasFactory, BelongsToGym;

    protected $fillable = [
        'gym_id',
        'member_id',
        'name',
        'token',
        'abilities',
        'last_used_at',
        'expires_at',
    ];

    protected $casts = [
        'abilities' => 'json',
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    protected $hidden = [
        'token',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function gym(): BelongsTo
    {
        return $this->belongsTo(Gym::class);
    }

    /**
     * Generate a new member token.
     *
     * @return array{plainTextToken: string, token: MemberToken}
     */
    public static function createToken(Member $member, string $name = 'mobile_app', ?Carbon $expiresAt = null): array
    {
        $plainTextToken = Str::random(40);
        $hashedToken = hash('sha256', $plainTextToken);

        $token = static::create([
            'gym_id' => $member->gym_id,
            'member_id' => $member->id,
            'name' => $name,
            'token' => $hashedToken,
            'abilities' => ['*'],
            'expires_at' => $expiresAt ?? now()->addDays(90),
        ]);

        return [
            'plainTextToken' => $plainTextToken,
            'token' => $token,
        ];
    }

    /**
     * Find token by plain text bearer string.
     */
    public static function findToken(string $plainTextToken): ?self
    {
        $hashedToken = hash('sha256', $plainTextToken);

        return static::withoutGymScope()
            ->with(['member.gym', 'gym'])
            ->where('token', $hashedToken)
            ->where(function (Builder $query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->first();
    }

    /**
     * Touch the token usage timestamp.
     */
    public function touchUsage(): void
    {
        $this->update(['last_used_at' => now()]);
    }
}
