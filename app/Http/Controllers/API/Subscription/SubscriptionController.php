<?php

namespace App\Http\Controllers\API\Subscription;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SystemSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Stripe\StripeClient;

class SubscriptionController extends Controller
{
    use ApiResponse;

    protected StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('stripe.secret'));
    }

    /**
     * Create a Stripe Checkout session in subscription mode.
     */
    public function createCheckoutSession(Request $request): JsonResponse
    {
        $user = Auth::user();

        $existing = Subscription::where('user_id', $user->id)
            ->where('subscription_status', 'active')
            ->where('subscription_expire_date', '>', now())
            ->first();

        if ($existing) {
            return $this->error(
                'You already have an active subscription.',
                409
            );
        }

        $settings         = SystemSetting::first();
        $subscriptionFee  = (int) (($settings?->subscription_fee ?? 59.95) * 100);
        $frontendUrl      = rtrim(config('app.frontend_url', config('app.url')), '/');

        $stripeCustomerId = $this->resolveStripeCustomer($user);

        $sessionParams = [
            'mode'       => 'subscription',
            'customer'   => $stripeCustomerId,
            'line_items' => [
                [
                    'price_data' => [
                        'currency'     => 'usd',
                        'unit_amount'  => $subscriptionFee,
                        'recurring'    => ['interval' => 'year'],
                        'product_data' => [
                            'name'        => 'Yearly Subscription',
                            'description' => 'Full access to all premium features for one year.',
                        ],
                    ],
                    'quantity' => 1,
                ],
            ],
            'success_url'           => $frontendUrl . '/subscription/success?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url'            => $frontendUrl . '/subscription/cancelled',
            'metadata'              => [
                'user_id' => $user->id,
                'email'   => $user->email,
                'type'    => 'user_subscription',
            ],
            'subscription_data'     => [
                'metadata' => [
                    'user_id' => $user->id,
                ],
            ],
        ];

        $session = $this->stripe->checkout->sessions->create($sessionParams);

        Log::info('[Subscription] Checkout session created', [
            'user_id'    => $user->id,
            'session_id' => $session->id,
        ]);

        return $this->success('Checkout session created. Redirect the user to the checkout URL.', [
            'checkout_url' => $session->url,
            'session_id'   => $session->id,
        ]);
    }

    /**
     * Verify a completed session and activate / confirm the subscription.
     */
    public function verifySession(Request $request): JsonResponse
    {
        $request->validate([
            'session_id' => ['required', 'string'],
        ]);

        $user    = Auth::user();
        $session = $this->stripe->checkout->sessions->retrieve($request->session_id, [
            'expand' => ['subscription'],
        ]);

        if (!$session || $session->metadata['user_id'] != $user->id) {
            return $this->error('Invalid session or session does not belong to this user.', 403);
        }

        if ($session->payment_status !== 'paid') {
            return $this->error(
                'Payment has not been completed yet. Status: ' . $session->payment_status,
                402
            );
        }
        $subscription = $this->activateSubscription($user->id, $session->subscription, $user->email);

        return $this->success('Subscription activated successfully.', [
            'subscription' => $this->formatSubscription($subscription),
        ]);
    }

    public function getStatus(): JsonResponse
    {
        $user = Auth::user();

        $subscription = Subscription::where('user_id', $user->id)
            ->latest()
            ->first();

        if (!$subscription) {
            return $this->success('No subscription found.', [
                'is_subscribed' => false,
            ]);
        }

        if (
            $subscription->subscription_status === 'active' &&
            $subscription->subscription_expire_date &&
            $subscription->subscription_expire_date->isPast()
        ) {
            $subscription->update([
                'subscription_status' => 'expired',
            ]);

            $subscription->refresh();
        }

        $isActive = $subscription->subscription_status === 'active'
            && $subscription->subscription_expire_date
            && $subscription->subscription_expire_date->isFuture();

        return $this->success('Subscription status retrieved.', [
            'is_subscribed' => $isActive,
            'subscription'  => $this->formatSubscription($subscription),
        ]);
    }


    /**
     * Cancel the current authenticated user's active Stripe subscription.
     */
    public function cancel(): JsonResponse
    {
        $user         = Auth::user();
        $subscription = Subscription::where('user_id', $user->id)
            ->where('subscription_status', 'active')
            ->latest()
            ->first();

        if (!$subscription || !$subscription->stripe_subscription_id) {
            return $this->error('No active subscription found to cancel.', 404);
        }

        try {
            $this->stripe->subscriptions->cancel($subscription->stripe_subscription_id, [
                'cancel_at_period_end' => true,
            ]);

            $subscription->update(['subscription_status' => 'cancelling']);

            Log::info('[Subscription] Cancellation scheduled', [
                'user_id'                 => $user->id,
                'stripe_subscription_id'  => $subscription->stripe_subscription_id,
            ]);

            return $this->success('Your subscription will be cancelled at the end of the billing period.', [
                'subscription' => $this->formatSubscription($subscription->fresh()),
            ]);
        } catch (\Stripe\Exception\ApiErrorException $e) {
            Log::error('[Subscription] Cancel failed: ' . $e->getMessage());
            return $this->error('Failed to cancel subscription: ' . $e->getMessage(), 500);
        }
    }

    // ──────────────────────────────────────────────────────────────────
    //  Helpers
    // ──────────────────────────────────────────────────────────────────

    protected function resolveStripeCustomer($user): string
    {
        $existing = Subscription::where('user_id', $user->id)
            ->whereNotNull('stripe_customer_id')
            ->latest()
            ->value('stripe_customer_id');

        if ($existing) {
            return $existing;
        }

        // Create a new Stripe customer
        $customer = $this->stripe->customers->create([
            'email'    => $user->email,
            'name'     => $user->name,
            'metadata' => ['user_id' => $user->id],
        ]);

        return $customer->id;
    }

    /**
     * Create or update the local Subscription record from a Stripe subscription object.
     */
    public function activateSubscription(int|string $userId, $stripeSubscription, string $email): Subscription
    {
        if (is_string($stripeSubscription)) {
            $stripeSubscription = $this->stripe->subscriptions->retrieve($stripeSubscription);
        }

        $periodEnd = now()->addYear();

        $subscription = Subscription::updateOrCreate(
            ['user_id' => $userId],
            [
                'stripe_email'             => $email,
                'stripe_customer_id'       => $stripeSubscription->customer,
                'stripe_subscription_id'   => $stripeSubscription->id,
                'amount'                   => ($stripeSubscription->plan?->amount ?? 0) / 100,
                'subscribe_date'           => now(),
                'subscription_status'      => 'active',
                'subscription_expire_date' => $periodEnd,
                'uuid'                     => (string) Str::uuid(),
            ]
        );

        Log::info('[Subscription] Activated', [
            'user_id'      => $userId,
            'expires_at'   => $periodEnd->toDateTimeString(),
        ]);

        return $subscription;
    }

    /**
     * Format a Subscription model for API responses.
     */
    protected function formatSubscription(Subscription $sub): array
    {
        return [
            'id'                       => $sub->id,
            'status'                   => $sub->subscription_status,
            'amount'                   => $sub->amount,
            'stripe_customer_id'       => $sub->stripe_customer_id,
            'stripe_subscription_id'   => $sub->stripe_subscription_id,
            'stripe_email'             => $sub->stripe_email,
            'subscribe_date'           => $sub->subscribe_date?->toDateTimeString(),
            'subscription_expire_date' => $sub->subscription_expire_date?->toDateTimeString(),
        ];
    }
}
