import React from 'react';
import { TableRow, TableCell } from '@workspace/ui/components/table';
import EditButton from './RowActions/EditButton';
import DeleteButton from './RowActions/DeleteButton';
import SaveButton from './RowActions/SaveButton';
import CancelButton from './RowActions/CancelButton';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { ColumnDefinition } from './types';
import { CellRenderer } from './cell-renderer';

interface DataRowProps {
    row: any;
    isLoading: boolean;
    onEdit: (id: string, action?: string | any, value?: any) => void;
    onDelete?: (id: string) => void;
    columns: ColumnDefinition[];
    toggleRow: (id: string) => void;
    isChecked: boolean;
    handleCellClick?: (rowId: string, key: string) => void;
    handleCellBlur?: (rowId: string, key: string) => void;
    isEditing: boolean;
    editingCell?: { rowId: string; key: string } | null;
    disableDelete?: boolean;
    hideActionsColumn?: boolean;
    disableEditMode?: boolean;
}

const DataRow: React.FC<DataRowProps> = ({ 
    row, 
    isLoading, 
    onEdit, 
    onDelete,
    columns, 
    handleCellBlur, 
    handleCellClick, 
    isEditing, 
    editingCell,
    toggleRow, 
    isChecked,
    disableDelete = false,
    hideActionsColumn = false,
    disableEditMode = false
}) => {
    
    // Check if a specific cell is being edited, taking editDisabled into account
    const isCellEditing = (columnKey: string) => {
        // Find the column to check if editing is disabled
        const column = columns.find(col => col.key === columnKey);
        
        // If editDisabled is true, return false regardless of other conditions
        if (column?.editDisabled) {
            return false;
        }
        
        return isEditing || (editingCell && editingCell.rowId === row.id && editingCell.key === columnKey);
    };
    
    // This function handles cell value changes when editing
    const handleCellChange = (rowId: string, key: string, value: any) => {
        // Find the column to determine its type and check editDisabled flag
        const column = columns.find(col => col.key === key);
        
        // Skip if column editing is disabled
        if (column?.editDisabled) {
            console.log(`DataRow.handleCellChange: Skipped for disabled column ${key}`);
            return;
        }
        
        console.log(`DataRow.handleCellChange: rowId=${rowId}, key=${key}, saveEvent=${column?.config.saveEvent}, renderer=${column?.config.renderer}`, value);
        
        // Pass to parent if not disabled
        onEdit(rowId, key, value);
    };

    return (
        <TableRow key={row.id} className="hover:bg-gray-50">
            <TableCell>
                <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleRow(row.id)}
                    className="checkbox-stripe"
                />
            </TableCell>
            {columns.map((column) => (
                <TableCell
                    key={column.key}
                    onClick={() => handleCellClick?.(row.id, column.key)}
                    onBlur={(e) => {
                        console.log(`DataRow onBlur: column=${column.key}, saveEvent=${column.config.saveEvent}, persistOnBlur=${column.config.persistCellEditOnBlur}`);
                        
                        // Check save event configuration
                        if (column.config.saveEvent === 'change') {
                            console.log(`DataRow onBlur: Skipping blur for saveEvent=change column ${column.key}`);
                            // For fields configured to save on change, don't trigger blur
                            // Exit edit mode without saving again
                            return;
                        }
                        
                        // For backward compatibility - check persistCellEditOnBlur
                        if (column.config.persistCellEditOnBlur) {
                            console.log(`DataRow onBlur: Skipping blur for persistCellEditOnBlur column ${column.key}`);
                            // Don't trigger blur when instructed to persist edit state
                            return;
                        }
                        
                        // For backward compatibility - check tag and user fields 
                        const renderer = column.config.renderer;
                        // Check for both string references and component references
                        const isTagOrUser = 
                          (typeof renderer === 'string' && (renderer === 'tag' || renderer === 'user')) ||
                          (typeof renderer !== 'string' && (renderer.name === 'TagRenderer' || renderer.name === 'UserRenderer'));
                          
                        if (isTagOrUser) {
                            console.log(`DataRow onBlur: Skipping blur for tag/user column ${column.key}`);
                            // Don't trigger blur when clicking on elements within the dropdown
                            // Let the Select/Assignees components handle their own state
                            return;
                        }
                        
                        // For other field types, handle blur normally
                        console.log(`DataRow onBlur: Handling blur normally for column ${column.key}`);
                        handleCellBlur?.(row.id, column.key);
                    }}
                    className="group relative hover:outline hover:outline-1 hover:outline-gray-200"
                    style={{ width: column.fixedWidth }}
                >
                    <div className="rounded outline-offset-0">
                        <CellRenderer
                            column={column}
                            value={row[column.key]}
                            row={row}
                            isEditing={isCellEditing(column.key)}
                            onCellChange={handleCellChange}
                        />
                    </div>
                </TableCell>
            ))}
            {!hideActionsColumn && (
              <TableCell>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <SaveButton onClick={() => onEdit(row.id, 'save')} disabled={isLoading} />
                            <CancelButton onClick={() => onEdit(row.id, 'cancel')} disabled={isLoading} />
                        </>
                    ) : (
                        <>
                            {!disableEditMode && <EditButton onClick={() => onEdit(row.id, 'edit')} disabled={isLoading} />}
                            {!disableDelete && onDelete && <DeleteButton onClick={() => onDelete(row.id)} disabled={isLoading} />}
                        </>
                    )}
                </div>
              </TableCell>
            )}
        </TableRow>
    )
};

export default DataRow;
