<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgentPayment extends Model
{
    protected $fillable = [
        'agent_id',
        'stripe_session_id',
        'payment_intent_id',
        'amount',
        'currency',
        'payment_status',
        'paid_at',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'paid_at'  => 'datetime',
    ];

    public function agent()
    {
        return $this->belongsTo(Agents::class, 'agent_id');
    }
}
