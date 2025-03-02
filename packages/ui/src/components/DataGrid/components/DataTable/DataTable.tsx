import React from 'react';
import { Table, TableBody } from "@workspace/ui/components/table";
import TableHeader from './TableHeader';
import EmptyRow from './EmptyRow';
import DataRow from '../../DataRow';
import { ColumnDefinition } from '../../types';
import { EditingCell } from '../../hooks/useRowActions';

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
  onEdit: (id: string, action?: string | any, value?: any) => void;
  onDelete?: (id: string) => void;
  handleSort: (key: string) => void;
  getSortConfig: (key: string) => any;
  searchTerm: string;
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
  onEdit,
  onDelete,
  handleSort,
  getSortConfig,
  searchTerm
}) => {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm stripe-card">
      <Table>
        <TableHeader
          columns={columns}
          handleSort={handleSort}
          getSortConfig={getSortConfig}
          selectedRows={selectedRows}
          totalRowCount={data.length}
          toggleAll={toggleAll}
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
              />
            ))
          ) : (
            <EmptyRow columnsCount={columns.length} searchTerm={searchTerm} />
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;