<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SocialLinkResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'facebook_link'  => $this->facebook_link,
            'twitter_link'   => $this->twitter_link,
            'linkedin_link'  => $this->linkedin_link,
        ];
    }
}
