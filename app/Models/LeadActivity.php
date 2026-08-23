<?php

namespace App\Models;

use App\Traits\BelongsToGym;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadActivity extends Model
{
    use HasFactory, BelongsToGym;

    public const TYPE_CALL = 'call';
    public const TYPE_WHATSAPP = 'whatsapp';
    public const TYPE_VISIT = 'visit';
    public const TYPE_EMAIL = 'email';
    public const TYPE_NOTE = 'note';

    protected $fillable = [
        'gym_id',
        'lead_id',
        'user_id',
        'type',
        'note',
        'contacted_at',
        'next_follow_up_at',
        'metadata',
    ];

    protected $casts = [
        'contacted_at' => 'datetime',
        'next_follow_up_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function gym(): BelongsTo
    {
        return $this->belongsTo(Gym::class);
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
