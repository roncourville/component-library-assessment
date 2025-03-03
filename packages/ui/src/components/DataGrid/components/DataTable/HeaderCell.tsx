import React from 'react';
import { TableHead } from "@workspace/ui/components/table";
import { ColumnDefinition } from '../../types';

interface HeaderCellProps {
  column: ColumnDefinition;
}

const HeaderCell: React.FC<HeaderCellProps> = ({ 
  column
}) => {
  return (
    <TableHead
      key={column.key}
      style={{ width: column.fixedWidth }}
    >
      <div className="flex items-center gap-1">
        {column.header}
      </div>
    </TableHead>
  );
};

export default HeaderCell;