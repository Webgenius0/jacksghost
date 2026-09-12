<?php

namespace App\Http\Controllers\Web\Admin\Payment;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    /**
     * Display a paginated list of subscriptions with optional search & status filter.
     */
    public function index(Request $request): Response
    {
        $query = Subscription::with(['user:id,name,email,avatar'])
            ->select([
                'id',
                'user_id',
                'amount',
                'stripe_email',
                'stripe_customer_id',
                'stripe_subscription_id',
                'subscribe_date',
                'subscription_status',
                'subscription_expire_date',
                'uuid',
                'created_at',
            ]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('stripe_email', 'like', "%{$search}%")
                  ->orWhere('stripe_subscription_id', 'like', "%{$search}%")
                  ->orWhere('stripe_customer_id', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('subscription_status', $request->status);
        }

        $subscriptions = $query->latest()->paginate($request->per_page ?? 15)->withQueryString();

        // Stats
        $stats = [
            'total_revenue'   => Subscription::where('subscription_status', 'active')->sum('amount'),
            'total_count'     => Subscription::count(),
            'active_count'    => Subscription::where('subscription_status', 'active')->count(),
            'expired_count'   => Subscription::where('subscription_status', 'expired')->count(),
            'canceled_count'  => Subscription::where('subscription_status', 'canceled')->count(),
            'past_due_count'  => Subscription::where('subscription_status', 'past_due')->count(),
        ];

        return Inertia::render('payments/subscriptions', [
            'subscriptions' => $subscriptions,
            'filters'       => $request->only(['search', 'status', 'per_page']),
            'stats'         => $stats,
        ]);
    }
}
