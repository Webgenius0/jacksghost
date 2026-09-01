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
            'league_id'     => $this->league_id,
            'league'        => new LeagueResource($this->whenLoaded('league')),
            'agent_content' => $this->agent_content,
            'image'         => $this->image, // model accessor already returns full URL
        ];
    }
}
