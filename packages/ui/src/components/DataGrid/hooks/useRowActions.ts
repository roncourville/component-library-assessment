import { useState, useEffect, useCallback } from 'react';
import { toast } from "@workspace/ui/hooks/use-toast";
import { GridSchema } from "../types";

interface UseRowActionsProps {
  data: Record<string, any>[];
  gridSchema: GridSchema;
  onUpdate?: (rowId: string, data: Record<string, any>) => void;
  disableEditMode?: boolean;
}

export interface EditingCell {
  rowId: string;
  key: string;
}

export function useRowActions({ data, gridSchema, onUpdate, disableEditMode = false }: UseRowActionsProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [rowEdits, setRowEdits] = useState<Record<string, Record<string, any>>>({});

  // Initialize row edits with current data
  useEffect(() => {
    const initialEdits: Record<string, Record<string, any>> = {};
    data.forEach((row) => {
      initialEdits[row.id] = { ...row };
    });
    setRowEdits(initialEdits);
  }, [data]);

  const saveCurrentEdit = useCallback((rowId: string, key: string) => {
    if (!editingRows.has(rowId)) {
      const updatedData = rowEdits[rowId];
      const originalRow = data.find((row) => row.id === rowId);

      if (updatedData && originalRow) {
        // Check if the value has actually changed
        const hasChanged = JSON.stringify(updatedData[key]) !== JSON.stringify(originalRow[key]);

        if (hasChanged) {
          // For cell-level edits, only send the changed field
          const changeData = { [key]: updatedData[key] };
          onUpdate?.(rowId, changeData);
          
          // Find the column to display its name in the toast
          const column = gridSchema.columns.find(col => col.key === key);
          toast({
            title: column ? `${column.header} updated` : "Field updated",
          });
        }
      }
    }
  }, [rowEdits, editingRows, data, gridSchema.columns, onUpdate]);

  const toggleRow = useCallback((id: string) => {
    setSelectedRows((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  }, []);

  const toggleAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(data.map((row) => row.id)));
    } else {
      setSelectedRows(new Set());
    }
  }, [data]);

  const handleCellClick = useCallback((rowId: string, key: string) => {
    // If edit mode is disabled, don't allow cell editing
    if (disableEditMode) return;
    
    // Get the column definition
    const column = gridSchema.columns.find((col) => col.key === key);
    
    // Don't enable editing for link renderer or columns with editDisabled
    if (column && !column.editDisabled) {
      // Check if it's a link renderer (by name or by type)
      const isLinkRenderer = 
        (typeof column.config.renderer === 'string' && column.config.renderer === 'link') ||
        (typeof column.config.renderer !== 'string' && column.config.renderer.name === 'LinkRenderer');
        
      if (!isLinkRenderer) {
        // If we're already editing this cell, do nothing
        if (editingCell?.rowId === rowId && editingCell?.key === key) {
          return;
        }
        
        // If we're editing a different cell, save that one first
        if (editingCell && (editingCell.rowId !== rowId || editingCell.key !== key)) {
          saveCurrentEdit(editingCell.rowId, editingCell.key);
        }
        
        // Set the new cell as the active editing cell
        setEditingCell({ rowId, key });
      }
    }
  }, [gridSchema.columns, editingCell, saveCurrentEdit, disableEditMode]);

  const handleCellChange = useCallback((rowId: string, key: string, value: any) => {
    console.log(`DataGrid.handleCellChange: rowId=${rowId}, key=${key}, value=`, value);
    
    setRowEdits((prev) => ({
      ...prev,
      [rowId]: {
        ...(prev[rowId] || {}),
        [key]: value,
      },
    }));

    // Get the column definition
    const column = gridSchema.columns.find((col) => col.key === key);
    console.log(`DataGrid.handleCellChange: column saveEvent=${column?.config.saveEvent}`);
    
    // Check if this field should save on change
    if (column?.config.saveEvent === 'change') {
      console.log(`DataGrid.handleCellChange: Processing saveEvent=change for column ${key}`);
      
      const originalRow = data.find((row) => row.id === rowId);
      const updatedValue = value;
      
      console.log(`DataGrid.handleCellChange: Original value=`, originalRow?.[key], `New value=`, updatedValue);
      
      // Always update for tag and user fields
      const renderer = column.config.renderer;
      const isTagOrUser = 
        (typeof renderer === 'string' && (renderer === 'tag' || renderer === 'user')) ||
        (typeof renderer !== 'string' && (renderer.name === 'TagRenderer' || renderer.name === 'UserRenderer'));
      
      // Check if value has changed
      const valueChanged = originalRow && JSON.stringify(updatedValue) !== JSON.stringify(originalRow[key]);
      
      if (isTagOrUser || valueChanged) {
        console.log(`DataGrid.handleCellChange: Saving change for ${column.header}`);
        
        // For immediate fields, send just the changed field to the update handler
        const changeData = { [key]: updatedValue };
        
        if (onUpdate) {
          onUpdate(rowId, changeData);
          toast({
            title: `${column.header} updated`,
          });
        } else {
          console.error("DataGrid.handleCellChange: onUpdate callback is undefined");
        }
      } else {
        console.log(`DataGrid.handleCellChange: No change detected for ${column.header}`);
      }
    }
  }, [data, gridSchema.columns, onUpdate]);

  const handleCellBlur = useCallback((rowId: string, columnKey: string) => {
    // Only proceed if we're editing a single cell (not a whole row)
    if (editingCell && editingCell.rowId === rowId && !editingRows.has(rowId)) {
      const column = gridSchema.columns.find((col) => col.key === columnKey);
      
      // Check if this field should save on change instead of blur
      if (column?.config.saveEvent === 'change') {
        // For fields that save on change, just exit edit mode without saving again
        setTimeout(() => {
          // Using setTimeout to avoid immediate blur when clicking within the component
          // This gives time for click events to process first
          setEditingCell(null);
        }, 200);
        return;
      }
      
      // For backward compatibility - check persistCellEditOnBlur
      if (column?.config.persistCellEditOnBlur) {
        // Don't exit edit mode or save on blur
        return;
      }
      
      // For tag and user fields (backward compatibility), we don't save on blur (they save on change)
      // but we do need to exit edit mode
      const renderer = column?.config.renderer;
      const isTagOrUser = 
        (typeof renderer === 'string' && (renderer === 'tag' || renderer === 'user')) ||
        (typeof renderer !== 'string' && (renderer.name === 'TagRenderer' || renderer.name === 'UserRenderer'));
      
      if (isTagOrUser) {
        // Just exit edit mode without saving again
        setTimeout(() => {
          // Using setTimeout to avoid immediate blur when clicking within the component
          // This gives time for click events to process first
          setEditingCell(null);
        }, 200);
        return;
      }
      
      // For other field types, save and exit edit mode
      saveCurrentEdit(rowId, columnKey);
      setEditingCell(null);
    }
  }, [editingCell, editingRows, gridSchema.columns, saveCurrentEdit]);

  const handleEditRow = useCallback((rowId: string) => {
    // If edit mode is disabled, don't allow row editing
    if (disableEditMode) return;
    
    setEditingRows((prev) => new Set(prev).add(rowId));
    // Initialize row edits with current values
    const currentRow = data.find((row) => row.id === rowId);
    if (currentRow) {
      setRowEdits((prev) => ({
        ...prev,
        [rowId]: { ...currentRow },
      }));
    }
  }, [data, disableEditMode]);

  const handleSaveRow = useCallback((rowId: string) => {
    const updatedData = rowEdits[rowId];
    const originalRow = data.find((row) => row.id === rowId);

    if (updatedData && originalRow) {
      // Check if any values have changed
      let hasChanges = false;

      for (const key in updatedData) {
        if (JSON.stringify(updatedData[key]) !== JSON.stringify(originalRow[key])) {
          hasChanges = true;
          break;
        }
      }

      if (hasChanges) {
        onUpdate?.(rowId, updatedData);
        toast({
          title: "Row updated",
        });
      }
    }

    setEditingRows((prev) => {
      const next = new Set(prev);
      next.delete(rowId);
      return next;
    });

    setEditingCell(null);
  }, [data, rowEdits, onUpdate]);

  const handleCancelRow = useCallback((rowId: string) => {
    // Just exit edit mode without saving changes
    setEditingRows((prev) => {
      const next = new Set(prev);
      next.delete(rowId);
      return next;
    });
    
    // Reset rowEdits state to original values for this row
    setRowEdits((prev) => {
      const originalRow = data.find((row) => row.id === rowId);
      if (originalRow) {
        return {
          ...prev,
          [rowId]: { ...originalRow }
        };
      }
      return prev;
    });
    
    setEditingCell(null);
  }, [data]);

  const isEditing = useCallback((rowId: string, key: string) => {
    return editingRows.has(rowId) || (editingCell?.rowId === rowId && editingCell?.key === key);
  }, [editingRows, editingCell]);

  return {
    selectedRows,
    setSelectedRows,
    editingRows,
    editingCell,
    setEditingCell,
    rowEdits,
    setRowEdits,
    saveCurrentEdit,
    toggleRow,
    toggleAll,
    handleCellClick,
    handleCellChange,
    handleCellBlur,
    handleEditRow,
    handleSaveRow,
    handleCancelRow,
    isEditing
  };
}