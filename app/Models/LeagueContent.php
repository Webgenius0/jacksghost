<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeagueContent extends Model
{
    use \App\Traits\Searchable;

    protected $fillable = [
        'league_id',
        'image',
        'agent_content',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function league()
    {
        return $this->belongsTo(League::class);
    }

    public function getImageAttribute($value)
    {
        return $value ? asset($value) : null;
    }
}
