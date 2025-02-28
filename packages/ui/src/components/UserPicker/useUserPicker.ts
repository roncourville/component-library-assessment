import * as React from "react";
import { User } from "./types";

interface UseUserPickerProps {
  selected: User[];
  onChange?: (users: User[]) => void;
  multiple?: boolean;
  disabled?: boolean;
}

export function useUserPicker({
  selected,
  onChange,
  multiple = false,
  disabled = false,
}: UseUserPickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = React.useCallback((user: User) => {
    if (!onChange || disabled) return;

    if (multiple) {
      const isSelected = selected.some((s) => s.id === user.id);
      if (isSelected) {
        onChange(selected.filter((s) => s.id !== user.id));
      } else {
        onChange([...selected, user]);
      }
    } else {
      onChange([user]);
      if (!multiple) setOpen(false);
    }
  }, [onChange, disabled, multiple, selected, setOpen]);

  const handleRemove = React.useCallback((userId: string) => {
    if (!onChange || disabled) return;
    onChange(selected.filter((u) => u.id !== userId));
  }, [onChange, disabled, selected]);

  return {
    open,
    setOpen,
    handleSelect,
    handleRemove
  };
}