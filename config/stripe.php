<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Stripe Keys
    |--------------------------------------------------------------------------
    |
    | The Stripe publishable key and secret key. The publishable key is used
    | on the frontend (Stripe.js). The secret key is used server-side.
    |
    */

    'key'    => env('STRIPE_KEY', ''),
    'secret' => env('STRIPE_SECRET', ''),

    /*
    |--------------------------------------------------------------------------
    | Stripe Webhook Secret
    |--------------------------------------------------------------------------
    |
    | Used to verify that incoming webhook events are genuinely from Stripe.
    | Get this from your Stripe dashboard > Webhooks > endpoint signing secret.
    |
    */

    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET', ''),

    /*
    |--------------------------------------------------------------------------
    | Agent Listing Fee
    |--------------------------------------------------------------------------
    |
    | The one-time fee (in cents) required to submit an agent listing.
    | $100.00 = 10000 cents
    |
    */

    'agent_listing_fee' => env('AGENT_LISTING_FEE', 10000),
];
