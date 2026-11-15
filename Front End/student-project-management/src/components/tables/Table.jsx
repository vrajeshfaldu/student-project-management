import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Pagination } from '../common/Pagination';
import { EmptyState } from '../common/EmptyState';

export const Table = ({
  columns = [],
  data = [],
  keyField = 'id',
  isLoading = false,
  itemsPerPage = 5,
  showPagination = true,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no items to display right now.'
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (!field) return;
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sorted Data
  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (typeof aVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
  });

  // Display Data (Paginated vs All)
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const displayData = showPagination
    ? sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : sortedData;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse font-sans">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-extrabold text-gray-600 uppercase tracking-wider">
              {columns.map((col, index) => {
                const isRight = col.headerClassName?.includes('text-right');
                const isLeft = col.headerClassName?.includes('text-left');
                const alignClass = isRight ? 'text-right' : isLeft ? 'text-left' : 'text-center';

                return (
                  <th
                    key={col.field || index}
                    className={`py-3.5 px-4 font-bold text-gray-600 select-none ${alignClass} ${col.headerClassName || ''}`}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.field)}
                        className={`inline-flex items-center gap-1.5 hover:text-gray-900 transition cursor-pointer font-bold ${
                          alignClass === 'text-right'
                            ? 'ml-auto'
                            : alignClass === 'text-center'
                            ? 'mx-auto'
                            : ''
                        }`}
                      >
                        {col.header}
                        {sortField === col.field ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-60 hover:opacity-100" />
                        )}
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-xs sm:text-sm font-sans">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-gray-500 font-medium font-sans">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : displayData.length > 0 ? (
              displayData.map((row, rowIndex) => (
                <tr
                  key={row[keyField] || rowIndex}
                  className="hover:bg-indigo-50/30 transition-colors font-sans"
                >
                  {columns.map((col, colIndex) => {
                    const isRight = col.headerClassName?.includes('text-right');
                    const isLeft = col.headerClassName?.includes('text-left');
                    const isCentered = !isRight && !isLeft;

                    return (
                      <td
                        key={colIndex}
                        className={`py-4 px-4 text-gray-700 font-medium ${
                          isRight ? 'text-right' : isLeft ? 'text-left' : 'text-center'
                        } ${col.className || ''}`}
                      >
                        {isCentered ? (
                          <div className="flex items-center justify-center">
                            {col.render ? col.render(row, rowIndex) : row[col.field]}
                          </div>
                        ) : col.render ? (
                          col.render(row, rowIndex)
                        ) : (
                          row[col.field]
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center font-sans">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showPagination && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
};
