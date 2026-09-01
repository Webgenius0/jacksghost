<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SystemSetting::create([
            'title' => 'XYZ',
            'system_name' => 'XYZ',
            'email' => 'info@gmail.com',
            'number' => '+12120000000',
            'logo' => null,
            'favicon' => null,
            'address' => null,
            'copyright_text' => 'Copyright 2026. All Rights Reserved. Powered by XYZ.',
            'description' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
