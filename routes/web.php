<?php


use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
   return redirect('/login');
    // return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified', 'admin'])->group(function () {

    //

});

Route::get('/run-migrate', function () {
    // Run the database migration
    Artisan::call('migrate');
    return 'Database migration successfully!';
});
// Run Migrate Fresh Route
Route::get('/run-migrate-fresh', function () {
    // Run the database migration
    Artisan::call('migrate:fresh');
    return 'Database migration fresh successfully!';
});
// Run Seeder Route
Route::get('/run-seed', function () {
    // Run the database seeding
    Artisan::call('db:seed');
    return 'Database seeding completed successfully!';
});


// Clear Config Cache Route
Route::get('/clear-config', function () {
    // Clear the config cache
    Artisan::call('config:clear');
    Artisan::call('optimize:clear');
    return 'Config cache cleared successfully!';
});


Route::get('/db-tables', function () {
    $databaseName = env('DB_DATABASE');
    $tables = DB::select("SHOW TABLES");

    $key = 'Tables_in_' . $databaseName;
    $tableNames = array_map(fn($table) => $table->$key, $tables);


    return response()->json($tableNames);
});


Route::middleware('auth')->get('/storage-link', function () {
    Artisan::call('storage:link');
    return 'Storage link created successfully!';
});


Route::get('/show/{table}', function ($table) {
    $data = DB::table($table)->get();
    return $data;
});

Route::get('/create-admin',  function () {
    $user = User::create([
        'name' => 'Admin',
        'email' => 'admin@admin.com',
        'password' => Hash::make('12345678'),
        'role' => 'Admin',
    ]);
    return response()->json([
        'message' => 'Admin created successfully',
        'data' => $user,
    ]);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
