import React from 'react';
import { Button } from "@workspace/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  pageSize: number;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalItems,
  goToPage,
  nextPage,
  prevPage,
  pageSize,
}) => {
  // Calculate the range of items being displayed
  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page number buttons
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 5; // Maximum number of page buttons to show
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    
    // Adjust startPage if endPage is at max
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    // Add first page button if not included in the range
    if (startPage > 1) {
      pageNumbers.push(
        <Button
          key="page-1"
          variant="ghost"
          size="sm"
          onClick={() => goToPage(1)}
          className="px-3 h-8"
        >
          1
        </Button>
      );
      
      // Add ellipsis if there's a gap
      if (startPage > 2) {
        pageNumbers.push(
          <span key="ellipsis-start" className="px-2">
            ...
          </span>
        );
      }
    }
    
    // Add page number buttons
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={`page-${i}`}
          variant={i === currentPage ? "default" : "ghost"}
          size="sm"
          onClick={() => goToPage(i)}
          className="px-3 h-8"
        >
          {i}
        </Button>
      );
    }
    
    // Add last page button if not included in the range
    if (endPage < totalPages) {
      // Add ellipsis if there's a gap
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span key="ellipsis-end" className="px-2">
            ...
          </span>
        );
      }
      
      pageNumbers.push(
        <Button
          key={`page-${totalPages}`}
          variant="ghost"
          size="sm"
          onClick={() => goToPage(totalPages)}
          className="px-3 h-8"
        >
          {totalPages}
        </Button>
      );
    }
    
    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="text-sm text-gray-500">
        Showing {startItem} to {endItem} of {totalItems} items
      </div>
      
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={prevPage}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center">{renderPageNumbers()}</div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PaginationControls;