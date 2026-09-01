<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgentListingTemp extends Model
{
    protected $fillable = [
        'user_id',
        'stripe_session_id',
        'form_data',
        'payment_status',
    ];

    protected $casts = [
        'form_data' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
