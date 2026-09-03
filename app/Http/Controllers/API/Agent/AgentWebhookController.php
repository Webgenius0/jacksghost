<?php

namespace App\Http\Controllers\API\Agent;

use App\Http\Controllers\Controller;
use App\Models\AgentListingTemp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class AgentWebhookController extends Controller
{
    /**
     * Handle incoming Stripe webhook events for agent listing payments.
     *
     * POST /api/agent/webhook
     *
     * IMPORTANT: This route must be unauthenticated — Stripe calls it directly.
     * Authenticity is verified via the Stripe-Signature header (STRIPE_WEBHOOK_SECRET).
     */
    public function handleWebhook(Request $request)
    {
        $payload       = $request->getContent();
        $sigHeader     = $request->header('Stripe-Signature');
        $webhookSecret = config('stripe.webhook_secret');

        // Verify the webhook signature to ensure the request came from Stripe
        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (\UnexpectedValueException $e) {
            Log::warning('[AgentWebhook] Invalid payload: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            Log::warning('[AgentWebhook] Invalid signature: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Handle the event type
        switch ($event->type) {
            case 'checkout.session.completed':
                $this->handleSessionCompleted($event->data->object);
                break;

            case 'checkout.session.expired':
                $this->handleSessionExpired($event->data->object);
                break;

            default:
                Log::info('[AgentWebhook] Unhandled event type: ' . $event->type);
                break;
        }

        // Always return 200 to acknowledge receipt to Stripe
        return response()->json(['received' => true], 200);
    }

    /**
     * Handle checkout.session.completed event.
     *
     * Fired when the user successfully completes the Stripe-hosted checkout page.
     * payment_status will be 'paid' for one-time payments.
     */
    protected function handleSessionCompleted(object $session): void
    {
        $sessionId = $session->id;

        Log::info('[AgentWebhook] checkout.session.completed: ' . $sessionId);

        // Only process fully paid sessions (not unpaid subscriptions etc.)
        if ($session->payment_status !== 'paid') {
            Log::info('[AgentWebhook] Session not paid yet, skipping: ' . $sessionId);
            return;
        }

        // Find the pending temp record by session ID
        $temp = AgentListingTemp::where('stripe_session_id', $sessionId)->first();

        if (!$temp) {
            Log::warning('[AgentWebhook] No temp record found for session: ' . $sessionId);
            return;
        }

        // Idempotency: avoid double-processing
        if ($temp->payment_status === 'succeeded') {
            Log::info('[AgentWebhook] Already processed session: ' . $sessionId);
            return;
        }

        try {
            // payment_intent is the underlying PaymentIntent ID (pi_xxx)
            $paymentIntentId = $session->payment_intent ?? null;

            AgentController::createAgentFromTemp($temp, $paymentIntentId);

            Log::info('[AgentWebhook] Agent listing created for session: ' . $sessionId);
        } catch (\Throwable $e) {
            Log::error('[AgentWebhook] Failed to create agent listing: ' . $e->getMessage(), [
                'session_id' => $sessionId,
            ]);
        }
    }

    /**
     * Handle checkout.session.expired event.
     *
     * Fired when the Stripe Checkout page expires (24h default) without payment.
     * Marks the temp record as failed so the user can retry.
     */
    protected function handleSessionExpired(object $session): void
    {
        $sessionId = $session->id;

        Log::info('[AgentWebhook] checkout.session.expired: ' . $sessionId);

        AgentListingTemp::where('stripe_session_id', $sessionId)
            ->update(['payment_status' => 'expired']);
    }
}
