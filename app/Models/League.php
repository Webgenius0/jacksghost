<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class League extends Model
{
    use \App\Traits\Searchable;

    protected $fillable = [
        'league_name',
        'league_slug',
        'icon',
        'title',
        'is_draft_pick',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'is_draft_pick' => 'boolean',
    ];
    public function leagueContent()
    {
        return $this->hasOne(LeagueContent::class);
    }
}
