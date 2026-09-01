<?php

namespace App\Http\Controllers\Web\Admin\League;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\League;
use App\Models\LeagueContent;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class LeagueContentController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = LeagueContent::with('league');

        if ($search) {
            $query->whereHas('league', function ($q) use ($search) {
                $q->where('league_name', 'like', "%{$search}%");
            })->orWhere('agent_content', 'like', "%{$search}%");
        }

        $leagueContents = $query->paginateData();
        $leagues = League::select('id', 'league_name')->get();

        return Inertia::render('league-content/index', [
            'leagueContents' => $leagueContents,
            'leagues' => $leagues,
        ]);
    }

    public function create()
    {
        $leagues = League::select('id', 'league_name')->get();
        return Inertia::render('league-content/create', [
            'leagues' => $leagues,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'league_id' => 'required|exists:leagues,id',
            'agent_content' => 'nullable|string',
            'image' => $request->hasFile('image') ? 'file|mimes:jpeg,png,jpg,gif,svg,webp|max:2048' : 'nullable',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('league_contents', 'public');
        }

        LeagueContent::create([
            'league_id' => $request->league_id,
            'agent_content' => $request->agent_content,
            'image' => $imagePath,
        ]);

        return redirect()->route('league-content.index')->with('success', 'League Content created successfully!');
    }

    public function edit(LeagueContent $league_content)
    {
        $leagues = League::select('id', 'league_name')->get();
        return Inertia::render('league-content/edit', [
            'leagueContent' => $league_content,
            'leagues' => $leagues,
        ]);
    }

    public function update(Request $request, LeagueContent $league_content)
    {
        $request->validate([
            'league_id' => 'required|exists:leagues,id',
            'agent_content' => 'nullable|string',
            'image' => $request->hasFile('image') ? 'file|mimes:jpeg,png,jpg,gif,svg,webp|max:2048' : 'nullable',
        ]);

        // Access the raw original image path (without the asset wrapper) using getRawOriginal
        $oldImagePath = $league_content->getRawOriginal('image');
        $imagePath = $oldImagePath;

        if ($request->hasFile('image')) {
            if ($oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
                Storage::disk('public')->delete($oldImagePath);
            }
            $imagePath = $request->file('image')->store('league_contents', 'public');
        } elseif ($request->input('image') === null && $request->exists('image')) {
            if ($oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
                Storage::disk('public')->delete($oldImagePath);
            }
            $imagePath = null;
        }

        $league_content->update([
            'league_id' => $request->league_id,
            'agent_content' => $request->agent_content,
            'image' => $imagePath,
        ]);

        return redirect()->route('league-content.index')->with('success', 'League Content updated successfully!');
    }

    public function destroy(LeagueContent $league_content)
    {
        $oldImagePath = $league_content->getRawOriginal('image');
        if ($oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
            Storage::disk('public')->delete($oldImagePath);
        }
        
        $league_content->delete();
        
        return redirect()->back()->with('success', 'League Content deleted successfully!');
    }
}
