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
        const isRelatedElement = document.querySelector('.select-content')?.contains(target) ||
          document.querySelector('.popover-content')?.contains(target) ||
          document.querySelector('.command')?.contains(target);
          
        if (isRelatedElement) {
          // Skip exit if clicking on related elements (dropdowns, menus, etc.)
          return;
        }
        
        // Get the column type of the cell being edited
        const column = gridSchema.columns.find(col => col.key === editingCell.key);
        
        // Check if this field should save on change instead of blur
        if (column?.config.saveEvent === 'change') {
          // For fields that save on change, just exit edit mode without saving again
          setEditingCell(null);
          return;
        }
        
        // For backward compatibility - check persistCellEditOnBlur flag
        if (column?.config.persistCellEditOnBlur) {
          // Don't exit edit mode or save on outside click
          return;
        }
        
        // For backward compatibility, check renderer types
        const renderer = column?.config.renderer;
        const isTagOrUser = 
          (typeof renderer === 'string' && (renderer === 'tag' || renderer === 'user')) ||
          (typeof renderer !== 'string' && (renderer.name === 'TagRenderer' || renderer.name === 'UserRenderer'));
          
        // For standard fields, save on click outside
        if (!isTagOrUser) {
          saveCurrentEdit(editingCell.rowId, editingCell.key);
        }
        
        // Exit edit mode for any field type when clicking outside (unless configured not to)
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