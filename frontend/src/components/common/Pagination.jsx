import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage,
  filteredCount 
}) {
  if (totalPages <= 1 && filteredCount === 0) return null;

  // Logic to calculate visible page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const startIdx = filteredCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, filteredCount);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-2 pt-6 border-t border-gray-50 dark:border-gray-800">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 sm:mb-0">
        Showing {startIdx} to {endIdx} of {filteredCount} entries
        {filteredCount !== totalItems && ` (filtered from ${totalItems})`}
      </p>
      <div className="flex items-center gap-1">
        <button 
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <ChevronLeft size={16} className="sm:hidden" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {getPageNumbers().map((page, idx) => (
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-gray-400">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 flex items-center justify-center text-sm rounded-full transition-colors ${
                currentPage === page 
                  ? 'bg-[#1A7A4A] text-white font-bold' 
                  : 'text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          )
        ))}

        <button 
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} className="sm:hidden" />
        </button>
      </div>
    </div>
  );
}
