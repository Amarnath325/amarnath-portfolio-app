<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'status' => true,
        'message' => 'Amarnath Portfolio Backend API is Live and Operational!',
        'api_endpoints' => [
            'portfolio' => url('/api/portfolio'),
            'personal' => url('/api/portfolio/personal'),
            'projects' => url('/api/portfolio/projects'),
        ]
    ]);
});
