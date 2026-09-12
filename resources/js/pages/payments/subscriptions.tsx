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
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Users,
    TrendingUp,
    CalendarClock,
    Hash,
    Layers,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────── */
interface User {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
}

interface SubscriptionRow {
    id: number;
    user_id: number;
    amount: number;
    stripe_email: string | null;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    subscribe_date: string | null;
    subscription_status: string;
    subscription_expire_date: string | null;
    uuid: string;
    created_at: string;
    user: User | null;
    // table key
    actions?: string;
}

interface Paginated {
    data: SubscriptionRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Stats {
    total_revenue: number;
    total_count: number;
    active_count: number;
    expired_count: number;
    canceled_count: number;
    past_due_count: number;
}

interface Props {
    subscriptions: Paginated;
    filters: { search?: string; status?: string; per_page?: string };
    stats: Stats;
}

/* ─── Helpers ─────────────────────────────────── */
const columns: { label: string; key: keyof SubscriptionRow; sortable?: boolean }[] = [
    { label: 'Subscriber',    key: 'user_id',                 sortable: false },
    { label: 'Subscription ID', key: 'stripe_subscription_id', sortable: false },
    { label: 'Amount',        key: 'amount',                  sortable: true  },
    { label: 'Status',        key: 'subscription_status',     sortable: true  },
    { label: 'Started',       key: 'subscribe_date',          sortable: true  },
    { label: 'Expires',       key: 'subscription_expire_date', sortable: true },
];

const statusConfig: Record<string, { label: string; classes: string; dot: string }> = {
    active:   { label: 'Active',    classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
    canceled: { label: 'Canceled',  classes: 'bg-gray-100    text-gray-600    dark:bg-gray-800/50   dark:text-gray-400   border-gray-200    dark:border-gray-700',    dot: 'bg-gray-400'   },
    expired:  { label: 'Expired',   classes: 'bg-orange-100  text-orange-700  dark:bg-orange-900/30 dark:text-orange-400 border-orange-200  dark:border-orange-800',  dot: 'bg-orange-500' },
    past_due: { label: 'Past Due',  classes: 'bg-red-100     text-red-700     dark:bg-red-900/30    dark:text-red-400    border-red-200     dark:border-red-800',     dot: 'bg-red-500'    },
    trialing: { label: 'Trialing',  classes: 'bg-sky-100     text-sky-700     dark:bg-sky-900/30    dark:text-sky-400    border-sky-200     dark:border-sky-800',     dot: 'bg-sky-500'    },
};

function fmt(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function fmtDate(d: string | null) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function isExpiringSoon(d: string | null): boolean {
    if (!d) return false;
    const diff = new Date(d).getTime() - Date.now();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
}

/* ─── Stat Card ─────────────────────────────────── */
function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    gradient,
    iconBg,
}: {
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ElementType;
    gradient: string;
    iconBg: string;
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
                    <Icon className="h-5 w-5 text-white" />
                </div>
            </div>
            <div className="pointer-events-none absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/5" />
        </div>
    );
}

/* ─── Page ─────────────────────────────────── */
export default function Subscriptions({ subscriptions, filters, stats }: Props) {
    const search  = filters.search  ?? '';
    const status  = filters.status  ?? 'all';

    function navigate(params: Record<string, string | number | undefined>) {
        const current = Object.fromEntries(new URLSearchParams(window.location.search).entries());
        router.get(window.location.pathname, { ...current, ...params }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Payments', href: '#' }, { title: 'Subscriptions', href: '/payments/subscriptions' }]}>
            <Head title="Subscriptions" />

            <div className="m-5 space-y-6">

                {/* Page header */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow">
                            <Layers className="h-4 w-4 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Subscriptions</h1>
                    </div>
                    <p className="ml-11 text-sm text-muted-foreground">Manage and monitor all user subscription plans</p>
                </div>

                {/* Stat cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <div className="xl:col-span-2">
                        <StatCard
                            label="Active MRR"
                            value={fmt(stats.total_revenue)}
                            sub="Revenue from active subs"
                            icon={TrendingUp}
                            gradient="bg-gradient-to-br from-teal-500 to-cyan-600"
                            iconBg="bg-white/15"
                        />
                    </div>
                    <StatCard
                        label="Total Subscriptions"
                        value={stats.total_count.toLocaleString()}
                        icon={Users}
                        gradient="bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-700 dark:to-slate-900"
                        iconBg="bg-white/15"
                    />
                    <StatCard
                        label="Active"
                        value={stats.active_count.toLocaleString()}
                        icon={CheckCircle2}
                        gradient="bg-gradient-to-br from-emerald-500 to-green-600"
                        iconBg="bg-white/15"
                    />
                    <StatCard
                        label="Expired"
                        value={stats.expired_count.toLocaleString()}
                        icon={CalendarClock}
                        gradient="bg-gradient-to-br from-orange-500 to-amber-500"
                        iconBg="bg-white/15"
                    />
                    <StatCard
                        label="Canceled"
                        value={stats.canceled_count.toLocaleString()}
                        icon={XCircle}
                        gradient="bg-gradient-to-br from-rose-500 to-red-600"
                        iconBg="bg-white/15"
                    />
                </div>

                {/* Table card */}
                <Card className="shadow-sm border-0 dark:bg-gray-900/60 backdrop-blur">
                    <CardHeader className="pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-muted-foreground">
                                Showing <span className="font-semibold text-foreground">{subscriptions.total}</span> subscriptions
                            </p>
                            <Select
                                value={status}
                                onValueChange={(val) => navigate({ status: val, page: 1 })}
                            >
                                <SelectTrigger className="w-[180px] text-sm">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="canceled">Canceled</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                    <SelectItem value="past_due">Past Due</SelectItem>
                                    <SelectItem value="trialing">Trialing</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <Table<SubscriptionRow>
                            data={subscriptions.data}
                            total={subscriptions.total}
                            currentPage={subscriptions.current_page}
                            rowsPerPage={subscriptions.per_page}
                            columns={columns}
                            searchableKeys={['stripe_email', 'stripe_subscription_id', 'uuid']}
                            searchValue={search}
                            renderCell={(key, value, row) => {

                                /* ── Subscriber ── */
                                if (key === 'user_id') {
                                    const user = row.user;
                                    const email = row.stripe_email;
                                    return (
                                        <div className="flex items-center gap-2.5">
                                            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-white dark:ring-gray-700 shadow-sm">
                                                {user?.avatar ? (
                                                    <img
                                                        src={user.avatar.startsWith('http') ? user.avatar : `/${user.avatar}`}
                                                        alt={user.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-400 to-cyan-500">
                                                        <span className="text-xs font-bold text-white uppercase">
                                                            {(user?.name ?? email ?? '?').charAt(0)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                                    {user?.name ?? '—'}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {user?.email ?? email ?? '—'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }

                                /* ── Subscription ID ── */
                                if (key === 'stripe_subscription_id') {
                                    const val = row.stripe_subscription_id;
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
                                            {fmt(row.amount)}
                                        </span>
                                    );
                                }

                                /* ── Status ── */
                                if (key === 'subscription_status') {
                                    const cfg = statusConfig[row.subscription_status] ?? {
                                        label: row.subscription_status,
                                        classes: 'bg-gray-100 text-gray-700 border-gray-200',
                                        dot: 'bg-gray-400',
                                    };
                                    return (
                                        <Badge className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${cfg.classes}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} shrink-0`} />
                                            {cfg.label}
                                        </Badge>
                                    );
                                }

                                /* ── Subscribe Date ── */
                                if (key === 'subscribe_date') {
                                    return <span className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(row.subscribe_date)}</span>;
                                }

                                /* ── Expire Date ── */
                                if (key === 'subscription_expire_date') {
                                    const expiring = isExpiringSoon(row.subscription_expire_date);
                                    return (
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {fmtDate(row.subscription_expire_date)}
                                            </span>
                                            {expiring && (
                                                <span title="Expiring within 7 days">
                                                    <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                                </span>
                                            )}
                                        </div>
                                    );
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
