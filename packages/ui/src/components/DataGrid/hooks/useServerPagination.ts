import { useState, useCallback, useEffect } from 'react';
import { DataFetchOptions, DataFetchResult, GridSchema } from "../types";
import { useCachedPages } from './useCachedPages';

interface UseServerPaginationProps {
  data: Record<string, any>[];
  externalIsLoading?: boolean;
  externalTotalCount?: number;
  externalTotalPages?: number;
  loadData?: (options: DataFetchOptions) => Promise<DataFetchResult>;
  serverSidePagination: boolean;
  pageSize: number;
  gridSchema: GridSchema;
  onDataFetched?: (data: Record<string, any>[], page: number) => void;
}

export function useServerPagination({
  data,
  externalIsLoading,
  externalTotalCount,
  externalTotalPages,
  loadData,
  serverSidePagination,
  pageSize,
  gridSchema,
  onDataFetched
}: UseServerPaginationProps) {
  // State for server-side data fetching
  const [internalData, setInternalData] = useState<Record<string, any>[]>(data);
  const [internalTotalCount, setInternalTotalCount] = useState<number>(externalTotalCount || data.length);
  const [internalTotalPages, setInternalTotalPages] = useState<number>(externalTotalPages || Math.ceil(data.length / pageSize));
  const [internalIsLoading, setInternalIsLoading] = useState<boolean>(externalIsLoading || false);
  const [internalCurrentPage, setInternalCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Cache for prefetched pages
  const {
    cachedPages,
    setCachedPages,
    logCacheState,
    prioritizeCachePages
  } = useCachedPages(internalCurrentPage);
  
  // Maximum number of pages to keep in cache
  const MAX_CACHED_PAGES = 10;
  
  // Server-side data fetching function
  const fetchData = useCallback(async (options: DataFetchOptions) => {
    if (!serverSidePagination || !loadData) return;
    
    try {
      // Check if the requested page is already in the cache
      const requestedPage = options.page;
      const isCached = cachedPages[requestedPage] && cachedPages[requestedPage].length > 0;
      const forceRefresh = options.forceRefresh || false;
      const optionsSearchTerm = options.searchTerm !== undefined ? options.searchTerm : searchTerm;
      
      // Always use the most current search term
      if (options.searchTerm === undefined && searchTerm) {
        options.searchTerm = searchTerm;
      }

      // Log before deciding whether to use cache
      console.log(`fetchData: page=${requestedPage}, cached=${isCached}, forceRefresh=${forceRefresh}, searchTerm=${options.searchTerm}`);
      logCacheState();
      
      // Only use cache if not a forced refresh AND search term matches current state
      // This ensures we don't use cached results from a different search
      if (isCached && !forceRefresh && optionsSearchTerm === searchTerm) {
        console.log(`Using cached data for page ${requestedPage} with search term "${searchTerm}"`);
        
        // Use the cached data without showing loading state
        setInternalData(cachedPages[requestedPage]);
        setInternalCurrentPage(requestedPage);
        
        // Notify parent component about data change
        if (onDataFetched) {
          onDataFetched(cachedPages[requestedPage], requestedPage);
        }
        
        return;
      }

      // If not cached, show loading and fetch from server
      setInternalIsLoading(true);
      
      const result = await loadData(options);
      
      // Update current page data
      setInternalData(result.data);
      setInternalTotalCount(result.totalCount);
      setInternalTotalPages(result.totalPages);
      setInternalCurrentPage(result.page);
      
      // Notify parent component about data change
      if (onDataFetched) {
        onDataFetched(result.data, result.page);
      }
      
      // Update the cache with all prefetched pages
      if (result.allPrefetchedData) {
        setCachedPages(prevCache => {
          // Create new cache with the prefetched data
          const newCache = {
            ...prevCache,
            ...result.allPrefetchedData
          };
          
          // If we have more than MAX_CACHED_PAGES, remove the farthest ones
          if (Object.keys(newCache).length > MAX_CACHED_PAGES) {
            return prioritizeCachePages(newCache, options.page, internalTotalPages, MAX_CACHED_PAGES);
          }
          
          return newCache;
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setInternalIsLoading(false);
    }
  }, [loadData, serverSidePagination, cachedPages, internalTotalPages, 
      logCacheState, setCachedPages, prioritizeCachePages, onDataFetched]);
  
  // Handle page change for server pagination
  const serverGoToPage = useCallback((page: number) => {
    if (!serverSidePagination || !loadData) return;
    
    // Check if the requested page is already in the cache
    const isCached = cachedPages[page] && cachedPages[page].length > 0;
    
    if (isCached) {
      // Use cached data immediately without loading state
      setInternalData(cachedPages[page]);
      setInternalCurrentPage(page);
      
      // Notify parent component about data change
      if (onDataFetched) {
        onDataFetched(cachedPages[page], page);
      }
      
      // Check if we need to prefetch the surrounding pages - SKIP prefetching if in search mode
      if (searchTerm) {
        console.log(`Skipping prefetch for search results with term "${searchTerm}"`);
        return; // Don't prefetch when searching
      }
      
      // For regular pagination (no search), prefetch surrounding pages
      const surroundingPages = [page - 2, page - 1, page + 1, page + 2].filter(p => p > 0);
      const needPrefetch = surroundingPages.some(pageNum => {
        if (pageNum > internalTotalPages) return false;
        return !cachedPages[pageNum] || cachedPages[pageNum].length === 0;
      });
      
      if (needPrefetch) {
        console.log(`Prefetching pages around ${page}`);
        
        // Fetch surrounding pages in the background without loading state
        loadData({
          page, // Use current page as center for prefetching window
          pageSize, 
          searchTerm // Include current search term to maintain consistency
        }).then(result => {
          if (result.allPrefetchedData) {
            setCachedPages(prevCache => {
              // Combine existing cache with new prefetched data
              const newCache = {
                ...prevCache,
                ...result.allPrefetchedData
              };
              
              // Apply cache size limit if needed
              if (Object.keys(newCache).length > MAX_CACHED_PAGES) {
                return prioritizeCachePages(newCache, page, internalTotalPages, MAX_CACHED_PAGES);
              }
              
              return newCache;
            });
          }
        }).catch(err => {
          console.error('Background prefetch failed:', err);
        });
      }
    } else {
      // If not cached, fetch with loading state
      // Update internal page state first
      setInternalCurrentPage(page);
      
      // Fetch the requested page 
      fetchData({
        page,
        pageSize,
        searchTerm, // Include current search term
        prefetchAdjacentPages: !searchTerm // Only prefetch if not in search mode
      });
    }
  }, [fetchData, pageSize, loadData, serverSidePagination, internalTotalPages, 
      cachedPages, setCachedPages, prioritizeCachePages, onDataFetched, searchTerm]);
  
  // Handle next page for server pagination
  const serverNextPage = useCallback(() => {
    if (internalCurrentPage < internalTotalPages) {
      serverGoToPage(internalCurrentPage + 1);
    }
  }, [internalCurrentPage, internalTotalPages, serverGoToPage]);
  
  // Handle previous page for server pagination
  const serverPrevPage = useCallback(() => {
    if (internalCurrentPage > 1) {
      serverGoToPage(internalCurrentPage - 1);
    }
  }, [internalCurrentPage, serverGoToPage]);
  
  // Initialize data fetching on mount
  useEffect(() => {
    if (serverSidePagination && loadData) {
      console.log("Initial data fetch on mount");
      fetchData({
        page: 1,
        pageSize,
        searchTerm: '', // Start with empty search
        prefetchAdjacentPages: true // Enable prefetching for initial load
      });
    }
  }, [serverSidePagination, loadData]); // Only run on mount and when these core dependencies change
  
  // Handle searching
  const handleSearch = useCallback((term: string) => {
    // Only proceed if the term is different
    if (term === searchTerm) return;
    
    console.log(`Search changed from "${searchTerm}" to "${term}"`);
    
    // Reset to first page when searching
    if (loadData) {
      // Before fetching, indicate loading
      setInternalIsLoading(true);
      
      // Clear cache when search term changes
      setCachedPages({});
      
      // Update search term state - AFTER we've checked against the previous value
      setSearchTerm(term);
      
      // Reset to page 1
      setInternalCurrentPage(1);
      
      try {
        // Directly call loadData to avoid any recursive loops through fetchData
        loadData({
          page: 1,
          pageSize,
          searchTerm: term,
          forceRefresh: true,
          prefetchAdjacentPages: false // Disable prefetching for search to simplify results
        }).then(result => {
          // Update data from the search results
          setInternalData(result.data);
          setInternalTotalCount(result.totalCount);
          setInternalTotalPages(result.totalPages);
          setInternalIsLoading(false);
        }).catch(err => {
          console.error("Search error:", err);
          setInternalIsLoading(false);
        });
      } catch (error) {
        console.error("Error during search:", error);
        setInternalIsLoading(false);
      }
    }
  }, [pageSize, loadData, setCachedPages, searchTerm]);

  return {
    internalData,
    internalTotalCount,
    internalTotalPages,
    internalIsLoading,
    internalCurrentPage,
    cachedPages,
    fetchData,
    serverGoToPage,
    serverNextPage,
    serverPrevPage,
    searchTerm,
    handleSearch
  };
}