"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import DataRow from './DataRow';
import { Checkbox } from "@workspace/ui/components/checkbox";
import { ArrowDown, ArrowUp, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { toast } from "@workspace/ui/hooks/use-toast";
import { User } from "@workspace/ui/components/UserPicker/UserPicker";
import { GridSchema } from "./types";

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
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [editingRows, setEditingRows] = React.useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = React.useState<{ rowId: string; key: string } | null>(null);
  const [rowEdits, setRowEdits] = React.useState<Record<string, Record<string, any>>>({});
  const [sortConfigs, setSortConfigs] = React.useState<SortConfig[]>([
    { key: "id", direction: "asc", priority: 1 }, // Default sort is ASC on ID
  ]);

  // Add search state and handlers
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchField, setSearchField] = React.useState("all");

  // Ref for tracking click outside
  const cellRef = React.useRef<HTMLDivElement>(null);

  // Initialize row edits with current data
  React.useEffect(() => {
    const initialEdits: Record<string, Record<string, any>> = {};
    data.forEach((row) => {
      initialEdits[row.id] = { ...row };
    });
    setRowEdits(initialEdits);
  }, [data]);

  // Handle click outside for exiting edit mode
  React.useEffect(() => {
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
  }, [editingCell, gridSchema.columns]);

  const saveCurrentEdit = (rowId: string, key: string) => {
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
  };

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(data.map((row) => row.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  // Update the cell click handler to pass the column key
  const handleCellClick = (rowId: string, key: string) => {
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
  };

  const handleCellChange = (rowId: string, key: string, value: any) => {
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
      
      return;
    }
  };

  // Update the handleCellBlur function to handle all field types appropriately
  const handleCellBlur = (rowId: string, columnKey: string) => {
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
  };

  const handleEditRow = (rowId: string) => {
    setEditingRows((prev) => new Set(prev).add(rowId));
    // Initialize row edits with current values
    const currentRow = data.find((row) => row.id === rowId);
    if (currentRow) {
      setRowEdits((prev) => ({
        ...prev,
        [rowId]: { ...currentRow },
      }));
    }
  };

  // Update the handleSaveRow function to show toast
  const handleSaveRow = (rowId: string) => {
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
  };
  
  // Handle row edit or save action from DataRow
  const handleRowAction = (rowId: string, action: string | any, value?: any) => {
    console.log(`handleRowAction called with rowId=${rowId}, action=${action}, value=`, value);
    
    if (action === 'edit') {
      // Start editing a row
      console.log("Starting row edit mode");
      handleEditRow(rowId);
    } else if (action === 'save') {
      // Save all changes to a row
      console.log("Saving all row edits");
      handleSaveRow(rowId);
    } else if (action === 'cancel') {
      // Cancel editing without saving
      console.log("Canceling row edit mode");
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
    } else {
      // Handle cell edit - in this case, action is the column key
      const key = action;
      console.log(`Cell edit detected: rowId=${rowId}, key=${key}, value=`, value);
      
      // Get the column definition
      const column = gridSchema.columns.find((col) => col.key === key);
      console.log(`Column renderer: ${column?.config.renderer}`);
      
      // We need to update both the UI and backend:
      
      // 1. Update local rowEdits state for UI
      setRowEdits((prev) => {
        // Create a new object to ensure React detects the change
        const newRowData = {
          ...(prev[rowId] || {}),
          [key]: value
        };
        
        const newEdits = {
          ...prev,
          [rowId]: newRowData
        };
        
        console.log(`Updated rowEdits state with new value for ${key}:`, newRowData);
        return newEdits;
      });
      
      // 2. Check if this field should save on change
      if (column?.config.saveEvent === 'change') {
        console.log(`Save on change for ${column.header} field with value:`, value);
        
        // Check if we have the onUpdate callback
        if (onUpdate) {
          console.log(`Calling onUpdate with rowId=${rowId}, field=${key}`);
          
          // Create update object with just the changed field
          const updateData = { [key]: value };
          console.log(`handleRowAction: Calling onUpdate with rowId=${rowId}, field=${key}, value=`, value);
          onUpdate(rowId, updateData);
          
          // Show success message
          toast({
            title: `${column.header} updated`,
          });
          
          // Auto-exit edit mode after a short delay
          setTimeout(() => {
            console.log("Auto-exiting edit mode for change-save field");
            setEditingCell(null);
          }, 300);
        } else {
          console.error("onUpdate callback is undefined");
        }
        return;
      }
      
    }
  };

  // This function checks if a specific cell or row is in edit mode
  const isEditing = (rowId: string, key: string) => {
    return editingRows.has(rowId) || (editingCell?.rowId === rowId && editingCell?.key === key);
  };

  // Handle delete for selected rows
  const handleDeleteSelected = () => {
    // Delete all selected rows
    selectedRows.forEach((id) => {
      onDelete?.(id);
    });

    // Show toast with appropriate message
    toast({
      title: selectedRows.size > 1 ? "Rows deleted" : "Row deleted",
    });

    setSelectedRows(new Set());
  };

  // Handle column sort
  const handleSort = (key: string) => {
    setSortConfigs((prevConfigs) => {
      // Find if this column is already being sorted
      const existingConfigIndex = prevConfigs.findIndex((config) => config.key === key);

      if (existingConfigIndex !== -1) {
        // Column is already being sorted, toggle direction or remove
        const existingConfig = prevConfigs[existingConfigIndex];
        const newConfigs = [...prevConfigs];

        if (existingConfig?.direction === "asc") {
          // Change to desc
          newConfigs[existingConfigIndex] = { ...existingConfig, direction: "desc" };
        } else if (existingConfig?.direction === "desc") {
          // Remove sort
          newConfigs.splice(existingConfigIndex, 1);
          // Update priorities
          return newConfigs.map((config, index) => ({
            ...config,
            priority: index + 1,
          }));
        }

        return newConfigs;
      } else {
        // Add new sort with highest priority
        return [...prevConfigs, { key, direction: "asc", priority: prevConfigs.length + 1 }];
      }
    });
  };

  // Get sort config for a column
  const getSortConfig = (key: string) => {
    return sortConfigs.find((config) => config.key === key);
  };

  // Sort the data based on sort configs
  const sortedData = React.useMemo(() => {
    if (sortConfigs.length === 0) return [...data];

    // Sort by priority
    const sortedConfigs = [...sortConfigs].sort((a, b) => a.priority - b.priority);

    return [...data].sort((a, b) => {
      // Apply each sort config in order of priority
      for (const config of sortedConfigs) {
        const { key, direction } = config;

        if (!direction) continue;

        let valueA = a[key];
        let valueB = b[key];

        // Handle special cases for different column types
        const column = gridSchema.columns.find((col) => col.key === key);

        // Check if this is a user renderer
        const renderer = column?.config.renderer;
        const isUserRenderer = 
          (typeof renderer === 'string' && renderer === 'user') ||
          (typeof renderer !== 'string' && renderer.name === 'UserRenderer');
        
        if (isUserRenderer && Array.isArray(valueA) && Array.isArray(valueB)) {
          // Sort by first user's name
          valueA = valueA.length > 0 ? valueA[0].name : "";
          valueB = valueB.length > 0 ? valueB[0].name : "";
        }

        // Compare values
        if (valueA < valueB) {
          return direction === "asc" ? -1 : 1;
        }
        if (valueA > valueB) {
          return direction === "asc" ? 1 : -1;
        }
      }

      return 0;
    });
  }, [data, sortConfigs]);

  // Add filtered data based on search
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return sortedData;

    return sortedData.filter((row) => {
      if (searchField === "all") {
        // Search in all fields
        return Object.entries(row).some(([key, value]) => {
          // Skip id field and handle different types
          if (key === "id") return false;

          if (key === "assignees" && Array.isArray(value)) {
            // For users, search in names
            return value.some((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
          }

          // For other fields, convert to string and search
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      } else {
        // Search in specific field
        const value = row[searchField];

        if (searchField === "assignees" && Array.isArray(value)) {
          // For users, search in names
          return value.some((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // For other fields, convert to string and search
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      }
    });
  }, [sortedData, searchTerm, searchField]);

  return (
    <div className="space-y-4" ref={cellRef}>
      <div className="flex items-center justify-between">
        <div className="w-full max-w-[600px]">
          <div className="flex">
            <Select value={searchField} onValueChange={setSearchField}>
              <SelectTrigger className="w-[240px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0 border-gray-300">
                <SelectValue placeholder="Search in..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                {gridSchema.columns.map((column) => (
                  <SelectItem key={column.key} value={column.key}>
                    {column.header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder={
                searchField === "all"
                  ? "Search..."
                  : `Search ${gridSchema.columns.find((col) => col.key === searchField)?.header.toLowerCase() || ""}...`
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-l-none focus:ring-0 focus:ring-offset-0 border-gray-300"
            />
          </div>
        </div>

        <div className="flex gap-2">
          {selectedRows.size > 0 && (
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
              disabled={isLoading}
              className="bg-[#635bff] hover:bg-[#4f46e5] text-white"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedRows.size})
            </Button>
          )}
          <Button onClick={onAdd} disabled={isLoading} className="bg-[#635bff] hover:bg-[#4f46e5] text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Row
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm stripe-card">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.size === data.length}
                  onCheckedChange={toggleAll}
                  className="checkbox-stripe"
                />
              </TableHead>
              {gridSchema.columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`cursor-pointer`}
                  style={{ width: column.fixedWidth }}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {getSortConfig(column.key)?.direction === "asc" && <ArrowUp className="h-4 w-4 text-[#635bff]" />}
                    {getSortConfig(column.key)?.direction === "desc" && (
                      <ArrowDown className="h-4 w-4 text-[#635bff]" />
                    )}
                    {getSortConfig(column.key) && (
                      <span className="text-xs text-gray-500 ml-1">{getSortConfig(column.key)?.priority}</span>
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row) => (
              <DataRow
                key={row[gridSchema.uniqueKey]}
                row={rowEdits[row.id] ?? row} // Ensure we're using the edited data when available
                isLoading={isLoading}
                onEdit={handleRowAction}
                onDelete={onDelete}
                columns={gridSchema.columns}
                isChecked={selectedRows.has(row.id)}
                toggleRow={toggleRow}
                isEditing={editingRows.has(row.id)}
                editingCell={editingCell}
                handleCellClick={handleCellClick}
                handleCellBlur={handleCellBlur}
              />
            ))}

            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={gridSchema.columns.length + 2} className="h-24 text-center text-gray-500">
                  {searchTerm ? "No results found." : "No data available."}
                </TableCell>
              </TableRow>
            )}

          </TableBody>
        </Table>
      </div>
    </div>
  );
}