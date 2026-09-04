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
            'title' => 'Sports Agent Directory',
            'system_name' => 'Sports Agent Directory',
            'email' => 'support@gmail.com',
            'number' => '+12120000000',
            'logo' => null,
            'favicon' => null,
            'address' => null,
            'copyright_text' => '© 1997 - 2026 - Sports Agent Directory - All Rights Reserved',
            'description' => 'The trusted directory connecting athletes with verified sports agents across every major league — since 1997.',
            'agent_listing_fee' => 100,
            'subscription_fee' => 59.95,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
