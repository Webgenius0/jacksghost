import AppLayout from '@/layouts/app-layout';
import { PaginatedLeagueContents, LeagueContent } from '@/types';
import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import Table from '@/components/Table';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Plus } from 'lucide-react';
import { AlertDialog } from "@heroui/react";
import { ConfirmDialog } from '@/components/alert-dialog';
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Props {
    leagueContents: PaginatedLeagueContents;
}

const columns = [
    { label: 'Image', key: 'image', sortable: false },
    { label: 'League Name', key: 'league', sortable: false },
    { label: 'Agent Content', key: 'agent_content', sortable: false },
    { label: 'Actions', key: 'actions' },
];

export default function Index({ leagueContents }: Props) {
    const queryParams = new URLSearchParams(window.location.search);
    const search = queryParams.get('search') || '';

    const deleteLeagueContent = (id: number) => {
        router.delete(route('league-content.destroy', id), {
            onSuccess: () => toast.success('League Content deleted successfully!'),
            onError: () => toast.error('Failed to delete the league content.'),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'League Contents', href: '/league-content' }]}>
            <Head title="League Contents List" />

            <div className="m-5">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                                League Contents List
                            </h1>
                            <Button onClick={() => router.get(route('league-content.create'))} className="ml-auto">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Content
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table<LeagueContent>
                            data={leagueContents.data}
                            total={leagueContents.total}
                            currentPage={leagueContents.current_page}
                            rowsPerPage={leagueContents.per_page}
                            columns={columns}
                            searchableKeys={['league.league_name', 'agent_content']}
                            renderCell={(key, value, row) => {
                                if (key === 'image') {
                                    return row.image ? (
                                        <img src={row.image} alt="Image" className="w-16 h-10 object-cover rounded" />
                                    ) : (
                                        <div className="w-16 h-10 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center text-gray-500">
                                            -
                                        </div>
                                    );
                                }

                                if (key === 'league') {
                                    return <span className="font-medium">{row.league?.league_name}</span>;
                                }

                                if (key === 'agent_content') {
                                    const rawContent = row.agent_content || '';
                                    const doc = new DOMParser().parseFromString(rawContent, 'text/html');
                                    let textContent = doc.body.textContent || "";
                                    if (textContent.length > 80) {
                                        textContent = textContent.substring(0, 80) + '...';
                                    }
                                    return <span title={doc.body.textContent || ""}>{textContent}</span>;
                                }

                                if (key === 'actions') {
                                    return (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                onClick={() => router.get(route('league-content.edit', row.id))}
                                            >
                                                <Edit className="w-4 h-4 text-blue-500" />
                                            </Button>
                                            <ConfirmDialog
                                                title="Delete this Content?"
                                                description="Are you sure you want to delete this content? This action cannot be undone."
                                                onConfirm={() => deleteLeagueContent(row.id)}
                                                trigger={
                                                    <AlertDialog.Trigger asChild>
                                                        <Button variant="secondary" size="icon">
                                                            <Trash className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    </AlertDialog.Trigger>
                                                }
                                            />
                                        </div>
                                    );
                                }

                                return value;
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
