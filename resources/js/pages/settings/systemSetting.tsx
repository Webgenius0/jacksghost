import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

import HeadingSmall from '@/components/heading-small';
import ImageUpload from '@/components/ImageUpload';
import FileUpload from '@/components/FileUpload';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'System Settings',
        href: '/settings/system-settings',
    },
];

interface SystemSettings {
    title: string;
    email: string;
    number: string;
    system_name: string;
    address: string;
    copyright_text: string;
    description: string;
    logo: File | string | null;
    favicon: File | string | null;
    agent_listing_fee: number | string;
    subscription_fee: number | string;
}

export default function SystemSetting({ settings }: { settings: SystemSettings | null }) {
    const { data, setData, post, errors, processing } = useForm<any>({
        title: settings?.title || '',
        email: settings?.email || '',
        number: settings?.number || '',
        system_name: settings?.system_name || '',
        address: settings?.address || '',
        copyright_text: settings?.copyright_text || '',
        description: settings?.description || '',
        logo: settings?.logo || null,
        favicon: settings?.favicon || null,
        agent_listing_fee: settings?.agent_listing_fee ?? '',
        subscription_fee: settings?.subscription_fee ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('system-settings.update'), {
            preserveScroll: true,
            onSuccess: () => toast.success('System settings updated successfully!'),
            onError: () => toast.error('Failed to update system settings.'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="System Configuration" description="Update your system's global settings and branding" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="system_name">System Name</Label>
                                <Input
                                    id="system_name"
                                    className="mt-1 block w-full"
                                    value={data.system_name}
                                    onChange={(e) => setData('system_name', e.target.value)}
                                    placeholder="e.g., My Application"
                                />
                                <InputError className="mt-2" message={errors.system_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="title">Browser Title</Label>
                                <Input
                                    id="title"
                                    className="mt-1 block w-full"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g., My App | Dashboard"
                                />
                                <InputError className="mt-2" message={errors.title} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">System Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="e.g., admin@example.com"
                                />
                                <InputError className="mt-2" message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="number">Contact Number</Label>
                                <Input
                                    id="number"
                                    className="mt-1 block w-full"
                                    value={data.number}
                                    onChange={(e) => setData('number', e.target.value)}
                                    placeholder="e.g., +1 234 567 890"
                                />
                                <InputError className="mt-2" message={errors.number} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                className="mt-1 block w-full"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="System address"
                            />
                            <InputError className="mt-2" message={errors.address} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="copyright_text">Copyright Text</Label>
                            <Input
                                id="copyright_text"
                                className="mt-1 block w-full"
                                value={data.copyright_text}
                                onChange={(e) => setData('copyright_text', e.target.value)}
                                placeholder="e.g., © 2024 My Company"
                            />
                            <InputError className="mt-2" message={errors.copyright_text} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">System Description</Label>
                            <Textarea
                                id="description"
                                className="mt-1 block w-full"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Brief description of the system"
                            />
                            <InputError className="mt-2" message={errors.description} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="agent_listing_fee">Agent Listing Fee ($)</Label>
                                <Input
                                    id="agent_listing_fee"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="mt-1 block w-full"
                                    value={data.agent_listing_fee}
                                    onChange={(e) => setData('agent_listing_fee', e.target.value)}
                                    placeholder="e.g., 25.00"
                                />
                                <InputError className="mt-2" message={errors.agent_listing_fee} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="subscription_fee">Subscription Fee ($)</Label>
                                <Input
                                    id="subscription_fee"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="mt-1 block w-full"
                                    value={data.subscription_fee}
                                    onChange={(e) => setData('subscription_fee', e.target.value)}
                                    placeholder="e.g., 9.99"
                                />
                                <InputError className="mt-2" message={errors.subscription_fee} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="logo">System Logo</Label>
                                <ImageUpload
                                    value={data.logo}
                                    onChange={(file) => setData('logo', file)}
                                    className="h-[150px]"
                                />
                                <InputError className="mt-2" message={errors.logo} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="favicon">Favicon</Label>
                                <ImageUpload
                                    value={data.favicon}
                                    onChange={(file) => setData('favicon', file)}
                                    className="h-[150px]"
                                />
                                <InputError className="mt-2" message={errors.favicon} />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save Settings</Button>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
