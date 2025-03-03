import React from 'react';

interface CacheStatusProps { 
  cachedPages: Record<number, Record<string, any>[]>
  currentPage: number
  totalPages: number
}

/**
 * Debug component that displays the current cache status
 */
const CacheStatus = ({ 
  cachedPages, 
  currentPage, 
  totalPages 
}: CacheStatusProps) => {
  const cachedPagesList = Object.keys(cachedPages).map(Number).sort((a, b) => a - b);
  const cachedPagesCount = cachedPagesList.length;
  const currentPageCached = cachedPages[currentPage] && cachedPages[currentPage].length > 0;
  
  // Check for previous and next pages in cache
  const prevPagesInCache = [currentPage-2, currentPage-1]
    .filter(p => p > 0)
    .filter(p => cachedPages[p] && cachedPages[p].length > 0);
    
  const nextPagesInCache = [currentPage+1, currentPage+2]
    .filter(p => p <= totalPages)
    .filter(p => cachedPages[p] && cachedPages[p].length > 0);
  
  return (
    <div className="text-xs text-gray-500 bg-gray-100 p-1 rounded">
      <div>Cache: {cachedPagesCount}/10 pages [{cachedPagesList.join(', ')}]</div>
      <div>Current: {currentPage} {currentPageCached ? '✅' : '❌'} | 
           Prev: {prevPagesInCache.length}/{Math.min(currentPage-1, 2)} | 
           Next: {nextPagesInCache.length}/{Math.min(totalPages-currentPage, 2)}
      </div>
    </div>
  );
};

export default CacheStatus;