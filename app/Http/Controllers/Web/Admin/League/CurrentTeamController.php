<?php

namespace App\Http\Controllers\Web\Admin\League;

use App\Http\Controllers\Controller;
use App\Models\CurrentTeam;
use App\Models\League;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CurrentTeamController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $leagueId = $request->input('league_id');

        $query = CurrentTeam::with('league');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('team_name', 'like', "%{$search}%")
                  ->orWhereHas('league', function ($leagueQuery) use ($search) {
                      $leagueQuery->where('league_name', 'like', "%{$search}%");
                  });
            });
        }

        if ($leagueId) {
            $query->where('league_id', $leagueId);
        }

        $currentTeams = $query->latest()->paginate($request->input('per_page', 10))->withQueryString();

        $leagues = League::where('is_draft_pick', true)
            ->select('id', 'league_name')
            ->orderBy('league_name')
            ->get();

        return Inertia::render('current-team/index', [
            'currentTeams' => $currentTeams,
            'leagues' => $leagues,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'league_id' => [
                'required',
                'integer',
                Rule::exists('leagues', 'id')->where('is_draft_pick', true),
            ],
            'team_name' => ['required', 'string', 'max:255'],
        ], [
            'league_id.exists' => 'The selected league must be a valid draft pick league.',
        ]);

        CurrentTeam::create($validated);

        return redirect()->route('current-team.index')->with('success', 'Current team created successfully!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CurrentTeam $currentTeam)
    {
        $validated = $request->validate([
            'league_id' => [
                'required',
                'integer',
                Rule::exists('leagues', 'id')->where('is_draft_pick', true),
            ],
            'team_name' => ['required', 'string', 'max:255'],
        ], [
            'league_id.exists' => 'The selected league must be a valid draft pick league.',
        ]);

        $currentTeam->update($validated);

        return redirect()->route('current-team.index')->with('success', 'Current team updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CurrentTeam $currentTeam)
    {
        $currentTeam->delete();

        return redirect()->route('current-team.index')->with('success', 'Current team deleted successfully!');
    }
}
