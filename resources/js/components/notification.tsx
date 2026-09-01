import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SharedData, NotificationItem } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Bell, CheckCheck, Eye, EyeOff, ExternalLink, Inbox, CircleCheck, CircleX } from 'lucide-react';
import { toast } from 'sonner';

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
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export function NotificationDropdown() {
    const { notifications } = usePage<SharedData>().props;

    if (!notifications) return null;

    const markAsRead = (id: string) => {
        router.patch(route('notification.read', id), {}, { preserveScroll: true });
    };

    const markAsResolved = (id: string) => {
        router.patch(route('notification.resolved', id), {}, { 
            preserveScroll: true,
            onSuccess: () => toast.success('Notification marked as resolved')
        });
    };

    const markAllAsRead = () => {
        router.patch(route('notification.readAll'), {}, { preserveScroll: true });
    };

    const NotificationList = ({ items }: { items: NotificationItem[] }) => (
        <div className="divide-y">
            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                    <p className="text-muted-foreground text-sm">No notifications found.</p>
                </div>
            ) : (
                items.map((notification) => {
                    const isRead = Boolean(notification.read_at);
                    const isResolved = Boolean(notification.resolved_at);
                    return (
                        <div
                            key={notification.id}
                            className={`group relative flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${
                                !isRead ? 'bg-primary/[0.02]' : ''
                            }`}
                        >
                            <div className="mt-1.5 flex-shrink-0">
                                <span
                                    className={`block h-2 w-2 rounded-full ${
                                        !isRead ? 'bg-primary' : 'bg-transparent'
                                    }`}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className={`text-xs leading-snug ${!isRead ? 'font-semibold' : 'font-medium text-muted-foreground'}`}>
                                        {notification.title}
                                    </p>
                                    <span className="flex-shrink-0 text-[10px] text-muted-foreground">
                                        {timeAgo(notification.created_at)}
                                    </span>
                                </div>
                                <p className={`mt-0.5 text-xs line-clamp-2 ${!isRead ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                                    {notification.message}
                                </p>
                                <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!isRead && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="text-[10px] text-primary font-medium hover:underline flex items-center gap-1"
                                        >
                                            <Eye className="h-3 w-3" /> Mark read
                                        </button>
                                    )}
                                    {!isResolved && (
                                        <button
                                            onClick={() => markAsResolved(notification.id)}
                                            className="text-[10px] text-green-600 font-medium hover:underline flex items-center gap-1"
                                        >
                                            <CircleCheck className="h-3 w-3" /> Resolve
                                        </button>
                                    )}
                                    {notification.url && (
                                        <Link
                                            href={notification.url}
                                            className="text-[10px] text-muted-foreground font-medium hover:underline flex items-center gap-1"
                                        >
                                            <ExternalLink className="h-3 w-3" /> View
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );

    const unreadItems = notifications.items.filter(i => !i.read_at);
    const resolvedItems = notifications.items.filter(i => i.resolved_at);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Bell className="h-5 w-5" />
                    {notifications.unread_count > 0 && (
                        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                            {notifications.unread_count > 9 ? '9+' : notifications.unread_count}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30">
                    <h2 className="text-sm font-semibold">Notifications</h2>
                    {notifications.unread_count > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-7 px-2 text-xs text-primary hover:text-primary/80">
                            <CheckCheck className="mr-1 h-3.5 w-3.5" />
                            Mark all read
                        </Button>
                    )}
                </div>

                <Tabs defaultValue="inbox" className="w-full">
                    <div className="px-2 pt-2 border-b">
                        <TabsList className="grid w-full grid-cols-3 h-8">
                            <TabsTrigger value="inbox" className="text-xs py-1">
                                Inbox
                            </TabsTrigger>
                            <TabsTrigger value="unread" className="text-xs py-1 relative">
                                Unread
                                {unreadItems.length > 0 && (
                                    <span className="ml-1 px-1 rounded-full bg-primary/10 text-primary text-[10px]">
                                        {unreadItems.length}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="resolved" className="text-xs py-1">
                                Resolved
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="h-[350px]">
                        <TabsContent value="inbox" className="m-0 border-0 outline-none">
                            <NotificationList items={notifications.items} />
                        </TabsContent>
                        <TabsContent value="unread" className="m-0 border-0 outline-none">
                            <NotificationList items={unreadItems} />
                        </TabsContent>
                        <TabsContent value="resolved" className="m-0 border-0 outline-none">
                            <NotificationList items={resolvedItems} />
                        </TabsContent>
                    </ScrollArea>
                </Tabs>

                <div className="border-t">
                    <Link
                        href="/notification"
                        className="flex items-center justify-center py-2.5 text-xs font-medium text-primary hover:bg-muted transition-colors"
                    >
                        View all notifications
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
