import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  const pages = [];
  const showEllipsis = totalPages > 7;

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
  }

  return (
    <div className={cn('flex items-center justify-between px-4 py-3 sm:px-6', className)}>
      <div className="flex justify-between sm:justify-start items-center space-x-2 w-full sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        <div className="hidden sm:flex space-x-1">
          {pages.map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              className={cn(
                'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                page === currentPage
                  ? 'bg-green-600 text-white'
                  : typeof page === 'number'
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-gray-400 cursor-default'
              )}
              disabled={page === '...'}
            >
              {page}
            </button>
          ))}
        </div>

        <div className="flex sm:hidden text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};