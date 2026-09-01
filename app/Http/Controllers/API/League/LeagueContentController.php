<?php

namespace App\Http\Controllers\API\League;

use App\Http\Controllers\Controller;
use App\Http\Resources\LeagueContentResource;
use App\Models\LeagueContent;
use App\Traits\ApiResponse;

class LeagueContentController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $contents = LeagueContent::with('league')->get();

        $contents = LeagueContentResource::collection($contents);

        return $this->success('League contents retrieved successfully!', $contents, 200);
    }

    public function show(LeagueContent $leagueContent)
    {
        $leagueContent->load('league');

        return $this->success('League content retrieved successfully!', new LeagueContentResource($leagueContent), 200);
    }

    public function byLeague($leagueId)
    {
        $contents = LeagueContent::with('league')
            ->where('league_id', $leagueId)
            ->get();

        $contents = LeagueContentResource::collection($contents);

        return $this->success('League contents retrieved successfully!', $contents, 200);
    }
}
