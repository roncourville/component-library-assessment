import { useState } from 'react';
import { addPlasmid, updatePlasmid, deletePlasmid } from '../../../lib/supabase-utils';
import { toast } from '@workspace/ui/hooks/use-toast';
import type { Plasmid } from '../../types/data.types';

export function useHandlers(setData: React.Dispatch<React.SetStateAction<Plasmid[]>>) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (rowId: string, updatedData: any) => {
    setIsLoading(true);
    try {
      await updatePlasmid(rowId, updatedData);
      setData((currentData) => currentData.map((row) => (row.id === rowId ? { ...row, ...updatedData } : row)));
      toast({
        title: "Row updated",
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
  };

  const handleDelete = async (rowId: string) => {
    setIsLoading(true);
    try {
      await deletePlasmid(rowId);
      setData((currentData) => currentData.filter((row) => row.id !== rowId));
      toast({
        title: "Row deleted",
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
  };

  return { handleUpdate, handleDelete, isLoading };
}