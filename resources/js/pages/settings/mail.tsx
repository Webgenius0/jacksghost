import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Mail settings',
        href: '/settings/mail',
    },
];

interface MailConfig {
    MAIL_MAILER: string;
    MAIL_HOST: string;
    MAIL_PORT: string;
    MAIL_USERNAME: string;
    MAIL_PASSWORD: string;
    MAIL_ENCRYPTION: string;
    MAIL_FROM_ADDRESS: string;
}

export default function Mail() {
    const { props } = usePage<{ mailConfig: MailConfig }>();
    const { mailConfig } = props;

    const { data, setData, put, errors, processing } = useForm<MailConfig>({
        MAIL_MAILER: mailConfig.MAIL_MAILER || '',
        MAIL_HOST: mailConfig.MAIL_HOST || '',
        MAIL_PORT: mailConfig.MAIL_PORT || '',
        MAIL_USERNAME: mailConfig.MAIL_USERNAME || '',
        MAIL_PASSWORD: mailConfig.MAIL_PASSWORD || '',
        MAIL_ENCRYPTION: mailConfig.MAIL_ENCRYPTION || '',
        MAIL_FROM_ADDRESS: mailConfig.MAIL_FROM_ADDRESS || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('mail.update'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Mail settings updated successfully!'),
            onError: () => toast.error('Failed to update mail settings.'),
        });
    };

    const {
        data: testData,
        setData: setTestData,
        post: postTest,
        errors: testErrors,
        processing: testProcessing,
        reset: resetTest
    } = useForm({
        test_email: '',
    });

    const submitTest: FormEventHandler = (e) => {
        e.preventDefault();

        postTest(route('mail.test'), {
            preserveScroll: true,
            onSuccess: () => {
                resetTest('test_email');
                toast.success('Test email sent successfully!');
            },
            onError: () => toast.error('Failed to send test email.'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mail settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Mail Configuration" description="Update your system's email configuration" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="MAIL_MAILER">Mailer</Label>
                            <Input
                                id="MAIL_MAILER"
                                className="mt-1 block w-full"
                                value={data.MAIL_MAILER}
                                onChange={(e) => setData('MAIL_MAILER', e.target.value)}
                                required
                                placeholder="e.g., smtp"
                            />
                            <InputError className="mt-2" message={errors.MAIL_MAILER} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="MAIL_HOST">Host</Label>
                            <Input
                                id="MAIL_HOST"
                                className="mt-1 block w-full"
                                value={data.MAIL_HOST}
                                onChange={(e) => setData('MAIL_HOST', e.target.value)}
                                required
                                placeholder="e.g., smtp.mailtrap.io"
                            />
                            <InputError className="mt-2" message={errors.MAIL_HOST} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="MAIL_PORT">Port</Label>
                            <Input
                                id="MAIL_PORT"
                                className="mt-1 block w-full"
                                value={data.MAIL_PORT}
                                onChange={(e) => setData('MAIL_PORT', e.target.value)}
                                required
                                placeholder="e.g., 2525"
                            />
                            <InputError className="mt-2" message={errors.MAIL_PORT} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="MAIL_USERNAME">Username</Label>
                            <Input
                                id="MAIL_USERNAME"
                                className="mt-1 block w-full"
                                value={data.MAIL_USERNAME}
                                onChange={(e) => setData('MAIL_USERNAME', e.target.value)}
                                placeholder="Username"
                            />
                            <InputError className="mt-2" message={errors.MAIL_USERNAME} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="MAIL_PASSWORD">Password</Label>
                            <Input
                                id="MAIL_PASSWORD"
                                type="password"
                                className="mt-1 block w-full"
                                value={data.MAIL_PASSWORD}
                                onChange={(e) => setData('MAIL_PASSWORD', e.target.value)}
                                placeholder="Password"
                            />
                            <InputError className="mt-2" message={errors.MAIL_PASSWORD} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="MAIL_ENCRYPTION">Encryption</Label>
                            <Input
                                id="MAIL_ENCRYPTION"
                                className="mt-1 block w-full"
                                value={data.MAIL_ENCRYPTION}
                                onChange={(e) => setData('MAIL_ENCRYPTION', e.target.value)}
                                placeholder="e.g., tls or ssl"
                            />
                            <InputError className="mt-2" message={errors.MAIL_ENCRYPTION} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="MAIL_FROM_ADDRESS">From Address</Label>
                            <Input
                                id="MAIL_FROM_ADDRESS"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.MAIL_FROM_ADDRESS}
                                onChange={(e) => setData('MAIL_FROM_ADDRESS', e.target.value)}
                                required
                                placeholder="e.g., no-reply@example.com"
                            />
                            <InputError className="mt-2" message={errors.MAIL_FROM_ADDRESS} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save Mail Configuration</Button>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
