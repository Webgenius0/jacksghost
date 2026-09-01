<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\Searchable;

class Faq extends Model
{
    use Searchable;
    protected $guarded = ['id'];
}
