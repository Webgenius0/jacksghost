// resources/js/components/Pagination.tsx
import { Link } from '@inertiajs/react';
import React from 'react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
}

const Pagination: React.FC<PaginationProps> = ({ links }) => {
    return (
        <div className="flex justify-center mt-6 space-x-1">
            {links.map((link, index) => (
                <Link
                    key={index}
                    href={link.url ?? ''}
                    className={`px-3 py-1 text-sm border rounded ${
                        link.active
                            ? 'bg-blue-600 text-white'
                            : link.url
                                ? 'hover:bg-gray-100'
                                : 'text-gray-400 cursor-not-allowed'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
};

export default Pagination;
