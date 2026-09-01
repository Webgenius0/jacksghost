import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Trash2, Loader, DownloadCloud } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Maintenance',
        href: '/settings/maintenance',
    },
];

const actionNames: Record<string, string> = {
    export: 'Database export',
    clearCache: 'Application cache clear',
    clearViews: 'View cache clear',
    clearCompiled: 'Compiled files clear',
    clearAll: 'All caches clear',
};

export default function Maintenance() {
    const [loading, setLoading] = useState<string | null>(null);

    const handleClearCache = async (action: string) => {
        setLoading(action);
        const actionName = actionNames[action] || 'Action';
        try {
            if (action === 'export') {
                // trigger file download via GET
                window.location.href = route('maintenance.export');
                toast.success('Database export started!');
                // clear loading after a short delay — browser will handle download
                setTimeout(() => setLoading(null), 1500);
                return;
            }

            router.post(route(`maintenance.${action}`), {}, {
                onSuccess: () => {
                    toast.success(`${actionName} completed successfully!`);
                },
                onError: () => {
                    toast.error(`Failed to execute ${actionName.toLowerCase()}.`);
                },
                onFinish: () => setLoading(null),
            });
        } catch (error) {
            toast.error(`Failed to execute ${actionName.toLowerCase()}.`);
            setLoading(null);
        }
    };

    const maintenanceActions = [
        {
            id: 'export',
            title: 'Export Database',
            description: 'Download a SQL dump of the application database.',
            icon: <DownloadCloud className="h-6 w-6" />,
        },
        {
            id: 'clearCache',
            title: 'Clear Application Cache',
            description: 'Remove all cached data from the application cache storage.',
            icon: '🗑️',
        },
        {
            id: 'clearViews',
            title: 'Clear View Cache',
            description: 'Remove compiled view templates from the cache.',
            icon: '👁️',
        },
        {
            id: 'clearCompiled',
            title: 'Clear Compiled Files',
            description: 'Remove compiled files and optimize cache.',
            icon: '⚙️',
        },
        {
            id: 'clearAll',
            title: 'Clear All Caches',
            description: 'Remove all caches, views, and compiled files at once.',
            icon: '🔥',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Maintenance" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Maintenance & Optimization"
                        description="Clear caches, views, and optimize your application"
                    />

                    <div className="grid gap-6">
                        {maintenanceActions.map((action) => (
                            <Card key={action.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{action.icon}</span>
                                            <div>
                                                <CardTitle className="text-lg">{action.title}</CardTitle>
                                                <CardDescription className="mt-1">
                                                    {action.description}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        variant={action.id === 'clearAll' ? 'destructive' : action.id === 'export' ? 'secondary' : 'outline'}
                                        onClick={() => handleClearCache(action.id)}
                                        disabled={loading !== null}
                                        className="w-full md:w-auto"
                                    >
                                        {loading === action.id ? (
                                            <>
                                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                {action.id === 'export' ? (
                                                    <DownloadCloud className="mr-2 h-4 w-4" />
                                                ) : (
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                )}
                                                {action.id === 'export' ? 'Export Database' : action.id === 'clearAll' ? 'Clear All' : 'Clear'}
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Separator className="my-6" />

                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                        <h3 className="font-semibold text-yellow-900">⚠️ Important Notice</h3>
                        <p className="mt-2 text-sm text-yellow-800">
                            Clearing caches may temporarily affect performance as the system rebuilds cached data on next request.
                            It's recommended to perform these operations during off-peak hours.
                        </p>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

