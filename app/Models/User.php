<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Traits\Searchable;
use App\Models\Subscription;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, Searchable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'avatar',
        'password',
        'role',
        'status',
        'reset_code',
        'reset_code_expires_at',
        'provider',
        'provider_id',
        'provider_token',
        'phone',
        'timezone',
        'last_login_date',
        'login_count',
        'last_ip'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'reset_code',
        'reset_code_expires_at',
        'stripe_customer_id'
    ];

    public function getAvatarUrlAttribute()
    {
        return $this->avatar ? asset($this->avatar) : asset('uploads/user/default.png');
    }

    /**
     * Get the user's currently active subscription.
     */
    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
            ->where('subscription_status', 'active')
            ->where('subscription_expire_date', '>', now())
            ->latest();
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login_date' => 'datetime',
        ];
    }
}
