<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PersonalInfo extends Model
{
    use HasFactory;

    protected $table = 'personal_infos';

    protected $fillable = [
        'name',
        'title',
        'location',
        'phone',
        'email',
        'github',
        'linkedin',
        'experience_years',
        'summary',
        'status',
    ];
}
