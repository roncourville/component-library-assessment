"use client";

import React from 'react';
import { GridSchema } from "./types";
import { useRowActions, useDataFiltering, useOutsideClick } from './hooks';
import { SearchBar, DataTable, DeleteSelectedButton, AddRowButton } from './components/UIComponents';

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
    onUpdate
  });
  
  const {
    searchTerm,
    setSearchTerm,
    searchField,
    setSearchField,
    handleSort,
    getSortConfig,
    filteredData
  } = useDataFiltering({
    data,
    gridSchema
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
        />

        <div className="flex gap-2">
          <DeleteSelectedButton
            selectedRows={selectedRows}
            onDelete={onDelete}
            isLoading={isLoading}
          />
          <AddRowButton 
            onAdd={onAdd} 
            isLoading={isLoading} 
          />
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
        onEdit={handleRowAction}
        onDelete={onDelete}
        handleSort={handleSort}
        getSortConfig={getSortConfig}
        searchTerm={searchTerm}
      />
    </div>
  );
}