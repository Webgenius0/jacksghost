import AppLayout from '@/layouts/app-layout';
import { PaginatedLeagues, League } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import Table from '@/components/Table';
import ImageUpload from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Plus } from 'lucide-react';
import { AlertDialog } from "@heroui/react";
import { ConfirmDialog } from '@/components/alert-dialog';
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FormEventHandler, useState, useEffect } from 'react';

interface Props {
    leagues: PaginatedLeagues;
}

const columns = [
    { label: 'Icon', key: 'icon', sortable: false },
    { label: 'Name', key: 'league_name', sortable: true },
    { label: 'Slug', key: 'league_slug', sortable: true },
    { label: 'Title', key: 'title', sortable: true },
    { label: 'Draft Pick', key: 'is_draft_pick', sortable: true },
    { label: 'Actions', key: 'actions' },
];

function CreateLeagueModal({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
    const { data, setData, errors, post, reset, processing, clearErrors } = useForm({
        league_name: '',
        title: '',
        icon: null as File | null,
        is_draft_pick: false,
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            clearErrors();
        }
    }, [isOpen]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('league.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('League created successfully!');
                setIsOpen(false);
                reset();
            },
            onError: () => {
                toast.error('Failed to create League.');
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Create League</DialogTitle>
                        <DialogDescription>
                            Add a new league to the system. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="league_name">League Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="league_name"
                                value={data.league_name}
                                onChange={(e) => setData('league_name', e.target.value)}
                                placeholder="Enter the league name"
                                disabled={processing}
                                required
                            />
                            <InputError message={errors.league_name} />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Enter the league title (optional)"
                                disabled={processing}
                            />
                            <InputError message={errors.title} />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="icon">Icon Image</Label>
                            <ImageUpload
                                value={data.icon}
                                onChange={(file) => setData('icon', file as File | null)}
                                className="h-[150px]"
                            />
                            <InputError message={errors.icon} />
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                            <Checkbox 
                                id="is_draft_pick" 
                                checked={data.is_draft_pick}
                                onCheckedChange={(checked) => setData('is_draft_pick', checked as boolean)}
                                disabled={processing}
                            />
                            <Label htmlFor="is_draft_pick">Is Draft Pick?</Label>
                        </div>
                        <InputError message={errors.is_draft_pick} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={processing}>Cancel</Button>
                        <Button type="submit" disabled={processing}>Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditLeagueModal({ league, isOpen, setIsOpen }: { league: League | null, isOpen: boolean, setIsOpen: (val: boolean) => void }) {
    const { data, setData, errors, post, processing, clearErrors } = useForm({
        _method: 'put',
        league_name: '',
        title: '',
        icon: null as File | string | null,
        is_draft_pick: false,
    });

    useEffect(() => {
        if (isOpen && league) {
            setData({
                _method: 'put',
                league_name: league.league_name,
                title: league.title || '',
                icon: league.icon || null,
                is_draft_pick: league.is_draft_pick,
            });
            clearErrors();
        }
    }, [isOpen, league]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!league) return;
        post(route('league.update', league.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('League updated successfully!');
                setIsOpen(false);
            },
            onError: () => {
                toast.error('Failed to update League.');
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Edit League</DialogTitle>
                        <DialogDescription>
                            Make changes to the league here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="edit_league_name">League Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="edit_league_name"
                                value={data.league_name}
                                onChange={(e) => setData('league_name', e.target.value)}
                                placeholder="Enter the league name"
                                disabled={processing}
                                required
                            />
                            <InputError message={errors.league_name} />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="edit_title">Title</Label>
                            <Input
                                id="edit_title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Enter the league title (optional)"
                                disabled={processing}
                            />
                            <InputError message={errors.title} />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="edit_icon">Icon Image</Label>
                            <ImageUpload
                                value={data.icon}
                                onChange={(file) => setData('icon', file as File | null)}
                                className="h-[150px]"
                            />
                            <InputError message={errors.icon} />
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                            <Checkbox 
                                id="edit_is_draft_pick" 
                                checked={data.is_draft_pick}
                                onCheckedChange={(checked) => setData('is_draft_pick', checked as boolean)}
                                disabled={processing}
                            />
                            <Label htmlFor="edit_is_draft_pick">Is Draft Pick?</Label>
                        </div>
                        <InputError message={errors.is_draft_pick} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={processing}>Cancel</Button>
                        <Button type="submit" disabled={processing}>Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function Index({ leagues }: Props) {
    const queryParams = new URLSearchParams(window.location.search);
    const search = queryParams.get('search') || '';

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingLeague, setEditingLeague] = useState<League | null>(null);

    const deleteLeague = (id: number) => {
        router.delete(route('league.destroy', id), {
            onSuccess: () => toast.success('League deleted successfully!'),
            onError: () => toast.error('Failed to delete the league.'),
        });
    };

    const openEditModal = (league: League) => {
        setEditingLeague(league);
        setIsEditOpen(true);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Leagues', href: '/league' }]}>
            <Head title="Leagues List" />

            <div className="m-5">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                                Leagues List
                            </h1>
                            <Button onClick={() => setIsCreateOpen(true)} className="ml-auto">
                                <Plus className="w-4 h-4 mr-2" />
                                Create League
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table<League>
                            data={leagues.data}
                            total={leagues.total}
                            currentPage={leagues.current_page}
                            rowsPerPage={leagues.per_page}
                            columns={columns}
                            searchableKeys={['league_name', 'title']}
                            renderCell={(key, value, row) => {
                                if (key === 'icon') {
                                    return row.icon ? (
                                        <img src={`/${row.icon}`} alt={row.league_name} className="w-10 h-10 object-cover rounded" />
                                    ) : (
                                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center text-gray-500">
                                            -
                                        </div>
                                    );
                                }

                                if (key === 'is_draft_pick') {
                                    return row.is_draft_pick ? (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Yes</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">No</span>
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
                                                title="Delete this League?"
                                                description="Are you sure you want to delete this league? This action cannot be undone."
                                                onConfirm={() => deleteLeague(row.id)}
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

            <CreateLeagueModal isOpen={isCreateOpen} setIsOpen={setIsCreateOpen} />
            <EditLeagueModal league={editingLeague} isOpen={isEditOpen} setIsOpen={setIsEditOpen} />
        </AppLayout>
    );
}
