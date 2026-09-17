<?php

namespace App\Http\Controllers\API\League;

use App\Http\Controllers\Controller;
use App\Http\Resources\LeagueContentResource;
use App\Http\Resources\LeagueResource;
use App\Models\CurrentTeam;
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

        $players = DraftPlayer::where('league_id', $league->id)
            ->where('year', $year)
            ->get()
            ->map(function ($player) {
                return [
                    'id' => $player->id,
                    'year' => $player->year,
                    'slug' => $player->slug,
                    'round' => $player->round,
                    'pick' => $player->pick,
                    'draft_team' => $player->draft_team,
                    'first_name' => $player->first_name,
                    'last_name' => $player->last_name,
                    'position' => $player->position,
                ];
            });

        return $this->success(
            'Draft players retrieved successfully!',
            $players,
            200
        );
    }


    public function searchPlayers(Request $request)
    {
        if (!$request->filled('sport')) {
            return $this->success(
                'Please select a value for all filters',
                [],
                200
            );
        }

        if (
            !$request->filled('name') &&
            !$request->filled('year') &&
            !$request->filled('current_team')
        ) {
            return $this->success(
                'Please select a value for all filters',
                [],
                200
            );
        }

        $query = DraftPlayer::query();

        $query->whereHas('league', function ($q) use ($request) {
            $q->where('league_name', $request->sport);
        });

        if ($request->filled('name')) {
            $name = $request->name;

            $query->where(function ($q) use ($name) {
                $q->where('first_name', $name)
                ->orWhere('last_name', $name);
            });
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }
        if ($request->filled('current_team')) {
            $query->where('current_team', $request->current_team);
        }

        $players = $query->get();

        return $this->success(
            'Draft players retrieved successfully!',
            $players,
            200
        );
    }



    public function CurrentTeam(Request $request)
    {
        $league = League::with('currentTeams')->where('league_name', $request->sport)->first();

        if (!$league) {
            return $this->error('League not found', 404);
        }

        $teams = $league->currentTeams->map(function ($team) {
            return [
                'id' => $team->id,
                'team_name' => $team->team_name,
            ];
        });

        return $this->success(
            'Current Team retrieved successfully!',
            $teams,
            200
        );
    }
}
