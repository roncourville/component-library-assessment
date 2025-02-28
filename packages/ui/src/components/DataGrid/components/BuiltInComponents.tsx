import React from 'react';
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import Link from 'next/link';
import { UserPicker } from "@workspace/ui/components/UserPicker";
import { CellComponentProps } from '../types';
import PluginRegistry from '../PluginRegistry';

// TEXT COMPONENTS
const TextRenderer = ({ value }: CellComponentProps<string>) => {
  return <span>{value}</span>;
};

const TextEditor = ({ value, onChange }: CellComponentProps<string>) => {
  return <Input 
    value={value || ''} 
    onChange={(e) => onChange?.(e.target.value)} 
  />;
};

// NUMBER COMPONENTS
const NumberRenderer = ({ value, options }: CellComponentProps<number>) => {
  return (
    <span className="font-mono">
      {value}
      {options?.unit ? ` ${options.unit}` : ""}
    </span>
  );
};

const NumberEditor = ({ value, onChange, options }: CellComponentProps<number>) => {
  return (
    <Input
      type="number"
      value={value || ''}
      onChange={(e) => {
        const newValue = Number.parseFloat(e.target.value);
        if (!isNaN(newValue)) {
          onChange?.(newValue);
        }
      }}
      className="w-24"
    />
  );
};

// LINK COMPONENTS
const LinkRenderer = ({ value, options }: CellComponentProps<string>) => {
  const baseUrl = options?.baseUrl || '';
  return (
    <Link href={`${baseUrl}${value}`} className="text-blue-600 hover:underline">
      {value}
    </Link>
  );
};

const LinkEditor = ({ value, onChange }: CellComponentProps<string>) => {
  return <Input 
    value={value || ''} 
    onChange={(e) => onChange?.(e.target.value)} 
  />;
};

// TAG COMPONENTS
const TagRenderer = ({ value }: CellComponentProps<string>) => {
  return (
    <Badge variant="secondary" className="font-mono">
      {value}
    </Badge>
  );
};

const TagEditor = ({ value, onChange, options, isEditing }: CellComponentProps<string>) => {
  const tagOptions = options?.plasmidOptions || options?.options || [];
  
  console.log("TagEditor: isEditing=", isEditing, "value=", value, "options=", options);
  
  return (
    <Select 
      value={value || ''} 
      onValueChange={(newValue) => {
        console.log("TagEditor: selected new value", newValue);
        onChange?.(newValue);
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={options?.placeholder || "Select option"} />
      </SelectTrigger>
      <SelectContent>
        {tagOptions.map((option: string) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// USER COMPONENTS
const UserRenderer = ({ value, options }: CellComponentProps<any[]>) => {
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

const UserEditor = ({ value, onChange, options, isEditing }: CellComponentProps<any[]>) => {
  const users = Array.isArray(value) ? value : (value ? [value] : []);
  
  console.log("UserEditor: isEditing=", isEditing, "value=", value, "options=", options);
  
  return (
    <UserPicker
      users={options?.allUsers || []}
      selected={users}
      onChange={(newUsers) => {
        console.log("UserEditor: selected new users", newUsers);
        onChange?.(newUsers);
      }}
      multiple={options?.multiple}
      isEditing={true}
    />
  );
};

// Register all built-in components
export function registerBuiltInComponents() {
  // Register text components
  PluginRegistry.registerComponent('text', TextRenderer, TextEditor);
  
  // Register number components
  PluginRegistry.registerComponent('number', NumberRenderer, NumberEditor);
  
  // Register link components
  PluginRegistry.registerComponent('link', LinkRenderer, LinkEditor);
  
  // Register tag components
  PluginRegistry.registerComponent('tag', TagRenderer, TagEditor);
  
  // Register user components
  PluginRegistry.registerComponent('user', UserRenderer, UserEditor);
}

// Export individual components for custom use
export {
  TextRenderer, TextEditor,
  NumberRenderer, NumberEditor,
  LinkRenderer, LinkEditor,
  TagRenderer, TagEditor,
  UserRenderer, UserEditor
};