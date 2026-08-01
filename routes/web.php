<?php

use Illuminate\Support\Facades\Route;

/**
 * Clean Pure REST API Web Routes
 * No Blade files or HTML templates inside Laravel.
 * All UI is 100% rendered by React.js on https://amarnath.info
 */

Route::get('/', function () {
    return response()->json([
        'status' => true,
        'message' => 'Amarnath Portfolio Laravel REST API Engine is Live!',
        'domain' => 'admin.amarnath.info',
        'api_endpoints' => [
            'portfolio' => 'https://admin.amarnath.info/api/portfolio',
            'admin_login' => 'https://admin.amarnath.info/api/admin/login'
        ]
    ]);
});

// Redirect any direct browser hits to React App
Route::get('/admin/login', function () {
    return redirect('https://amarnath.info/admin/login');
});

Route::get('/admin/dashboard', function () {
    return redirect('https://amarnath.info/admin/dashboard');
});
