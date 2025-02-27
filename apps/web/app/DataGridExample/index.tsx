"use client"
import { useState, useEffect } from 'react';
import { usePlasmids } from './usePlasmids';
import { useUsers } from './useUsers';
import { useHandlers } from './useHandlers';
// import DataGrid from '../data-grid';
import DataGrid from '@workspace/ui/components/DataGrid';
import { Toaster } from '@workspace/ui/components/toaster';
import { gridSchema } from "./schema"


const plasmidOptions = [
  "GT-plasmids-1: lentiCRISPR v2",
  "GT-plasmids-2: psPAX2",
  "GT-plasmids-3: pMD2.G",
  "GT-plasmids-4: CRISPRoff-v2.1",
  "GT-plasmids-5: pLKO.1",
  "GT-plasmids-6: pLJM1",
  "GT-plasmids-7: pX330",
  "GT-plasmids-8: pX458",
  "GT-plasmids-9: pLenti-CRISPR",
  "GT-plasmids-10: pAAV-CRISPR",
];

export default function Page() {
  const { data, setData, isLoading } = usePlasmids();
  const { users, isLoadingUsers } = useUsers();
  const { handleAdd, handleUpdate, handleDelete } = useHandlers(setData);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.theme = "light";
    }
  }, []);

  return (
    <div className="p-4">
      <DataGrid
        data={data}
        allUsers={users}
        plasmidOptions={plasmidOptions}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        isLoadingUsers={isLoadingUsers}
        isLoading={isLoading}
        gridSchema={gridSchema}
      />
      <Toaster />
    </div>
  );
}