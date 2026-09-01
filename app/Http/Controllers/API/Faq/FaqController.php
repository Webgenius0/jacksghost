<?php

namespace App\Http\Controllers\API\Faq;

use App\Http\Controllers\Controller;
use App\Http\Resources\FaqResource;
use App\Models\Faq;
use App\Traits\ApiResponse;

class FaqController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $faqs = Faq::where('status', 'active')->get();

        $faqs = FaqResource::collection($faqs);

        return $this->success('FAQs retrieved successfully!', $faqs, 200);
    }
}
