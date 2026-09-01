import React, { useEffect, useMemo, useState } from 'react';

type SortDirection = 'asc' | 'desc';

type TableColumn<T> = {
    label: string;
    key: keyof T;
    sortable?: boolean;
    className?: string;
};

type TablePaginationProps<T> = {
    data: T[];
    columns: TableColumn<T>[];
    searchableKeys?: (keyof T)[];
    renderCell?: (key: keyof T, value: any, row: T, index: number) => React.ReactNode;
    className?: string;
    tableClassName?: string;
};

function TablePagination<T extends Record<string, any>>({
                                                            data,
                                                            columns,
                                                            searchableKeys = [],
                                                            renderCell,
                                                            className = '',
                                                            tableClassName = '',
                                                        }: TablePaginationProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortKey, setSortKey] = useState<keyof T | ''>('');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        return data.filter((row) =>
            searchableKeys.some((key) =>
                String(row[key] ?? '')
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            )
        );
    }, [data, searchTerm, searchableKeys]);

    const sortedData = useMemo(() => {
        if (!sortKey) return filteredData;
        return [...filteredData].sort((a, b) => {
            const valA = String(a[sortKey] ?? '');
            const valB = String(b[sortKey] ?? '');
            return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        });
    }, [filteredData, sortKey, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return sortedData.slice(start, start + rowsPerPage);
    }, [sortedData, currentPage, rowsPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, rowsPerPage, sortKey, sortDirection]);

    const handleSortChange = (key: keyof T) => {
        if (sortKey === key) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const startItem = (currentPage - 1) * rowsPerPage + 1;
    const endItem = Math.min(startItem + rowsPerPage - 1, sortedData.length);

    return (
        <div className={`w-full ${className}`}>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <div className="flex gap-2 items-center">
                    <label className="text-sm text-gray-600">Rows per page:</label>
                    <select
                        value={rowsPerPage}
                        onChange={(e) => setRowsPerPage(Number(e.target.value))}
                        className="border px-2 py-1 rounded dark:bg-black "
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border px-3 py-1 rounded w-full sm:w-auto"
                />
            </div>

            <div className="text-sm text-gray-600 my-2">
                Showing {paginatedData.length > 0 ? `${startItem} to ${endItem}` : '0'} of {filteredData.length} entries
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className={`min-w-full border ${tableClassName}`}>
                    <thead>
                    <tr className="bg-gray-100 text-left dark:bg-black">
                        {columns.map((col) => (
                            <th
                                key={String(col.key)}
                                className={`px-4 py-2 cursor-pointer select-none ${col.className ?? ''}`}
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
                    {paginatedData.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="text-center py-4 text-gray-500">
                                No data found.
                            </td>
                        </tr>
                    ) : (
                        paginatedData.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-t hover:bg-gray-50 hover:bg-gray-300 dark:hover:bg-black">
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className="px-4 py-2">
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

            {/* Pagination */}
            <div className="mt-4 flex justify-end items-end flex-wrap gap-1 text-sm">
                <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 hover:bg-gray-300 rounded dark:bg-white dark:text-black disabled:opacity-50"
                >
                    Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                        // Show first, last, current, and nearby pages
                        return (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                        );
                    })
                    .reduce<number[]>((acc, page, i, arr) => {
                        // Insert ellipsis (-1) where pages are skipped
                        if (i > 0 && page - arr[i - 1] > 1) {
                            acc.push(-1); // represents ellipsis
                        }
                        acc.push(page);
                        return acc;
                    }, [])
                    .map((page, i) =>
                            page === -1 ? (
                                <span key={`ellipsis-${i}`} className="px-2">
                    ...
                </span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded ${
                                        currentPage === page
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 hover:bg-gray-300 dark:bg-white dark:text-black'
                                    }`}
                                >
                                    {page}
                                </button>
                            )
                    )}

                <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 hover:bg-gray-300 dark:bg-white dark:text-black rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>


        </div>
    );
}

export default TablePagination;
