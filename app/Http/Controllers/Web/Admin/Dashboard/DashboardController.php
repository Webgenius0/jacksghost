<?php

namespace App\Http\Controllers\Web\Admin\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\AgentPayment;
use App\Models\Agents;
use App\Models\Contact;
use App\Models\DraftPlayer;
use App\Models\League;
use App\Models\LeagueContent;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $agentRevenue        = (float) AgentPayment::whereIn('payment_status', ['succeeded', 'paid'])->sum('amount');
        $subscriptionRevenue = (float) Subscription::where('subscription_status', 'active')->sum('amount');
        $totalGrossRevenue   = $agentRevenue + $subscriptionRevenue;

        $stats = [
            'total_users'            => User::where('role', 'User')->count(),
            'total_contacts'         => Contact::count(),
            'agent_revenue'          => $agentRevenue,
            'subscription_revenue'   => $subscriptionRevenue,
            'total_gross_revenue'    => $totalGrossRevenue,
            'paid_agents_count'      => AgentPayment::whereIn('payment_status', ['succeeded', 'paid'])->count(),
            'pending_agents_count'   => AgentPayment::whereIn('payment_status', ['pending', 'unpaid'])->count(),
            'failed_agents_count'    => AgentPayment::where('payment_status', 'failed')->count(),
            'total_agents_payments'  => AgentPayment::count(),
            'active_subscriptions'   => Subscription::where('subscription_status', 'active')->count(),
            'expired_subscriptions'  => Subscription::where('subscription_status', 'expired')->count(),
            'canceled_subscriptions' => Subscription::where('subscription_status', 'canceled')->count(),
            'total_subscriptions'    => Subscription::count(),
            'total_agents'           => Agents::count(),
            'approved_agents'        => Agents::where('status', 'approved')->count(),
            'pending_agents'         => Agents::where('status', 'pending')->count(),
            'total_leagues'          => League::count(),
            'total_league_content'   => LeagueContent::count(),
            'total_league_players'   => DraftPlayer::count(),
        ];

        // Recent Agent Payments (latest 6)
        $recentAgentPayments = AgentPayment::with(['agent:id,agent_name,agency_name,agent_photo,email'])
            ->select([
                'id',
                'agent_id',
                'transaction_id',
                'payment_intent_id',
                'amount',
                'currency',
                'payment_status',
                'paid_at',
                'created_at',
            ])
            ->latest()
            ->take(6)
            ->get();

        // Recent Subscriptions (latest 6)
        $recentSubscriptions = Subscription::with(['user:id,name,email,avatar'])
            ->select([
                'id',
                'user_id',
                'amount',
                'stripe_email',
                'stripe_subscription_id',
                'subscribe_date',
                'subscription_status',
                'subscription_expire_date',
                'created_at',
            ])
            ->latest()
            ->take(6)
            ->get();

        // Last 6 months revenue timeline
        $timeline = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = Carbon::now()->subMonths($i)->startOfMonth();
            $monthEnd   = Carbon::now()->subMonths($i)->endOfMonth();
            $monthLabel = $monthStart->format('M Y');

            $monthAgentRev = (float) AgentPayment::whereIn('payment_status', ['succeeded', 'paid'])
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('amount');

            $monthSubRev = (float) Subscription::whereIn('subscription_status', ['active', 'trialing'])
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('amount');

            $timeline[] = [
                'month'     => $monthLabel,
                'agent_rev' => $monthAgentRev,
                'sub_rev'   => $monthSubRev,
                'total'     => $monthAgentRev + $monthSubRev,
            ];
        }

        return Inertia::render('dashboard', [
            'stats'               => $stats,
            'recentAgentPayments' => $recentAgentPayments,
            'recentSubscriptions' => $recentSubscriptions,
            'timeline'            => $timeline,
        ]);
    }
}
