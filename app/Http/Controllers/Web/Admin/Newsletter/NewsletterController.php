<?php

namespace App\Http\Controllers\Web\Admin\Newsletter;

use App\Http\Controllers\Controller;
use App\Models\Newsletter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NewsletterController extends Controller
{
    /**
     * Display a listing of the newsletters.
     */
    public function index(Request $request): Response
    {
        $newsletters = Newsletter::search(['email'])
            ->latest()
            ->paginateData();

        return Inertia::render('newsletter/index', [
            'newsletters' => $newsletters,
        ]);
    }

    /**
     * Remove the specified newsletter from storage.
     */
    public function destroy(Newsletter $newsletter)
    {
        $newsletter->delete();
        return redirect()->route('newsletter.index')->with('success', 'Subscriber deleted successfully!');
    }
}
