<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

$basePath = file_exists(__DIR__.'/backend/routes/api.php') ? __DIR__.'/backend' : __DIR__;

return Application::configure(basePath: $basePath)
    ->withRouting(
        web: $basePath.'/routes/web.php',
        api: $basePath.'/routes/api.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
