<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\MailSettingsController;
use App\Http\Controllers\Settings\SystemSettingController;
use App\Http\Controllers\Settings\SocialLinkController;
use App\Http\Controllers\Settings\MaintenanceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    Route::get('settings/mail', [MailSettingsController::class, 'edit'])->name('mail.edit');
    Route::put('settings/mail', [MailSettingsController::class, 'update'])->name('mail.update');

    Route::get('settings/system-settings', [SystemSettingController::class, 'edit'])->name('system-settings.edit');
    Route::post('settings/system-settings', [SystemSettingController::class, 'update'])->name('system-settings.update');

    Route::get('settings/social-links', [SocialLinkController::class, 'edit'])->name('social-links.edit');
    Route::post('settings/social-links', [SocialLinkController::class, 'update'])->name('social-links.update');

    Route::get('settings/maintenance', [MaintenanceController::class, 'show'])->name('maintenance.show');
    Route::get('settings/maintenance/export', [MaintenanceController::class, 'export'])->name('maintenance.export');
    Route::post('settings/maintenance/clear-cache', [MaintenanceController::class, 'clearCache'])->name('maintenance.clearCache');
    Route::post('settings/maintenance/clear-views', [MaintenanceController::class, 'clearViews'])->name('maintenance.clearViews');
    Route::post('settings/maintenance/clear-compiled', [MaintenanceController::class, 'clearCompiled'])->name('maintenance.clearCompiled');
    Route::post('settings/maintenance/clear-all', [MaintenanceController::class, 'clearAll'])->name('maintenance.clearAll');
});
