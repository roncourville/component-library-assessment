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
    handleUpdate,
    handleDelete
  } = useRowsFetching();

  const pageSize = 10;

  useEffect(() => {
    loadData({ page: 1, pageSize: pageSize });
  }, [loadData]);
  
  return (
    <div className="p-4">
      <ProjectHeader />
      <DataGrid
        data={data}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        isLoading={isLoading}
        gridSchema={gridSchema}
        // Enable server-side pagination
        serverSidePagination={true}
        loadData={loadData}
        totalCount={totalCount}
        totalPages={totalPages}
        pageSize={pageSize}
      />
      <Toaster />
    </div>
  );
}