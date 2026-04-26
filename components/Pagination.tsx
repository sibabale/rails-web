import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, totalCount, onPageChange }) => {
  // Hide pagination if only one page or no results
  if (totalPages <= 1 || totalCount === 0) {
    return null;
  }

  const handlePrevious = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      onPageChange(page + 1);
    }
  };

  return (
    <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 px-6 py-4 dark:bg-black">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={page === 1}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded border transition-colors ${
            page === 1
              ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 border-zinc-200 dark:border-zinc-800 cursor-not-allowed'
              : 'bg-white dark:bg-black text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900'
          }`}
        >
          <span className="material-symbols-sharp shrink-0 !text-[14px] leading-none" aria-hidden>
            chevron_left
          </span>
          Previous
        </button>
        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-500">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={handleNext}
          disabled={page >= totalPages}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded border transition-colors ${
            page >= totalPages
              ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 border-zinc-200 dark:border-zinc-800 cursor-not-allowed'
              : 'bg-white dark:bg-black text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900'
          }`}
        >
          Next
          <span className="material-symbols-sharp shrink-0 !text-[14px] leading-none" aria-hidden>
            chevron_right
          </span>
        </button>
      </div>
      <div className="text-xs font-mono text-zinc-400 dark:text-zinc-600">
        {totalCount} total
      </div>
    </div>
  );
};

export default Pagination;
