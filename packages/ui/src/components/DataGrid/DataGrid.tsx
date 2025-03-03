"use client";

import React, { useEffect } from 'react';
import { DataFetchOptions, DataFetchResult, GridSchema } from "./types";
import { useRowActions, useDataFiltering, useOutsideClick } from './hooks';
import { SearchBar, DataTable, DeleteSelectedButton, AddRowButton, PaginationControls } from './components/UIComponents';

interface Plasmid {
  id: string;
  name: string;
  [key: string]: any;
}

interface DataGridProps {
  data?: Record<string, any>[];
  onAdd?: (newData: Plasmid) => Promise<void>;
  onUpdate?: (rowId: string, data: Record<string, any>) => void;
  onDelete?: (rowId: string) => void;
  isLoading?: boolean;
  loadingText?: string;
  emptyStateMessage?: string;
  enableSearch?: boolean;
  enableSorting?: boolean;
  searchPlaceholder?: string;
  enablePagination?: boolean;
  pageSize?: number;
  disableEditMode?: boolean;
  disableAddRow?: boolean;
  disableDelete?: boolean;
  hideActionsColumn?: boolean;
  addRowButtonText?: string;
  gridSchema: GridSchema;
  onEdit?: (id: string, data?: Record<string, any>) => void;
  
  // Server-side pagination props
  loadData?: (options: DataFetchOptions) => Promise<DataFetchResult>;
  serverSidePagination?: boolean;
  totalCount?: number;
  totalPages?: number;
}

type SortDirection = "asc" | "desc" | null;
type SortConfig = {
  key: string;
  direction: SortDirection;
  priority: number;
};

export default function DataGrid({
  data = [],
  isLoading: externalIsLoading,
  loadingText,
  emptyStateMessage = "No data available.",
  enableSearch = true,
  enableSorting = true,
  searchPlaceholder = "Search...",
  enablePagination = true,
  pageSize = 10,
  disableEditMode = false,
  disableAddRow = false,
  disableDelete = false,
  hideActionsColumn = false,
  addRowButtonText,
  onEdit,
  onDelete,
  gridSchema,
  onAdd,
  onUpdate,
  // Server-side pagination props
  loadData,
  serverSidePagination = false,
  totalCount: externalTotalCount,
  totalPages: externalTotalPages,
}: DataGridProps) {
  // State for server-side data fetching
  const [internalData, setInternalData] = React.useState<Record<string, any>[]>(data);
  const [internalTotalCount, setInternalTotalCount] = React.useState<number>(externalTotalCount || data.length);
  const [internalTotalPages, setInternalTotalPages] = React.useState<number>(externalTotalPages || Math.ceil(data.length / pageSize));
  const [internalIsLoading, setInternalIsLoading] = React.useState<boolean>(externalIsLoading || false);
  // Track the current page internally to avoid dependency issues
  const [internalCurrentPage, setInternalCurrentPage] = React.useState<number>(1);
  
  // Cache for prefetched pages (page number → page data)
  const [cachedPages, setCachedPages] = React.useState<Record<number, Record<string, any>[]>>({});
  // Maximum number of pages to keep in cache
  const MAX_CACHED_PAGES = 10;
  
  // Determine if we're using the internal or external loading state
  const isLoading = serverSidePagination ? internalIsLoading : externalIsLoading;

  // Use the non-server version of this hook for client-side data operations
  const {
    selectedRows,
    editingRows,
    editingCell,
    rowEdits,
    setEditingCell,
    toggleRow,
    toggleAll,
    handleCellClick,
    handleCellChange,
    handleCellBlur,
    handleEditRow,
    handleSaveRow,
    handleCancelRow,
    saveCurrentEdit
  } = useRowActions({
    data: serverSidePagination ? internalData : data,
    gridSchema,
    onUpdate,
    disableEditMode
  });
  
  const {
    searchTerm,
    setSearchTerm,
    searchField,
    setSearchField,
    handleSort,
    getSortConfig,
    filteredData,
    currentPage,
    totalPages: clientTotalPages,
    goToPage: clientGoToPage,
    nextPage: clientNextPage,
    prevPage: clientPrevPage,
    totalItems: clientTotalItems,
    sortConfigs,
    setSortConfigs
  } = useDataFiltering({
    data: serverSidePagination ? internalData : data,
    gridSchema,
    enableSorting,
    enablePagination: serverSidePagination ? false : enablePagination, // Disable client pagination if server pagination is enabled
    pageSize
  });
  
  // Ref for tracking click outside
  const cellRef = useOutsideClick({
    editingCell,
    setEditingCell,
    gridSchema,
    saveCurrentEdit
  });
  
  // Debug function to log cache state
  const logCacheState = React.useCallback(() => {
    const cacheKeys = Object.keys(cachedPages).sort((a, b) => Number(a) - Number(b));
    console.log('Current cache state:', {
      pages: cacheKeys,
      currentPage: internalCurrentPage,
      itemsPerPage: cacheKeys.map(page => ({
        page,
        items: cachedPages[Number(page)]?.length || 0
      }))
    });
  }, [cachedPages, internalCurrentPage]);

  // Server-side data fetching function
  const fetchData = React.useCallback(async (options: DataFetchOptions) => {
    if (!serverSidePagination || !loadData) return;
    
    try {
      // Check if the requested page is already in the cache
      const requestedPage = options.page;
      const isCached = cachedPages[requestedPage] && cachedPages[requestedPage].length > 0;
      
      logCacheState();
      console.log(`Page ${requestedPage} cached:`, isCached);
      
      if (isCached) {
        console.log(`Using cached data for page ${requestedPage}`);
        // Use the cached data without showing loading state
        setInternalData(cachedPages[requestedPage]);
        setInternalCurrentPage(requestedPage);
        return;
      }
      
      // If not cached, show loading and fetch from server
      setInternalIsLoading(true);
      console.log('Fetching data with options:', options);
      const result = await loadData(options);
      console.log('Fetched data result:', result);
      
      // Update current page data
      setInternalData(result.data);
      setInternalTotalCount(result.totalCount);
      setInternalTotalPages(result.totalPages);
      setInternalCurrentPage(result.page);
      
      // Update the cache with all prefetched pages
      if (result.allPrefetchedData) {
        console.log('Updating cache with prefetched data');
        setCachedPages(prevCache => {
          // Create new cache with the prefetched data
          const newCache = {
            ...prevCache,
            ...result.allPrefetchedData
          };
          
          // If we have more than MAX_CACHED_PAGES, remove the farthest ones
          if (Object.keys(newCache).length > MAX_CACHED_PAGES) {
            console.log('Cache exceeds maximum size, pruning distant pages');
            
            // Strategy: Keep the current page, the next two pages, and 
            // fill the rest with pages closest to the current page
            const currentPage = options.page;
            
            // These pages we always want to keep (current and next 2)
            const priorityPages = new Set([
              currentPage, 
              currentPage + 1, 
              currentPage + 2
            ].filter(p => p <= internalTotalPages)); // Don't keep if beyond max pages
            
            // Add previous pages if we have room
            if (priorityPages.size < MAX_CACHED_PAGES && currentPage > 1) {
              priorityPages.add(currentPage - 1);
            }
            if (priorityPages.size < MAX_CACHED_PAGES && currentPage > 2) {
              priorityPages.add(currentPage - 2);
            }
            
            // Convert keys to numbers and sort by distance from current page
            // for the remaining slots
            const cachedPagesList = Object.keys(newCache)
              .map(Number)
              .filter(pageNum => !priorityPages.has(pageNum))
              .map(pageNum => ({
                page: pageNum,
                distance: Math.abs(pageNum - currentPage)
              }))
              .sort((a, b) => a.distance - b.distance);
            
            // Add remaining closest pages until we reach the limit
            let remainingSlots = MAX_CACHED_PAGES - priorityPages.size;
            for (const item of cachedPagesList) {
              if (remainingSlots <= 0) break;
              priorityPages.add(item.page);
              remainingSlots--;
            }
            
            // Create a new cache with only the pages to keep
            const prunedCache: Record<number, Record<string, any>[]> = {};
            Array.from(priorityPages).forEach(pageNum => {
              if (newCache[pageNum]) {
                prunedCache[pageNum] = newCache[pageNum];
              }
            });
            
            // Log what happened
            const removedPages = Object.keys(newCache).map(Number)
              .filter(pageNum => !prunedCache[pageNum]);
              
            console.log(`Pruned cache from ${Object.keys(newCache).length} to ${Object.keys(prunedCache).length} pages.`);
            console.log(`Keeping: ${Object.keys(prunedCache).sort((a, b) => Number(a) - Number(b))}`);
            console.log(`Removed: ${removedPages.sort((a, b) => a - b)}`);
            
            return prunedCache;
          }
          
          return newCache;
        });
      }
      
      console.log('Updated internal state:', {
        dataLength: result.data.length,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.page,
        cachedPages: result.allPrefetchedData ? Object.keys(result.allPrefetchedData) : 'none'
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setInternalIsLoading(false);
    }
  }, [loadData, serverSidePagination, cachedPages]);
  
  // Handle page change for server pagination
  const serverGoToPage = React.useCallback((page: number) => {
    if (!serverSidePagination || !loadData) return;
    
    // Get primary sort column and direction
    const primarySort = sortConfigs[0] || { key: gridSchema.uniqueKey, direction: 'asc' as const };
    
    console.log(`Changing to page ${page} with sort:`, primarySort);
    
    // Check if the requested page is already in the cache
    const isCached = cachedPages[page] && cachedPages[page].length > 0;
    
    if (isCached) {
      console.log(`Page ${page} is cached, using cached data without loading animation`);
      
      // Use cached data immediately without loading state
      setInternalData(cachedPages[page]);
      setInternalCurrentPage(page);
      
      // Check if we need to prefetch the surrounding pages (±2 pages)
      const surroundingPages = [page - 2, page - 1, page + 1, page + 2].filter(p => p > 0);
      const needPrefetch = surroundingPages.some(pageNum => {
        // Skip if beyond total pages
        if (pageNum > internalTotalPages) return false;
        // Check if page is not in cache
        return !cachedPages[pageNum] || cachedPages[pageNum].length === 0;
      });
      
      if (needPrefetch) {
        console.log(`Prefetching pages around ${page} in the background`);
        // Fetch surrounding pages in the background without loading state
        loadData({
          page, // Use current page as center for prefetching window
          pageSize,
          searchTerm: searchTerm || undefined,
          sortColumn: primarySort.key,
          sortDirection: primarySort.direction as 'asc' | 'desc' || 'asc'
        }).then(result => {
          if (result.allPrefetchedData) {
            console.log('Background prefetch successful, updating cache');
            setCachedPages(prevCache => {
              // Combine existing cache with new prefetched data
              const newCache = {
                ...prevCache,
                ...result.allPrefetchedData
              };
              
              // Apply cache size limit if needed
              if (Object.keys(newCache).length > MAX_CACHED_PAGES) {
                // Prioritize current page and adjacent pages
                const currentPage = page;
                
                // Priority pages to keep (current page and surrounding ±2 pages)
                const priorityPages = new Set([
                  currentPage,      // Current page is highest priority
                  currentPage + 1,  // Next page
                  currentPage - 1,  // Previous page
                  currentPage + 2,  // Two pages ahead
                  currentPage - 2   // Two pages behind
                ].filter(p => p > 0 && p <= internalTotalPages));
                
                // Sort remaining pages by distance from current page
                const otherPages = Object.keys(newCache)
                  .map(Number)
                  .filter(pageNum => !priorityPages.has(pageNum))
                  .map(pageNum => ({
                    page: pageNum,
                    distance: Math.abs(pageNum - currentPage)
                  }))
                  .sort((a, b) => a.distance - b.distance);
                
                // Fill remaining slots with closest pages
                const remainingSlots = MAX_CACHED_PAGES - priorityPages.size;
                for (let i = 0; i < Math.min(remainingSlots, otherPages.length); i++) {
                  priorityPages.add(otherPages[i].page);
                }
                
                // Create pruned cache with only priority pages
                const prunedCache: Record<number, Record<string, any>[]> = {};
                Array.from(priorityPages).forEach(pageNum => {
                  if (newCache[pageNum]) {
                    prunedCache[pageNum] = newCache[pageNum];
                  }
                });
                
                console.log(`Background prefetch: pruned cache from ${Object.keys(newCache).length} to ${Object.keys(prunedCache).length} pages`);
                return prunedCache;
              }
              
              return newCache;
            });
            logCacheState();
          }
        }).catch(err => {
          console.error('Background prefetch failed:', err);
        });
      }
    } else {
      // If not cached, fetch with loading state
      console.log(`Page ${page} not cached, fetching with loading animation`);
      
      // Update internal page state first
      setInternalCurrentPage(page);
      
      // Fetch the requested page and prefetch next pages
      fetchData({
        page,
        pageSize,
        searchTerm: searchTerm || undefined,
        sortColumn: primarySort.key,
        sortDirection: primarySort.direction as 'asc' | 'desc' || 'asc'
      });
    }
  }, [fetchData, pageSize, searchTerm, gridSchema.uniqueKey, sortConfigs, loadData,
      serverSidePagination, internalTotalPages, cachedPages, logCacheState]);
  
  // Handle next page for server pagination
  const serverNextPage = React.useCallback(() => {
    console.log('serverNextPage called. Current page:', internalCurrentPage, 'Total pages:', internalTotalPages);
    if (internalCurrentPage < internalTotalPages) {
      console.log('Going to next page:', internalCurrentPage + 1);
      serverGoToPage(internalCurrentPage + 1);
    }
  }, [internalCurrentPage, internalTotalPages, serverGoToPage]);
  
  // Handle previous page for server pagination
  const serverPrevPage = React.useCallback(() => {
    console.log('serverPrevPage called. Current page:', internalCurrentPage);
    if (internalCurrentPage > 1) {
      console.log('Going to previous page:', internalCurrentPage - 1);
      serverGoToPage(internalCurrentPage - 1);
    }
  }, [internalCurrentPage, serverGoToPage]);
  
  // Define pagination controls based on whether we're using server-side pagination
  const paginationProps = serverSidePagination
    ? {
        currentPage: internalCurrentPage, // Use the internal page state for server-side pagination
        totalPages: internalTotalPages,
        totalItems: internalTotalCount,
        goToPage: serverGoToPage,
        nextPage: serverNextPage,
        prevPage: serverPrevPage,
        pageSize
      }
    : {
        currentPage,
        totalPages: clientTotalPages,
        totalItems: clientTotalItems,
        goToPage: clientGoToPage, 
        nextPage: clientNextPage,
        prevPage: clientPrevPage,
        pageSize
      };
      
  // Initialize data fetching on mount
  useEffect(() => {
    if (serverSidePagination && loadData) {
      // Get primary sort column and direction
      const primarySort = sortConfigs[0] || { key: gridSchema.uniqueKey, direction: 'asc' as const };
      
      console.log('Initial data fetch with currentPage:', currentPage);
      fetchData({
        page: currentPage,
        pageSize,
        searchTerm: searchTerm || undefined,
        sortColumn: primarySort.key,
        sortDirection: primarySort.direction as 'asc' | 'desc' || 'asc'
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount, all other updates will be handled explicitly
  
  // Clear cache when search or sort changes
  useEffect(() => {
    if (serverSidePagination) {
      console.log('Search or sort criteria changed, clearing page cache');
      setCachedPages({});
    }
  }, [searchTerm, sortConfigs, serverSidePagination]);


  // Handle row edit or save action from DataRow
  const handleRowAction = (rowId: string, action: string | any, value?: any) => {
    console.log(`handleRowAction called with rowId=${rowId}, action=${action}, value=`, value);
    
    if (action === 'edit') {
      // Start editing a row
      handleEditRow(rowId);
    } else if (action === 'save') {
      // Save all changes to a row
      handleSaveRow(rowId);
    } else if (action === 'cancel') {
      // Cancel editing without saving
      handleCancelRow(rowId);
    } else {
      // Handle cell edit - in this case, action is the column key
      handleCellChange(rowId, action, value);
    }
  };

  // Log cache state whenever the component renders (helpful for debugging)
  React.useEffect(() => {
    logCacheState();
  }, [internalCurrentPage, cachedPages, logCacheState]);
  
  // Small debug component to show cache status
  const CacheStatus = () => {
    const cachedPagesList = Object.keys(cachedPages).map(Number).sort((a, b) => a - b);
    const cachedPagesCount = cachedPagesList.length;
    const currentPageCached = cachedPages[internalCurrentPage] && cachedPages[internalCurrentPage].length > 0;
    
    // Check for previous and next pages in cache
    const prevPagesInCache = [internalCurrentPage-2, internalCurrentPage-1]
      .filter(p => p > 0)
      .filter(p => cachedPages[p] && cachedPages[p].length > 0);
      
    const nextPagesInCache = [internalCurrentPage+1, internalCurrentPage+2]
      .filter(p => p <= internalTotalPages)
      .filter(p => cachedPages[p] && cachedPages[p].length > 0);
    
    return (
      <div className="text-xs text-gray-500 bg-gray-100 p-1 rounded">
        <div>Cache: {cachedPagesCount}/10 pages [{cachedPagesList.join(', ')}]</div>
        <div>Current: {internalCurrentPage} {currentPageCached ? '✅' : '❌'} | 
             Prev: {prevPagesInCache.length}/{Math.min(internalCurrentPage-1, 2)} | 
             Next: {nextPagesInCache.length}/{Math.min(internalTotalPages-internalCurrentPage, 2)}
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-4" ref={cellRef}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchField={searchField}
            setSearchField={setSearchField}
            gridSchema={gridSchema}
            searchPlaceholder={searchPlaceholder}
            enableSearch={enableSearch}
          />
          {serverSidePagination && <CacheStatus />}
        </div>

        <div className="flex gap-2">
          <DeleteSelectedButton
            selectedRows={selectedRows}
            onDelete={onDelete}
            isLoading={isLoading}
            disableDelete={disableDelete}
          />
          {!disableAddRow && (
            <AddRowButton 
              onAdd={onAdd} 
              isLoading={isLoading}
              buttonText={addRowButtonText}
            />
          )}
        </div>
      </div>

      <DataTable
        data={serverSidePagination ? internalData : filteredData}
        columns={gridSchema.columns}
        rowEdits={rowEdits}
        uniqueKey={gridSchema.uniqueKey}
        selectedRows={selectedRows}
        toggleRow={toggleRow}
        toggleAll={toggleAll}
        editingRows={editingRows}
        editingCell={editingCell}
        handleCellClick={handleCellClick}
        handleCellBlur={handleCellBlur}
        isLoading={isLoading}
        loadingText={loadingText}
        onEdit={handleRowAction}
        onDelete={onDelete}
        handleSort={serverSidePagination 
          ? (column: string) => {
              console.log('Server-side sorting for column:', column);
              
              // First, check if the column is sortable
              const columnDef = gridSchema.columns.find(col => col.key === column);
              if (columnDef && columnDef.sortable === false) {
                console.log('Column is not sortable:', column);
                return;
              }
              
              // Get the current direction for this column
              const currentConfig = getSortConfig(column);
              // Toggle direction or default to asc
              const newDirection = !currentConfig 
                ? 'asc' 
                : currentConfig.direction === 'asc' 
                  ? 'desc' 
                  : 'asc';
                  
              console.log(`Sorting by ${column} ${newDirection}`);
              
              // Update the sort configuration in the UI
              const newSortConfig: SortConfig[] = [{
                key: column,
                direction: newDirection,
                priority: 1
              }];
              
              // Update UI sort state first
              setSortConfigs(newSortConfig);
              
              try {
                // Call fetchData with the sorting parameters
                fetchData({
                  page: currentPage,
                  pageSize,
                  searchTerm: searchTerm || undefined,
                  sortColumn: column,
                  sortDirection: newDirection as 'asc' | 'desc'
                });
              } catch (error) {
                console.error('Error during sorting:', error);
              }
            }
          : handleSort}
        getSortConfig={getSortConfig}
        searchTerm={searchTerm}
        emptyStateMessage={emptyStateMessage}
        disableDelete={disableDelete}
        hideActionsColumn={hideActionsColumn}
        disableEditMode={disableEditMode}
      />
      
      {enablePagination && (
        <PaginationControls
          currentPage={paginationProps.currentPage}
          totalPages={paginationProps.totalPages}
          totalItems={paginationProps.totalItems}
          goToPage={paginationProps.goToPage}
          nextPage={paginationProps.nextPage}
          prevPage={paginationProps.prevPage}
          pageSize={paginationProps.pageSize}
        />
      )}
    </div>
  );
}