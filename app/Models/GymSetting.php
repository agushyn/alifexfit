<?php

namespace App\Models;

use App\Traits\BelongsToGym;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GymSetting extends Model
{
    use HasFactory, BelongsToGym;

    protected $fillable = [
        'gym_id',
        'group',
        'key',
        'value',
    ];
}
