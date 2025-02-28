import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Save } from "lucide-react";

interface EditButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const EditButton: React.FC<EditButtonProps> = ({ onClick, disabled }) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={onClick}
    disabled={disabled}
    className="text-[#635bff] hover:bg-purple-50"
  >
    <Save className="h-4 w-4" />
  </Button>
);

export default EditButton;