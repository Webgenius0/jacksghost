import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Folder, LayoutGrid, Activity, ClipboardCheck, ShieldAlert, FolderDot, ScrollText, MessageSquareWarning, Users, Package, Mail, Newspaper, ClipboardList, Ticket, ShoppingCart, Box, Settings, Trophy, FileText } from 'lucide-react';
import AppLogo from './app-logo';
import { useMemo } from 'react';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Leagues',
        href: '#',
        icon: Trophy,
        children: [
            {
                title: 'All Leagues',
                href: '/league',
                icon: Trophy,
            },
            {
                title: 'League Contents',
                href: '/league-content',
                icon: FileText,
            },
        ],
    },
    {
        title: 'User Management',
        href: '/user',
        icon: Users,
    },
    {
        title: 'Content',
        href: '#',
        icon: ScrollText,
        children: [
            {
                title: 'FAQs',
                href: '/faq',
                icon: MessageSquareWarning,
            },
            {
                title: 'Dynamic Pages',
                href: '/dynamic_page',
                icon: FolderDot,
            },
        ],
    },
    {
        title: 'Communications',
        href: '#',
        icon: Mail,
        children: [
            {
                title: 'Contacts',
                href: '/contact',
                icon: Mail,
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    //
];

function markActiveItems(items: NavItem[], currentPath: string): NavItem[] {
    return items.map((item) => {
        let isActive = false;
        let hasActiveChild = false;

        if (item.children && item.children.length > 0) {
            const updatedChildren = item.children.map((child) => {
                const childActive = currentPath === child.href || currentPath.startsWith(child.href + '/');
                if (childActive) hasActiveChild = true;
                return { ...child, isActive: childActive };
            });
            isActive = hasActiveChild;
            return { ...item, children: updatedChildren, isActive };
        }

        isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
        return { ...item, isActive };
    });
}

export function AppSidebar() {
    const page = usePage();
    const currentPath = page.url;

    const navItems = useMemo(
        () => markActiveItems(mainNavItems, currentPath),
        [currentPath]
    );

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
