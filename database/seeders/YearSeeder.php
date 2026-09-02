<?php

namespace Database\Seeders;

use App\Models\Year;
use Illuminate\Database\Seeder;

class YearSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        for ($year = 2002; $year <= 2026; $year++) {
            Year::firstOrCreate([
                'year' => $year,
            ]);
        }
    }
}
