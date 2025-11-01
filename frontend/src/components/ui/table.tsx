'use client';

import React from 'react';
import { ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

// Card Components
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

// Table Components
interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full border-collapse bg-white text-sm">{children}</table>
    </div>
  );
};

export const TableHeader: React.FC<TableProps> = ({ children, className = '' }) => {
  return <thead className={className}>{children}</thead>;
};

export const TableBody: React.FC<TableProps> = ({ children, className = '' }) => {
  return <tbody className={className}>{children}</tbody>;
};

export const TableRow: React.FC<TableProps> = ({ children, className = '' }) => {
  return <tr className={`border-b border-gray-100 ${className}`}>{children}</tr>;
};

export const TableHead: React.FC<TableProps & { onClick?: () => void; sortable?: boolean }> = ({
  children,
  className = '',
  onClick,
  sortable = false,
}) => {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${
        sortable ? 'cursor-pointer hover:bg-gray-50' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortable && <ChevronUpDownIcon className="w-4 h-4 text-gray-400" />}
      </div>
    </th>
  );
};

export const TableCell: React.FC<TableProps> = ({ children, className = '' }) => {
  return <td className={`px-4 py-3 whitespace-nowrap ${className}`}>{children}</td>;
};

// Sortable Table Head Component
interface SortableTableHeadProps {
  column: Column;
  onSort: () => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}

const SortableTableHead: React.FC<SortableTableHeadProps> = ({
  column,
  onSort,
  sortKey,
  sortDirection,
}) => {
  const isActive = sortKey === column.key;
  
  const getSortIcon = () => {
    if (!isActive) return <ChevronUpDownIcon className="w-4 h-4 text-gray-400" />;
    return sortDirection === 'asc' ? 
      <ChevronUpIcon className="w-4 h-4 text-gray-700" /> : 
      <ChevronDownIcon className="w-4 h-4 text-gray-700" />;
  };

  return (
    <TableHead
      sortable={column.sortable}
      onClick={column.sortable ? onSort : undefined}
      className={column.className}
    >
      <div className="flex items-center space-x-1">
        <span>{column.label}</span>
        {column.sortable && getSortIcon()}
      </div>
    </TableHead>
  );
};

// Main Table Component
interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (value: any, row: any) => React.ReactNode;
  mobilePriority?: number; // 1 = highest priority (always shown on mobile)
}

interface TableComponentProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  className?: string;
}

export const TableComponent: React.FC<TableComponentProps> = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  onSort,
  sortKey,
  sortDirection,
  className,
}) => {
  const handleSort = (key: string) => {
    if (!onSort || !columns.find(col => col.key === key)?.sortable) return;
    
    let direction: 'asc' | 'desc' = 'asc';
    if (sortKey === key) {
      direction = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    onSort(key, direction);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <Table className={className}>
      <TableHeader className="bg-gray-50">
        <TableRow>
          {columns.map((column) => (
            <SortableTableHead
              key={column.key}
              column={column}
              onSort={() => handleSort(column.key)}
              sortKey={sortKey}
              sortDirection={sortDirection}
            />
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={row.id || index} className="hover:bg-gray-50 transition-colors">
            {columns.map((column) => (
              <TableCell key={column.key} className={column.className}>
                {column.render ? column.render(row[column.key], row) : row[column.key]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// DataTable Component (Your original component)
interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  className?: string;
  mobileView?: 'table' | 'cards' | 'auto'; // auto switches to cards on mobile
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  onSort,
  sortKey,
  sortDirection,
  className,
  mobileView = 'auto',
}) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const displayAsCards = mobileView === 'cards' || (mobileView === 'auto' && isMobile);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (displayAsCards && data.length > 0) {
    const mobileColumns = columns
      .filter(col => col.mobilePriority !== undefined)
      .sort((a, b) => (a.mobilePriority || 99) - (b.mobilePriority || 99))
      .slice(0, 3); // Show top 3 columns on mobile

    return (
      <div className="space-y-4 md:hidden">
        {data.map((row, index) => (
          <Card key={row.id || index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                {mobileColumns.map((column) => (
                  <div key={column.key} className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-500">
                      {column.label}:
                    </span>
                    <span className="text-sm text-gray-900 text-right flex-1 ml-2">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </span>
                  </div>
                ))}
                {/* Actions */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <div className="flex-1">
                    {columns.find(col => col.key === 'status')?.render?.(row.status, row)}
                  </div>
                  <div className="flex space-x-2">
                    {columns
                      .find(col => col.key === 'actions')
                      ?.render?.(null, row)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <TableComponent
      columns={columns}
      data={data}
      loading={loading}
      emptyMessage={emptyMessage}
      onSort={onSort}
      sortKey={sortKey}
      sortDirection={sortDirection}
      className={className}
    />
  );
};

