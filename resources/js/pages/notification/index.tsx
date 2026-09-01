import Pagination from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, NotificationItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Bell, CheckCheck, Eye, EyeOff, ExternalLink, CircleCheck, CircleX } from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notifications',
        href: '/notification',
    },
];

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedNotifications {
    data: NotificationItem[];
    links: PaginationLink[];
}

interface NotificationIndexProps {
    notificationData: PaginatedNotifications;
    unreadCount: number;
    resolvedCount: number;
}

const timeAgo = (dateTime: string | null): string => {
    if (!dateTime) return '';
    const now = new Date();
    const date = new Date(dateTime);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function NotificationIndex({ notificationData, unreadCount, resolvedCount }: NotificationIndexProps) {
    const markAsRead = (id: string) => {
        router.patch(route('notification.read', id), {}, { preserveScroll: true });
    };

    const markAsUnread = (id: string) => {
        router.patch(route('notification.unread', id), {}, { preserveScroll: true });
    };

    const markAsResolved = (id: string) => {
        router.patch(route('notification.resolved', id), {}, { 
            preserveScroll: true,
            onSuccess: () => toast.success('Notification marked as resolved')
        });
    };

    const markAsUnresolved = (id: string) => {
        router.patch(route('notification.unresolved', id), {}, { 
            preserveScroll: true,
            onSuccess: () => toast.success('Notification marked as unresolved')
        });
    };

    const markAllAsRead = () => {
        router.patch(route('notification.readAll'), {}, { preserveScroll: true });
    };

    const NotificationItemComponent = ({ notification }: { notification: NotificationItem }) => {
        const isRead = Boolean(notification.read_at);
        const isResolved = Boolean(notification.resolved_at);
        return (
            <div
                className={`group relative flex items-start gap-4 px-6 py-5 transition-colors hover:bg-muted/50 ${
                    !isRead ? 'bg-primary/[0.03]' : ''
                }`}
            >
                {/* Unread indicator dot */}
                <div className="mt-2 flex-shrink-0">
                    <span
                        className={`block h-2.5 w-2.5 rounded-full transition-colors ${
                            !isRead ? 'bg-primary' : 'bg-transparent'
                        }`}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <p className={`text-sm leading-snug ${!isRead ? 'font-semibold' : 'font-medium text-muted-foreground'}`}>
                                {notification.title}
                            </p>
                            <p className={`mt-1 text-sm leading-relaxed ${!isRead ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                                {notification.message}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className="text-xs text-muted-foreground whitespace-nowrap pt-0.5">
                                {timeAgo(notification.created_at)}
                            </span>
                            {isResolved && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                    Resolved
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex items-center gap-3">
                        {isRead ? (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2.5 text-xs gap-1.5"
                                onClick={() => markAsUnread(notification.id)}
                            >
                                <EyeOff className="h-4 w-4" />
                                Mark unread
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 px-2.5 text-xs gap-1.5"
                                onClick={() => markAsRead(notification.id)}
                            >
                                <Eye className="h-4 w-4" />
                                Mark read
                            </Button>
                        )}
                        
                        {isResolved ? (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2.5 text-xs gap-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                                onClick={() => markAsUnresolved(notification.id)}
                            >
                                <CircleX className="h-4 w-4" />
                                Mark unresolved
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2.5 text-xs gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
                                onClick={() => markAsResolved(notification.id)}
                            >
                                <CircleCheck className="h-4 w-4" />
                                Mark resolved
                            </Button>
                        )}

                        {notification.url && (
                            <Link href={notification.url}>
                                <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs gap-1.5">
                                    <ExternalLink className="h-4 w-4" />
                                    View details
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const inboxItems = notificationData.data;
    const unreadItems = notificationData.data.filter(i => !i.read_at);
    const resolvedItems = notificationData.data.filter(i => i.resolved_at);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            <div className="m-5 space-y-4 max-w-5xl mx-auto">
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <Bell className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Admin Notifications</CardTitle>
                                <p className="text-muted-foreground text-sm mt-0.5">
                                    Manage system alerts and user activities
                                </p>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <Button onClick={markAllAsRead} className="gap-2">
                                <CheckCheck className="h-4 w-4" />
                                Mark all as read
                            </Button>
                        )}
                    </CardHeader>

                    <CardContent className="p-0">
                        <Tabs defaultValue="inbox" className="w-full">
                            <div className="px-6 border-b">
                                <TabsList className="bg-transparent h-12 w-fit p-0 gap-6">
                                    <TabsTrigger 
                                        value="inbox" 
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-1"
                                    >
                                        Inbox
                                        <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1 justify-center rounded-full">
                                            {notificationData.data.length}
                                        </Badge>
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="unread"
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-1"
                                    >
                                        Unread
                                        {unreadCount > 0 && (
                                            <Badge className="ml-2 h-5 min-w-5 px-1 justify-center rounded-full bg-primary text-primary-foreground">
                                                {unreadCount}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="resolved"
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-1"
                                    >
                                        Resolved
                                        <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1 justify-center rounded-full">
                                            {resolvedCount}
                                        </Badge>
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="min-h-[400px]">
                                <TabsContent value="inbox" className="m-0 border-0 outline-none">
                                    <div className="divide-y divide-border/50">
                                        {inboxItems.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                                <p className="text-muted-foreground">No notifications yet.</p>
                                            </div>
                                        ) : (
                                            inboxItems.map((n) => <NotificationItemComponent key={n.id} notification={n} />)
                                        )}
                                    </div>
                                </TabsContent>
                                
                                <TabsContent value="unread" className="m-0 border-0 outline-none">
                                    <div className="divide-y divide-border/50">
                                        {unreadItems.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                                    <CheckCheck className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                                <p className="text-muted-foreground font-medium">All caught up!</p>
                                                <p className="text-muted-foreground/70 text-sm mt-1">You have no unread notifications.</p>
                                            </div>
                                        ) : (
                                            unreadItems.map((n) => <NotificationItemComponent key={n.id} notification={n} />)
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="resolved" className="m-0 border-0 outline-none">
                                    <div className="divide-y divide-border/50">
                                        {resolvedItems.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                                <p className="text-muted-foreground">No resolved notifications yet.</p>
                                            </div>
                                        ) : (
                                            resolvedItems.map((n) => <NotificationItemComponent key={n.id} notification={n} />)
                                        )}
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>

                        <div className="px-6 py-6 border-t bg-muted/20">
                            <Pagination links={notificationData.links} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
