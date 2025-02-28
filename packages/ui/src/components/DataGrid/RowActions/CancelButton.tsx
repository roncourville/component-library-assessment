import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { X } from 'lucide-react';

interface CancelButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const CancelButton: React.FC<CancelButtonProps> = ({ onClick, disabled }) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={onClick}
    disabled={disabled}
    className="text-gray-500 hover:bg-gray-100"
  >
    <X className="h-4 w-4" />
  </Button>
);

export default CancelButton;