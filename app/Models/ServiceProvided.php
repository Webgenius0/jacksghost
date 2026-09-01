<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceProvided extends Model
{
    protected $fillable = [
        'agent_id',
        'service_name',
    ];

    public function agent()
    {
        return $this->belongsTo(Agents::class);
    }
}
