import React from 'react';
import { TableRow, TableCell } from '@workspace/ui/components/table';
import EditButton from './RowActions/EditButton';
import DeleteButton from './RowActions/DeleteButton';
import SaveButton from './RowActions/SaveButton';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { ColumnDefinition } from './types';
import { CellRenderer } from '@workspace/ui/components/DataGrid/cell-renderer';

interface DataRowProps {
    row: any;
    isLoading: boolean;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    columns: ColumnDefinition[];
    toggleRow: (id: string) => void;
    isChecked: boolean;
    handleCellClick: (rowId: string, key: string) => void;
    handleCellBlur: (rowId: string, key: string) => void;
    allUsers?: any[];
    plasmidOptions?: string[];
    isEditing: boolean;
}

const DataRow: React.FC<DataRowProps> = ({ row, isLoading, onEdit, onDelete,
    columns, handleCellBlur, handleCellClick, allUsers, plasmidOptions, isEditing,
    toggleRow, isChecked }) => {
    const [rowEdits, setRowEdits] = React.useState<Record<string, Record<string, any>>>({});

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
                    onClick={() => handleCellClick(row.id, column.key)}
                    onBlur={() => handleCellBlur(row.id, column.key)}
                    className="group relative hover:outline hover:outline-1 hover:outline-gray-200"
                    style={{ width: column.fixedWidth }}
                >
                    <div className="rounded outline-offset-0">
                        <CellRenderer
                            column={column}
                            value={rowEdits[row.id]?.[column.key] ?? row[column.key]}
                            row={row}
                            allUsers={allUsers}
                            isEditing={isEditing}
                            onCellChange={onEdit}
                            plasmidOptions={plasmidOptions}
                            // isLoadingUsers={isLoadingUsers}
                        />
                    </div>
                </TableCell>
            ))}
            <TableCell>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <SaveButton onClick={() => onEdit(row.id)} disabled={isLoading} />
                    ) : (
                        <EditButton onClick={() => onEdit(row.id)} disabled={isLoading} />
                    )}
                    <DeleteButton onClick={() => onDelete(row.id)} disabled={isLoading} />
                </div>
            </TableCell>
        </TableRow>

    )
};

export default DataRow;

{/* <TableRow>
{columns.map((column) => (
  <TableCell key={column.field}>
    {Array.isArray(row[column.field])
      ? row[column.field].map((user) => user.name).join(', ')
      : row[column.field]}
  </TableCell>
))}
<TableCell>
  <div className="flex space-x-2">
    <EditButton onClick={() => onEdit(row.id)} disabled={isLoading} />
    <DeleteButton onClick={() => onDelete(row.id)} disabled={isLoading} />
  </div>
</TableCell>
</TableRow> */}