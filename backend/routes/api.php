<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PortfolioApiController;
use App\Http\Controllers\Api\AdminPortfolioController;

/*
|--------------------------------------------------------------------------
| Public API Routes for React Frontend
|--------------------------------------------------------------------------
*/

// Fetch entire dynamic portfolio data
Route::get('/portfolio', [PortfolioApiController::class, 'getPortfolioData']);

// Fetch specific dynamic sections
Route::get('/portfolio/personal', [PortfolioApiController::class, 'getPersonalInfo']);
Route::get('/portfolio/strengths', [PortfolioApiController::class, 'getStrengths']);
Route::get('/portfolio/skills', [PortfolioApiController::class, 'getSkills']);
Route::get('/portfolio/experiences', [PortfolioApiController::class, 'getExperiences']);
Route::get('/portfolio/projects', [PortfolioApiController::class, 'getProjects']);
Route::get('/portfolio/education', [PortfolioApiController::class, 'getEducation']);

// Submit contact form / inquiry from frontend
Route::post('/contact', [PortfolioApiController::class, 'submitContactMessage']);


/*
|--------------------------------------------------------------------------
| Admin Management Routes (Full control for content customization)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->group(function () {
    // Update Personal Info
    Route::post('/personal', [AdminPortfolioController::class, 'updatePersonalInfo']);
    
    // Strengths Management
    Route::get('/strengths', [AdminPortfolioController::class, 'listStrengths']);
    Route::post('/strengths', [AdminPortfolioController::class, 'storeStrength']);
    Route::put('/strengths/{id}', [AdminPortfolioController::class, 'updateStrength']);
    Route::delete('/strengths/{id}', [AdminPortfolioController::class, 'deleteStrength']);

    // Skills Management
    Route::get('/skills', [AdminPortfolioController::class, 'listSkills']);
    Route::post('/skills', [AdminPortfolioController::class, 'storeSkill']);
    Route::put('/skills/{id}', [AdminPortfolioController::class, 'updateSkill']);
    Route::delete('/skills/{id}', [AdminPortfolioController::class, 'deleteSkill']);

    // Projects Management
    Route::get('/projects', [AdminPortfolioController::class, 'listProjects']);
    Route::post('/projects', [AdminPortfolioController::class, 'storeProject']);
    Route::put('/projects/{id}', [AdminPortfolioController::class, 'updateProject']);
    Route::delete('/projects/{id}', [AdminPortfolioController::class, 'deleteProject']);

    // Experiences Management
    Route::get('/experiences', [AdminPortfolioController::class, 'listExperiences']);
    Route::post('/experiences', [AdminPortfolioController::class, 'storeExperience']);
    Route::put('/experiences/{id}', [AdminPortfolioController::class, 'updateExperience']);
    Route::delete('/experiences/{id}', [AdminPortfolioController::class, 'deleteExperience']);

    // Contact Messages Inbox
    Route::get('/messages', [AdminPortfolioController::class, 'listMessages']);
    Route::put('/messages/{id}/read', [AdminPortfolioController::class, 'markMessageRead']);
});
