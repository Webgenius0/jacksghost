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
            'notable_client'   => $this->notable_client,
            'background_info'  => $this->background_info,
            'status'           => $this->status,
            // 'payment'          => $this->whenLoaded('payment', function () {
            //     return [
            //         'transaction_id'    => $this->payment->transaction_id,
            //         'payment_status'    => $this->payment->payment_status,
            //         'amount'            => $this->payment->amount,
            //         'currency'          => $this->payment->currency,
            //         'paid_at'           => $this->payment->paid_at,
            //     ];
            // }),
            'services'         => $this->whenLoaded('services', function () {
                return $this->services->map(fn($s) => [
                    'service_name' => $s->service_name,
                ]);
            }),
            'certifications'   => $this->whenLoaded('certifications', function () {
                return $this->certifications->map(fn($c) => [
                    'certificate_name' => $c->certificate_name,
                ]);
            }),
            'created_at'       => $this->created_at,
        ];
    }
}
