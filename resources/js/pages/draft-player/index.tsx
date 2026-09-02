import AppLayout from '@/layouts/app-layout';
import { PaginatedDraftPlayers, DraftPlayer, League, Year } from '@/types';
import { Head, router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import Table from '@/components/Table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Edit, Trash, Plus, UserCheck } from 'lucide-react';
import { AlertDialog } from '@heroui/react';
import { ConfirmDialog } from '@/components/alert-dialog';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/ui/card';
import { useState } from 'react';

type DraftPlayerRow = DraftPlayer & { actions?: unknown };

interface Props {
    draftPlayers: PaginatedDraftPlayers;
    leagues: League[];
    years: Year[];
}

const STATUS_COLORS: Record<string, string> = {
    signed: 'bg-green-100 text-green-800',
    unsigned_draft: 'bg-yellow-100 text-yellow-800',
    undrafted: 'bg-gray-100 text-gray-700',
};

const STATUS_LABELS: Record<string, string> = {
    signed: 'Signed',
    unsigned_draft: 'Unsigned Draft',
    undrafted: 'Undrafted',
};

const columns = [
    { label: 'Player Name', key: 'player_name' as keyof DraftPlayerRow, sortable: true },
    { label: 'League',      key: 'league_id'   as keyof DraftPlayerRow, sortable: false },
    { label: 'Year',        key: 'year'        as keyof DraftPlayerRow, sortable: true },
    { label: 'Round / Pick',key: 'round'       as keyof DraftPlayerRow, sortable: true },
    { label: 'Position',    key: 'position'    as keyof DraftPlayerRow, sortable: true },
    { label: 'School',      key: 'school'      as keyof DraftPlayerRow, sortable: true },
    { label: 'Status',      key: 'status'      as keyof DraftPlayerRow, sortable: true },
    { label: 'Actions',     key: 'actions'     as keyof DraftPlayerRow },
];

export default function Index({ draftPlayers, leagues, years }: Props) {
    const queryParams = new URLSearchParams(window.location.search);
    const search = queryParams.get('search') || '';

    const [leagueFilter, setLeagueFilter] = useState(queryParams.get('league_id') || '');
    const [yearFilter, setYearFilter]     = useState(queryParams.get('year') || '');

    const applyFilter = (newLeague: string, newYear: string) => {
        const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
        if (newLeague) params.league_id = newLeague; else delete params.league_id;
        if (newYear)   params.year      = newYear;   else delete params.year;
        params.page = '1';
        router.get(window.location.pathname, params, { preserveState: true, replace: true });
    };

    const deletePlayer = (id: number) => {
        router.delete(route('draft-player.destroy', id), {
            onSuccess: () => toast.success('Draft player deleted successfully!'),
            onError:   () => toast.error('Failed to delete draft player.'),
        });
    };

    const navigate = (params: Record<string, string | number>) => {
        const current = Object.fromEntries(new URLSearchParams(window.location.search).entries());
        router.get(window.location.pathname, { ...current, ...params }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Drafted Players', href: '/draft-player' }]}>
            <Head title="Drafted Players" />

            <div className="m-5">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <UserCheck className="w-6 h-6 text-primary" />
                                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                                    Drafted Players
                                </h1>
                            </div>
                            <Link
                                href={route('draft-player.create')}
                                className={buttonVariants({ variant: 'default' })}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Player
                            </Link>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-3 mt-4">
                            <select
                                id="filter_league"
                                className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={leagueFilter}
                                onChange={(e) => {
                                    setLeagueFilter(e.target.value);
                                    applyFilter(e.target.value, yearFilter);
                                }}
                            >
                                <option value="">All Leagues</option>
                                {leagues.map((l) => (
                                    <option key={l.id} value={l.id}>{l.league_name}</option>
                                ))}
                            </select>

                            <select
                                id="filter_year"
                                className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={yearFilter}
                                onChange={(e) => {
                                    setYearFilter(e.target.value);
                                    applyFilter(leagueFilter, e.target.value);
                                }}
                            >
                                <option value="">All Years</option>
                                {years.map((y) => (
                                    <option key={y.id} value={y.year}>{y.year}</option>
                                ))}
                            </select>

                            {(leagueFilter || yearFilter) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setLeagueFilter('');
                                        setYearFilter('');
                                        applyFilter('', '');
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Table<DraftPlayerRow>
                            data={draftPlayers.data}
                            total={draftPlayers.total}
                            currentPage={draftPlayers.current_page}
                            rowsPerPage={draftPlayers.per_page}
                            columns={columns}
                            searchableKeys={['player_name', 'position', 'school', 'agent_name']}
                            renderCell={(key, _value, row) => {
                                if (key === 'player_name') {
                                    return (
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                {row.player_name ?? '—'}
                                            </p>
                                            {row.nationality && (
                                                <p className="text-xs text-muted-foreground">{row.nationality}</p>
                                            )}
                                        </div>
                                    );
                                }

                                if (key === 'league_id') {
                                    return (
                                        <span className="font-medium">
                                            {row.league?.league_name ?? '—'}
                                        </span>
                                    );
                                }

                                if (key === 'year') {
                                    return <span className="font-medium">{row.year ?? '—'}</span>;
                                }

                                if (key === 'round') {
                                    const r = row.round ? `R${row.round}` : '—';
                                    const p = row.pick  ? `P${row.pick}`  : '';
                                    return <span className="tabular-nums">{p ? `${r} / ${p}` : r}</span>;
                                }

                                if (key === 'status') {
                                    const cls = STATUS_COLORS[row.status] ?? 'bg-gray-100 text-gray-700';
                                    const lbl = STATUS_LABELS[row.status] ?? row.status;
                                    return (
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${cls}`}>
                                            {lbl}
                                        </span>
                                    );
                                }

                                if (key === 'actions') {
                                    return (
                                        <div className="flex gap-2">
                                            <Link
                                                href={route('draft-player.edit', row.id)}
                                                className={buttonVariants({ variant: 'secondary', size: 'icon' })}
                                            >
                                                <Edit className="w-4 h-4 text-blue-500" />
                                            </Link>
                                            <ConfirmDialog
                                                title="Delete this Draft Player?"
                                                description="Are you sure you want to delete this player? This action cannot be undone."
                                                onConfirm={() => deletePlayer(row.id)}
                                                trigger={
                                                    <AlertDialog.Trigger
                                                        className={buttonVariants({ variant: 'secondary', size: 'icon' })}
                                                    >
                                                        <Trash className="w-4 h-4 text-red-500" />
                                                    </AlertDialog.Trigger>
                                                }
                                            />
                                        </div>
                                    );
                                }

                                return _value ?? '—';
                            }}
                            onPageChange={(page) => navigate({ page })}
                            onPerPageChange={(perPage) => navigate({ page: 1, per_page: perPage })}
                            onSearchChange={(searchVal) => {
                                const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
                                if (searchVal) params.search = searchVal; else delete params.search;
                                router.get(window.location.pathname, { ...params, page: 1 }, { preserveState: true, replace: true });
                            }}
                            searchValue={search}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
