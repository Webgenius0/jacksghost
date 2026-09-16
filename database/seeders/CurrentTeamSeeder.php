<?php

namespace Database\Seeders;

use App\Models\CurrentTeam;
use App\Models\League;
use Illuminate\Database\Seeder;

class CurrentTeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            'MLB' => [
                'Retired',
                'Unsigned',
                'Angels',
                'Astros',
                'Athletics',
                'Blue Jays',
                'Braves',
                'Brewers',
                'Cardinals',
                'Cubs',
                'Diamondbacks',
                'Dodgers',
                'Giants',
                'Guardians',
                'Mariners',
                'Marlins',
                'Mets',
                'Naionals',
                'Nationals',
                'Orioles',
                'Padres',
                'Phillies',
                'Pirates',
                'Rangers',
                'Rays',
                'Red Sox',
                'Reds',
                'Rockies',
                'Royals',
                'Tigers',
                'Twins',
                'White Sox',
                'Yankees',
            ],
            'NBA' => [
                'Retired',
                'Unsigned',
                '76ers',
                'Batum',
                'Bucks',
                'Bulls',
                'Cavaliers',
                'Celtics',
                'Clippers',
                'Grizzlies',
                'Hawks',
                'Heat',
                'Hornets',
                'Jazz',
                'Kings',
                'Knicks',
                'Lakers',
                'Magic',
                'Mavericks',
                'Nets',
                'Nuggest',
                'Nuggets',
                'Pacers',
                'Packers',
                'Pelicans',
                'Pistons',
                'Raptors',
                'Rockets',
                'Spurs',
                'Suns',
                'Thunder',
                'Timberwolves',
                'Trail Blazers',
                'Warriors',
                'Wizards',
            ],
            'NFL' => [
                'Retired',
                'Unsigned',
                '49ers',
                'Bears',
                'Bengals',
                'Bills',
                'Broncos',
                'Browns',
                'Buccaneers',
                'Cardinals',
                'Chargers',
                'Chiefs',
                'Colts',
                'Commanders',
                'Cowboys',
                'Dolphins',
                'Eagles',
                'Falcons',
                'Giants',
                'Jaguars',
                'Jets',
                'Lions',
                'Packers',
                'Panthers',
                'Patriots',
                'Raiders',
                'Rams',
                'Ravens',
                'Saints',
                'Seahawks',
                'Steelers',
                'Texans',
                'Titans',
                'Vikings',
                'Vikins',
            ],
        ];

        foreach ($data as $leagueName => $teams) {
            $league = League::where('league_name', $leagueName)->first();

            if (!$league) {
                $league = League::firstOrCreate(
                    ['league_slug' => strtolower($leagueName)],
                    [
                        'league_name' => $leagueName,
                        'is_draft_pick' => true,
                    ]
                );
            }

            foreach (array_unique($teams) as $teamName) {
                CurrentTeam::updateOrCreate(
                    [
                        'league_id' => $league->id,
                        'team_name' => trim($teamName),
                    ]
                );
            }
        }
    }
}
