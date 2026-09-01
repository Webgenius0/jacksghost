<?php

namespace App\Http\Resources;

use App\Traits\ImagePathTrait;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    use ImagePathTrait;

    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'email'           => $this->email,
            'email_verified_at'  => $this->email_verified_at,
            'phone'           => $this->phone,
            'avatar'          => $this->avatar,
            'avatar_full_url' => $this->fullImageUrlForApi($this->avatar),
            'role'            => $this->role,
            'status'          => $this->status,
            'timezone'        => $this->timezone,
        ];
    }
}
