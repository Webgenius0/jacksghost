import { usePage } from '@inertiajs/react';
import { useSidebar } from '@/components/ui/sidebar';

function normalizeLogoSrc(src?: string | null) {
    if (!src) {
        return '/assets/brand/logo.png';
    }

    if (/^(?:https?:)?\/\//.test(src)) {
        return src;
    }

    if (src.startsWith('/storage/uploads/')) {
        return `${window.location.origin}/${src.replace('storage/', '')}`;
    }

    if (src.startsWith('storage/uploads/')) {
        return `${window.location.origin}/${src.replace('storage/', '')}`;
    }

    if (src.startsWith('/uploads/')) {
        return `${window.location.origin}${src}`;
    }

    if (src.startsWith('uploads/')) {
        return `${window.location.origin}/${src}`;
    }

    if (src.startsWith('/')) {
        return src;
    }

    return `/${src}`;
}

export default function AppLogo() {
    const { settings } = usePage().props as any;
    const { state } = useSidebar();

    const isCollapsed = state === 'collapsed';
    const hasLogo    = !!settings?.logo;
    const hasFavicon = !!settings?.favicon;
    const displayName = settings?.system_name || 'Admin Dashboard';

    /* ── Collapsed sidebar: show favicon (or letter fallback) ── */
    if (isCollapsed) {
        if (hasFavicon) {
            return (
                <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md">
                    <img
                        src={normalizeLogoSrc(settings.favicon)}
                        alt={displayName}
                        className="size-6 object-contain"
                    />
                </div>
            );
        }

        /* No favicon — show first letter of display name as avatar */
        return (
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md text-sm font-semibold">
                {displayName.charAt(0).toUpperCase()}
            </div>
        );
    }

    /* ── Expanded sidebar: logo → system_name → "Admin Dashboard" ── */
    if (hasLogo) {
        return (
            <div className="flex items-center justify-center overflow-hidden">
                <img
                    src={normalizeLogoSrc(settings.logo)}
                    alt={displayName}
                    className="h-12 w-full object-contain"
                />
            </div>
        );
    }

    return (
        <div className="ml-1 grid flex-1 text-left text-sm">
            <span className="mb-0.5 truncate leading-none font-semibold">
                {displayName}
            </span>
        </div>
    );
}
