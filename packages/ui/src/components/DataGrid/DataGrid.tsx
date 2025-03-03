"use client";

import React, { useEffect, useCallback } from 'react';
import { DataFetchOptions, DataFetchResult, GridSchema } from "./types";
import { useRowActions, useDataFiltering, useOutsideClick } from './hooks';
import { DataTable, DeleteSelectedButton, PaginationControls, CacheStatus } from './components/UIComponents';
// Import hooks used in this component
import { useServerPagination } from './hooks/useServerPagination';

interface Plasmid {
  id: string;
  name: string;
  [key: string]: any;
}

interface DataGridProps {
  data?: Record<string, any>[];
  onUpdate?: (rowId: string, data: Record<string, any>) => void;
  onDelete?: (rowId: string) => void;
  isLoading?: boolean;
  loadingText?: string;
  emptyStateMessage?: string;
  enablePagination?: boolean;
  pageSize?: number;
  disableEditMode?: boolean;
  disableDelete?: boolean;
  hideActionsColumn?: boolean;
  gridSchema: GridSchema;
  onEdit?: (id: string, data?: Record<string, any>) => void;
  
  // Server-side pagination props
  loadData?: (options: DataFetchOptions) => Promise<DataFetchResult>;
  serverSidePagination?: boolean;
  totalCount?: number;
  totalPages?: number;
}

export default function DataGrid({
  data = [],
  isLoading: externalIsLoading,
  loadingText,
  emptyStateMessage = "No data available.",
  enablePagination = true,
  pageSize = 10,
  disableEditMode = false,
  disableDelete = false,
  hideActionsColumn = false,
  onEdit,
  onDelete,
  gridSchema,
  onUpdate,
  // Server-side pagination props
  loadData,
  serverSidePagination = true,
  totalCount: externalTotalCount,
  totalPages: externalTotalPages,
}: DataGridProps) {
  // Use the server-side pagination hook to manage data fetching and caching
  const {
    internalData,
    internalTotalCount,
    internalTotalPages,
    internalIsLoading,
    internalCurrentPage,
    cachedPages,
    fetchData,
    serverGoToPage,
    serverNextPage,
    serverPrevPage
  } = useServerPagination({
    data,
    externalIsLoading,
    externalTotalCount,
    externalTotalPages,
    loadData,
    serverSidePagination,
    pageSize,
    gridSchema
  });
  
  // Determine if we're using the internal or external loading state
  const isLoading = serverSidePagination ? internalIsLoading : externalIsLoading;

  // Set up row actions for editing, selecting, etc.
  const {
    selectedRows,
    editingRows,
    editingCell,
    rowEdits,
    setEditingCell,
    toggleRow,
    toggleAll,
    handleCellClick,
    handleCellChange,
    handleCellBlur,
    handleEditRow,
    handleSaveRow,
    handleCancelRow,
    saveCurrentEdit
  } = useRowActions({
    data: serverSidePagination ? internalData : data,
    gridSchema,
    onUpdate,
    disableEditMode
  });
  
  // Set up client-side filtering and pagination
  const {
    filteredData,
    currentPage,
    totalPages: clientTotalPages,
    goToPage: clientGoToPage,
    nextPage: clientNextPage,
    prevPage: clientPrevPage,
    totalItems: clientTotalItems
  } = useDataFiltering({
    data: serverSidePagination ? internalData : data,
    gridSchema,
    enablePagination: serverSidePagination ? false : enablePagination, 
    pageSize
  });
  
  // Ref for tracking click outside
  const cellRef = useOutsideClick({
    editingCell,
    setEditingCell,
    gridSchema,
    saveCurrentEdit
  });
  
  // Handle row edit or save action from DataRow
  const handleRowAction = (rowId: string, action: string | any, value?: any) => {
    if (action === 'edit') {
      handleEditRow(rowId);
    } else if (action === 'save') {
      handleSaveRow(rowId);
    } else if (action === 'cancel') {
      handleCancelRow(rowId);
    } else {
      // Handle cell edit - in this case, action is the column key
      handleCellChange(rowId, action, value);
    }
  };
  
  // Handle row deletion with data refresh
  const handleRowDelete = useCallback((rowId: string) => {
    if (onDelete) {
      // Call the provided onDelete handler
      onDelete(rowId);
      
      // After deleting a row, refresh data if using server-side pagination
      if (serverSidePagination && loadData) {
        // Small timeout to allow the delete operation to complete
        setTimeout(() => {
          fetchData({
            page: internalCurrentPage,
            pageSize,
            forceRefresh: true // Force refresh to bypass cache after deletion
          });
        }, 100);
      }
    }
  }, [onDelete, serverSidePagination, loadData, fetchData, internalCurrentPage, pageSize]);

  // Define pagination controls based on pagination type
  const paginationProps = serverSidePagination
    ? {
        currentPage: internalCurrentPage,
        totalPages: internalTotalPages,
        totalItems: internalTotalCount,
        goToPage: serverGoToPage,
        nextPage: serverNextPage,
        prevPage: serverPrevPage,
        pageSize
      }
    : {
        currentPage,
        totalPages: clientTotalPages,
        totalItems: clientTotalItems,
        goToPage: clientGoToPage, 
        nextPage: clientNextPage,
        prevPage: clientPrevPage,
        pageSize
      };
  
  return (
    <div className="space-y-4" ref={cellRef}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {serverSidePagination && (
            <CacheStatus 
              cachedPages={cachedPages} 
              currentPage={internalCurrentPage} 
              totalPages={internalTotalPages} 
            />
          )}
        </div>

        <div className="flex gap-2">
          <DeleteSelectedButton
            selectedRows={selectedRows}
            onDelete={onDelete}
            isLoading={isLoading}
            disableDelete={disableDelete}
          />
        </div>
      </div>

      <DataTable
        data={serverSidePagination ? internalData : filteredData}
        columns={gridSchema.columns}
        rowEdits={rowEdits}
        uniqueKey={gridSchema.uniqueKey}
        selectedRows={selectedRows}
        toggleRow={toggleRow}
        toggleAll={toggleAll}
        editingRows={editingRows}
        editingCell={editingCell}
        handleCellClick={handleCellClick}
        handleCellBlur={handleCellBlur}
        isLoading={isLoading}
        loadingText={loadingText}
        onEdit={handleRowAction}
        onDelete={handleRowDelete}
        emptyStateMessage={emptyStateMessage}
        disableDelete={disableDelete}
        hideActionsColumn={hideActionsColumn}
        disableEditMode={disableEditMode}
      />
      
      {enablePagination && (
        <PaginationControls
          currentPage={paginationProps.currentPage}
          totalPages={paginationProps.totalPages}
          totalItems={paginationProps.totalItems}
          goToPage={paginationProps.goToPage}
          nextPage={paginationProps.nextPage}
          prevPage={paginationProps.prevPage}
          pageSize={paginationProps.pageSize}
        />
      )}
    </div>
  );
}