import AppLayout from '@/layouts/app-layout';
import { PaginatedYears, Year } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import Table from '@/components/Table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Edit, Trash, Plus, Calendar } from 'lucide-react';
import { AlertDialog } from '@heroui/react';
import { ConfirmDialog } from '@/components/alert-dialog';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { FormEventHandler, useState, useEffect } from 'react';

type YearRow = Year & {
    actions?: unknown;
};

interface Props {
    years: PaginatedYears;
}

const columns = [
    { label: 'Year', key: 'year' as keyof YearRow, sortable: true },
    { label: 'Created At', key: 'created_at' as keyof YearRow, sortable: true },
    { label: 'Actions', key: 'actions' as keyof YearRow },
];

function CreateYearModal({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
    const { data, setData, errors, post, reset, processing, clearErrors } = useForm({
        year: '',
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            clearErrors();
        }
    }, [isOpen]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('year.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Drafted year created successfully!');
                setIsOpen(false);
                reset();
            },
            onError: () => {
                toast.error('Failed to create drafted year.');
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Create Drafted Year</DialogTitle>
                        <DialogDescription>
                            Add a new drafted year to the system. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="year">Year <span className="text-red-500">*</span></Label>
                            <Input
                                id="year"
                                type="number"
                                min="1900"
                                max="2100"
                                value={data.year}
                                onChange={(e) => setData('year', e.target.value)}
                                placeholder="e.g. 2026"
                                disabled={processing}
                                required
                            />
                            <InputError message={errors.year} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={processing}>
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

function EditYearModal({ year, isOpen, setIsOpen }: { year: Year | null; isOpen: boolean; setIsOpen: (val: boolean) => void }) {
    const { data, setData, errors, post, processing, clearErrors } = useForm({
        _method: 'put',
        year: '',
    });

    useEffect(() => {
        if (isOpen && year) {
            setData({
                _method: 'put',
                year: year.year.toString(),
            });
            clearErrors();
        }
    }, [isOpen, year]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!year) return;
        post(route('year.update', year.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Drafted year updated successfully!');
                setIsOpen(false);
            },
            onError: () => {
                toast.error('Failed to update drafted year.');
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Edit Drafted Year</DialogTitle>
                        <DialogDescription>
                            Make changes to the drafted year here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="edit_year">Year <span className="text-red-500">*</span></Label>
                            <Input
                                id="edit_year"
                                type="number"
                                min="1900"
                                max="2100"
                                value={data.year}
                                onChange={(e) => setData('year', e.target.value)}
                                placeholder="e.g. 2026"
                                disabled={processing}
                                required
                            />
                            <InputError message={errors.year} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={processing}>
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

export default function Index({ years }: Props) {
    const queryParams = new URLSearchParams(window.location.search);
    const search = queryParams.get('search') || '';

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingYear, setEditingYear] = useState<Year | null>(null);

    const deleteYear = (id: number) => {
        router.delete(route('year.destroy', id), {
            onSuccess: () => toast.success('Drafted year deleted successfully!'),
            onError: () => toast.error('Failed to delete drafted year.'),
        });
    };

    const openEditModal = (year: Year) => {
        setEditingYear(year);
        setIsEditOpen(true);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Drafted Years', href: '/year' }]}>
            <Head title="Drafted Years" />

            <div className="m-5">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-6 h-6 text-primary" />
                                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                                    Drafted Years
                                </h1>
                            </div>
                            <Button onClick={() => setIsCreateOpen(true)} className="ml-auto">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Drafted Year
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table<YearRow>
                            data={years.data}
                            total={years.total}
                            currentPage={years.current_page}
                            rowsPerPage={years.per_page}
                            columns={columns}
                            searchableKeys={['year']}
                            renderCell={(key, value, row) => {
                                if (key === 'year') {
                                    return (
                                        <span className="font-semibold text-base text-gray-900 dark:text-gray-100">
                                            {row.year}
                                        </span>
                                    );
                                }

                                if (key === 'created_at') {
                                    return (
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(row.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
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
                                                title="Delete this Drafted Year?"
                                                description="Are you sure you want to delete this drafted year? This action cannot be undone."
                                                onConfirm={() => deleteYear(row.id)}
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

            <CreateYearModal isOpen={isCreateOpen} setIsOpen={setIsCreateOpen} />
            <EditYearModal year={editingYear} isOpen={isEditOpen} setIsOpen={setIsEditOpen} />
        </AppLayout>
    );
}
