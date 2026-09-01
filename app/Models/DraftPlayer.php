<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DraftPlayer extends Model
{
    protected $fillable = [
        'league_id',
        'year',
        'round',
        'pick',
        'player_name',
        'position',
        'school',
        'slug',
        'agent_id',
        'agent_name',
        'agency_name',
        'height',
        'weight',
        'birthdate',
        'nationality',
        'status',
    ];

    protected $casts = [
        'birthdate' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function draftLeague()
    {
        return $this->belongsTo(League::class);
    }

    public function agent()
    {
        return $this->belongsTo(Agents::class, 'agent_id');
    }
}
