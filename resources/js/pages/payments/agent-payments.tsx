import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Table from '@/components/Table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DollarSign,
    CheckCircle2,
    Clock,
    XCircle,
    CreditCard,
    TrendingUp,
    Hash,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────── */
interface Agent {
    id: number;
    agent_name: string;
    agency_name: string | null;
    agent_photo: string | null;
    email: string | null;
}

interface PaymentRow {
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
    // table key
    actions?: string;
}

interface Paginated {
    data: PaymentRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Stats {
    total_revenue: number;
    total_count: number;
    paid_count: number;
    pending_count: number;
    failed_count: number;
}

interface Props {
    payments: Paginated;
    filters: { search?: string; status?: string; per_page?: string };
    stats: Stats;
}

/* ─── Helpers ─────────────────────────────────── */
const columns: { label: string; key: keyof PaymentRow; sortable?: boolean }[] = [
    { label: 'Agent',          key: 'agent_id',        sortable: false },
    { label: 'Transaction ID', key: 'transaction_id',  sortable: false },
    { label: 'Amount',         key: 'amount',          sortable: true  },
    { label: 'Status',         key: 'payment_status',  sortable: true  },
    { label: 'Paid At',        key: 'paid_at',         sortable: true  },
    { label: 'Created',        key: 'created_at',      sortable: true  },
];

const statusConfig: Record<string, { label: string; classes: string }> = {
    succeeded: { label: 'Succeeded', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    paid:      { label: 'Paid',      classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    pending:   { label: 'Pending',   classes: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400  border-amber-200  dark:border-amber-800'  },
    unpaid:    { label: 'Unpaid',    classes: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400  border-amber-200  dark:border-amber-800'  },
    failed:    { label: 'Failed',    classes: 'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400    border-red-200    dark:border-red-800'    },
    expired:   { label: 'Expired',   classes: 'bg-zinc-100   text-zinc-700   dark:bg-zinc-900/30   dark:text-zinc-400   border-zinc-200   dark:border-zinc-800'   },
    refunded:  { label: 'Refunded',  classes: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800' },
};

function fmt(amount: number, currency = 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount);
}

function fmtDate(d: string | null) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/* ─── Stat Card ─────────────────────────────────── */
function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    gradient,
    iconBg,
    iconColor,
}: {
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ElementType;
    gradient: string;
    iconBg: string;
    iconColor: string;
}) {
    return (
        <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient} shadow-sm border border-white/20 dark:border-white/5`}>
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/70">{label}</p>
                    <p className="text-3xl font-bold text-white leading-none">{value}</p>
                    {sub && <p className="text-xs text-white/60 mt-1">{sub}</p>}
                </div>
                <div className={`${iconBg} rounded-xl p-2.5`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
            </div>
            {/* Decorative circle */}
            <div className="pointer-events-none absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/5" />
        </div>
    );
}

/* ─── Page ─────────────────────────────────── */
export default function AgentPayments({ payments, filters, stats }: Props) {
    const search = filters.search ?? '';
    const status = filters.status ?? 'all';

    function navigate(params: Record<string, string | number | undefined>) {
        const current = Object.fromEntries(new URLSearchParams(window.location.search).entries());
        router.get(window.location.pathname, { ...current, ...params }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Payments', href: '#' }, { title: 'Agent Payments', href: '/payments/agent-payments' }]}>
            <Head title="Agent Payments" />

            <div className="m-5 space-y-6">

                {/* Page header */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow">
                            <CreditCard className="h-4 w-4 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Agent Payments</h1>
                    </div>
                    <p className="ml-11 text-sm text-muted-foreground">Track all agent listing fee transactions</p>
                </div>

                {/* Stat cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                    <StatCard
                        label="Total Revenue"
                        value={fmt(stats.total_revenue)}
                        sub="From paid transactions"
                        icon={TrendingUp}
                        gradient="bg-gradient-to-br from-indigo-600 to-violet-600"
                        iconBg="bg-white/15"
                        iconColor="text-white"
                    />
                    <StatCard
                        label="Total Transactions"
                        value={stats.total_count.toLocaleString()}
                        icon={DollarSign}
                        gradient="bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-700 dark:to-slate-900"
                        iconBg="bg-white/15"
                        iconColor="text-white"
                    />
                    <StatCard
                        label="Paid"
                        value={stats.paid_count.toLocaleString()}
                        icon={CheckCircle2}
                        gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                        iconBg="bg-white/15"
                        iconColor="text-white"
                    />
                    <StatCard
                        label="Unpaid / Pending"
                        value={stats.pending_count.toLocaleString()}
                        icon={Clock}
                        gradient="bg-gradient-to-br from-amber-500 to-orange-500"
                        iconBg="bg-white/15"
                        iconColor="text-white"
                    />
                    <StatCard
                        label="Failed"
                        value={stats.failed_count.toLocaleString()}
                        icon={XCircle}
                        gradient="bg-gradient-to-br from-rose-500 to-red-600"
                        iconBg="bg-white/15"
                        iconColor="text-white"
                    />
                </div>

                {/* Table card */}
                <Card className="shadow-sm border-0 dark:bg-gray-900/60 backdrop-blur">
                    <CardHeader className="pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-muted-foreground">
                                Showing <span className="font-semibold text-foreground">{payments.total}</span> transactions
                            </p>
                            <Select
                                value={status}
                                onValueChange={(val) => navigate({ status: val, page: 1 })}
                            >
                                <SelectTrigger className="w-[160px] text-sm">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="succeeded">Succeeded</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="unpaid">Unpaid</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                    <SelectItem value="refunded">Refunded</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <Table<PaymentRow>
                            data={payments.data}
                            total={payments.total}
                            currentPage={payments.current_page}
                            rowsPerPage={payments.per_page}
                            columns={columns}
                            searchableKeys={['transaction_id', 'payment_intent_id']}
                            searchValue={search}
                            renderCell={(key, value, row) => {
                                /* ── Agent ── */
                                if (key === 'agent_id') {
                                    const agent = row.agent;
                                    if (!agent) return <span className="text-muted-foreground text-xs">—</span>;
                                    return (
                                        <div className="flex items-center gap-2.5">
                                            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-white dark:ring-gray-700 shadow-sm">
                                                {agent.agent_photo ? (
                                                    <img
                                                        src={agent.agent_photo.startsWith('http') ? agent.agent_photo : `/${agent.agent_photo}`}
                                                        alt={agent.agent_name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-400 to-violet-500">
                                                        <span className="text-xs font-bold text-white uppercase">
                                                            {agent.agent_name?.charAt(0) ?? '?'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                                    {agent.agent_name}
                                                </p>
                                                {agent.agency_name && (
                                                    <p className="truncate text-xs text-muted-foreground">{agent.agency_name}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }

                                /* ── Transaction ID ── */
                                if (key === 'transaction_id') {
                                    const val = row.transaction_id ?? row.payment_intent_id;
                                    if (!val) return <span className="text-muted-foreground text-xs">—</span>;
                                    return (
                                        <div className="flex items-center gap-1.5">
                                            <Hash className="h-3 w-3 text-muted-foreground shrink-0" />
                                            <span className="font-mono text-xs text-gray-700 dark:text-gray-300 truncate max-w-[180px]">
                                                {val}
                                            </span>
                                        </div>
                                    );
                                }

                                /* ── Amount ── */
                                if (key === 'amount') {
                                    return (
                                        <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
                                            {fmt(row.amount, row.currency)}
                                        </span>
                                    );
                                }

                                /* ── Status ── */
                                if (key === 'payment_status') {
                                    const cfg = statusConfig[row.payment_status] ?? { label: row.payment_status, classes: 'bg-gray-100 text-gray-700' };
                                    return (
                                        <Badge className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${cfg.classes}`}>
                                            {cfg.label}
                                        </Badge>
                                    );
                                }

                                /* ── Paid At ── */
                                if (key === 'paid_at') {
                                    return <span className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(row.paid_at)}</span>;
                                }

                                /* ── Created ── */
                                if (key === 'created_at') {
                                    return <span className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(row.created_at)}</span>;
                                }

                                return value ?? '—';
                            }}
                            onPageChange={(page) => navigate({ page })}
                            onPerPageChange={(perPage) => navigate({ per_page: perPage, page: 1 })}
                            onSearchChange={(s) => navigate({ search: s || undefined, page: 1 })}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
