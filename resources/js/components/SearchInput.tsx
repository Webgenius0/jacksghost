import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface SearchInputProps {
    placeholder?: string;
    model?: string; // Query param name, default: 'search'
    routeUrl: string; // URL without query (e.g., "/task")
    defaultValue?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
                                                     placeholder = 'Search...',
                                                     model = 'search',
                                                     routeUrl,
                                                     defaultValue = '',
                                                 }) => {
    const [search, setSearch] = useState<string>(defaultValue);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const searchParams = new URLSearchParams(window.location.search);
            if (search) {
                searchParams.set(model, search);
                searchParams.set('page', '1'); // Reset page when searching
            } else {
                searchParams.delete(model);
            }

            router.get(`${routeUrl}?${searchParams.toString()}`, {}, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 500); // Debounce 500ms

        return () => clearTimeout(timeout);
    }, [search]);

    return (
        <input
            type="text"
            className="border px-3 py-1 rounded text-sm"
            placeholder={placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />
    );
};

export default SearchInput;
