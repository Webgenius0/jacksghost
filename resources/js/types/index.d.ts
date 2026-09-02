import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    children?: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    notifications: {
        items: NotificationItem[];
        unread_count: number;
        resolved_count: number;
    } | null;
    [key: string]: unknown;
}

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    url: string | null;
    created_at: string | null;
    read_at: string | null;
    resolved_at: string | null;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface DynamicPage {
    id: number;
    page_title: string;
    page_slug: string;
    page_content: string;
    status: 'Active' | 'Inactive';
    created_at: string;
    updated_at: string;
}

export interface PaginatedDynamicPages {
    data: DynamicPage[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export interface DynamicPage {
    id: number;
    page_title: string;
    page_slug: string;
    page_content: string;
    status: 'Active' | 'Inactive';
    created_at: string;
    updated_at: string;
}

export interface PaginatedDynamicPages {
    data: DynamicPage[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export interface Faq {
    id: number;
    type: string | null;
    question: string;
    answer: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

export interface PaginatedFaqs {
    data: Faq[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export interface League {
    id: number;
    league_name: string;
    league_slug: string;
    icon: string | null;
    title: string | null;
    is_draft_pick: boolean;
    created_at: string;
    updated_at: string;
}

export interface PaginatedLeagues {
    data: League[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export interface LeagueContent {
    id: number;
    league_id: number;
    image: string | null;
    soccer_agent_content: string | null;
    created_at: string;
    updated_at: string;
    league?: League;
}

export interface PaginatedLeagueContents {
    data: LeagueContent[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export interface Year {
    id: number;
    year: number;
    created_at: string;
    updated_at: string;
}

export interface PaginatedYears {
    data: Year[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export interface DraftPlayer {
    id: number;
    league_id: number;
    year: number | null;
    round: number | null;
    pick: number | null;
    player_name: string | null;
    position: string | null;
    school: string | null;
    slug: string | null;
    agent_id: number | null;
    agent_name: string | null;
    agency_name: string | null;
    height: string | null;
    weight: string | null;
    birthdate: string | null;
    nationality: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    league?: League;
    agent?: { id: number; agent_name: string };
}

export interface PaginatedDraftPlayers {
    data: DraftPlayer[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}


