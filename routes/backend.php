<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\Admin\Contact\ContactController;
use App\Http\Controllers\Web\Admin\Dashboard\DashboardController;
use App\Http\Controllers\Web\Admin\User\UserController;
use App\Http\Controllers\Web\Admin\Faq\FaqController;
use App\Http\Controllers\Web\Admin\DynamicPage\DynamicPageController;
use App\Http\Controllers\Web\Admin\Notification\NotificationController;
use App\Http\Controllers\Web\Admin\League\LeagueController;
use App\Http\Controllers\Web\Admin\League\DraftPlayerController;
use App\Http\Controllers\Web\Admin\Year\YearController;

Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

Route::get('/notification', [NotificationController::class, 'index'])->name('notification.index');
Route::patch('/notification/read-all', [NotificationController::class, 'markAllRead'])->name('notification.readAll');
Route::patch('/notification/{notification}/read', [NotificationController::class, 'markRead'])->name('notification.read');
Route::patch('/notification/{notification}/unread', [NotificationController::class, 'markUnread'])->name('notification.unread');
Route::patch('/notification/{notification}/resolved', [NotificationController::class, 'markResolved'])->name('notification.resolved');
Route::patch('/notification/{notification}/unresolved', [NotificationController::class, 'markUnresolved'])->name('notification.unresolved');


Route::get('/user/export-csv', [UserController::class, 'exportCsv'])->name('user.exportCsv');
Route::patch('/user/{user}/status', [UserController::class, 'updateStatus'])->name('user.updateStatus');
Route::delete('/user/{user}', [UserController::class, 'destroy'])->name('user.destroy');
Route::resource('/user', UserController::class);

Route::patch('/dynamic_page/{dynamicPage}/status', [DynamicPageController::class, 'updateStatus'])->name('dynamic_page.updateStatus');
Route::resource('/dynamic_page', DynamicPageController::class);

Route::patch('/faq/{faq}/status', [FaqController::class, 'updateStatus'])->name('faq.updateStatus');
Route::resource('/faq', FaqController::class);

Route::resource('/contact', ContactController::class);

Route::resource('/league', LeagueController::class);
Route::resource('/league-content', \App\Http\Controllers\Web\Admin\League\LeagueContentController::class);
Route::resource('/draft-player', DraftPlayerController::class);
Route::resource('/year', YearController::class);

