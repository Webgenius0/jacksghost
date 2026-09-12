<?php

namespace App\Http\Controllers\Web\Admin\Payment;

use App\Http\Controllers\Controller;
use App\Models\AgentPayment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AgentPaymentController extends Controller
{
    /**
     * Display a paginated list of agent payments with optional search & status filter.
     */
    public function index(Request $request): Response
    {
        $query = AgentPayment::with(['agent:id,agent_name,agency_name,agent_photo,email'])
            ->select([
                'id',
                'agent_id',
                'stripe_session_id',
                'payment_intent_id',
                'transaction_id',
                'amount',
                'currency',
                'payment_status',
                'paid_at',
                'created_at',
            ]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                  ->orWhere('payment_intent_id', 'like', "%{$search}%")
                  ->orWhereHas('agent', function ($aq) use ($search) {
                      $aq->where('agent_name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('payment_status', $request->status);
        }

        $payments = $query->latest()->paginate($request->per_page ?? 15)->withQueryString();

        // Stats
        $stats = [
            'total_revenue'  => AgentPayment::where('payment_status', 'succeeded')->sum('amount'),
            'total_count'    => AgentPayment::count(),
            'paid_count'     => AgentPayment::where('payment_status', 'succeeded')->count(),
            'pending_count'  => AgentPayment::where('payment_status', 'pending')->count(),
            'failed_count'   => AgentPayment::where('payment_status', 'failed')->count(),
        ];

        return Inertia::render('payments/agent-payments', [
            'payments' => $payments,
            'filters'  => $request->only(['search', 'status', 'per_page']),
            'stats'    => $stats,
        ]);
    }
}
