import React from 'react';
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { UserPicker } from "@workspace/ui/components/UserPicker";
import { CellComponentProps } from '@workspace/ui/components/DataGrid/types';
import { useUsers } from '../hooks/useUsers';

// TAG EDITOR
export const CustomTagEditor: React.FC<CellComponentProps<string>> = ({ value, onChange, options }) => {
  // Hard-coded plasmid options - this would normally come from an API or context
  const plasmidOptions = [
    "GT-plasmids-1: lentiCRISPR v2",
    "GT-plasmids-2: psPAX2",
    "GT-plasmids-3: pMD2.G",
    "GT-plasmids-4: CRISPRoff-v2.1",
    "GT-plasmids-5: pLKO.1",
    "GT-plasmids-6: pLJM1",
    "GT-plasmids-7: pX330",
    "GT-plasmids-8: pX458",
    "GT-plasmids-9: pLenti-CRISPR",
    "GT-plasmids-10: pAAV-CRISPR",
  ];
  
  // Print debug info to console
  console.log("CustomTagEditor rendering with value:", value);
  
  return (
    <Select value={value || ''} onValueChange={(newValue) => {
      console.log("CustomTagEditor: selected value changed to", newValue);
      onChange?.(newValue);
    }}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={options?.placeholder || "Select option"} />
      </SelectTrigger>
      <SelectContent className="select-content">
        {plasmidOptions.map((option: string) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// USER EDITOR
export const UserEditor: React.FC<CellComponentProps<any[]>> = ({ value, onChange, options }) => {
  // Extract selected users from value
  const selected = Array.isArray(value) ? value : (value ? [value] : []);
  
  // Import users hook to get users directly in this component
  const { users, isLoadingUsers } = useUsers();
  
  return (
    <UserPicker
      users={users}
      selected={selected}
      onChange={(newUsers) => onChange?.(newUsers)}
      multiple={options?.multiple}
      isEditing={true}
      isLoading={isLoadingUsers}
    />
  );
};

// COLOR EDITOR
export const ColorValueEditor: React.FC<CellComponentProps<string>> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-8 h-8 rounded"
      />
      <Input
        type="text"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-24"
      />
    </div>
  );
};