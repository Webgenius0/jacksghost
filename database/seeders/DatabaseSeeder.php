<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */

    public function run(): void
    {
        // Disable FK constraints (works for all DBs)
        Schema::disableForeignKeyConstraints();

        DB::table('users')->truncate();
        DB::table('system_settings')->truncate();
        DB::table('dynamic_pages')->truncate();

        Schema::enableForeignKeyConstraints();

        $this->call([
            UserSeeder::class,
            SystemSettingSeeder::class,
            DynamicPageSeeder::class,
            SocialLinkSeeder::class,
        ]);
    }
}
