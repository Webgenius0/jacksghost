<?php

namespace App\Http\Controllers\API\Faq;

use App\Http\Controllers\Controller;
use App\Http\Resources\FaqResource;
use App\Models\Faq;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $faqs = Faq::where('status', 'active')
            ->when($request->type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->get();

        $faqs = FaqResource::collection($faqs);

        return $this->success('FAQs retrieved successfully!', $faqs, 200);
    }

}
