import AppLayout from '@/layouts/app-layout';
import { PaginatedCurrentTeams, CurrentTeam } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import Table from '@/components/Table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Edit, Trash, Plus, Shield } from 'lucide-react';
import { AlertDialog } from "@heroui/react";
import { ConfirmDialog } from '@/components/alert-dialog';
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from "@/components/ui/input";
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { FormEventHandler, useState, useEffect } from 'react';

interface LeagueOption {
    id: number;
    league_name: string;
}

type CurrentTeamRow = CurrentTeam & {
    actions?: unknown;
};

interface Props {
    currentTeams: PaginatedCurrentTeams;
    leagues: LeagueOption[];
}

const columns = [
    { label: 'Team Name', key: 'team_name' as keyof CurrentTeamRow, sortable: true },
    { label: 'League', key: 'league' as keyof CurrentTeamRow, sortable: false },
    { label: 'Created At', key: 'created_at' as keyof CurrentTeamRow, sortable: true },
    { label: 'Actions', key: 'actions' as keyof CurrentTeamRow },
];

function CreateCurrentTeamModal({
    isOpen,
    setIsOpen,
    leagues,
}: {
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    leagues: LeagueOption[];
}) {
    const { data, setData, errors, post, reset, processing, clearErrors } = useForm({
        team_name: '',
        league_id: '',
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            clearErrors();
        }
    }, [isOpen]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('current-team.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Current team created successfully!');
                setIsOpen(false);
                reset();
            },
            onError: () => {
                toast.error('Failed to create current team.');
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Create Current Team</DialogTitle>
                        <DialogDescription>
                            Add a new team for a draft pick league. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="create_league_id">
                                League <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={data.league_id}
                                onValueChange={(val) => setData('league_id', val)}
                                disabled={processing}
                            >
                                <SelectTrigger id="create_league_id" className="w-full">
                                    <SelectValue placeholder="Select draft pick league" />
                                </SelectTrigger>
                                <SelectContent>
                                    {leagues.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            No draft pick leagues found
                                        </div>
                                    ) : (
                                        leagues.map((league) => (
                                            <SelectItem key={league.id} value={String(league.id)}>
                                                {league.league_name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.league_id} />
                        </div>

                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="create_team_name">
                                Team Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="create_team_name"
                                value={data.team_name}
                                onChange={(e) => setData('team_name', e.target.value)}
                                placeholder="Enter team name"
                                disabled={processing}
                                required
                            />
                            <InputError message={errors.team_name} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || !data.league_id}>
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditCurrentTeamModal({
    currentTeam,
    isOpen,
    setIsOpen,
    leagues,
}: {
    currentTeam: CurrentTeam | null;
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    leagues: LeagueOption[];
}) {
    const { data, setData, errors, post, processing, clearErrors } = useForm({
        _method: 'put',
        team_name: '',
        league_id: '',
    });

    useEffect(() => {
        if (isOpen && currentTeam) {
            setData({
                _method: 'put',
                team_name: currentTeam.team_name,
                league_id: String(currentTeam.league_id),
            });
            clearErrors();
        }
    }, [isOpen, currentTeam]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!currentTeam) return;

        post(route('current-team.update', currentTeam.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Current team updated successfully!');
                setIsOpen(false);
            },
            onError: () => {
                toast.error('Failed to update current team.');
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Edit Current Team</DialogTitle>
                        <DialogDescription>
                            Make changes to the team details here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="edit_league_id">
                                League <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={data.league_id}
                                onValueChange={(val) => setData('league_id', val)}
                                disabled={processing}
                            >
                                <SelectTrigger id="edit_league_id" className="w-full">
                                    <SelectValue placeholder="Select draft pick league" />
                                </SelectTrigger>
                                <SelectContent>
                                    {leagues.map((league) => (
                                        <SelectItem key={league.id} value={String(league.id)}>
                                            {league.league_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.league_id} />
                        </div>

                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="edit_team_name">
                                Team Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit_team_name"
                                value={data.team_name}
                                onChange={(e) => setData('team_name', e.target.value)}
                                placeholder="Enter team name"
                                disabled={processing}
                                required
                            />
                            <InputError message={errors.team_name} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function Index({ currentTeams, leagues }: Props) {
    const queryParams = new URLSearchParams(window.location.search);
    const search = queryParams.get('search') || '';
    const selectedLeague = queryParams.get('league_id') || 'all';

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<CurrentTeam | null>(null);

    const deleteCurrentTeam = (id: number) => {
        router.delete(route('current-team.destroy', id), {
            onSuccess: () => toast.success('Current team deleted successfully!'),
            onError: () => toast.error('Failed to delete current team.'),
        });
    };

    const openEditModal = (team: CurrentTeam) => {
        setEditingTeam(team);
        setIsEditOpen(true);
    };

    const handleLeagueFilterChange = (val: string) => {
        const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
        if (val && val !== 'all') {
            params.league_id = val;
        } else {
            delete params.league_id;
        }
        delete params.page;
        router.get(window.location.pathname, params, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Leagues', href: '/league' }, { title: 'Current Teams', href: '/current-team' }]}>
            <Head title="Current Teams List" />

            <div className="m-5">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                    <Shield className="w-6 h-6 text-primary" />
                                    Current Teams List
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Manage teams associated with draft pick enabled leagues.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="w-[200px]">
                                    <Select
                                        value={selectedLeague}
                                        onValueChange={handleLeagueFilterChange}
                                    >
                                        <SelectTrigger className="w-full h-9">
                                            <SelectValue placeholder="All Draft Leagues" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Draft Leagues</SelectItem>
                                            {leagues.map((lg) => (
                                                <SelectItem key={lg.id} value={String(lg.id)}>
                                                    {lg.league_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={() => setIsCreateOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Team
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table<CurrentTeamRow>
                            data={currentTeams.data}
                            total={currentTeams.total}
                            currentPage={currentTeams.current_page}
                            rowsPerPage={currentTeams.per_page}
                            columns={columns}
                            searchableKeys={['team_name']}
                            renderCell={(key, value, row) => {
                                if (key === 'team_name') {
                                    return (
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                                <Shield className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-foreground">{row.team_name}</span>
                                        </div>
                                    );
                                }

                                if (key === 'league') {
                                    return (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                            {row.league?.league_name || 'N/A'}
                                        </span>
                                    );
                                }

                                if (key === 'created_at') {
                                    return (
                                        <span className="text-sm text-muted-foreground">
                                            {row.created_at
                                                ? new Date(row.created_at).toLocaleDateString(undefined, {
                                                      year: 'numeric',
                                                      month: 'short',
                                                      day: 'numeric',
                                                  })
                                                : '-'}
                                        </span>
                                    );
                                }

                                if (key === 'actions') {
                                    return (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                onClick={() => openEditModal(row)}
                                            >
                                                <Edit className="w-4 h-4 text-blue-500" />
                                            </Button>
                                            <ConfirmDialog
                                                title="Delete this Current Team?"
                                                description="Are you sure you want to delete this team? This action cannot be undone."
                                                onConfirm={() => deleteCurrentTeam(row.id)}
                                                trigger={
                                                    <AlertDialog.Trigger className={buttonVariants({ variant: 'secondary', size: 'icon' })}>
                                                        <Trash className="w-4 h-4 text-red-500" />
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
                                router.get(
                                    window.location.pathname,
                                    {
                                        ...params,
                                        page,
                                    },
                                    { preserveState: true, replace: true }
                                );
                            }}
                            onPerPageChange={(perPage) => {
                                const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
                                router.get(
                                    window.location.pathname,
                                    {
                                        ...params,
                                        page: 1,
                                        per_page: perPage,
                                    },
                                    { preserveState: true, replace: true }
                                );
                            }}
                            onSearchChange={(searchVal) => {
                                const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
                                if (searchVal) {
                                    params.search = searchVal;
                                } else {
                                    delete params.search;
                                }
                                router.get(
                                    window.location.pathname,
                                    {
                                        ...params,
                                        page: 1,
                                    },
                                    { preserveState: true, replace: true }
                                );
                            }}
                            searchValue={search}
                        />
                    </CardContent>
                </Card>
            </div>

            <CreateCurrentTeamModal
                isOpen={isCreateOpen}
                setIsOpen={setIsCreateOpen}
                leagues={leagues}
            />
            <EditCurrentTeamModal
                currentTeam={editingTeam}
                isOpen={isEditOpen}
                setIsOpen={setIsEditOpen}
                leagues={leagues}
            />
        </AppLayout>
    );
}
