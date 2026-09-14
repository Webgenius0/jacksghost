<?php

namespace App\Http\Controllers\API\League;

use App\Http\Controllers\Controller;
use App\Http\Resources\LeagueContentResource;
use App\Http\Resources\LeagueResource;
use App\Models\DraftPlayer;
use App\Models\League;
use App\Models\Year;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class LeagueController extends Controller
{
    use ApiResponse;

    public function agentLeagues()
    {
        $leagues = League::get();

        $leagues = LeagueResource::collection($leagues);

        return $this->success('Agent leagues retrieved successfully!', $leagues, 200);
    }

    public function show($slug)
    {
        $league = League::where('league_slug', $slug)->first();
        $league->load('leagueContent');

        return $this->success('League content retrieved successfully!', new LeagueContentResource($league), 200);
    }

    public function draftLeagues()
    {
        $leagues = League::where('is_draft_pick', true)->with('leagueContent')->get();

        $leagues = LeagueResource::collection($leagues);

        return $this->success('Draft leagues retrieved successfully!', $leagues, 200);
    }

    public function draftYear($slug)
    {
        $league = League::where('league_slug', $slug)->where('is_draft_pick', true)->first();
        
        if (!$league) {
            return $this->error('Draft picks league not found', 404);
        }
        $years = Year::orderBy('year', 'desc')->get();

        return $this->success('Draft years retrieved successfully!', $years, 200);
    }

    public function draftPlayers(Request $request, $slug, $year)
    {
        $league = League::where('league_slug', $slug)
            ->where('is_draft_pick', true)
            ->first();

        if (!$league) {
            return $this->error('Draft picks league not found', 404);
        }

        $query = DraftPlayer::where('league_id', $league->id)
            ->where('year', $year);

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('player_name', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%")
                    ->orWhere('school', 'like', "%{$search}%")
                    ->orWhere('agent_name', 'like', "%{$search}%")
                    ->orWhere('agency_name', 'like', "%{$search}%")
                    ->orWhere('round', 'like', "%{$search}%")
                    ->orWhere('pick', 'like', "%{$search}%");
            });
        }

        $players = $query->get();

        return $this->success(
            'Draft players retrieved successfully!',
            $players,
            200
        );
    }

    public function searchPlayers(Request $request)
    {
        $query = DraftPlayer::query();

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        if ($request->filled('sports_type')) {
            $query->whereHas('league', function ($q) use ($request) {
                $q->where('league_name', $request->sports_type);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('player_name', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%")
                    ->orWhere('school', 'like', "%{$search}%")
                    ->orWhere('agent_name', 'like', "%{$search}%")
                    ->orWhere('agency_name', 'like', "%{$search}%")
                    ->orWhere('round', 'like', "%{$search}%")
                    ->orWhere('pick', 'like', "%{$search}%");
            });
        }

        $players = $query->get();

        return $this->success(
            'Draft players retrieved successfully!',
            $players,
            200
        );
    }
}
