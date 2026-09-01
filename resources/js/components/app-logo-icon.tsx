import { usePage } from '@inertiajs/react';
import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    const { settings } = usePage().props as any;

    if (settings?.logo) {
        return <img src={settings.logo} alt="Logo" className={props.className} />;
    }

    if (settings?.favicon) {
        return <img src={settings.favicon} alt="Logo" className={props.className} />;
    }

    return <img src="/assets/brand/logo.png" alt="Logo" className={props.className} />;
}
