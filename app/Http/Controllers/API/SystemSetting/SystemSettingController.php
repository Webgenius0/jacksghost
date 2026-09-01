<?php

namespace App\Http\Controllers\API\SystemSetting;

use App\Http\Controllers\Controller;
use App\Http\Resources\SocialLinkResource;
use App\Http\Resources\SystemSettingResource;
use App\Models\SocialLink;
use App\Models\SystemSetting;
use App\Traits\ApiResponse;

class SystemSettingController extends Controller
{
    use ApiResponse;

    public function systemInfo()
    {
        $systemSetting = SystemSetting::first();

        if (!$systemSetting) {
            return $this->error('System Setting not found', 500);
        }

        return $this->ok('Data Retrieve Successfully!', new SystemSettingResource($systemSetting), 200);
    }

    public function socialLinks()
    {
        $socialLink = SocialLink::first();

        if (!$socialLink) {
            return $this->error('Social Link not found', 500);
        }

        return $this->ok('Data Retrieve Successfully!', new SocialLinkResource($socialLink), 200);
    }
}
