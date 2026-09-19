import AppLayout from '@/layouts/app-layout';
import { Head, router, Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import Table from '@/components/Table';
import {
    Trash,
    Edit,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Plus,
    Upload,
    Download,
    FileSpreadsheet,
    ChevronDown,
    AlertTriangle,
    Globe,
    Lock,
    X,
} from 'lucide-react';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import ImportAgentModal from './import-modal';

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
    is_public: boolean;
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
    is_public?: string;
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
    { label: 'Visibility', key: 'is_public', sortable: true },
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
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [dismissErrors, setDismissErrors] = useState(false);

    const { flash } = usePage<{ flash?: { success?: string; error?: string; import_errors?: string[] } }>().props;

    const handleExportFiltered = () => {
        const params = new URLSearchParams();
        if (filters.status && filters.status !== 'all') {
            params.append('status', filters.status);
        }
        if (filters.is_public !== undefined && filters.is_public !== 'all') {
            params.append('is_public', filters.is_public);
        }
        if (search) {
            params.append('search', search);
        }

        const qs = params.toString();
        window.location.href = route('agents.export') + (qs ? `?${qs}` : '');
    };

    const handleExportAll = () => {
        window.location.href = route('agents.export');
    };

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
                            <div className="flex items-center gap-2.5 ml-auto flex-wrap">
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
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Filter status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.is_public !== undefined ? String(filters.is_public) : 'all'}
                                    onValueChange={(val) => {
                                        const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
                                        if (val === 'all') {
                                            delete params.is_public;
                                        } else {
                                            params.is_public = val;
                                        }
                                        router.get(window.location.pathname, { ...params, page: 1 }, { preserveState: true, replace: true });
                                    }}
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Visibility" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Visibility</SelectItem>
                                        <SelectItem value="1">Public Only</SelectItem>
                                        <SelectItem value="0">Private Only</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Export Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="gap-2">
                                            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            <span>Export</span>
                                            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuItem
                                            onClick={handleExportFiltered}
                                            className="cursor-pointer gap-2"
                                        >
                                            <Download className="w-4 h-4 text-emerald-600" />
                                            <span>Export Current ({agents.total})</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={handleExportAll}
                                            className="cursor-pointer gap-2"
                                        >
                                            <Download className="w-4 h-4 text-blue-600" />
                                            <span>Export All Agents</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => (window.location.href = route('agents.template'))}
                                            className="cursor-pointer gap-2"
                                        >
                                            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                                            <span>Download Template (.xlsx)</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Import Button */}
                                <Button
                                    variant="outline"
                                    onClick={() => setIsImportModalOpen(true)}
                                    className="gap-2"
                                >
                                    <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    <span>Import Excel</span>
                                </Button>

                                <Link
                                    href={route('agents.create')}
                                    className={buttonVariants({ variant: 'default', className: 'gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm' })}
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Create Agent</span>
                                </Link>
                            </div>
                        </div>

                        {/* Import Warnings Alert */}
                        {flash?.import_errors && flash.import_errors.length > 0 && !dismissErrors && (
                            <div className="mt-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-2.5">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="text-sm font-semibold">
                                                Import Notices ({flash.import_errors.length} issue{flash.import_errors.length > 1 ? 's' : ''})
                                            </h3>
                                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                                                Some rows had issues or were skipped during import:
                                            </p>
                                            <ul className="mt-2 space-y-1 text-xs list-disc list-inside max-h-40 overflow-y-auto">
                                                {flash.import_errors.map((err, idx) => (
                                                    <li key={idx} className="font-mono text-[11px]">{err}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setDismissErrors(true)}
                                        className="text-amber-600 hover:text-amber-900 dark:hover:text-amber-100 p-1"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
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

                                /* ── Public Visibility ─────────────────────── */
                                if (key === 'is_public') {
                                    return (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                router.patch(route('agents.togglePublic', row.id), {}, {
                                                    preserveScroll: true,
                                                    onSuccess: () => toast.success('Agent visibility updated!'),
                                                    onError: () => toast.error('Failed to update visibility.'),
                                                });
                                            }}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer hover:opacity-80 active:scale-95 ${
                                                row.is_public
                                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                            }`}
                                            title="Click to toggle public visibility"
                                        >
                                            {row.is_public ? (
                                                <>
                                                    <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                    <span>Public</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                                    <span>Private</span>
                                                </>
                                            )}
                                        </button>
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

            {/* Import Agent Modal */}
            <ImportAgentModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
            />
        </AppLayout>
    );
}
