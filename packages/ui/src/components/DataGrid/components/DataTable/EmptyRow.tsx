import React from 'react';
import { TableCell, TableRow } from "@workspace/ui/components/table";

interface EmptyRowProps {
  columnsCount: number;
  searchTerm: string;
}

const EmptyRow: React.FC<EmptyRowProps> = ({ columnsCount, searchTerm }) => {
  return (
    <TableRow>
      <TableCell colSpan={columnsCount + 2} className="h-24 text-center text-gray-500">
        {searchTerm ? "No results found." : "No data available."}
      </TableCell>
    </TableRow>
  );
};

export default EmptyRow;