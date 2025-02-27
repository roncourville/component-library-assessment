import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Trash2 } from 'lucide-react';

interface DeleteButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onClick, disabled }) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={onClick}
    disabled={disabled}
    className="text-red-500 hover:bg-red-50"
  >
    <Trash2 className="h-4 w-4" />
  </Button>
);

export default DeleteButton;