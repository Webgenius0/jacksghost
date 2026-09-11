<?php

namespace App\Http\Controllers\API\Subscription;

use App\Http\Controllers\Controller;
use App\Http\Controllers\API\Subscription\SubscriptionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class SubscriptionWebhookController extends Controller
{
    /**
     * Handle incoming Stripe webhook events for user subscriptions.
     *
     * POST /api/subscription/webhook
     *
     * IMPORTANT: This route must be unauthenticated — Stripe calls it directly.
     * Authenticity is verified via the Stripe-Signature header.
     *
     * Stripe events handled:
     *  - checkout.session.completed          → activate subscription after checkout
     *  - customer.subscription.updated       → sync status / expiry on renewal
     *  - customer.subscription.deleted       → mark subscription as cancelled
     *  - invoice.payment_failed              → mark subscription as past_due
     */
    public function handleWebhook(Request $request)
    {
        $payload       = $request->getContent();
        $sigHeader     = $request->header('Stripe-Signature');
        $webhookSecret = config('stripe.subscription_webhook_secret');

        // Verify the webhook signature
        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (\UnexpectedValueException $e) {
            Log::warning('[SubscriptionWebhook] Invalid payload: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            Log::warning('[SubscriptionWebhook] Invalid signature: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        Log::info('[SubscriptionWebhook] Event received: ' . $event->type);

        switch ($event->type) {
            case 'checkout.session.completed':
                $this->handleSessionCompleted($event->data->object);
                break;

            case 'customer.subscription.updated':
                $this->handleSubscriptionUpdated($event->data->object);
                break;

            case 'customer.subscription.deleted':
                $this->handleSubscriptionDeleted($event->data->object);
                break;

            case 'invoice.payment_failed':
                $this->handlePaymentFailed($event->data->object);
                break;

            default:
                Log::info('[SubscriptionWebhook] Unhandled event type: ' . $event->type);
                break;
        }

        // Always return 200 to acknowledge receipt to Stripe
        return response()->json(['received' => true], 200);
    }

    // ──────────────────────────────────────────────────────────────────
    //  Event Handlers
    // ──────────────────────────────────────────────────────────────────

    /**
     * checkout.session.completed
     *
     * Fired when the user successfully completes the Stripe-hosted checkout.
     * The session must be in subscription mode; we resolve the user from
     * session metadata and activate their subscription.
     */
    protected function handleSessionCompleted(object $session): void
    {
        Log::info('[SubscriptionWebhook] checkout.session.completed: ' . $session->id);

        // Only handle subscription-mode sessions tagged with our metadata
        if (($session->metadata['type'] ?? '') !== 'user_subscription') {
            Log::info('[SubscriptionWebhook] Skipping non-subscription session: ' . $session->id);
            return;
        }

        if ($session->payment_status !== 'paid') {
            Log::info('[SubscriptionWebhook] Session not paid yet, skipping: ' . $session->id);
            return;
        }

        $userId = $session->metadata['user_id'] ?? null;
        $email  = $session->metadata['email'] ?? null;

        if (!$userId) {
            Log::warning('[SubscriptionWebhook] No user_id in metadata for session: ' . $session->id);
            return;
        }

        // Idempotency: skip if already active
        $existing = \App\Models\Subscription::where('user_id', $userId)
            ->where('subscription_status', 'active')
            ->first();

        if ($existing) {
            Log::info('[SubscriptionWebhook] Subscription already active for user: ' . $userId);
            return;
        }

        try {
            $ctrl = new SubscriptionController();
            $ctrl->activateSubscription($userId, $session->subscription, $email ?? '');

            Log::info('[SubscriptionWebhook] Subscription activated for user: ' . $userId);
        } catch (\Throwable $e) {
            Log::error('[SubscriptionWebhook] Failed to activate subscription: ' . $e->getMessage(), [
                'user_id'    => $userId,
                'session_id' => $session->id,
            ]);
        }
    }

    /**
     * customer.subscription.updated
     *
     * Fired when a subscription renews, changes plan, or its status changes.
     * We sync the local record: expiry date, status, and amount.
     */
    protected function handleSubscriptionUpdated(object $stripeSubscription): void
    {
        Log::info('[SubscriptionWebhook] customer.subscription.updated: ' . $stripeSubscription->id);

        $sub = \App\Models\Subscription::where('stripe_subscription_id', $stripeSubscription->id)->first();

        if (!$sub) {
            Log::warning('[SubscriptionWebhook] No local subscription found for: ' . $stripeSubscription->id);
            return;
        }

        $newStatus = match ($stripeSubscription->status) {
            'active'            => 'active',
            'past_due'          => 'past_due',
            'canceled'          => 'cancelled',
            'unpaid'            => 'past_due',
            'cancel_at_period_end' => 'cancelling',
            default             => $stripeSubscription->status,
        };

        // Handle cancel_at_period_end flag
        if ($stripeSubscription->cancel_at_period_end && $newStatus === 'active') {
            $newStatus = 'cancelling';
        }

        $sub->update([
            'subscription_status'      => $newStatus,
            'subscription_expire_date' => \Carbon\Carbon::createFromTimestamp(
                $stripeSubscription->current_period_end
            ),
            'amount'                   => ($stripeSubscription->plan?->amount ?? $sub->amount * 100) / 100,
        ]);

        Log::info('[SubscriptionWebhook] Subscription updated', [
            'user_id'    => $sub->user_id,
            'new_status' => $newStatus,
        ]);
    }

    /**
     * customer.subscription.deleted
     *
     * Fired when a subscription is fully cancelled (after cancel_at_period_end expires
     * or when cancelled immediately).
     */
    protected function handleSubscriptionDeleted(object $stripeSubscription): void
    {
        Log::info('[SubscriptionWebhook] customer.subscription.deleted: ' . $stripeSubscription->id);

        \App\Models\Subscription::where('stripe_subscription_id', $stripeSubscription->id)
            ->update(['subscription_status' => 'cancelled']);

        Log::info('[SubscriptionWebhook] Subscription marked cancelled: ' . $stripeSubscription->id);
    }

    /**
     * invoice.payment_failed
     *
     * Fired when a renewal payment fails. We mark the subscription as past_due
     * so the app can show a prompt to update billing details.
     */
    protected function handlePaymentFailed(object $invoice): void
    {
        $stripeSubscriptionId = $invoice->subscription ?? null;

        Log::warning('[SubscriptionWebhook] invoice.payment_failed', [
            'invoice_id'      => $invoice->id,
            'subscription_id' => $stripeSubscriptionId,
        ]);

        if (!$stripeSubscriptionId) {
            return;
        }

        \App\Models\Subscription::where('stripe_subscription_id', $stripeSubscriptionId)
            ->update(['subscription_status' => 'past_due']);

        Log::info('[SubscriptionWebhook] Subscription marked past_due: ' . $stripeSubscriptionId);
    }
}
