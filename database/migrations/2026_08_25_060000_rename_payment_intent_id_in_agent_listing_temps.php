<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Rename payment_intent_id → stripe_session_id in agent_listing_temps
     * to reflect that we now use Stripe Checkout Sessions.
     */
    public function up(): void
    {
        Schema::table('agent_listing_temps', function (Blueprint $table) {
            $table->renameColumn('payment_intent_id', 'stripe_session_id');
        });
    }

    public function down(): void
    {
        Schema::table('agent_listing_temps', function (Blueprint $table) {
            $table->renameColumn('stripe_session_id', 'payment_intent_id');
        });
    }
};
