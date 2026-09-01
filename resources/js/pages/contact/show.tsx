import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import React from 'react';

interface Contact {
    id: number;
    name: string;
    email: string;
    topic: string;
    message: string;
    created_at: string;
}

interface Props {
    contact: Contact;
}

export default function Show({ contact }: Props) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Contacts Management', href: '/contact' },
            { title: 'View Contact', href: `/contact/${contact.id}` },
        ]}>
            <Head title={`View Contact: ${contact.name}`} />

            <div className="m-5 max-w-4xl mx-auto">
                <Card className="shadow-lg border-0 bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
                    <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 pb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Link
                                    href={route('contact.index')}
                                    className={buttonVariants({ variant: 'outline', size: 'icon' })}
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </Link>
                                <CardTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    Contact Message
                                </CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid gap-8">
                            {/* Contact Details Header */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sender Name</h3>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{contact.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</h3>
                                    <p className="text-lg font-medium text-blue-600 dark:text-blue-400 break-all">{contact.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Topic</h3>
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">{contact.topic}</p>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date Submitted</h3>
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        {new Date(contact.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Message Content */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2">
                                    Message Content
                                </h3>
                                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm mt-4">
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
                                        {contact.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
