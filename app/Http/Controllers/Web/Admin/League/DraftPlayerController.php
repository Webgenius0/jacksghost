<?php

namespace App\Http\Controllers\Web\Admin\League;

use App\Http\Controllers\Controller;
use App\Models\Agents;
use App\Models\DraftPlayer;
use App\Models\League;
use App\Models\Year;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DraftPlayerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search    = $request->input('search');
        $leagueId  = $request->input('league_id');
        $yearValue = $request->input('year');

        $query = DraftPlayer::with(['league', 'agent'])
            ->search(['player_name', 'position', 'school', 'agent_name', 'agency_name', 'nationality']);

        if ($leagueId) {
            $query->where('league_id', $leagueId);
        }

        if ($yearValue) {
            $query->where('year', $yearValue);
        }

        $draftPlayers = $query->latest()->paginate($request->input('per_page', 10))->withQueryString();

        $leagues = League::select('id', 'league_name')
            ->where('is_draft_pick', true)
            ->orderBy('league_name')
            ->get();

        $years = Year::select('id', 'year')
            ->orderBy('year', 'desc')
            ->get();

        return Inertia::render('draft-player/index', [
            'draftPlayers' => $draftPlayers,
            'leagues'      => $leagues,
            'years'        => $years,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $leagues = League::select('id', 'league_name')
            ->where('is_draft_pick', true)
            ->orderBy('league_name')
            ->get();

        $years = Year::select('id', 'year')
            ->orderBy('year', 'desc')
            ->get();

        $agents = Agents::select('id', 'agent_name')
            ->orderBy('agent_name')
            ->get();

        return Inertia::render('draft-player/create', [
            'leagues' => $leagues,
            'years'   => $years,
            'agents'  => $agents,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'league_id'    => ['required', 'exists:leagues,id'],
            'year'         => ['required', 'integer', 'exists:years,year'],
            'round'        => ['nullable', 'integer', 'min:1'],
            'pick'         => ['nullable', 'integer', 'min:1'],
            'player_name'  => ['required', 'string', 'max:255'],
            'position'     => ['nullable', 'string', 'max:100'],
            'school'       => ['nullable', 'string', 'max:255'],
            'agent_id'     => ['nullable', 'exists:agents,id'],
            'agent_name'   => ['nullable', 'string', 'max:255'],
            'agency_name'  => ['nullable', 'string', 'max:255'],
            'height'       => ['nullable', 'string', 'max:20'],
            'weight'       => ['nullable', 'string', 'max:20'],
            'birthdate'    => ['nullable', 'date'],
            'nationality'  => ['nullable', 'string', 'max:100'],
            'status'       => ['nullable', 'string', 'max:50'],
        ]);

        DraftPlayer::create([
            'league_id'   => $request->league_id,
            'year'        => $request->year,
            'round'       => $request->round,
            'pick'        => $request->pick,
            'player_name' => $request->player_name,
            'position'    => $request->position,
            'school'      => $request->school,
            'slug'        => Str::slug($request->player_name),
            'agent_id'    => $request->agent_id ?: null,
            'agent_name'  => $request->agent_name,
            'agency_name' => $request->agency_name,
            'height'      => $request->height,
            'weight'      => $request->weight,
            'birthdate'   => $request->birthdate,
            'nationality' => $request->nationality,
            'status'      => $request->status ?? 'unsigned_draft',
        ]);

        return redirect()->route('draft-player.index')->with('success', 'Draft player created successfully!');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DraftPlayer $draftPlayer)
    {
        $leagues = League::select('id', 'league_name')
            ->where('is_draft_pick', true)
            ->orderBy('league_name')
            ->get();

        $years = Year::select('id', 'year')
            ->orderBy('year', 'desc')
            ->get();

        $agents = Agents::select('id', 'agent_name')
            ->orderBy('agent_name')
            ->get();

        return Inertia::render('draft-player/edit', [
            'draftPlayer' => $draftPlayer,
            'leagues'     => $leagues,
            'years'       => $years,
            'agents'      => $agents,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DraftPlayer $draftPlayer)
    {
        $request->validate([
            'league_id'    => ['required', 'exists:leagues,id'],
            'year'         => ['required', 'integer', 'exists:years,year'],
            'round'        => ['nullable', 'integer', 'min:1'],
            'pick'         => ['nullable', 'integer', 'min:1'],
            'player_name'  => ['required', 'string', 'max:255'],
            'position'     => ['nullable', 'string', 'max:100'],
            'school'       => ['nullable', 'string', 'max:255'],
            'agent_id'     => ['nullable', 'exists:agents,id'],
            'agent_name'   => ['nullable', 'string', 'max:255'],
            'agency_name'  => ['nullable', 'string', 'max:255'],
            'height'       => ['nullable', 'string', 'max:20'],
            'weight'       => ['nullable', 'string', 'max:20'],
            'birthdate'    => ['nullable', 'date'],
            'nationality'  => ['nullable', 'string', 'max:100'],
            'status'       => ['nullable', 'string', 'max:50'],
        ]);

        $draftPlayer->update([
            'league_id'   => $request->league_id,
            'year'        => $request->year,
            'round'       => $request->round,
            'pick'        => $request->pick,
            'player_name' => $request->player_name,
            'position'    => $request->position,
            'school'      => $request->school,
            'slug'        => Str::slug($request->player_name),
            'agent_id'    => $request->agent_id ?: null,
            'agent_name'  => $request->agent_name,
            'agency_name' => $request->agency_name,
            'height'      => $request->height,
            'weight'      => $request->weight,
            'birthdate'   => $request->birthdate,
            'nationality' => $request->nationality,
            'status'      => $request->status ?? 'unsigned_draft',
        ]);

        return redirect()->route('draft-player.index')->with('success', 'Draft player updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DraftPlayer $draftPlayer)
    {
        $draftPlayer->delete();

        return redirect()->back()->with('success', 'Draft player deleted successfully!');
    }
}
