<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAgentListingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // Personal Information
            'agent_name'       => ['required', 'string', 'max:255'],
            'agency_name'      => ['nullable', 'string', 'max:255'],
            'agent_photo'      => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'], // 5MB

            // Services
            'services'         => ['nullable', 'array'],
            'services.*'       => ['required', 'string', 'max:255'],

            // Education
            'institution_name' => ['nullable', 'string', 'max:255'],
            'degree'           => ['nullable', 'string', 'max:255'],
            'graduation_year'  => ['nullable', 'integer', 'min:1950', 'max:2099'],

            // Certifications
            'certifications'              => ['nullable', 'array'],
            'certifications.*.name'       => ['required_with:certifications', 'string', 'max:255'],
            'certifications.*.file'       => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf,webp', 'max:10240'], // 10MB

            // Contact
            'address'          => ['nullable', 'string', 'max:500'],
            'phone_number'     => ['nullable', 'string', 'max:30'],
            'email'            => ['nullable', 'email', 'max:255'],

            // Bio
            'bio'              => ['nullable', 'string'],
        ];
    }

    /**
     * Custom attribute names for validation error messages.
     */
    public function attributes(): array
    {
        return [
            'agent_name'          => 'full name',
            'agency_name'         => 'agency name',
            'agent_photo'         => 'profile image',
            'services.*'          => 'service name',
            'institution_name'    => 'institution',
            'graduation_year'     => 'graduation year',
            'certifications.*.name' => 'certification name',
            'certifications.*.file' => 'certification file',
            'phone_number'        => 'phone number',
            'bio'                 => 'bio',
        ];
    }
}
