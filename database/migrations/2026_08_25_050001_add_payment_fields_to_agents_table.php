<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds Stripe payment tracking fields to the agents table.
     */
    public function up(): void
    {
        Schema::table('agents', function (Blueprint $table) {
            $table->string('payment_intent_id')->nullable()->unique()->after('status');
            $table->string('payment_status')->nullable()->default('pending')->after('payment_intent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agents', function (Blueprint $table) {
            $table->dropColumn(['payment_intent_id', 'payment_status']);
        });
    }
};
