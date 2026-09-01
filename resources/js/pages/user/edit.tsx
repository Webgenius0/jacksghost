import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import ImageUpload from '@/components/ImageUpload';
import InputError from '@/components/input-error';
import { Button, buttonVariants } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FormEventHandler, useState, ChangeEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

type User = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
};

type EditUserForm = {
    name: string;
    email: string;
    phone: string;
    password: string;
    avatar: File | null;
    _method: string;
};

interface Props {
    user: User;
}

export default function Edit({ user }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'User Management',
            href: '/user',
        },
        {
            title: 'Edit User',
            href: `/user/${user.id}/edit`,
        },
    ];

    const { data, setData, errors, post, processing } = useForm<EditUserForm>({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        avatar: null,
        _method: 'PUT',
    });

    const [imageRemoved, setImageRemoved] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const updateUser: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('user.update', user.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User updated successfully!');
            },
            onError: () => {
                toast.error('Failed to update User.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />
            <div className="m-5 flex flex-col gap-5">
                <div className="flex">
                    <Link className={(buttonVariants({ variant: 'default', className: 'mb-2 ml-auto' }))} href={route('user.index')}>
                        Back to List
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Edit User</CardTitle>
                    </CardHeader>
                    <form onSubmit={updateUser}>
                        <CardContent>
                            <div className="grid w-full items-center gap-4">

                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter name"
                                        disabled={processing}
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter email"
                                        disabled={processing}
                                        required
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="Enter phone number"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="password">Password (Leave blank to keep current)</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Enter new password"
                                            disabled={processing}
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="avatar">Avatar</Label>
                                    <ImageUpload
                                        value={data.avatar || (!imageRemoved && user.avatar ? user.avatar : null)}
                                        onChange={(val) => {
                                            setData('avatar', val as File | null);
                                            setImageRemoved(!val);
                                        }}
                                        multiple={false}
                                    />
                                    <InputError message={errors.avatar} />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between mt-5">
                            <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={processing}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Update User
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
