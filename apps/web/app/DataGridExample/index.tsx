"use client"
import { useState, useEffect } from 'react';
import { usePlasmids } from './hooks/usePlasmids';
import { useHandlers } from './hooks/useHandlers';
import DataGrid from '@workspace/ui/components/DataGrid';
import { Toaster } from '@workspace/ui/components/toaster';
import { gridSchema } from "./schema"

export default function Page() {
  const { data, setData, isLoading } = usePlasmids();
  const { handleAdd, handleUpdate, handleDelete } = useHandlers(setData);
  
  return (
    <div className="p-4">
      <DataGrid
        data={data}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        isLoading={isLoading}
        gridSchema={gridSchema}
      />
      <Toaster />
      
    </div>
  );
}