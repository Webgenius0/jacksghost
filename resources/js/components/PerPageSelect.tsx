import { router, usePage } from '@inertiajs/react';
import React from 'react';

interface PerPageSelectProps {
    current: number;
    routeUrl: string;
}

const PerPageSelect: React.FC<PerPageSelectProps> = ({ current, routeUrl }) => {
    const { url } = usePage();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const perPage = parseInt(e.target.value);

        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set('per_page', perPage.toString());
        searchParams.set('page', '1'); // Reset to page 1 when per page changes

        router.get(`${routeUrl}?${searchParams.toString()}`, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="mb-4">
            <label className="mr-2 text-sm font-medium">Show:</label>
            <select
                value={current}
                onChange={handleChange}
                className="border rounded px-3 py-1 text-sm"
            >
                {[10, 25, 50, 100, 500].map((size) => (
                    <option key={size} value={size}>{size}</option>
                ))}
            </select>
        </div>
    );
};

export default PerPageSelect;
