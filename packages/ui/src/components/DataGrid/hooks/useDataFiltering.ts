import { useState, useMemo, useCallback } from 'react';
import { GridSchema } from '../types';

interface UseDataFilteringProps {
  data: Record<string, any>[];
  gridSchema: GridSchema;
  enablePagination?: boolean;
  pageSize?: number;
}

export function useDataFiltering({ 
  data, 
  gridSchema,
  enablePagination = false,
  pageSize = 10
}: UseDataFilteringProps) {
  // For pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Just return the data as is
  const filteredData = useMemo(() => {
    return [...data]; 
  }, [data]);
  
  // Handle pagination
  const paginatedData = useMemo(() => {
    if (!enablePagination) return filteredData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize, enablePagination]);
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    if (!enablePagination) return 1;
    return Math.max(1, Math.ceil(filteredData.length / pageSize));
  }, [filteredData.length, pageSize, enablePagination]);
  
  // Handle page changes
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  }, [totalPages]);
  
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);
  
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  return {
    filteredData: paginatedData,
    // Pagination
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    totalItems: filteredData.length
  };
}