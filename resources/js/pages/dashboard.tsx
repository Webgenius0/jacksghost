import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    CreditCard,
    MessageSquare,
    Repeat,
    Users,
    TrendingUp,
    CheckCircle2,
    Clock,
    AlertCircle,
    Calendar,
    ArrowRight,
    DollarSign,
    Hash,
    Layers,
    Activity,
    Briefcase,
    Trophy,
    FileText,
    UserCheck,
} from 'lucide-react';
import React, { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

/* ─── Interfaces ─────────────────────────────────── */
interface Agent {
    id: number;
    agent_name: string;
    agency_name: string | null;
    agent_photo: string | null;
    email: string | null;
}

interface RecentAgentPayment {
    id: number;
    agent_id: number;
    transaction_id: string | null;
    payment_intent_id: string | null;
    amount: number;
    currency: string;
    payment_status: string;
    paid_at: string | null;
    created_at: string;
    agent: Agent | null;
}

interface User {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
}

interface RecentSubscription {
    id: number;
    user_id: number;
    amount: number;
    stripe_email: string | null;
    stripe_subscription_id: string | null;
    subscribe_date: string | null;
    subscription_status: string;
    subscription_expire_date: string | null;
    created_at: string;
    user: User | null;
}

interface TimelineItem {
    month: string;
    agent_rev: number;
    sub_rev: number;
    total: number;
}

interface DashboardProps {
    stats: {
        total_users: number;
        total_contacts: number;
        agent_revenue: number;
        subscription_revenue: number;
        total_gross_revenue: number;
        paid_agents_count: number;
        pending_agents_count: number;
        failed_agents_count: number;
        total_agents_payments: number;
        active_subscriptions: number;
        expired_subscriptions: number;
        canceled_subscriptions: number;
        total_subscriptions: number;
        total_agents?: number;
        approved_agents?: number;
        pending_agents?: number;
        total_leagues?: number;
        total_league_content?: number;
        total_league_players?: number;
    };
    recentAgentPayments?: RecentAgentPayment[];
    recentSubscriptions?: RecentSubscription[];
    timeline?: TimelineItem[];
}

/* ─── Helpers ─────────────────────────────────── */
function fmt(val: number, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
        maximumFractionDigits: 0,
    }).format(val);
}

function fmtDate(d: string | null) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const agentStatusConfig: Record<string, { label: string; classes: string }> = {
    succeeded: { label: 'Succeeded', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    paid:      { label: 'Paid',      classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    pending:   { label: 'Pending',   classes: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400  border-amber-200  dark:border-amber-800'  },
    unpaid:    { label: 'Unpaid',    classes: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400  border-amber-200  dark:border-amber-800'  },
    failed:    { label: 'Failed',    classes: 'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400    border-red-200    dark:border-red-800'    },
    expired:   { label: 'Expired',   classes: 'bg-zinc-100   text-zinc-700   dark:bg-zinc-900/30   dark:text-zinc-400   border-zinc-200   dark:border-zinc-800'   },
};

const subStatusConfig: Record<string, { label: string; classes: string; dot: string }> = {
    active:   { label: 'Active',   classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200', dot: 'bg-emerald-500' },
    canceled: { label: 'Canceled', classes: 'bg-zinc-100    text-zinc-600    dark:bg-zinc-800/60   dark:text-zinc-400   border-zinc-200',    dot: 'bg-zinc-400'    },
    expired:  { label: 'Expired',  classes: 'bg-amber-100   text-amber-700   dark:bg-amber-900/30  dark:text-amber-400  border-amber-200',   dot: 'bg-amber-500'   },
    past_due: { label: 'Past Due', classes: 'bg-red-100     text-red-700     dark:bg-red-900/30    dark:text-red-400    border-red-200',     dot: 'bg-red-500'     },
    trialing: { label: 'Trialing', classes: 'bg-sky-100     text-sky-700     dark:bg-sky-900/30    dark:text-sky-400    border-sky-200',     dot: 'bg-sky-500'     },
};

export default function Dashboard({
    stats,
    recentAgentPayments = [],
    recentSubscriptions = [],
    timeline = [],
}: DashboardProps) {
    const [activeTab, setActiveTab] = useState<'agents' | 'subscriptions'>('agents');

    const totalRev = stats.total_gross_revenue ?? 0;
    const agentRev = stats.agent_revenue ?? 0;
    const subRev   = stats.subscription_revenue ?? 0;

    const agentShare = totalRev > 0 ? Math.round((agentRev / totalRev) * 100) : 0;
    const subShare   = totalRev > 0 ? 100 - agentShare : 0;

    const maxTimelineTotal = Math.max(...timeline.map((t) => t.total), 100);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="p-6 space-y-6">
                {/* ── Top Header ── */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                Overview & Transactions
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Real-time tracking of agent listing payments, user subscriptions, and platform activity.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Link
                            href="/payments/agent-payments"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
                        >
                            <CreditCard className="w-3.5 h-3.5" />
                            Agent Payments
                        </Link>
                        <Link
                            href="/payments/subscriptions"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition-colors"
                        >
                            <Repeat className="w-3.5 h-3.5" />
                            Subscriptions
                        </Link>
                    </div>
                </div>

                {/* ── Key Financial Stat Cards ── */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {/* Hero Gross Revenue Card */}
                    <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-sm border border-indigo-500/20 sm:col-span-2 lg:col-span-1 xl:col-span-1">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">Total Revenue</p>
                                <p className="text-3xl font-extrabold tracking-tight mt-1">{fmt(totalRev)}</p>
                                <p className="text-xs text-indigo-200/80 mt-1">Combined gross earnings</p>
                            </div>
                            <div className="p-2.5 bg-white/10 rounded-xl">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-indigo-100">
                            <span>Agent: {fmt(agentRev)}</span>
                            <span>•</span>
                            <span>Subs: {fmt(subRev)}</span>
                        </div>
                    </div>

                    {/* Agent Payments Card */}
                    <Link href="/payments/agent-payments">
                        <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer h-full group bg-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Agent Payments
                                </CardTitle>
                                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                    <CreditCard className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold tracking-tight text-foreground">
                                    {fmt(agentRev)}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                                        <CheckCircle2 className="w-3 h-3 mr-0.5" />
                                        {stats.paid_agents_count ?? 0} paid
                                    </span>
                                    {Boolean(stats.pending_agents_count) && (
                                        <span>• {stats.pending_agents_count} pending</span>
                                    )}
                                </div>
                                <div className="mt-3 flex items-center text-xs font-medium text-indigo-600 dark:text-indigo-400 opacity-70 group-hover:opacity-100 transition-opacity">
                                    Track agent payments
                                    <ArrowUpRight className="ml-1 h-3 w-3" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Subscriptions Card */}
                    <Link href="/payments/subscriptions">
                        <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer h-full group bg-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Subscriptions MRR
                                </CardTitle>
                                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                                    <Repeat className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold tracking-tight text-foreground">
                                    {fmt(subRev)}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1" />
                                        {stats.active_subscriptions ?? 0} active plans
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center text-xs font-medium text-teal-600 dark:text-teal-400 opacity-70 group-hover:opacity-100 transition-opacity">
                                    Track subscriptions
                                    <ArrowUpRight className="ml-1 h-3 w-3" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Total Users Card */}
                    <Link href="/user">
                        <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer h-full group bg-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Total Users
                                </CardTitle>
                                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                    <Users className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold tracking-tight text-foreground">
                                    {(stats.total_users ?? 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Platform members registered
                                </p>
                                <div className="mt-3 flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 opacity-70 group-hover:opacity-100 transition-opacity">
                                    Manage users
                                    <ArrowUpRight className="ml-1 h-3 w-3" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Contacts Card */}
                    <Link href="/contact">
                        <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer h-full group bg-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Inquiries
                                </CardTitle>
                                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                                    <MessageSquare className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold tracking-tight text-foreground">
                                    {(stats.total_contacts ?? 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Messages received
                                </p>
                                <div className="mt-3 flex items-center text-xs font-medium text-rose-600 dark:text-rose-400 opacity-70 group-hover:opacity-100 transition-opacity">
                                    View messages
                                    <ArrowUpRight className="ml-1 h-3 w-3" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* ── Directory & League Operations Section ── */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-violet-500" />
                            <h2 className="text-sm font-semibold tracking-tight text-foreground">
                                Directory & League Management
                            </h2>
                        </div>
                        <span className="text-xs text-muted-foreground">Platform content and sports roster tracking</span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Total Agents */}
                        <Link href="/agents">
                            <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer h-full group bg-card">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Total Agents
                                    </CardTitle>
                                    <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                                        <Briefcase className="h-4 w-4" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold tracking-tight text-foreground">
                                        {(stats.total_agents ?? 0).toLocaleString()}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                            {stats.approved_agents ?? 0} approved
                                        </span>
                                        {Boolean(stats.pending_agents) && (
                                            <span>• {stats.pending_agents} pending</span>
                                        )}
                                    </div>
                                    <div className="mt-3 flex items-center text-xs font-medium text-violet-600 dark:text-violet-400 opacity-70 group-hover:opacity-100 transition-opacity">
                                        Manage directory
                                        <ArrowUpRight className="ml-1 h-3 w-3" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Total Leagues */}
                        <Link href="/league">
                            <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer h-full group bg-card">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Total Leagues
                                    </CardTitle>
                                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                        <Trophy className="h-4 w-4" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold tracking-tight text-foreground">
                                        {(stats.total_leagues ?? 0).toLocaleString()}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Active sport leagues tracked
                                    </p>
                                    <div className="mt-3 flex items-center text-xs font-medium text-amber-600 dark:text-amber-400 opacity-70 group-hover:opacity-100 transition-opacity">
                                        Explore leagues
                                        <ArrowUpRight className="ml-1 h-3 w-3" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* League Content */}
                        <Link href="/league-content">
                            <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer h-full group bg-card">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        League Content
                                    </CardTitle>
                                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold tracking-tight text-foreground">
                                        {(stats.total_league_content ?? 0).toLocaleString()}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Published guides & articles
                                    </p>
                                    <div className="mt-3 flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 opacity-70 group-hover:opacity-100 transition-opacity">
                                        Manage content
                                        <ArrowUpRight className="ml-1 h-3 w-3" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Total League Players */}
                        <Link href="/draft-player">
                            <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer h-full group bg-card">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Drafted Players
                                    </CardTitle>
                                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                        <UserCheck className="h-4 w-4" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold tracking-tight text-foreground">
                                        {(stats.total_league_players ?? 0).toLocaleString()}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Drafted athletes registered
                                    </p>
                                    <div className="mt-3 flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 opacity-70 group-hover:opacity-100 transition-opacity">
                                        View drafted players
                                        <ArrowUpRight className="ml-1 h-3 w-3" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>

                {/* ── Visual Analytics Row ── */}
                <div className="grid gap-6 lg:grid-cols-12">
                    {/* Revenue Distribution Card (5 cols) */}
                    <Card className="lg:col-span-5 border-none shadow-sm flex flex-col justify-between">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold">
                                    Revenue Distribution
                                </CardTitle>
                                <Badge variant="outline" className="text-xs font-normal">
                                    All Time
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Split between one-off agent listing fees and recurring user subscriptions
                            </p>
                        </CardHeader>

                        <CardContent className="space-y-6 pt-2">
                            {/* Visual Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                                        <span className="h-2 w-2 rounded-full bg-indigo-600" />
                                        Agent Listings ({agentShare}%)
                                    </span>
                                    <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                                        <span className="h-2 w-2 rounded-full bg-teal-500" />
                                        Subscriptions ({subShare}%)
                                    </span>
                                </div>
                                <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex">
                                    <div
                                        style={{ width: `${agentShare}%` }}
                                        className="bg-indigo-600 h-full transition-all duration-500"
                                        title={`Agent Listings: ${fmt(agentRev)}`}
                                    />
                                    <div
                                        style={{ width: `${subShare}%` }}
                                        className="bg-teal-500 h-full transition-all duration-500"
                                        title={`Subscriptions: ${fmt(subRev)}`}
                                    />
                                </div>
                            </div>

                            {/* Breakdown Stat Blocks */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">Agent Listings</span>
                                        <CreditCard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <p className="text-lg font-bold text-indigo-950 dark:text-white mt-1">
                                        {fmt(agentRev)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                                        <span>{stats.paid_agents_count ?? 0} paid</span>
                                        <span>•</span>
                                        <span>{stats.pending_agents_count ?? 0} pending</span>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/30">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-teal-900 dark:text-teal-200">Subscriptions</span>
                                        <Repeat className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                                    </div>
                                    <p className="text-lg font-bold text-teal-950 dark:text-white mt-1">
                                        {fmt(subRev)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                                        <span>{stats.active_subscriptions ?? 0} active</span>
                                        <span>•</span>
                                        <span>{stats.canceled_subscriptions ?? 0} canceled</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Jump Links */}
                            <div className="pt-2 flex items-center justify-between border-t border-border/50 text-xs">
                                <Link
                                    href="/payments/agent-payments"
                                    className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                                >
                                    Agent Payment Logs
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                                <Link
                                    href="/payments/subscriptions"
                                    className="flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline font-medium"
                                >
                                    Subscriber Logs
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Monthly Trend Visualizer (7 cols) */}
                    <Card className="lg:col-span-7 border-none shadow-sm flex flex-col justify-between">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold">
                                        6-Month Revenue Trend
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Monthly payment volume comparison
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <span className="h-2 w-2 rounded-full bg-indigo-600" />
                                        Agent
                                    </span>
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <span className="h-2 w-2 rounded-full bg-teal-500" />
                                        Subscription
                                    </span>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-2">
                            {timeline.length > 0 ? (
                                <div className="h-44 w-full flex items-end justify-between gap-2 pt-6 pb-2">
                                    {timeline.map((item, idx) => {
                                        const agentHeightPercent = maxTimelineTotal > 0
                                            ? Math.round((item.agent_rev / maxTimelineTotal) * 100)
                                            : 0;
                                        const subHeightPercent = maxTimelineTotal > 0
                                            ? Math.round((item.sub_rev / maxTimelineTotal) * 100)
                                            : 0;

                                        return (
                                            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                                {/* Tooltip on hover */}
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-center whitespace-nowrap bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-1.5 py-0.5 rounded shadow pointer-events-none mb-1">
                                                    {fmt(item.total)}
                                                </div>

                                                {/* Bar Stack */}
                                                <div className="w-full max-w-[36px] flex flex-col items-center justify-end rounded-t-md overflow-hidden bg-gray-100 dark:bg-gray-800/60 h-28">
                                                    {item.sub_rev > 0 && (
                                                        <div
                                                            style={{ height: `${Math.max(subHeightPercent, 4)}%` }}
                                                            className="w-full bg-teal-500 transition-all duration-300"
                                                            title={`Subscription: ${fmt(item.sub_rev)}`}
                                                        />
                                                    )}
                                                    {item.agent_rev > 0 && (
                                                        <div
                                                            style={{ height: `${Math.max(agentHeightPercent, 4)}%` }}
                                                            className="w-full bg-indigo-600 transition-all duration-300"
                                                            title={`Agent Payment: ${fmt(item.agent_rev)}`}
                                                        />
                                                    )}
                                                    {item.total === 0 && (
                                                        <div className="w-full h-1 bg-gray-300 dark:bg-gray-700" />
                                                    )}
                                                </div>

                                                {/* Month Label */}
                                                <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                                                    {item.month.split(' ')[0]}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="h-44 flex items-center justify-center text-xs text-muted-foreground">
                                    No timeline data available yet
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── Recent Transactions Feed (Tabbed Card) ── */}
                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <CardTitle className="text-base font-semibold">
                                    Recent Payment Activities
                                </CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Live stream of recent agent fee payments and subscriber events
                                </p>
                            </div>

                            {/* Tab Switcher */}
                            <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800/80 p-1 text-xs">
                                <button
                                    onClick={() => setActiveTab('agents')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                                        activeTab === 'agents'
                                            ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    Agent Payments ({recentAgentPayments.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('subscriptions')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                                        activeTab === 'subscriptions'
                                            ? 'bg-white dark:bg-gray-900 text-teal-600 dark:text-teal-400 shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Repeat className="w-3.5 h-3.5" />
                                    Subscriptions ({recentSubscriptions.length})
                                </button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {/* Tab 1: Agent Payments */}
                        {activeTab === 'agents' && (
                            <div>
                                {recentAgentPayments.length > 0 ? (
                                    <div className="divide-y divide-border/60">
                                        {recentAgentPayments.map((pay) => {
                                            const cfg = agentStatusConfig[pay.payment_status] ?? {
                                                label: pay.payment_status,
                                                classes: 'bg-gray-100 text-gray-700',
                                            };
                                            const agent = pay.agent;

                                            return (
                                                <div
                                                    key={pay.id}
                                                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                                                >
                                                    {/* Agent Info */}
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-border shadow-sm">
                                                            {agent?.agent_photo ? (
                                                                <img
                                                                    src={agent.agent_photo.startsWith('http') ? agent.agent_photo : `/${agent.agent_photo}`}
                                                                    alt={agent.agent_name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase">
                                                                    {agent?.agent_name?.charAt(0) ?? '?'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold truncate text-foreground">
                                                                {agent?.agent_name ?? 'Unknown Agent'}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {agent?.agency_name ?? agent?.email ?? 'Listing Fee Payment'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Transaction ID & Date */}
                                                    <div className="hidden sm:flex flex-col items-end text-right">
                                                        <div className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                                                            <Hash className="w-3 h-3 opacity-60" />
                                                            <span className="truncate max-w-[130px]">
                                                                {pay.transaction_id || pay.payment_intent_id || '—'}
                                                            </span>
                                                        </div>
                                                        <span className="text-[11px] text-muted-foreground">
                                                            {fmtDate(pay.paid_at || pay.created_at)}
                                                        </span>
                                                    </div>

                                                    {/* Amount & Status Badge */}
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-bold tabular-nums text-foreground">
                                                            {fmt(pay.amount, pay.currency)}
                                                        </span>
                                                        <Badge className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${cfg.classes}`}>
                                                            {cfg.label}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-xs text-muted-foreground">
                                        No agent payments recorded yet.
                                    </div>
                                )}

                                <div className="p-3 bg-muted/20 border-t border-border/50 flex justify-end">
                                    <Link
                                        href="/payments/agent-payments"
                                        className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                    >
                                        View all agent payments
                                        <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Subscriptions */}
                        {activeTab === 'subscriptions' && (
                            <div>
                                {recentSubscriptions.length > 0 ? (
                                    <div className="divide-y divide-border/60">
                                        {recentSubscriptions.map((sub) => {
                                            const cfg = subStatusConfig[sub.subscription_status] ?? {
                                                label: sub.subscription_status,
                                                classes: 'bg-zinc-100 text-zinc-700',
                                                dot: 'bg-zinc-400',
                                            };
                                            const user = sub.user;

                                            return (
                                                <div
                                                    key={sub.id}
                                                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                                                >
                                                    {/* User Info */}
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-border shadow-sm">
                                                            {user?.avatar ? (
                                                                <img
                                                                    src={user.avatar.startsWith('http') ? user.avatar : `/${user.avatar}`}
                                                                    alt={user.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-bold text-xs uppercase">
                                                                    {(user?.name || sub.stripe_email || '?').charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold truncate text-foreground">
                                                                {user?.name ?? 'Subscriber'}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {user?.email ?? sub.stripe_email ?? '—'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Sub ID & Date */}
                                                    <div className="hidden sm:flex flex-col items-end text-right">
                                                        <div className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                                                            <Hash className="w-3 h-3 opacity-60" />
                                                            <span className="truncate max-w-[130px]">
                                                                {sub.stripe_subscription_id || '—'}
                                                            </span>
                                                        </div>
                                                        <span className="text-[11px] text-muted-foreground">
                                                            Started {fmtDate(sub.subscribe_date || sub.created_at)}
                                                        </span>
                                                    </div>

                                                    {/* Amount & Status Badge */}
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-bold tabular-nums text-foreground">
                                                            {fmt(sub.amount)}
                                                        </span>
                                                        <Badge className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold ${cfg.classes}`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                                                            {cfg.label}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-xs text-muted-foreground">
                                        No subscription records yet.
                                    </div>
                                )}

                                <div className="p-3 bg-muted/20 border-t border-border/50 flex justify-end">
                                    <Link
                                        href="/payments/subscriptions"
                                        className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                                    >
                                        View all subscriptions
                                        <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
