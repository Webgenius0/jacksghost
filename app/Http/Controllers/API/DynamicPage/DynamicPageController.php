<?php

namespace App\Http\Controllers\API\DynamicPage;

use App\Http\Controllers\Controller;
use App\Http\Resources\DynamicPageResource;
use App\Models\DynamicPage;
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
    public function disclaimer()
    {
        $data = DynamicPage::where('status', 'Active')
            ->where('page_slug', 'disclaimer')
            ->first();

        if ($data) {
            return $this->success('Data Retrieve Successfully!', new DynamicPageResource($data), 200);
        }

        return $this->error('Data not found', 500);
    }
}
