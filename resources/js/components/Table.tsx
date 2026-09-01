import React, { useEffect, useMemo, useState } from 'react';

type SortDirection = 'asc' | 'desc';

type TableColumn<T> = {
    label: string;
    key: keyof T;
    sortable?: boolean;
    className?: string;
};

type TableProps<T> = {
    data: T[];
    total: number;
    currentPage: number;
    rowsPerPage: number;
    columns: TableColumn<T>[];
    searchableKeys?: (keyof T)[];
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    onSearchChange?: (search: string) => void;
    searchValue?: string;
    renderCell?: (key: keyof T, value: any, row: T, index: number) => React.ReactNode;
    className?: string;
    tableClassName?: string;
};

function Table<T extends Record<string, any>>({
    data,
    total,
    currentPage,
    rowsPerPage,
    columns,
    searchableKeys = [],
    onPageChange,
    onPerPageChange,
    onSearchChange,
    searchValue = '',
    renderCell,
    className = '',
    tableClassName = '',
}: TableProps<T>) {
    const [searchInput, setSearchInput] = useState(searchValue);
    const [sortKey, setSortKey] = useState<keyof T | ''>('');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setSearchInput(searchValue);
    }, [searchValue]);

    const sortedData = useMemo(() => {
        if (!sortKey) return data;
        return [...data].sort((a, b) => {
            const valA = String(a[sortKey] ?? '');
            const valB = String(b[sortKey] ?? '');
            return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        });
    }, [data, sortKey, sortDirection]);

    const handleSortChange = (key: keyof T) => {
        if (sortKey === key) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    const startItem = (currentPage - 1) * rowsPerPage + 1;
    const endItem = Math.min(startItem + data.length - 1, total);

    return (
        <div className={`w-full ${className}`}>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <div className="flex gap-2 items-center">
                    <label className="text-sm text-gray-600 dark:text-white">Rows per page:</label>
                    <select
                        value={rowsPerPage}
                        onChange={(e) => onPerPageChange(Number(e.target.value))}
                        className="border px-2 py-1 rounded dark:bg-black"
                    >
                        {[10, 25, 50, 100, 500].map((n) => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                    </select>
                </div>

                <input
                    type="text"
                    placeholder="Search..."
                    value={searchInput}
                    onChange={(e) => {
                        const value = e.target.value;
                        setSearchInput(value);
                        if (debounceTimerRef.current) {
                            clearTimeout(debounceTimerRef.current);
                        }
                        debounceTimerRef.current = setTimeout(() => {
                            onSearchChange?.(value);
                        }, 500);
                    }}
                    className="border px-3 py-1 rounded w-full dark:text-white sm:w-auto"
                />
            </div>

            <div className="text-sm text-gray-600 dark:text-white my-2">
                Showing {data.length > 0 ? `${startItem} to ${endItem}` : '0'} of {total} entries
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <div className="rounded-lg overflow-hidden border">
                    <table className={`min-w-full border-separate border-spacing-0 ${tableClassName}`}>
                        <thead className="border-b border-gray-200 dark:border-gray-700">
                            <tr className="bg-gray-100 text-left dark:bg-black">
                                {columns.map((col, index) => (
                                    <th
                                        key={String(col.key)}
                                        className={`px-4 py-2 cursor-pointer select-none border-b border-gray-200 dark:border-gray-800 ${col.className ?? ''}
                                        ${index === 0 ? 'rounded-tl-lg' : ''}
                                        ${index === columns.length - 1 ? 'rounded-tr-lg' : ''}`}
                                        onClick={() => col.sortable && handleSortChange(col.key)}
                                    >
                                        {col.label}
                                        {col.sortable && sortKey === col.key && (
                                            <span className="ml-1 text-sm">
                                        {sortDirection === 'asc' ? '↑' : '↓'}
                                    </span>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-4 text-gray-500">
                                    No data found.
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800">
                                    {columns.map((col, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className={`px-4 py-2
                                    ${rowIndex === sortedData.length - 1 && colIndex === 0 ? 'rounded-bl-lg' : ''}
                                    ${rowIndex === sortedData.length - 1 && colIndex === columns.length - 1 ? 'rounded-br-lg' : ''}`}
                                        >
                                            {renderCell
                                                ? renderCell(col.key, row[col.key], row, rowIndex)
                                                : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-end items-end flex-wrap gap-1 text-sm">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 hover:bg-gray-300 rounded dark:bg-white dark:text-black disabled:opacity-50"
                >
                    Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                        return (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                        );
                    })
                    .reduce<number[]>((acc, page, i, arr) => {
                        if (i > 0 && page - arr[i - 1] > 1) {
                            acc.push(-1); // Ellipsis
                        }
                        acc.push(page);
                        return acc;
                    }, [])
                    .map((page, i) =>
                        page === -1 ? (
                            <span key={`ellipsis-${i}`} className="px-2">...</span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`px-3 py-1 rounded ${currentPage === page
                                        ? 'bg-gray-700 text-white dark:text-white'
                                        : 'bg-gray-200 hover:bg-gray-300 dark:bg-white dark:text-black'
                                    }`}
                            >
                                {page}
                            </button>
                        )
                    )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 hover:bg-gray-300 dark:bg-white dark:text-black rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default Table;
