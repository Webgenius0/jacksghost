<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Traits\DatabaseExportable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceController extends Controller
{
    use DatabaseExportable;
    /**
     * Display the maintenance page.
     *
     * @return Response
     */
    public function show(): Response
    {
        return Inertia::render('settings/maintenance');
    }

    /**
     * Clear application cache.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function clearCache(Request $request)
    {
        try {
            Artisan::call('cache:clear');
            Cache::flush();
            return back()->with('success', 'Application cache cleared successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to clear cache: ' . $e->getMessage());
        }
    }

    /**
     * Clear view cache.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function clearViews(Request $request)
    {
        try {
            Artisan::call('view:clear');
            return back()->with('success', 'View cache cleared successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to clear views: ' . $e->getMessage());
        }
    }

    /**
     * Clear compiled files.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function clearCompiled(Request $request)
    {
        try {
            Artisan::call('optimize:clear');
            return back()->with('success', 'Compiled files cleared successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to clear compiled files: ' . $e->getMessage());
        }
    }

    /**
     * Clear all caches.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function clearAll(Request $request)
    {
        try {
            Artisan::call('cache:clear');
            Artisan::call('view:clear');
            Artisan::call('optimize:clear');
            Cache::flush();
            return back()->with('success', 'All caches cleared successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to clear all caches: ' . $e->getMessage());
        }
    }

    /**
     * Download a SQL export of the database.
     *
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\RedirectResponse
     */
    public function export(Request $request)
    {
        try {
            return $this->exportDatabase();
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to export database: ' . $e->getMessage());
        }
    }
}
