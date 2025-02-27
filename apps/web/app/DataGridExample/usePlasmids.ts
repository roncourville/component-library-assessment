import { useState, useEffect } from 'react';
import { fetchPlasmids } from '../../lib/supabase-utils';
import { toast } from '@workspace/ui/hooks/use-toast';
import type { Plasmid } from '../../data-grid';

export function usePlasmids() {
  const [data, setData] = useState<Plasmid[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadPlasmids = async () => {
      setIsLoading(true);
      try {
        const plasmids = await fetchPlasmids() as Plasmid[];
        setData(plasmids);
      } catch (error) {
        console.error("Error fetching plasmids:", error);
        toast({
          title: "Error",
          description: "Failed to load plasmids",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPlasmids();
  }, []);

  return { data, setData, isLoading };
}