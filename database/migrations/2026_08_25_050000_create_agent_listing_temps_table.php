<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Stores agent form data temporarily while awaiting Stripe payment confirmation.
     */
    public function up(): void
    {
        Schema::create('agent_listing_temps', function (Blueprint $table) {
            $table->id();
            $table->string('stripe_session_id')->unique();
            $table->longText('form_data'); // JSON blob of all form fields
            $table->string('payment_status')->default('pending'); // pending | succeeded | failed
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_listing_temps');
    }
};
