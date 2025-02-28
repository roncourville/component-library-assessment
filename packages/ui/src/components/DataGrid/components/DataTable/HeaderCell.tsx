import React from 'react';
import { TableHead } from "@workspace/ui/components/table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { ColumnDefinition } from '../../types';
import { SortConfig } from '../../hooks/useDataFiltering';

interface HeaderCellProps {
  column: ColumnDefinition;
  sortConfig?: SortConfig;
  onSort: (key: string) => void;
}

const HeaderCell: React.FC<HeaderCellProps> = ({ 
  column,
  sortConfig,
  onSort 
}) => {
  return (
    <TableHead
      key={column.key}
      className={`cursor-pointer`}
      style={{ width: column.fixedWidth }}
      onClick={() => onSort(column.key)}
    >
      <div className="flex items-center gap-1">
        {column.header}
        {sortConfig?.direction === "asc" && <ArrowUp className="h-4 w-4 text-[#635bff]" />}
        {sortConfig?.direction === "desc" && <ArrowDown className="h-4 w-4 text-[#635bff]" />}
        {sortConfig && <span className="text-xs text-gray-500 ml-1">{sortConfig.priority}</span>}
      </div>
    </TableHead>
  );
};

export default HeaderCell;