<?php

namespace App\Models;

use App\Traits\Searchable;
use Illuminate\Database\Eloquent\Model;

class DraftPlayer extends Model
{
    use Searchable;

    protected $fillable = [
        'league_id',
        'year',
        'round',
        'pick',
        'first_name',
        'last_name',
        'position',
        'current_team',
        'draft_team',
        'school',
        'slug',
        'agent_name',
        'agency_name',
        'height',
        'weight',
        'birthdate',
        'nationality',
        'status',
    ];

    protected $appends = [
        'player_name',
    ];

    public function getPlayerNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    protected $casts = [
        'year'       => 'integer',
        'round'      => 'integer',
        'pick'       => 'integer',
        'birthdate'  => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function league()
    {
        return $this->belongsTo(League::class);
    }
}

