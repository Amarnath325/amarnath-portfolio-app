<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
    use HasFactory;

    protected $fillable = [
        'role',
        'company',
        'period',
        'points',
        'sort_order',
    ];

    protected $casts = [
        'points' => 'array',
    ];
}
