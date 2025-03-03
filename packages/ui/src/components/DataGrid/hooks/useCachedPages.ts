import { useState, useCallback } from 'react';

export function useCachedPages(currentPage: number) {
  // Cache for prefetched pages (page number → page data)
  const [cachedPages, setCachedPages] = useState<Record<number, Record<string, any>[]>>({});
  
  // Debug function to log cache state
  const logCacheState = useCallback(() => {
    const cacheKeys = Object.keys(cachedPages).sort((a, b) => Number(a) - Number(b));
    console.log('Current cache state:', {
      pages: cacheKeys,
      currentPage,
      itemsPerPage: cacheKeys.map(page => ({
        page,
        items: cachedPages[Number(page)]?.length || 0
      }))
    });
  }, [cachedPages, currentPage]);

  // Helper to prioritize and prune cache pages
  const prioritizeCachePages = useCallback((
    newCache: Record<number, Record<string, any>[]>,
    currentPage: number,
    totalPages: number,
    maxCachedPages: number
  ) => {
    console.log('Cache exceeds maximum size, pruning distant pages');
    
    // Strategy: Keep the current page, the next two pages, and 
    // fill the rest with pages closest to the current page
    
    // These pages we always want to keep (current and next 2)
    const priorityPages = new Set([
      currentPage, 
      currentPage + 1, 
      currentPage + 2
    ].filter(p => p <= totalPages)); // Don't keep if beyond max pages
    
    // Add previous pages if we have room
    if (priorityPages.size < maxCachedPages && currentPage > 1) {
      priorityPages.add(currentPage - 1);
    }
    if (priorityPages.size < maxCachedPages && currentPage > 2) {
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
    let remainingSlots = maxCachedPages - priorityPages.size;
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
  }, []);

  return {
    cachedPages,
    setCachedPages,
    logCacheState,
    prioritizeCachePages
  };
}