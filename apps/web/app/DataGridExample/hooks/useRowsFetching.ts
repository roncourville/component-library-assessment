import { useState, useCallback } from 'react';
import { fetchRows, addPlasmid, updatePlasmid, deletePlasmid } from '../../../lib/supabase-utils';
import { toast } from '@workspace/ui/hooks/use-toast';
import type { Plasmid } from '../../types/data.types';
import { DataFetchOptions, DataFetchResult } from '@workspace/ui/components/DataGrid/types';

export function useRowsFetching() {
  const [data, setData] = useState<Plasmid[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Server-side data loading function
  const loadData = useCallback(async (options: DataFetchOptions): Promise<DataFetchResult> => {
    setIsLoading(true);
    
    try {
      console.log('useRowsFetching.loadData called with options:', options);
      const result = await fetchRows(options);
      console.log('useRowsFetching.loadData result:', result);
      
      // Update internal state
      setData(result.data as Plasmid[]);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      
      return result;
    } catch (error) {
      console.error("Error fetching plasmids:", error);
      toast({
        title: "Error",
        description: "Failed to load plasmids",
        variant: "destructive",
      });
      
      // Return a minimal result to avoid errors
      return {
        data: [],
        totalCount: 0,
        totalPages: 1,
        page: options.page,
        pageSize: options.pageSize
      };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Handle row addition with refetch
  const handleAdd = useCallback(async (newPlasmid: Plasmid) => {
    setIsLoading(true);
    try {
      await addPlasmid(newPlasmid);
      // Refetch data to get the updated list (disable prefetching on CRUD operations to refresh cache)
      await loadData({ 
        page: 1, 
        pageSize: 10,
        prefetchAdjacentPages: false // Force a complete refresh after adding
      });
      toast({
        title: "Success",
        description: "Plasmid added successfully",
      });
    } catch (error) {
      console.error("Error adding plasmid:", error);
      toast({
        title: "Error",
        description: "Failed to add plasmid",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);
  
  // Handle row update with refetch
  const handleUpdate = useCallback(async (id: string, updatedData: Record<string, any>) => {
    setIsLoading(true);
    try {
      await updatePlasmid(id, updatedData);
      // Refetch data to get the updated list (disable prefetching on CRUD operations to refresh cache)
      await loadData({ 
        page: 1, 
        pageSize: 10,
        prefetchAdjacentPages: false 
      });
      toast({
        title: "Success",
        description: "Plasmid updated successfully",
      });
    } catch (error) {
      console.error("Error updating plasmid:", error);
      toast({
        title: "Error",
        description: "Failed to update plasmid",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);
  
  // Handle row deletion with refetch
  const handleDelete = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await deletePlasmid(id);
      // Refetch data to get the updated list (disable prefetching on CRUD operations to refresh cache)
      await loadData({ 
        page: 1, 
        pageSize: 10,
        prefetchAdjacentPages: false
      });
      toast({
        title: "Success",
        description: "Plasmid deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting plasmid:", error);
      toast({
        title: "Error",
        description: "Failed to delete plasmid",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  return { 
    data, 
    setData, 
    isLoading, 
    loadData, 
    totalCount, 
    totalPages,
    handleAdd,
    handleUpdate,
    handleDelete
  };
}