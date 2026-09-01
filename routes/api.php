<?php

use App\Http\Controllers\API\Agent\AgentController;
use App\Http\Controllers\API\Agent\AgentWebhookController;
use App\Http\Controllers\API\Auth\LoginController;
use App\Http\Controllers\API\Auth\RegisterController;
use App\Http\Controllers\API\Auth\SocialLoginController;
use App\Http\Controllers\API\DynamicPage\DynamicPageController;
use App\Http\Controllers\API\Faq\FaqController;
use App\Http\Controllers\API\League\LeagueController;
use App\Http\Controllers\API\League\LeagueContentController;
use App\Http\Controllers\API\Notification\NotificationController;
use App\Http\Controllers\API\Track\TrackController;
use App\Http\Controllers\API\User\UserController;
use App\Http\Controllers\API\SystemSetting\SystemSettingController;
use App\Http\Controllers\API\Contact\ContactController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::middleware(['guest'])->group(function () {

    //  Authentication routes
    Route::post('/login', [LoginController::class, 'login']);
    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/verify_otp', [RegisterController::class, 'verify_otp']);
    Route::post('/resend_otp', [RegisterController::class, 'resend_otp']);
    Route::post('/forgot-password', [RegisterController::class, 'forgot_password']);
    Route::post('/forgot-verify-otp', [RegisterController::class, 'forgot_verify_otp']);
    Route::post('/reset-password', [RegisterController::class, 'reset_password']);
    Route::post('/social-login', [SocialLoginController::class, 'socialLogin']);
});


//dynamic page
Route::get('/terms-of-service', [DynamicPageController::class, 'termsOfService']);
Route::get('/privacy-policy', [DynamicPageController::class, 'privacyPolicy']);
Route::get('/disclaimer', [DynamicPageController::class, 'disclaimer']);

//system settings
Route::get('/system-info', [SystemSettingController::class, 'systemInfo']);
Route::get('/social-links', [SystemSettingController::class, 'socialLinks']);


// faq
Route::get('/faq', [FaqController::class, 'index']);

// leagues
Route::get('/leagues', [LeagueController::class, 'index']);
Route::get('/leagues/{league}', [LeagueController::class, 'show']);

// league contents
Route::get('/league-contents', [LeagueContentController::class, 'index']);
Route::get('/league-contents/{leagueContent}', [LeagueContentController::class, 'show']);
Route::get('/leagues/{leagueId}/contents', [LeagueContentController::class, 'byLeague']);

// contact
Route::post('/contact', [ContactController::class, 'store']);

// Agent Stripe webhook — must be unauthenticated (called directly by Stripe)
// IMPORTANT: Exclude this route from CSRF in VerifyCsrfToken middleware if applicable
Route::post('/agent/webhook', [AgentWebhookController::class, 'handleWebhook']);


Route::group(['middleware' => 'auth:sanctum'], function ($router) {
    // common routes
    Route::post('/logout', [LoginController::class, 'logout']);

    // profile update routes
    Route::get('/user/profile', [UserController::class, 'userProfile']);
    Route::post('/user/profile/update', [UserController::class, 'updateProfile']);
    Route::post('/user/change-password', [UserController::class, 'changePassword']);
    Route::post('/user/account-delete', [UserController::class, 'accountDelete']);

    //session
    Route::post('/session/start', [TrackController::class, 'start']);
    Route::post('/session/end', [TrackController::class, 'end']);

    //notification
    Route::get('/setting/notification', [NotificationController::class, 'index']);
    Route::post('/setting/notification/update', [NotificationController::class, 'update']);
    Route::get('/notifications', [NotificationController::class, 'userNotifications']);
    //firebase token
    Route::post('/firebase-token', [NotificationController::class, 'storeFirebaseToken']);

    // Agent listing routes
    Route::prefix('agent')->group(function () {
        Route::post('/create-checkout-session', [AgentController::class, 'createCheckoutSession']);
        Route::post('/verify-session', [AgentController::class, 'verifySession']);
        Route::get('/my-listing', [AgentController::class, 'myListing']);
    });

});
