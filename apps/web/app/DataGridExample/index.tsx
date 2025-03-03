"use client"
import { useEffect } from 'react';
import { useRowsFetching } from './hooks/useRowsFetching';
import DataGrid from '@workspace/ui/components/DataGrid';
import { Toaster } from '@workspace/ui/components/toaster';
import { gridSchema } from "./schema"
import { ProjectHeader } from "./components/project-header"

export default function Page() {
  const { 
    data, 
    isLoading, 
    loadData, 
    totalCount, 
    totalPages,
    handleAdd,
    handleUpdate,
    handleDelete
  } = useRowsFetching();

  // Initialize data load on first render  
  useEffect(() => {
    loadData({ page: 1, pageSize: 10 });
  }, [loadData]);
  
  return (
    <div className="p-4">
      <ProjectHeader />
      <DataGrid
        data={data}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        isLoading={isLoading}
        gridSchema={gridSchema}
        // Enable server-side pagination
        serverSidePagination={true}
        loadData={loadData}
        totalCount={totalCount}
        totalPages={totalPages}
        pageSize={10}
      />
      <Toaster />
    </div>
  );
}