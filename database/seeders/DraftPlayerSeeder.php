<?php

namespace Database\Seeders;

use App\Models\DraftPlayer;
use App\Models\League;
use App\Models\Year;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DraftPlayerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure years exist
        foreach ([2024, 2025, 2026] as $year) {
            Year::firstOrCreate(['year' => $year]);
        }

        // Get or create a draft-enabled league
        $league = League::where('is_draft_pick', true)->first();
        if (!$league) {
            $league = League::create([
                'league_name' => 'MLB',
                'league_slug' => 'mlb',
                'title' => 'Major League Baseball',
                'is_draft_pick' => true,
            ]);
        }

        $players = [
            [
                'year' => 2026,
                'round' => 1,
                'pick' => 1,
                'player_name' => 'John Smith',
                'position' => 'PG',
                'school' => 'Arizona State University, Arizona',
                'agent_name' => 'Michael Brown',
                'agency_name' => 'ABC Sports',
                'status' => 'unsigned_draft',
            ],
            [
                'year' => 2026,
                'round' => 1,
                'pick' => 2,
                'player_name' => 'Alex Rodriguez',
                'position' => 'SS',
                'school' => 'University of Miami, Florida',
                'agent_name' => 'Scott Boras',
                'agency_name' => 'Boras Corporation',
                'status' => 'unsigned_draft',
            ],
            [
                'year' => 2026,
                'round' => 1,
                'pick' => 3,
                'player_name' => 'David Miller',
                'position' => 'CF',
                'school' => 'Vanderbilt University, Tennessee',
                'agent_name' => 'Casey Close',
                'agency_name' => 'Excel Sports',
                'status' => 'unsigned_draft',
            ],
            [
                'year' => 2025,
                'round' => 1,
                'pick' => 1,
                'player_name' => 'James Wilson',
                'position' => 'RHP',
                'school' => 'LSU, Louisiana',
                'agent_name' => 'Brodie Van Wagenen',
                'agency_name' => 'Wasserman',
                'status' => 'unsigned_draft',
            ],
            [
                'year' => 2025,
                'round' => 1,
                'pick' => 2,
                'player_name' => 'Carlos Gomez',
                'position' => '3B',
                'school' => 'Stanford University, California',
                'agent_name' => 'Dan Lozano',
                'agency_name' => 'MVP Sports',
                'status' => 'unsigned_draft',
            ],
            [
                'year' => 2024,
                'round' => 1,
                'pick' => 1,
                'player_name' => 'Ethan Turner',
                'position' => 'LHP',
                'school' => 'University of Florida, Florida',
                'agent_name' => 'Jeff Berry',
                'agency_name' => 'CAA Sports',
                'status' => 'unsigned_draft',
            ],
        ];

        foreach ($players as $player) {
            DraftPlayer::updateOrCreate(
                [
                    'league_id' => $league->id,
                    'year' => $player['year'],
                    'round' => $player['round'],
                    'pick' => $player['pick'],
                    'player_name' => $player['player_name'],
                ],
                [
                    'position' => $player['position'],
                    'school' => $player['school'],
                    'slug' => Str::slug($player['player_name']),
                    'agent_name' => $player['agent_name'],
                    'agency_name' => $player['agency_name'],
                    'status' => $player['status'],
                ]
            );
        }
    }
}
