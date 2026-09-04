<?php

namespace App\Http\Resources;

use App\Traits\ImagePathTrait;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentResource extends JsonResource
{
    use ImagePathTrait;

    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'agent_name'       => $this->agent_name,
            'agency_name'      => $this->agency_name,
            'slug'             => $this->slug,
            'agent_photo'      => $this->agent_photo,
            'agent_photo_url'  => $this->agent_photo ? $this->fullImageUrlForApi($this->agent_photo) : null,
            'institution_name' => $this->institution_name,
            'degree'           => $this->degree,
            'graduation_year'  => $this->graduation_year,
            'address'          => $this->address,
            'phone_number'     => $this->phone_number,
            'email'            => $this->email,
            'website_link'     => $this->website_link,
            'notable_client'   => $this->notable_client,
            'background_info'  => $this->background_info,
            'status'           => $this->status,
            'payment'          => $this->whenLoaded('payment', function () {
                return [
                    'payment_intent_id' => $this->payment->payment_intent_id,
                    'stripe_session_id' => $this->payment->stripe_session_id,
                    'payment_status'    => $this->payment->payment_status,
                    'amount'            => $this->payment->amount,
                    'currency'          => $this->payment->currency,
                    'paid_at'           => $this->payment->paid_at,
                ];
            }),
            'services'         => $this->whenLoaded('services', function () {
                return $this->services->map(fn($s) => [
                    'id'           => $s->id,
                    'service_name' => $s->service_name,
                ]);
            }),
            'certifications'   => $this->whenLoaded('certifications', function () {
                return $this->certifications->map(fn($c) => [
                    'id'               => $c->id,
                    'certificate_name' => $c->certificate_name,
                    'certificate_file' => $c->certificate_file,
                    'certificate_file_url' => $c->certificate_file
                        ? $this->fullImageUrlForApi($c->certificate_file)
                        : null,
                ]);
            }),
            'created_at'       => $this->created_at,
        ];
    }
}
