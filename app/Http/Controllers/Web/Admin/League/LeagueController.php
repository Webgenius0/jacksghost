<?php

namespace App\Http\Controllers\Web\Admin\League;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\League;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class LeagueController extends Controller
{
    public function index()
    {
        $leagues = League::search(['league_name', 'title'])->paginateData();

        return Inertia::render('league/index', [
            'leagues' => $leagues,
        ]);
    }



    public function store(Request $request)
    {
        $request->validate([
            'league_name' => 'required|string|max:255|unique:leagues,league_name',
            'title' => 'nullable|string|max:255',
            'icon' => $request->hasFile('icon') ? 'file|mimes:svg,png,webp,jpeg,jpg,gif|max:2048' : 'nullable',
            'is_draft_pick' => 'boolean',
        ]);

        $iconPath = null;
        if ($request->hasFile('icon')) {
            $iconPath = $request->file('icon')->store('leagues', 'public');
        }

        League::create([
            'league_name' => $request->league_name,
            'league_slug' => Str::slug($request->league_name),
            'title' => $request->title,
            'icon' => $iconPath,
            'is_draft_pick' => $request->boolean('is_draft_pick'),
        ]);

        return redirect()->route('league.index')->with('success', 'League created successfully!');
    }



    public function update(Request $request, League $league)
    {
        $request->validate([
            'league_name' => 'required|string|max:255|unique:leagues,league_name,' . $league->id,
            'title' => 'nullable|string|max:255',
            'icon' => $request->hasFile('icon') ? 'file|mimes:svg,png,webp,jpeg,jpg,gif|max:2048' : 'nullable',
            'is_draft_pick' => 'boolean',
        ]);

        $iconPath = $league->icon;
        if ($request->hasFile('icon')) {
            if ($league->icon && Storage::disk('public')->exists($league->icon)) {
                Storage::disk('public')->delete($league->icon);
            }
            $iconPath = $request->file('icon')->store('leagues', 'public');
        } elseif ($request->input('icon') === null && $request->exists('icon')) {
            if ($league->icon && Storage::disk('public')->exists($league->icon)) {
                Storage::disk('public')->delete($league->icon);
            }
            $iconPath = null;
        }

        $league->update([
            'league_name' => $request->league_name,
            'league_slug' => Str::slug($request->league_name),
            'title' => $request->title,
            'icon' => $iconPath,
            'is_draft_pick' => $request->boolean('is_draft_pick'),
        ]);

        return redirect()->route('league.index')->with('success', 'League updated successfully!');
    }

    public function destroy(League $league)
    {
        if ($league->icon && Storage::disk('public')->exists($league->icon)) {
            Storage::disk('public')->delete($league->icon);
        }
        $league->delete();
        return redirect()->route('league.index')->with('success', 'League deleted successfully!');
    }
}
