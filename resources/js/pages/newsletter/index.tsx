import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import Table from '@/components/Table';
import { Trash } from 'lucide-react';
import React from 'react';
import { ConfirmDialog } from '@/components/alert-dialog';
import { AlertDialog } from "@heroui/react";

interface NewsletterRow {
    id: number;
    email: string;
    created_at: string;
}

interface PaginatedNewsletters {
    data: NewsletterRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Filters {
    search: string;
}

interface Props {
    newsletters: PaginatedNewsletters;
    filters: Filters;
}

const columns = [
    { label: 'Email Address', key: 'email', sortable: true },
    { label: 'Subscribed Date', key: 'created_at', sortable: true },
    { label: 'Actions', key: 'actions' },
];

export default function Index({ newsletters, filters }: Props) {
    const queryParams = new URLSearchParams(window.location.search);
    const search = queryParams.get('search') || '';

    const deleteSubscriber = (id: number) => {
        router.delete(route('newsletter.destroy', id), {
            onSuccess: () => toast.success('Subscriber deleted successfully!'),
            onError: () => toast.error('Failed to delete subscriber.'),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Newsletters', href: '/newsletter' }]}>
            <Head title="Newsletters Management" />

            <div className="m-5">
                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Newsletters Subscribers</h1>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Table<NewsletterRow>
                            data={newsletters.data}
                            total={newsletters.total}
                            currentPage={newsletters.current_page}
                            rowsPerPage={newsletters.per_page}
                            columns={columns}
                            searchableKeys={['email']}
                            renderCell={(key, value, row) => {
                                if (key === 'created_at') {
                                    return new Date(row.created_at).toLocaleDateString();
                                }

                                if (key === 'actions') {
                                    return (
                                        <div className="flex gap-2">
                                            <ConfirmDialog
                                                title="Delete Subscriber?"
                                                description="Are you sure you want to delete this subscriber? This action cannot be undone."
                                                onConfirm={() => deleteSubscriber(row.id)}
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
