"use client";

import React from 'react';
import { GridSchema } from "./types";
import { useRowActions, useDataFiltering, useOutsideClick } from './hooks';
import { SearchBar, DataTable, DeleteSelectedButton, AddRowButton, PaginationControls } from './components/UIComponents';

interface Plasmid {
  id: string;
  name: string;
  [key: string]: any;
}

interface DataGridProps {
  data: Record<string, any>[];
  onAdd?: (newData: Plasmid) => Promise<void>;
  onUpdate?: (rowId: string, data: Record<string, any>) => void;
  onDelete?: (rowId: string) => void;
  isLoading?: boolean;
  loadingText?: string;
  emptyStateMessage?: string;
  enableSearch?: boolean;
  enableSorting?: boolean;
  searchPlaceholder?: string;
  enablePagination?: boolean;
  pageSize?: number;
  disableEditMode?: boolean;
  disableAddRow?: boolean;
  disableDelete?: boolean;
  hideActionsColumn?: boolean;
  addRowButtonText?: string;
  gridSchema: GridSchema;
  onEdit?: (id: string, data?: Record<string, any>) => void;
}

type SortDirection = "asc" | "desc" | null;
type SortConfig = {
  key: string;
  direction: SortDirection;
  priority: number;
};

export default function DataGrid({
  data,
  isLoading,
  loadingText,
  emptyStateMessage = "No data available.",
  enableSearch = true,
  enableSorting = true,
  searchPlaceholder = "Search...",
  enablePagination = false,
  pageSize = 10,
  disableEditMode = false,
  disableAddRow = false,
  disableDelete = false,
  hideActionsColumn = false,
  addRowButtonText,
  onEdit,
  onDelete,
  gridSchema,
  onAdd,
  onUpdate,
}: DataGridProps) {
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
    data,
    gridSchema,
    onUpdate,
    disableEditMode
  });
  
  const {
    searchTerm,
    setSearchTerm,
    searchField,
    setSearchField,
    handleSort,
    getSortConfig,
    filteredData,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    totalItems
  } = useDataFiltering({
    data,
    gridSchema,
    enableSorting,
    enablePagination,
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
    console.log(`handleRowAction called with rowId=${rowId}, action=${action}, value=`, value);
    
    if (action === 'edit') {
      // Start editing a row
      handleEditRow(rowId);
    } else if (action === 'save') {
      // Save all changes to a row
      handleSaveRow(rowId);
    } else if (action === 'cancel') {
      // Cancel editing without saving
      handleCancelRow(rowId);
    } else {
      // Handle cell edit - in this case, action is the column key
      handleCellChange(rowId, action, value);
    }
  };

  return (
    <div className="space-y-4" ref={cellRef}>
      <div className="flex items-center justify-between">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchField={searchField}
          setSearchField={setSearchField}
          gridSchema={gridSchema}
          searchPlaceholder={searchPlaceholder}
          enableSearch={enableSearch}
        />

        <div className="flex gap-2">
          <DeleteSelectedButton
            selectedRows={selectedRows}
            onDelete={onDelete}
            isLoading={isLoading}
            disableDelete={disableDelete}
          />
          {!disableAddRow && (
            <AddRowButton 
              onAdd={onAdd} 
              isLoading={isLoading}
              buttonText={addRowButtonText}
            />
          )}
        </div>
      </div>

      <DataTable
        data={filteredData}
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
        onDelete={onDelete}
        handleSort={handleSort}
        getSortConfig={getSortConfig}
        searchTerm={searchTerm}
        emptyStateMessage={emptyStateMessage}
        disableDelete={disableDelete}
        hideActionsColumn={hideActionsColumn}
        disableEditMode={disableEditMode}
      />
      
      {enablePagination && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          goToPage={goToPage}
          nextPage={nextPage}
          prevPage={prevPage}
          pageSize={pageSize}
        />
      )}
    </div>
  );
}