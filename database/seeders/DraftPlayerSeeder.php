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
                'first_name' => 'John',
                'last_name' => 'Smith',
                'position' => 'PG',
                'current_team' => 'Padres',
                'draft_team' => '',
                'school' => 'Arizona State University, Arizona',
                'agent_name' => 'Jamie Murphy',
                'agency_name' => 'TWC Sports Management',
                'status' => 'signed',
            ],
            [
                'year' => 2026,
                'round' => 1,
                'pick' => 2,
                'first_name' => 'Alex',
                'last_name' => 'Rodriguez',
                'position' => 'SS',
                'current_team' => 'Mariners',
                'draft_team' => 'Giants',
                'school' => 'University of Miami, Florida',
                'agent_name' => 'Scott Boras',
                'agency_name' => 'Boras Corporation',
                'status' => 'unsigned_draft',
            ],
            [
                'year' => 2026,
                'round' => 1,
                'pick' => 3,
                'first_name' => 'David',
                'last_name' => 'Miller',
                'position' => 'CF',
                'current_team' => 'Mariners',
                'draft_team' => 'Giants',
                'school' => 'Vanderbilt University, Tennessee',
                'agent_name' => 'Casey Close',
                'agency_name' => 'Excel Sports',
                'status' => 'unsigned_draft',
            ],
            [
                'year' => 2025,
                'round' => 1,
                'pick' => 1,
                'first_name' => 'James',
                'last_name' => 'Wilson',
                'position' => 'RHP',
                'current_team' => 'Astros',
                'draft_team' => 'Yankees',
                'school' => 'LSU, Louisiana',
                'agent_name' => 'Brodie Van Wagenen',
                'agency_name' => 'Wasserman',
                'status' => 'unsigned_draft',
            ],
            [
                'year' => 2025,
                'round' => 1,
                'pick' => 2,
                'first_name' => 'Carlos',
                'last_name' => 'Gomez',
                'position' => '3B',
                'current_team' => 'Angels',
                'draft_team' => 'Red Sox',
                'school' => 'Stanford University, California',
                'agent_name' => 'Dan Lozano',
                'agency_name' => 'MVP Sports',
                'status' => 'signed',
            ],
            [
                'year' => 2024,
                'round' => 1,
                'pick' => 1,
                'first_name' => 'Ethan',
                'last_name' => 'Turner',
                'position' => 'LHP',
                'current_team' => 'Retired',
                'draft_team' => 'Orioles',
                'school' => 'University of Florida, Florida',
                'agent_name' => 'Jeff Berry',
                'agency_name' => 'CAA Sports',
                'status' => 'signed',
            ],
        ];

        foreach ($players as $player) {
            $fullName = trim("{$player['first_name']} {$player['last_name']}");
            DraftPlayer::updateOrCreate(
                [
                    'league_id'  => $league->id,
                    'year'       => $player['year'],
                    'round'      => $player['round'],
                    'pick'       => $player['pick'],
                    'first_name' => $player['first_name'],
                    'last_name'  => $player['last_name'],
                ],
                [
                    'position'     => $player['position'],
                    'current_team' => $player['current_team'] ?? null,
                    'draft_team'   => $player['draft_team'] ?? null,
                    'school'       => $player['school'],
                    'slug'         => Str::slug($fullName),
                    'agent_name'   => $player['agent_name'],
                    'agency_name'  => $player['agency_name'],
                    'status'       => $player['status'],
                ]
            );
        }
    }
}
