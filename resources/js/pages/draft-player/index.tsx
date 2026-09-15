import AppLayout from '@/layouts/app-layout';
import { PaginatedDraftPlayers, DraftPlayer, League, Year } from '@/types';
import { Head, router, Link, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import Table from '@/components/Table';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    Edit,
    Trash,
    Plus,
    UserCheck,
    Upload,
    Download,
    FileSpreadsheet,
    ChevronDown,
    AlertTriangle,
    X,
} from 'lucide-react';
import { AlertDialog } from '@heroui/react';
import { ConfirmDialog } from '@/components/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/ui/card';
import { useState } from 'react';
import ImportDraftPlayerModal from './import-modal';

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
    { label: 'Player Name', key: 'first_name' as keyof DraftPlayerRow, sortable: true },
    { label: 'League',      key: 'league_id'   as keyof DraftPlayerRow, sortable: false },
    { label: 'Year',        key: 'year'        as keyof DraftPlayerRow, sortable: true },
    { label: 'Round / Pick',key: 'round'       as keyof DraftPlayerRow, sortable: true },
    { label: 'Position',    key: 'position'    as keyof DraftPlayerRow, sortable: true },
    { label: 'Teams',       key: 'draft_team'  as keyof DraftPlayerRow, sortable: false },
    { label: 'School',      key: 'school'      as keyof DraftPlayerRow, sortable: true },
    { label: 'Status',      key: 'status'      as keyof DraftPlayerRow, sortable: true },
    { label: 'Actions',     key: 'actions'     as keyof DraftPlayerRow },
];

export default function Index({ draftPlayers, leagues, years }: Props) {
    const queryParams = new URLSearchParams(window.location.search);
    const search = queryParams.get('search') || '';

    const [leagueFilter, setLeagueFilter] = useState(queryParams.get('league_id') || '');
    const [yearFilter, setYearFilter]     = useState(queryParams.get('year') || '');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [dismissErrors, setDismissErrors] = useState(false);

    const { flash } = usePage<{ flash?: { success?: string; error?: string; import_errors?: string[] } }>().props;

    const applyFilter = (newLeague: string, newYear: string) => {
        const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
        if (newLeague) params.league_id = newLeague; else delete params.league_id;
        if (newYear)   params.year      = newYear;   else delete params.year;
        params.page = '1';
        router.get(window.location.pathname, params, { preserveState: true, replace: true });
    };

    const handleExportFiltered = () => {
        const params = new URLSearchParams();
        if (leagueFilter) params.append('league_id', leagueFilter);
        if (yearFilter) params.append('year', yearFilter);
        if (search) params.append('search', search);

        const qs = params.toString();
        window.location.href = route('draft-player.export') + (qs ? `?${qs}` : '');
    };

    const handleExportAll = () => {
        window.location.href = route('draft-player.export');
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
                            <div className="flex items-center gap-2 flex-wrap">
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
                                            <span>Export Filtered ({draftPlayers.total})</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={handleExportAll}
                                            className="cursor-pointer gap-2"
                                        >
                                            <Download className="w-4 h-4 text-blue-600" />
                                            <span>Export All Players</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => (window.location.href = route('draft-player.template'))}
                                            className="cursor-pointer gap-2"
                                        >
                                            <FileSpreadsheet className="w-4 h-4 text-primary" />
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
                                    <Upload className="w-4 h-4 text-primary" />
                                    <span>Import Excel</span>
                                </Button>

                                {/* Add Player Link */}
                                <Link
                                    href={route('draft-player.create')}
                                    className={buttonVariants({ variant: 'default' })}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Player
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
                            searchableKeys={['first_name', 'last_name', 'position', 'current_team', 'draft_team', 'school', 'agent_name']}
                            renderCell={(key, _value, row) => {
                                if (key === 'first_name' || key === 'player_name') {
                                    const fullName = [row.first_name, row.last_name].filter(Boolean).join(' ') || row.player_name || '—';
                                    return (
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                {fullName}
                                            </p>
                                            {row.nationality && (
                                                <p className="text-xs text-muted-foreground">{row.nationality}</p>
                                            )}
                                        </div>
                                    );
                                }

                                if (key === 'draft_team') {
                                    return (
                                        <div className="text-xs space-y-0.5">
                                            {row.draft_team && (
                                                <p><span className="text-muted-foreground">Draft:</span> <span className="font-medium text-foreground">{row.draft_team}</span></p>
                                            )}
                                            {row.current_team && (
                                                <p><span className="text-muted-foreground">Current:</span> <span className="font-medium text-foreground">{row.current_team}</span></p>
                                            )}
                                            {!row.draft_team && !row.current_team && <span className="text-muted-foreground">—</span>}
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

            <ImportDraftPlayerModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                leagues={leagues}
            />
        </AppLayout>
    );
}
