<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class OrderCheckoutRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_name'     => 'required|string',
            'customer_email'    => 'required|email',
            'customer_phone'    => 'required|string|min:8|max:16',
            'customer_address'  => 'required|string',
            'coupon_code'       => 'nullable|string',
            'items'             => 'required|array|min:1',
            'items.*.variant_id' => 'required|exists:product_variants,id',
            'items.*.quantity'  => 'required|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'customer_name.required'    => 'Customer name is required.',
            'customer_email.required'   => 'Customer email is required.',
            'customer_email.email'      => 'Customer email must be a valid email.',
            'customer_phone.required'   => 'Customer phone is required.',
            'customer_address.required' => 'Customer address is required.',
            'items.required'            => 'Items are required.',
            'items.array'               => 'Items must be an array.',
            'items.min'                 => 'Items must have at least one item.',
            'items.*.variant_id.required' => 'Variant ID is required.',
            'items.*.variant_id.exists' => 'Variant ID does not exist.',
            'items.*.quantity.required' => 'Quantity is required.',
            'items.*.quantity.integer'  => 'Quantity must be an integer.',
            'items.*.quantity.min'      => 'Quantity must be at least 1.',
        ];
    }
}
