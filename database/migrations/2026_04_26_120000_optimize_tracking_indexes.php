<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_sessions', function (Blueprint $table) {
            $table->index(['token_id', 'finished_at'], 'user_sessions_token_finished_idx');
            $table->index(['user_id', 'started_at'], 'user_sessions_user_started_idx');
            $table->index(['user_id', 'created_at'], 'user_sessions_user_created_idx');
            $table->index(['platform', 'created_at'], 'user_sessions_platform_created_idx');
        });

        Schema::table('user_activities', function (Blueprint $table) {
            $table->index(['user_id', 'created_at'], 'user_activities_user_created_idx');
            $table->index(['platform', 'created_at'], 'user_activities_platform_created_idx');
            $table->index(['action'], 'user_activities_action_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_sessions', function (Blueprint $table) {
            $table->dropIndex('user_sessions_token_finished_idx');
            $table->dropIndex('user_sessions_user_started_idx');
            $table->dropIndex('user_sessions_user_created_idx');
            $table->dropIndex('user_sessions_platform_created_idx');
        });

        Schema::table('user_activities', function (Blueprint $table) {
            $table->dropIndex('user_activities_user_created_idx');
            $table->dropIndex('user_activities_platform_created_idx');
            $table->dropIndex('user_activities_action_idx');
        });
    }
};
