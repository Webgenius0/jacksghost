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
        Schema::create('draft_players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('league_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('year')->nullable();
            $table->integer('round')->nullable();
            $table->integer('pick')->nullable();
            $table->string('player_name')->nullable();
            $table->string('position')->nullable();
            $table->string('school')->nullable();
            $table->string('slug')->nullable();
            $table->foreignId('agent_id')->nullable()->constrained()->nullOnDelete();
            $table->string('agent_name')->nullable();
            $table->string('agency_name')->nullable();
            $table->string('height')->nullable();
            $table->string('weight')->nullable();
            $table->date('birthdate')->nullable();
            $table->string('nationality')->nullable();
            $table->string('status')->default('unsigned_draft');
            $table->timestamps();

            $table->index(['league_id', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('draft_players');
    }
};
