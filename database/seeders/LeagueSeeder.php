<?php

namespace Database\Seeders;

use App\Models\League;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LeagueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $leagues = [
            [
                'league_name' => 'PGA',
                'league_slug' => 'pga',
                'title' => 'PROFESSIONAL GOLF',
                'icon' => 'leagues/0qPTrBvF0xdOVZ5FavIkkqlD6LkQtVlkZTvKIrPh.svg',
                'is_draft_pick' => false,
            ],
            [
                'league_name' => 'NHL',
                'league_slug' => 'nhl',
                'title' => 'NATIONAL HOCKEY LEAGUE',
                'icon' => 'leagues/ZFDVem8snC8qOJbueGjyl7M4imwfKgp4I9wekoKl.svg',
                'is_draft_pick' => false,
            ],
            [
                'league_name' => 'NFL',
                'league_slug' => 'nfl',
                'title' => 'FOOTBALL LEAGUES',
                'icon' => 'leagues/91P4GvIqPpucIIaDP3nEQK5jnMBxzWesLazTqkXa.svg',
                'is_draft_pick' => true,
            ],
            [
                'league_name' => 'NBA',
                'league_slug' => 'nba',
                'title' => 'NATIONAL BASKETBALL ASSN',
                'icon' => 'leagues/E53SOmYsU1lMhIwXayDGPJd8LlbxL3frm6S6NYMI.svg',
                'is_draft_pick' => true,
            ],
            [
                'league_name' => 'MLB',
                'league_slug' => 'mlb',
                'title' => 'MAJOR LEAGUE BASEBALL',
                'icon' => 'leagues/OgyFH726phbbmIkEVQmrGCzyNaUQVuPNPSy0qVul.svg',
                'is_draft_pick' => true,
            ],
            [
                'league_name' => 'FIFA',
                'league_slug' => 'fifa',
                'title' => 'INTERNATIONAL FOOTBALL',
                'icon' => 'leagues/96g3pESw1y4eWx3qyC2MovvYveCe6GqsoDx77er0.svg',
                'is_draft_pick' => false,
            ],
        ];

        foreach ($leagues as $league) {
            League::updateOrCreate(
                ['league_slug' => $league['league_slug']],
                [
                    'league_name' => $league['league_name'],
                    'title' => $league['title'],
                    'icon' => $league['icon'],
                    'is_draft_pick' => $league['is_draft_pick'],
                ]
            );
        }
    }
}
