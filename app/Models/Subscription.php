<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Subscription extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'amount',
        'stripe_email',
        'stripe_customer_id',
        'stripe_subscription_id',
        'subscribe_date',
        'subscription_status',
        'subscription_expire_date',
        'uuid',
    ];

    protected $casts = [
        'subscribe_date'           => 'datetime',
        'subscription_expire_date' => 'datetime',
    ];

    /**
     * Automatically generate a UUID when creating a new subscription record.
     */
    protected static function booted(): void
    {
        static::creating(function (self $subscription) {
            if (empty($subscription->uuid)) {
                $subscription->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the user that owns this subscription.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Determine whether the subscription is currently active.
     */
    public function isActive(): bool
    {
        return $this->subscription_status === 'active'
            && $this->subscription_expire_date
            && $this->subscription_expire_date->isFuture();
    }
}
