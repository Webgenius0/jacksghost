<?php

namespace App\Models;

use App\Traits\Searchable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CurrentTeam extends Model
{
    use Searchable;

    protected $fillable = [
        'league_id',
        'team_name',
    ];

    protected $casts = [
        'league_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function league(): BelongsTo
    {
        return $this->belongsTo(League::class);
    }
}

