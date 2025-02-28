import React from 'react';
import { Button } from "@workspace/ui/components/button";
import { Plus } from "lucide-react";

interface AddRowButtonProps {
  onAdd?: () => void;
  isLoading?: boolean;
}

const AddRowButton: React.FC<AddRowButtonProps> = ({ 
  onAdd,
  isLoading = false
}) => {
  return (
    <Button 
      onClick={onAdd} 
      disabled={isLoading} 
      className="bg-[#635bff] hover:bg-[#4f46e5] text-white"
    >
      <Plus className="mr-2 h-4 w-4" />
      Add Row
    </Button>
  );
};

export default AddRowButton;