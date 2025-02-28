import React from 'react';
import { Badge } from "@workspace/ui/components/badge";
import Link from 'next/link';
import { UserPicker } from "@workspace/ui/components/UserPicker";
import { CellComponentProps } from '@workspace/ui/components/DataGrid/types';

// TEXT COMPONENT
export const TextRenderer: React.FC<CellComponentProps<string>> = ({ value }) => {
  return <span>{value}</span>;
};

// NUMBER COMPONENT
export const NumberRenderer: React.FC<CellComponentProps<number>> = ({ value, options }) => {
  return (
    <span className="font-mono">
      {value}
      {options?.unit ? ` ${options.unit}` : ""}
    </span>
  );
};

// LINK COMPONENT
export const LinkRenderer: React.FC<CellComponentProps<string>> = ({ value, options }) => {
  const baseUrl = options?.baseUrl || '';
  return (
    <Link href={`${baseUrl}${value}`} className="text-blue-600 hover:underline">
      {value}
    </Link>
  );
};

// TAG COMPONENT
export const TagRenderer: React.FC<CellComponentProps<string>> = ({ value }) => {
  return (
    <Badge variant="secondary" className="font-mono">
      {value}
    </Badge>
  );
};

// USER COMPONENT
export const UserRenderer: React.FC<CellComponentProps<any[]>> = ({ value, options }) => {
  const users = Array.isArray(value) ? value : (value ? [value] : []);
  return (
    <UserPicker 
      users={options?.allUsers || []} 
      selected={users} 
      multiple={options?.multiple} 
      disabled={true} 
    />
  );
};

// AVATAR COMPONENT
export const AvatarRenderer: React.FC<CellComponentProps<{ name: string; image?: string }>> = ({ value }) => {
  if (!value) return null;
  
  return (
    <div className="flex items-center gap-2">
      <UserPicker
        users={[]} 
        selected={[{ id: '1', name: value.name, email: '', image: value.image }]} 
        disabled={true}
      />
    </div>
  );
};

// COLOR VALUE COMPONENT
export const ColorValueRenderer: React.FC<CellComponentProps<string>> = ({ value }) => {
  if (!value) return null;
  
  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-6 h-6 rounded-full border border-gray-200" 
        style={{ backgroundColor: value }}
      />
      <span>{value}</span>
    </div>
  );
};