<?php

namespace App\Http\Resources;

use App\Traits\ImagePathTrait;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SystemSettingResource extends JsonResource
{
    use ImagePathTrait;

    public function toArray(Request $request): array
    {
        return [
            'title'            => $this->title,
            'email'            => $this->email,
            'number'           => $this->number,
            'system_name'      => $this->system_name,
            'address'          => $this->address,
            'copyright_text'   => $this->copyright_text,
            'logo'             => $this->logo,
            'logo_full_url'    => $this->fullImageUrlForApi($this->logo),
            'favicon'          => $this->favicon,
            'favicon_full_url' => $this->fullImageUrlForApi($this->favicon),
            'description'      => $this->description,
        ];
    }
}
