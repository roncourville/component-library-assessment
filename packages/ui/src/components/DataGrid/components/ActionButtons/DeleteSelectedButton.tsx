import React from 'react';
import { Button } from "@workspace/ui/components/button";
import { Trash2 } from "lucide-react";
import { toast } from "@workspace/ui/hooks/use-toast";

interface DeleteSelectedButtonProps {
  selectedRows: Set<string>;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  disableDelete?: boolean;
}

const DeleteSelectedButton: React.FC<DeleteSelectedButtonProps> = ({ 
  selectedRows, 
  onDelete,
  isLoading = false,
  disableDelete = false
}) => {
  const handleDeleteSelected = () => {
    // Delete all selected rows
    selectedRows.forEach((id) => {
      onDelete?.(id);
    });

    // Show toast with appropriate message
    toast({
      title: selectedRows.size > 1 ? "Rows deleted" : "Row deleted",
    });
  };

  if (selectedRows.size === 0 || disableDelete || !onDelete) {
    return null;
  }

  return (
    <Button
      variant="destructive"
      onClick={handleDeleteSelected}
      disabled={isLoading}
      className="bg-[#635bff] hover:bg-[#4f46e5] text-white"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Delete Selected ({selectedRows.size})
    </Button>
  );
};

export default DeleteSelectedButton;