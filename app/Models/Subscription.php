<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;
    use HasUuids;
    
    protected $fillable = [
        'user_id',
        'amount',
        'stripe_email',
        'stripe_customer_id',
        'stripe_subscription_id',
        'subscribe_date',
        'subscription_status',
        'subscription_expire_date',
    ];

    protected $casts = [
        'subscribe_date' => 'datetime',
        'subscription_expire_date' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
