<?php

namespace App\Http\Controllers\API\Newsletter;

use App\Http\Controllers\Controller;
use App\Models\Newsletter;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NewsletterController extends Controller
{
    use ApiResponse;

    /**
     * Store a newly created newsletter subscriber.
     */
    public function subscribe(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255|unique:newsletters,email',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 400);
        }

        $newsletter = Newsletter::create([
            'email' => $request->email,
        ]);

        return $this->ok('Subscribed successfully!', $newsletter, 201);
    }
}
