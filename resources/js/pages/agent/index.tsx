import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import Table from '@/components/Table';
import { Trash, Edit, Eye, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { ConfirmDialog } from '@/components/alert-dialog';
import { AlertDialog } from '@heroui/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface AgentPayment {
    amount: number;
    currency: string;
    payment_status: string;
    paid_at: string | null;
}

interface AgentRow {
    id: number;
    agent_name: string;
    agency_name: string | null;
    email: string | null;
    phone_number: string | null;
    agent_photo: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    payment: AgentPayment | null;
    actions?: string;
}

interface PaginatedAgents {
    data: AgentRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Filters {
    search: string;
    status: string;
}

interface Props {
    agents: PaginatedAgents;
    filters: Filters;
}

const columns: { label: string; key: keyof AgentRow; sortable?: boolean }[] = [
    { label: 'Photo', key: 'agent_photo', sortable: false },
    { label: 'Name', key: 'agent_name', sortable: true },
    { label: 'Agency', key: 'agency_name', sortable: true },
    { label: 'Email', key: 'email', sortable: true },
    { label: 'Status', key: 'status', sortable: true },
    { label: 'Payment', key: 'payment', sortable: false },
    { label: 'Actions', key: 'actions' },
];

const statusConfig: Record<string, { label: string; icon: React.ElementType; classes: string }> = {
    pending:  { label: 'Pending',  icon: Clock,        classes: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
    approved: { label: 'Approved', icon: CheckCircle,  classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
    rejected: { label: 'Rejected', icon: XCircle,      classes: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

export default function Index({ agents, filters }: Props) {
    const queryParams = new URLSearchParams(window.location.search);
    const search = queryParams.get('search') || '';

    const deleteAgent = (id: number) => {
        router.delete(route('agents.destroy', id), {
            onSuccess: () => toast.success('Agent deleted successfully!'),
            onError: () => toast.error('Failed to delete agent.'),
        });
    };

    const [pendingStatus, setPendingStatus] = useState<{ id: number; newStatus: string; oldStatus: string } | null>(null);
    const statusDialogTriggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (pendingStatus) {
            statusDialogTriggerRef.current?.click();
        }
    }, [pendingStatus]);

    const confirmStatusChange = () => {
        if (!pendingStatus) return;
        router.patch(route('agents.updateStatus', pendingStatus.id), { status: pendingStatus.newStatus }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Status updated to ${pendingStatus.newStatus}!`);
                setPendingStatus(null);
            },
            onError: () => {
                toast.error('Failed to update status.');
                setPendingStatus(null);
            },
        });
    };

    const cancelStatusChange = () => setPendingStatus(null);

    return (
        <AppLayout breadcrumbs={[{ title: 'Agent Management', href: '/agents' }]}>
            <Head title="Agent Management" />

            <div className="m-5">
                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Agent Management</h1>

                            {/* Actions & Filters */}
                            <div className="flex items-center gap-3 ml-auto">
                                <Select
                                    value={filters.status || 'all'}
                                    onValueChange={(val) => {
                                        const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
                                        if (val === 'all') {
                                            delete params.status;
                                        } else {
                                            params.status = val;
                                        }
                                        router.get(window.location.pathname, { ...params, page: 1 }, { preserveState: true, replace: true });
                                    }}
                                >
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Filter status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Link
                                    href={route('agents.create')}
                                    className={buttonVariants({ variant: 'default', className: 'gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm' })}
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Create Agent</span>
                                </Link>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Table<AgentRow>
                            data={agents.data}
                            total={agents.total}
                            currentPage={agents.current_page}
                            rowsPerPage={agents.per_page}
                            columns={columns}
                            searchableKeys={['agent_name', 'agency_name', 'email']}
                            renderCell={(key, value, row) => {
                                /* ── Photo ─────────────────────────────────── */
                                if (key === 'agent_photo') {
                                    return (
                                        <div className="w-10 h-10 overflow-hidden rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 ring-2 ring-white dark:ring-gray-700">
                                            {row.agent_photo ? (
                                                <img
                                                    src={row.agent_photo.startsWith('http') ? row.agent_photo : `/${row.agent_photo}`}
                                                    alt={row.agent_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-xs font-bold text-gray-400 uppercase">
                                                    {row.agent_name?.charAt(0) || '?'}
                                                </span>
                                            )}
                                        </div>
                                    );
                                }

                                /* ── Status ─────────────────────────────────── */
                                if (key === 'status') {
                                    const cfg = statusConfig[row.status] ?? statusConfig['pending'];
                                    const displayStatus = pendingStatus?.id === row.id ? pendingStatus.newStatus : row.status;
                                    const displayCfg = statusConfig[displayStatus] ?? cfg;

                                    return (
                                        <Select
                                            value={displayStatus}
                                            onValueChange={(val) => {
                                                if (val !== row.status) {
                                                    setPendingStatus({ id: row.id, newStatus: val, oldStatus: row.status });
                                                }
                                            }}
                                        >
                                            <SelectTrigger className={`h-8 w-[120px] px-3 py-1 rounded-full text-xs font-semibold border-none outline-none ring-0 focus:ring-0 focus:ring-offset-0 shadow-none cursor-pointer ${displayCfg.classes}`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-1 shadow-lg">
                                                <SelectItem value="pending" className="cursor-pointer rounded-lg text-amber-700 font-medium focus:bg-amber-50 dark:focus:bg-amber-900/20">
                                                    Pending
                                                </SelectItem>
                                                <SelectItem value="approved" className="cursor-pointer rounded-lg text-emerald-700 font-medium focus:bg-emerald-50 dark:focus:bg-emerald-900/20">
                                                    Approved
                                                </SelectItem>
                                                <SelectItem value="rejected" className="cursor-pointer rounded-lg text-red-700 font-medium focus:bg-red-50 dark:focus:bg-red-900/20">
                                                    Rejected
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    );
                                }

                                /* ── Payment ─────────────────────────────────── */
                                if (key === 'payment') {
                                    if (!row.payment) {
                                        return <span className="text-gray-400 text-xs">No payment</span>;
                                    }
                                    return (
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-semibold text-gray-800 dark:text-white">
                                                ${row.payment.amount?.toLocaleString()}
                                            </span>
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-full border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 w-fit">
                                                {row.payment.payment_status}
                                            </Badge>
                                        </div>
                                    );
                                }

                                /* ── Actions ─────────────────────────────────── */
                                if (key === 'actions') {
                                    return (
                                        <div className="flex gap-2">
                                            <Link
                                                href={route('agents.show', row.id)}
                                                className={buttonVariants({ variant: 'secondary', size: 'icon' })}
                                                title="View Agent"
                                            >
                                                <Eye className="w-4 h-4 text-indigo-500" />
                                            </Link>
                                            <Link
                                                href={route('agents.edit', row.id)}
                                                className={buttonVariants({ variant: 'secondary', size: 'icon' })}
                                                title="Edit Agent"
                                            >
                                                <Edit className="w-4 h-4 text-blue-500" />
                                            </Link>
                                            <ConfirmDialog
                                                title="Delete this Agent?"
                                                description="Are you sure you want to permanently delete this agent? This action cannot be undone."
                                                onConfirm={() => deleteAgent(row.id)}
                                                trigger={
                                                    <AlertDialog.Trigger className={buttonVariants({ variant: 'secondary', size: 'icon' })}>
                                                        <Trash className="w-4 h-4 text-red-500" />
                                                    </AlertDialog.Trigger>
                                                }
                                            />
                                        </div>
                                    );
                                }

                                return value || '—';
                            }}
                            onPageChange={(page) => {
                                const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
                                router.get(window.location.pathname, { ...params, page }, { preserveState: true, replace: true });
                            }}
                            onPerPageChange={(perPage) => {
                                const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
                                router.get(window.location.pathname, { ...params, page: 1, per_page: perPage }, { preserveState: true, replace: true });
                            }}
                            onSearchChange={(searchVal) => {
                                const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
                                if (searchVal) { params.search = searchVal; } else { delete params.search; }
                                router.get(window.location.pathname, { ...params, page: 1 }, { preserveState: true, replace: true });
                            }}
                            searchValue={search}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Hidden status confirm dialog */}
            <ConfirmDialog
                title="Change Agent Status?"
                description={`Change status from "${pendingStatus?.oldStatus}" to "${pendingStatus?.newStatus}"?`}
                onConfirm={confirmStatusChange}
                confirmText="Change Status"
                confirmColor="primary"
                icon={<Edit className="size-5" />}
                trigger={
                    <AlertDialog.Trigger>
                        <button ref={statusDialogTriggerRef} className="hidden" />
                    </AlertDialog.Trigger>
                }
                onOpenChange={(isOpen) => { if (!isOpen) cancelStatusChange(); }}
            />
        </AppLayout>
    );
}
