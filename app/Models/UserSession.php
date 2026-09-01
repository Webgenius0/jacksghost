<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'platform',
        'started_at',
        'last_activity',
        'finished_at',
        'token_id',
        'duration',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'last_activity' => 'datetime',
        'finished_at' => 'datetime',
    ];
}
