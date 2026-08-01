<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'status' => true,
        'message' => 'Amarnath Portfolio Backend Engine is Live!',
        'domain' => 'amarnath.info',
        'api_endpoints' => [
            'portfolio' => url('/api/portfolio'),
            'admin_login' => url('/admin/login'),
        ]
    ]);
});

Route::get('/admin/login', function () {
    return response()->json([
        'status' => true,
        'portal' => 'Render Backend Admin Portal',
        'login_endpoint' => url('/api/admin/login'),
        'credentials' => [
            'email' => 'admin@amarnath.info',
            'password' => 'admin123'
        ],
        'instructions' => 'Send POST request to /api/admin/login to receive session token.'
    ]);
});

Route::get('/admin/dashboard', function () {
    return response()->json([
        'status' => true,
        'portal' => 'Render Backend Admin Dashboard',
        'message' => 'Authenticated Admin Session Active.'
    ]);
});
