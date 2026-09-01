<?php

namespace App\Http\Controllers\API\DynamicPage;

use App\Http\Controllers\Controller;
use App\Http\Resources\DynamicPageResource;
use App\Http\Resources\ManufacturingProofResource;
use App\Models\DynamicPage;
use App\Models\SystemSetting;
use App\Traits\ApiResponse;

class DynamicPageController extends Controller
{
    use ApiResponse;

    public function termsOfService()
    {
        $data = DynamicPage::where('status', 'Active')
            ->where('page_slug', 'terms-of-service')
            ->first();

        if ($data) {
            return $this->success('Data Retrieve Successfully!', new DynamicPageResource($data), 200);
        }

        return $this->error('Data not found', 500);
    }

    public function privacyPolicy()
    {
        $data = DynamicPage::where('status', 'Active')
            ->where('page_slug', 'privacy-policy')
            ->first();

        if ($data) {
            return $this->success('Data Retrieve Successfully!', new DynamicPageResource($data), 200);
        }

        return $this->error('Data not found', 500);
    }

    public function proofOfManufacturing()
    {
        $systemSetting = SystemSetting::first();

        if (!$systemSetting) {
            return $this->error('Data not found', 500);
        }

        return $this->success('Data Retrieve Successfully!', new ManufacturingProofResource($systemSetting), 200);
    }
}
