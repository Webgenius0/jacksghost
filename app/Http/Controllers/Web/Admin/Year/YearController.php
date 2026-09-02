<?php

namespace App\Http\Controllers\Web\Admin\Year;

use App\Http\Controllers\Controller;
use App\Models\Year;
use Illuminate\Http\Request;
use Inertia\Inertia;

class YearController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $years = Year::search(['year'])
            ->orderBy('year', 'desc')
            ->paginate(request('per_page', 10))
            ->withQueryString();

        return Inertia::render('year/index', [
            'years' => $years,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'year' => ['required', 'integer', 'digits:4', 'min:1900', 'max:2100', 'unique:years,year'],
        ]);

        Year::create($validated);

        return redirect()->route('year.index')->with('success', 'Drafted Year created successfully!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Year $year)
    {
        $validated = $request->validate([
            'year' => ['required', 'integer', 'digits:4', 'min:1900', 'max:2100', 'unique:years,year,' . $year->id],
        ]);

        $year->update($validated);

        return redirect()->route('year.index')->with('success', 'Drafted Year updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Year $year)
    {
        $year->delete();

        return redirect()->route('year.index')->with('success', 'Drafted Year deleted successfully!');
    }
}
