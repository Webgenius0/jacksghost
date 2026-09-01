<?php

namespace App\Http\Controllers\Web\Admin\DynamicPage;

use App\Http\Controllers\Controller;
use App\Models\DynamicPage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DynamicPageController extends Controller
{
    public function index()
    {
        $pages = DynamicPage::search(['page_title', 'page_slug'])->paginateData();

        return Inertia::render('dynamic_page/index', [
            'pages' => $pages,
        ]);
    }

    public function create()
    {
        return Inertia::render('dynamic_page/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'page_title' => 'required|string|max:255',
            'page_slug' => 'nullable|string|max:255|unique:dynamic_pages,page_slug',
            'page_content' => 'nullable|string',
        ]);

        $slug = $request->page_slug ? Str::slug($request->page_slug) : Str::slug($request->page_title);

        $baseSlug = $slug;
        $counter = 1;
        while (DynamicPage::where('page_slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        DynamicPage::create([
            'page_title' => $request->page_title,
            'page_slug' => $slug,
            'page_content' => $request->page_content,
        ]);

        return redirect()->route('dynamic_page.index')->with('success', 'Page created successfully!');
    }

    public function edit(DynamicPage $dynamicPage)
    {
        return Inertia::render('dynamic_page/edit', [
            'dynamicPage' => $dynamicPage,
        ]);
    }

    public function update(Request $request, DynamicPage $dynamicPage)
    {
        $request->validate([
            // 'page_title' => 'required|string|max:255',
            // 'page_slug' => 'nullable|string|max:255|unique:dynamic_pages,page_slug,' . $dynamicPage->id,
            'page_content' => 'nullable|string',
        ]);

        // $slug = $request->page_slug ? Str::slug($request->page_slug) : Str::slug($request->page_title);

        // $baseSlug = $slug;
        // $counter = 1;
        // while (DynamicPage::where('page_slug', $slug)->where('id', '!=', $dynamicPage->id)->exists()) {
        //     $slug = $baseSlug . '-' . $counter;
        //     $counter++;
        // }

        $dynamicPage->update([
            // 'page_title' => $request->page_title,
            // 'page_slug' => $slug,
            'page_content' => $request->page_content,
        ]);

        return redirect()->route('dynamic_page.index')->with('success', 'Page updated successfully!');
    }

    public function updateStatus(DynamicPage $dynamicPage)
    {
        $dynamicPage->update([
            'status' => $dynamicPage->status === 'Active' ? 'Inactive' : 'Active',
        ]);

        return redirect()->back()->with('success', 'Status updated successfully!');
    }

    public function destroy(DynamicPage $dynamicPage)
    {
        $dynamicPage->delete();
        return redirect()->route('dynamic_page.index')->with('success', 'Page deleted successfully!');
    }
}
