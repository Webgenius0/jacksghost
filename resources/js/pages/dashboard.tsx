import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    Mail,
    MessageSquare,
    Users,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    stats: {
        total_users: number;
        total_contacts: number;
        total_newsletters: number;
    };
}

export default function Dashboard({ stats }: DashboardProps) {
    const statCards = [
        {
            title: 'Total Users',
            value: stats.total_users,
            icon: Users,
            description: 'Registered users on platform',
            color: 'text-blue-600',
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            href: '/user',
        },
        {
            title: 'Contact Messages',
            value: stats.total_contacts,
            icon: MessageSquare,
            description: 'Messages from contact form',
            color: 'text-rose-600',
            bg: 'bg-rose-100 dark:bg-rose-900/30',
            href: '/contact',
        },
        {
            title: 'Newsletter Subscribers',
            value: stats.total_newsletters,
            icon: Mail,
            description: 'Active newsletter subscribers',
            color: 'text-cyan-600',
            bg: 'bg-cyan-100 dark:bg-cyan-900/30',
            href: '/newsletter',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
                    <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {statCards.map((card) => (
                        <Link key={card.title} href={card.href}>
                            <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all duration-200 cursor-pointer h-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {card.title}
                                    </CardTitle>
                                    <div className={`p-2 rounded-lg ${card.bg}`}>
                                        <card.icon className={`h-4 w-4 ${card.color}`} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold tracking-tight">
                                        {card.value.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {card.description}
                                    </p>
                                    <div className={`mt-4 flex items-center text-xs font-medium ${card.color} opacity-70 group-hover:opacity-100 transition-opacity duration-200`}>
                                        View details
                                        <ArrowUpRight className="ml-1 h-3 w-3" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
