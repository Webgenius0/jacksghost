import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import Table from '@/components/Table';
import { Trash, Edit } from 'lucide-react';
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

interface UserRow {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    status: 'Active' | 'Inactive';
    created_at: string;
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
                                    return (
                                        <div className="flex gap-2">
                                            <Link
                                                href={route('user.edit', row.id)}
                                                className={buttonVariants({ variant: 'secondary', size: 'icon' })}
                                            >
                                                <Edit className="w-4 h-4 text-blue-500" />
                                            </Link>
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
