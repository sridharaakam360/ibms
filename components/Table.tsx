import React, { useState, useMemo } from 'react';

export interface Column<T> {
  header: string | React.ReactNode;
  accessorKey?: keyof T;
  render?: (row: T) => React.ReactNode;
  className?: string; 
  headerClassName?: string;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowsPerPage?: number;
  keyExtractor: (row: T) => string | number;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}

const Table = <T,>({ 
  columns, 
  data, 
  rowsPerPage = 10, 
  keyExtractor, 
  emptyMessage = "No data found",
  searchable = false,
  searchPlaceholder = "Search..."
}: TableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: number | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

  // 1. Filtering
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerTerm = searchTerm.toLowerCase();
    
    return data.filter(row => {
      // Simple search: check all string/number values in the row
      return Object.values(row as any).some(val => 
        String(val).toLowerCase().includes(lowerTerm)
      );
    });
  }, [data, searchTerm]);

  // 2. Sorting
  const sortedData = useMemo(() => {
    if (sortConfig.key === null) return filteredData;
    
    const colIndex = sortConfig.key;
    const column = columns[colIndex];
    const direction = sortConfig.direction === 'asc' ? 1 : -1;

    return [...filteredData].sort((a, b) => {
        if (column.sortFn) {
            return column.sortFn(a, b) * direction;
        }
        
        const aVal = column.accessorKey ? a[column.accessorKey] : '';
        const bVal = column.accessorKey ? b[column.accessorKey] : '';

        if (aVal === bVal) return 0;
        // Handle undefined/null
        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;
        
        return aVal > bVal ? direction : -direction;
    });
  }, [filteredData, sortConfig, columns]);

  // 3. Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
  
  // Reset page when data/search changes
  useMemo(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [sortedData.length, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSort = (index: number) => {
      if (!columns[index].sortable) return;
      
      let direction: 'asc' | 'desc' = 'asc';
      if (sortConfig.key === index && sortConfig.direction === 'asc') {
          direction = 'desc';
      }
      setSortConfig({ key: index, direction });
  };

  return (
    <div className="w-full flex flex-col">
      {searchable && (
          <div className="mb-4 relative">
             <input 
                type="text" 
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64 text-sm" 
             />
             <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
      )}

      <div className="overflow-x-auto w-full scrollbar-hide">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  onClick={() => handleSort(idx)}
                  className={`py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider ${col.headerClassName || ''} ${col.sortable ? 'cursor-pointer hover:bg-gray-50 select-none' : ''}`}
                >
                  <div className="flex items-center gap-1">
                      {col.header}
                      {col.sortable && (
                          <span className="text-gray-300">
                              {sortConfig.key === idx ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                          </span>
                      )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentData.map((row, rowIndex) => (
              <tr key={keyExtractor(row) || rowIndex} className="hover:bg-gray-50/50 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`py-3 px-4 text-sm ${col.className || ''}`}>
                    {col.render 
                      ? col.render(row) 
                      : (col.accessorKey ? String(row[col.accessorKey] ?? '') : '')}
                  </td>
                ))}
              </tr>
            ))}
            {currentData.length === 0 && (
               <tr>
                 <td colSpan={columns.length} className="py-8 text-center text-gray-400 text-sm">{emptyMessage}</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {sortedData.length > rowsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 border-t border-gray-50 px-2 gap-4">
          <p className="text-xs text-gray-500">
            Showing <span className="font-bold">{startIndex + 1}</span> to <span className="font-bold">{Math.min(startIndex + rowsPerPage, sortedData.length)}</span> of <span className="font-bold">{sortedData.length}</span> entries
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="hidden sm:flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
                    .map((page, i, arr) => (
                        <React.Fragment key={page}>
                            {i > 0 && arr[i-1] !== page - 1 && <span className="px-2 text-gray-400 self-center">...</span>}
                            <button
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${currentPage === page ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                {page}
                            </button>
                        </React.Fragment>
                    ))
                }
            </div>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;