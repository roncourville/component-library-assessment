import React from 'react';
import { TableCell, TableRow } from "@workspace/ui/components/table";

interface EmptyRowProps {
  columnsCount: number;
  searchTerm: string;
  isLoading?: boolean;
  emptyStateMessage?: string;
}

const EmptyRow: React.FC<EmptyRowProps> = ({ 
  columnsCount, 
  searchTerm, 
  isLoading = false,
  emptyStateMessage = "No data available."
}) => {
  return (
    <TableRow className='h-56'>
      <TableCell colSpan={columnsCount + 2} className="h-24 text-center text-gray-500">
        {isLoading ? "" : searchTerm ? "No results found." : emptyStateMessage}
      </TableCell>
    </TableRow>
  );
};

export default EmptyRow;