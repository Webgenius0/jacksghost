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
        Schema::create('agents', function (Blueprint $table) {
            $table->id();
            $table->string('agent_photo')->nullable();
            $table->string('agent_name')->nullable();
            $table->string('slug')->nullable();
            $table->string('agency_name')->nullable();
            $table->string('institution_name')->nullable();
            $table->string('degree')->nullable();
            $table->string('graduation_year')->nullable();
            $table->text('address')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('email')->nullable();
            $table->string('website_link')->nullable();
            $table->longText('background_info')->nullable();
            $table->json('notable_client')->nullable();
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agents');
    }
};
