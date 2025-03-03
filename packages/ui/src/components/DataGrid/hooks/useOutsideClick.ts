import { useEffect, useRef, RefObject } from 'react';
import { GridSchema } from '../types';
import { EditingCell } from './useRowActions';

interface UseOutsideClickProps {
  editingCell: EditingCell | null;
  setEditingCell: (cell: EditingCell | null) => void;
  gridSchema: GridSchema;
  saveCurrentEdit: (rowId: string, key: string) => void;
}

export function useOutsideClick({ 
  editingCell, 
  setEditingCell, 
  gridSchema, 
  saveCurrentEdit 
}: UseOutsideClickProps) {
  const cellRef = useRef<HTMLDivElement>(null);

  // Handle click outside for exiting edit mode
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!editingCell) return; // Do nothing if not editing a cell
      
      const target = event.target as Node;
      
      if (cellRef.current && !cellRef.current.contains(target)) {
        // Check if the click is on a related element like a dropdown
        // This prevents exiting edit mode when interacting with dropdowns or dialog elements
        const isRelatedElement = 
          // Add all possible dropdown/select content containers
          document.querySelector('.select-content')?.contains(target) ||
          document.querySelector('[role="listbox"]')?.contains(target) || // Radix UI select role
          document.querySelector('.popover-content')?.contains(target) ||
          document.querySelector('.command')?.contains(target);
          
        if (isRelatedElement) {
          // Skip exit if clicking on related elements (dropdowns, menus, etc.)
          return;
        }
        
        // Get the column type of the cell being edited
        const column = gridSchema.columns.find(col => col.key === editingCell.key);
        
        // For backward compatibility - check persistCellEditOnBlur flag
        if (column?.config.persistCellEditOnBlur) {
          // Don't exit edit mode or save on outside click
          return;
        }
        
        // If the field is not a saveEvent='change' field, we need to save it on outside click
        // because these fields save their values when clicking outside
        if (column?.config.saveEvent !== 'change') {
          // Save the current edit
          saveCurrentEdit(editingCell.rowId, editingCell.key);
        } 
        // For fields with saveEvent='change', they've already saved their value
        // when the value changed, so we don't need to save again
        
        // Exit edit mode
        setEditingCell(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingCell, gridSchema.columns, saveCurrentEdit, setEditingCell]);

  return cellRef;
}