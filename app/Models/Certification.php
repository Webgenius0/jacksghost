<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Certification extends Model
{
    protected $fillable = [
        'agent_id',
        'certificate_name',
        'certificate_file',
    ];

    public function agent()
    {
        return $this->belongsTo(Agents::class);
    }
}
