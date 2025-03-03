import React from 'react';
import { Table, TableBody } from "@workspace/ui/components/table";
import TableHeader from './TableHeader';
import EmptyRow from './EmptyRow';
import DataRow from '../../DataRow';
import { ColumnDefinition } from '../../types';
import { EditingCell } from '../../hooks/useRowActions';
import LoadingOverlay from './LoadingOverlay';

interface DataTableProps {
  data: Record<string, any>[];
  columns: ColumnDefinition[];
  rowEdits: Record<string, Record<string, any>>;
  uniqueKey: string;
  selectedRows: Set<string>;
  toggleRow: (id: string) => void;
  toggleAll: (checked: boolean) => void;
  editingRows: Set<string>;
  editingCell: EditingCell | null;
  handleCellClick: (rowId: string, key: string) => void;
  handleCellBlur: (rowId: string, key: string) => void;
  isLoading?: boolean;
  loadingText?: string;
  onEdit: (id: string, action?: string | any, value?: any) => void;
  onDelete?: (id: string) => void;
  emptyStateMessage?: string;
  disableDelete?: boolean;
  hideActionsColumn?: boolean;
  disableEditMode?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  rowEdits,
  uniqueKey,
  selectedRows,
  toggleRow,
  toggleAll,
  editingRows,
  editingCell,
  handleCellClick,
  handleCellBlur,
  isLoading = false,
  loadingText,
  onEdit,
  onDelete,
  emptyStateMessage,
  disableDelete = false,
  hideActionsColumn = false,
  disableEditMode = false
}) => {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm stripe-card relative">
      {isLoading && <LoadingOverlay text={loadingText} />}
      <Table>
        <TableHeader
          columns={columns}
          selectedRows={selectedRows}
          totalRowCount={data.length}
          toggleAll={toggleAll}
          hideActionsColumn={hideActionsColumn}
        />
        <TableBody>
          {data.length > 0 ? (
            data.map((row) => (
              <DataRow
                key={row[uniqueKey]}
                row={rowEdits[row.id] ?? row} // Ensure we're using the edited data when available
                isLoading={isLoading}
                onEdit={onEdit}
                onDelete={onDelete}
                columns={columns}
                isChecked={selectedRows.has(row.id)}
                toggleRow={toggleRow}
                isEditing={editingRows.has(row.id)}
                editingCell={editingCell}
                handleCellClick={handleCellClick}
                handleCellBlur={handleCellBlur}
                disableDelete={disableDelete}
                hideActionsColumn={hideActionsColumn}
                disableEditMode={disableEditMode}
              />
            ))
          ) : (
            <EmptyRow 
              columnsCount={columns.length} 
              isLoading={isLoading}
              emptyStateMessage={emptyStateMessage}
            />
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;