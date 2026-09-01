<?php

namespace App\Http\Controllers\API\League;

use App\Http\Controllers\Controller;
use App\Http\Resources\LeagueResource;
use App\Models\League;
use App\Traits\ApiResponse;

class LeagueController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $leagues = League::with('leagueContent')->get();

        $leagues = LeagueResource::collection($leagues);

        return $this->success('Leagues retrieved successfully!', $leagues, 200);
    }

    public function show(League $league)
    {
        $league->load('leagueContent');

        return $this->success('League retrieved successfully!', new LeagueResource($league), 200);
    }
}
