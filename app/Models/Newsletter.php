<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Searchable;

class Newsletter extends Model
{
    use Searchable;

    protected $fillable = ['email'];
}
