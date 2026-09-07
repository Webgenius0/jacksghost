<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeagueContentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'slug'          => $this->league_slug,
            'name'          => $this->league_name,
            'image'         => $this->leagueContent?->image,
            'content'       => $this->leagueContent?->agent_content,
        ];
    }
}
