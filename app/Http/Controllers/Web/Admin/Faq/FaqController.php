<?php

namespace App\Http\Controllers\Web\Admin\Faq;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Faq;
use Inertia\Inertia;

class FaqController extends Controller
{
    public function index()
    {
        $faqs = Faq::search(['question', 'answer'])->paginateData();

        return Inertia::render('faq/index', [
            'faqs' => $faqs,
        ]);
    }

    public function create()
    {
        return Inertia::render('faq/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'question'  => 'required|string|max:255',
            'answer'    => 'required|string',
            'type'      => 'nullable|string|max:255',
        ]);

        Faq::create([
            'question'  => $request->question,
            'answer'    => $request->answer,
            'type'      => $request->type,
        ]);

        return redirect()->route('faq.index')->with('success', 'FAQ created successfully!');
    }

    public function edit(Faq $faq)
    {
        return Inertia::render('faq/edit', [
            'faq' => $faq,
        ]);
    }

    public function update(Request $request, Faq $faq)
    {
        $request->validate([
            'question'  => 'required|string|max:255',
            'answer'    => 'required|string',
            'type'      => 'nullable|string|max:255',
        ]);

        $faq->update([
            'question'  => $request->question,
            'answer'    => $request->answer,
            'type'      => $request->type,
        ]);

        return redirect()->route('faq.index')->with('success', 'FAQ updated successfully!');
    }

    public function updateStatus(Faq $faq)
    {
        $faq->update([
            'status' => $faq->status === 'active' ? 'inactive' : 'active',
        ]);

        return redirect()->back()->with('success', 'Status updated successfully!');
    }

    public function destroy(Faq $faq)
    {
        $faq->delete();
        return redirect()->route('faq.index')->with('success', 'FAQ deleted successfully!');
    }
}
