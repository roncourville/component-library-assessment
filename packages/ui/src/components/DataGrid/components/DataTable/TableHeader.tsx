import React from 'react';
import { TableHead, TableHeader as ShadcnTableHeader, TableRow } from "@workspace/ui/components/table";
import { Checkbox } from "@workspace/ui/components/checkbox";
import HeaderCell from './HeaderCell';
import { ColumnDefinition } from '../../types';

interface TableHeaderProps {
  columns: ColumnDefinition[];
  selectedRows: Set<string>;
  totalRowCount: number;
  toggleAll: (checked: boolean) => void;
  hideActionsColumn?: boolean;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  selectedRows,
  totalRowCount,
  toggleAll,
  hideActionsColumn = false
}) => {
  return (
    <ShadcnTableHeader className="bg-gray-50">
      <TableRow>
        <TableHead className="w-12">
          <Checkbox
            checked={selectedRows.size === totalRowCount && totalRowCount > 0}
            onCheckedChange={toggleAll}
            className="checkbox-stripe"
          />
        </TableHead>
        {columns.map((column) => (
          <HeaderCell
            key={column.key}
            column={column}
          />
        ))}
        {!hideActionsColumn && (
          <TableHead className="w-[100px]">Actions</TableHead>
        )}
      </TableRow>
    </ShadcnTableHeader>
  );
};

export default TableHeader;