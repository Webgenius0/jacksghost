import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import Table from '@/components/Table';
import { Trash, Eye } from 'lucide-react';
import React from 'react';
import { ConfirmDialog } from '@/components/alert-dialog';
import { AlertDialog } from "@heroui/react";

interface ContactRow {
    id: number;
    name: string;
    email: string;
    topic: string;
    message: string;
    created_at: string;
}

interface PaginatedContacts {
    data: ContactRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Filters {
    search: string;
}

interface Props {
    contacts: PaginatedContacts;
    filters: Filters;
}

const columns = [
    { label: 'Name', key: 'name', sortable: true },
    { label: 'Email', key: 'email', sortable: true },
    { label: 'Topic', key: 'topic', sortable: true },
    { label: 'Date', key: 'created_at', sortable: true },
    { label: 'Actions', key: 'actions' },
];

export default function Index({ contacts, filters }: Props) {
    const queryParams = new URLSearchParams(window.location.search);
    const search = queryParams.get('search') || '';

    const deleteContact = (id: number) => {
        router.delete(route('contact.destroy', id), {
            onSuccess: () => toast.success('Contact deleted successfully!'),
            onError: () => toast.error('Failed to delete contact.'),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Contacts Management', href: '/contact' }]}>
            <Head title="Contacts Management" />

            <div className="m-5">
                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Contacts Management</h1>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Table<ContactRow>
                            data={contacts.data}
                            total={contacts.total}
                            currentPage={contacts.current_page}
                            rowsPerPage={contacts.per_page}
                            columns={columns}
                            searchableKeys={['name', 'email', 'topic']}
                            renderCell={(key, value, row) => {
                                if (key === 'created_at') {
                                    return new Date(row.created_at).toLocaleDateString();
                                }

                                if (key === 'actions') {
                                    return (
                                        <div className="flex gap-2">
                                            <Link
                                                href={route('contact.show', row.id)}
                                                className={buttonVariants({ variant: 'secondary', size: 'icon' })}
                                            >
                                                <Eye className="w-4 h-4 text-blue-500" />
                                            </Link>
                                            <ConfirmDialog
                                                title="Delete this Contact?"
                                                description="Are you sure you want to delete this Contact message? This action cannot be undone."
                                                onConfirm={() => deleteContact(row.id)}
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
        </AppLayout>
    );
}
