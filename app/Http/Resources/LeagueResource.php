<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeagueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'league_name'  => $this->league_name,
            'league_slug'  => $this->league_slug,
            'title'        => $this->title,
            'icon'         => $this->icon ? asset('storage/' . $this->getRawOriginal('icon')) : null,
            'is_draft_pick' => $this->is_draft_pick,
        ];
    }
}
