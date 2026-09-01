<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agents extends Model
{
    protected $fillable = [
        'user_id',
        'agent_photo',
        'agent_name',
        'slug',
        'agency_name',
        'institution_name',
        'degree',
        'graduation_year',
        'address',
        'phone_number',
        'email',
        'website_link',
        'background_info',
        'notable_client',
        'status',
        'payment_intent_id',
        'payment_status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function certifications()
    {
        return $this->hasMany(Certification::class, 'agent_id');
    }

    public function services()
    {
        return $this->hasMany(ServiceProvided::class, 'agent_id');
    }
}
