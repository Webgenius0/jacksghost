<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Searchable;

class Contact extends Model
{
    use Searchable;

    protected $fillable = [
        'name',
        'email',
        'topic',
        'message',
    ];
}
