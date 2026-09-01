<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use App\Traits\Searchable;

class DynamicPage extends Model
{
    use HasFactory;
    use Searchable;

    protected $fillable = [
        'page_title',
        'page_slug',
        'page_content',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];
}
