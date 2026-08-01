<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'category', // enterprise, custom, cms
        'tag',
        'icon',
        'description',
        'tech',
        'sort_order',
    ];

    protected $casts = [
        'tech' => 'array',
    ];
}
