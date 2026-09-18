import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import Table from '@/components/Table';
import { Trash, Edit, LogIn, Hash, BadgeCheck, ShieldCheck } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { ConfirmDialog } from '@/components/alert-dialog';
import { AlertDialog } from "@heroui/react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ActiveSubscription {
    id: number;
    subscription_status: string;
    subscription_expire_date: string | null;
}

interface UserRow {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    status: 'Active' | 'Inactive';
    last_login_date: string | null;
    login_count: number;
    last_ip: string | null;
    created_at: string;
    active_subscription: ActiveSubscription | null;
}

interface PaginatedUsers {
    data: UserRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Filters {
    search: string;
}

interface Props {
    users: PaginatedUsers;
    filters: Filters;
}

const columns = [
    { label: 'Avatar', key: 'avatar', sortable: false },
    { label: 'Name', key: 'name', sortable: true },
    { label: 'Email', key: 'email', sortable: true },
    { label: 'Phone', key: 'phone', sortable: true },
    { label: 'Subscription', key: 'active_subscription', sortable: false },
    { label: 'Login Count', key: 'login_count', sortable: true },
    { label: 'Last Login', key: 'last_login_date', sortable: true },
    { label: 'Status', key: 'status', sortable: true },
    { label: 'Actions', key: 'actions' },
];

export default function Index({ users, filters }: Props) {
    const queryParams = new URLSearchParams(window.location.search);
    const search = queryParams.get('search') || '';

    const deleteUser = (id: number) => {
        router.delete(route('user.destroy', id), {
            onSuccess: () => toast.success('User deleted successfully!'),
            onError: () => toast.error('Failed to delete user.'),
        });
    };

    const grantSubscription = (id: number, name: string) => {
        router.post(route('user.grantSubscription', id), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(`1-year subscription granted to ${name}!`),
            onError: () => toast.error('Failed to grant subscription.'),
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
        const { id, newStatus } = pendingStatus;
        
        router.patch(route('user.updateStatus', id), { status: newStatus }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Status updated to ${newStatus}!`);
                setPendingStatus(null);
            },
            onError: () => {
                toast.error('Failed to update status.');
                setPendingStatus(null);
            },
        });
    };

    const cancelStatusChange = () => {
        setPendingStatus(null);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'User Management', href: '/user' }]}>
            <Head title="User Management" />

            <div className="m-5">
                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">User Management</h1>
                            <Link className={(buttonVariants({ variant: 'default', className: 'ml-auto' }))} href={route('user.create')}>
                                Create User
                            </Link>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Table<UserRow>
                            data={users.data}
                            total={users.total}
                            currentPage={users.current_page}
                            rowsPerPage={users.per_page}
                            columns={columns}
                            searchableKeys={['name', 'email', 'phone']}
                            renderCell={(key, value, row) => {
                                if (key === 'avatar') {
                                    return (
                                        <div className="w-10 h-10 overflow-hidden rounded-full flex items-center justify-center bg-gray-100">
                                            {row.avatar ? (
                                                <img src={row.avatar.startsWith('http') ? row.avatar : `/${row.avatar}`} alt={row.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs text-gray-400">No Img</span>
                                            )}
                                        </div>
                                    );
                                }

                                if (key === 'active_subscription') {
                                    const sub = row.active_subscription;
                                    const isActive = !!sub;
                                    const expiry = sub?.subscription_expire_date
                                        ? new Date(sub.subscription_expire_date).toLocaleDateString(undefined, {
                                            year: 'numeric', month: 'short', day: 'numeric',
                                          })
                                        : null;
                                    return (
                                        <div className="flex flex-col gap-1">
                                            {isActive ? (
                                                <>
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 w-fit">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        Active
                                                    </span>
                                                    {expiry && (
                                                        <span className="text-[11px] text-gray-400 dark:text-gray-500 pl-0.5">
                                                            Expires: {expiry}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200/60 dark:border-gray-700/60 w-fit">
                                                    No subscription
                                                </span>
                                            )}
                                        </div>
                                    );
                                }

                                if (key === 'login_count') {
                                    const count = Number(row.login_count ?? 0);
                                    return (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                                            <Hash className="w-3 h-3" />
                                            {count}
                                        </span>
                                    );
                                }

                                if (key === 'last_login_date') {
                                    if (!row.last_login_date) {
                                        return <span className="text-xs text-gray-400 dark:text-gray-500 italic">Never</span>;
                                    }
                                    const date = new Date(row.last_login_date);
                                    const formattedDate = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                                    const formattedTime = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                                    return (
                                        <div className="flex flex-col text-xs leading-tight">
                                            <span className="inline-flex items-center gap-1 font-medium text-gray-800 dark:text-gray-200">
                                                <LogIn className="w-3 h-3 text-gray-400" />
                                                {formattedDate} {formattedTime}
                                            </span>
                                            {row.last_ip && (
                                                <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono mt-0.5 pl-4">
                                                    {row.last_ip}
                                                </span>
                                            )}
                                        </div>
                                    );
                                }

                                if (key === 'status') {
                                    const getStatusColor = (status: string) => {
                                        switch (status.toLowerCase()) {
                                            case 'active': return 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400';
                                            case 'inactive': return 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400';
                                            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300';
                                        }
                                    };
                                    
                                    const displayStatus = pendingStatus?.id === row.id ? pendingStatus.newStatus : row.status;
                                    
                                    return (
                                        <Select
                                            value={displayStatus}
                                            onValueChange={(value) => {
                                                if (value !== row.status) {
                                                    setPendingStatus({ id: row.id, newStatus: value, oldStatus: row.status });
                                                }
                                            }}
                                        >
                                            <SelectTrigger className={`h-8 w-[110px] px-3 py-1 rounded-full text-sm font-medium outline-none border-none cursor-pointer text-center ${getStatusColor(displayStatus)} transition-colors ring-0 focus:ring-0 focus:ring-offset-0 shadow-none`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-1 shadow-lg">
                                                <SelectItem value="Active" className="cursor-pointer rounded-lg px-4 py-2 font-medium focus:bg-green-100 focus:text-green-800 dark:focus:bg-green-900/30 dark:focus:text-green-400">
                                                    Active
                                                </SelectItem>
                                                <SelectItem value="Inactive" className="cursor-pointer rounded-lg px-4 py-2 font-medium focus:bg-red-100 focus:text-red-800 dark:focus:bg-red-900/30 dark:focus:text-red-400">
                                                    Inactive
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    );
                                }

                                if (key === 'actions') {
                                    const isSubscribed = !!row.active_subscription;
                                    const expiryFormatted = row.active_subscription?.subscription_expire_date
                                        ? new Date(row.active_subscription.subscription_expire_date).toLocaleDateString(undefined, {
                                            year: 'numeric', month: 'long', day: 'numeric',
                                          })
                                        : null;
                                    return (
                                        <div className="flex gap-2 flex-wrap">
                                            <Link
                                                href={route('user.edit', row.id)}
                                                className={buttonVariants({ variant: 'secondary', size: 'icon' })}
                                            >
                                                <Edit className="w-4 h-4 text-blue-500" />
                                            </Link>

                                            {!isSubscribed && (
                                                <ConfirmDialog
                                                    title="Grant Subscription?"
                                                    description={`This will grant ${row.name} a free 1-year subscription. Are you sure?`}
                                                    onConfirm={() => grantSubscription(row.id, row.name)}
                                                    confirmText="Grant"
                                                    confirmColor="primary"
                                                    icon={<BadgeCheck className="size-5" />}
                                                    trigger={
                                                        <AlertDialog.Trigger
                                                            className={buttonVariants({ variant: 'secondary', size: 'icon' })}
                                                            title="Grant 1-year subscription"
                                                        >
                                                            <BadgeCheck className="w-4 h-4 text-amber-500" />
                                                        </AlertDialog.Trigger>
                                                    }
                                                />
                                            )}

                                            {isSubscribed && (
                                                <button
                                                    className={buttonVariants({ variant: 'secondary', size: 'icon' })}
                                                    title={`Subscribed until ${expiryFormatted}`}
                                                    disabled
                                                >
                                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                                </button>
                                            )}

                                            <ConfirmDialog
                                                title="Delete this User?"
                                                description="Are you sure you want to delete this User? This action cannot be undone."
                                                onConfirm={() => deleteUser(row.id)}
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
                                router.get(window.location.pathname, {
                                    ...params,
                                    page,
                                }, { preserveState: true, replace: true });
                            }}
                            onPerPageChange={(perPage) => {
                                const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
                                router.get(window.location.pathname, {
                                    ...params,
                                    page: 1,
                                    per_page: perPage,
                                }, { preserveState: true, replace: true });
                            }}
                            onSearchChange={(searchVal) => {
                                const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
                                if (searchVal) {
                                    params.search = searchVal;
                                } else {
                                    delete params.search;
                                }
                                router.get(window.location.pathname, {
                                    ...params,
                                    page: 1,
                                }, { preserveState: true, replace: true });
                            }}
                            searchValue={search}
                        />
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                title="Change Status?"
                description={`Are you sure you want to change the status from ${pendingStatus?.oldStatus} to ${pendingStatus?.newStatus}?`}
                onConfirm={confirmStatusChange}
                confirmText="Change Status"
                confirmColor="primary"
                icon={<Edit className="size-5" />}
                trigger={
                    <AlertDialog.Trigger>
                        <button ref={statusDialogTriggerRef} className="hidden" />
                    </AlertDialog.Trigger>
                }
                onOpenChange={(isOpen) => {
                    if (!isOpen) cancelStatusChange();
                }}
            />
        </AppLayout>
    );
}
