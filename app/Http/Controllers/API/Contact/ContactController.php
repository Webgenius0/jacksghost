<?php

namespace App\Http\Controllers\API\Contact;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactRequest;
use App\Models\Contact;
use App\Traits\ApiResponse;

class ContactController extends Controller
{
    use ApiResponse;

    /**
     * Store a newly created contact message.
     */
    public function store(StoreContactRequest $request)
    {
        try {
            $contact = Contact::create($request->validated());

            return $this->ok('Contact message submitted successfully!', $contact, 201);
        } catch (\Exception $e) {
            return $this->error('Failed to submit contact message: ' . $e->getMessage(), 500);
        }
    }
}
