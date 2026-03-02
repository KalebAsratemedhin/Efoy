import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const Pagination = ({ currentPage, totalPages, onPageChange }: {currentPage: number, totalPages: number, onPageChange: (page: number) => void}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    } 
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <motion.button
          key={i}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(i)}
          className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors
            ${currentPage === i 
              ? 'bg-purple-600 text-white shadow-md' 
              : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
            }`}
        >
          {i}
        </motion.button>
      );
    }

    if (startPage > 1) {
      pages.unshift(
        <motion.button
          key="start"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(1)}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600"
        >
          1
        </motion.button>,
        <span key="start-ellipsis" className="px-2 text-gray-400">...</span>
      );
    }

    if (endPage < totalPages) {
      pages.push(
        <span key="end-ellipsis" className="px-2 text-gray-400">...</span>,
        <motion.button
          key="end"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(totalPages)}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600"
        >
          {totalPages}
        </motion.button>
      );
    }

    return pages;
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${currentPage === 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
            }`}
        >
          <ChevronLeftIcon className="h-5 w-5" />
          <span className="ml-1">Previous</span>
        </motion.button>

        <div className="flex items-center gap-1">
          {renderPageNumbers()}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${currentPage === totalPages 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
            }`}
        >
          <span className="mr-1">Next</span>
          <ChevronRightIcon className="h-5 w-5" />
        </motion.button>
      </div>

      <span className="text-sm text-gray-500">
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
};

export default Pagination;

