import React from 'react';
import { ColumnDefinition, CellComponentProps } from "./types";
import PluginRegistry from './PluginRegistry';
import { registerBuiltInComponents } from './components/BuiltInComponents';
import { User } from "@workspace/ui/components/UserPicker/UserPicker";

// Register all built-in components when this module is loaded
registerBuiltInComponents();

interface CellRendererProps {
  column: ColumnDefinition;
  value: any;
  row: Record<string, any>;
  allUsers?: User[];
  isEditing?: boolean;
  onCellChange?: (rowId: string, key: string, value: any) => void;
  plasmidOptions?: string[];
  isLoadingUsers?: boolean;
}

/**
 * Dynamic cell renderer that uses the PluginRegistry to find and render
 * the appropriate component based on the column configuration.
 */
export function CellRenderer({
  column,
  value,
  row,
  allUsers = [],
  isEditing = false,
  onCellChange,
  plasmidOptions = [],
}: CellRendererProps) {
  // If editing is disabled for this column, force view mode
  const effectiveIsEditing = isEditing && !column.editDisabled;
  
  // Handle both direct component references and string references
  let Component: React.ComponentType<CellComponentProps<any>> | null = null;
  
  if (typeof column.config.renderer === 'string' || typeof column.config.editor === 'string') {
    // Get the appropriate component name based on editing mode
    const componentName = effectiveIsEditing && column.config.editor
      ? column.config.editor as string
      : column.config.renderer as string;
    
    // Get the mode based on editing state and available components
    const mode = effectiveIsEditing && column.config.editor ? 'edit' : 'view';
    
    // Look up the component in the registry
    Component = PluginRegistry.getComponent(componentName, mode);
  } else {
    // Use direct component reference
    Component = effectiveIsEditing && column.config.editor
      ? column.config.editor as React.ComponentType<CellComponentProps<any>>
      : column.config.renderer as React.ComponentType<CellComponentProps<any>>;
  }
  
  // Fallback to a default component if not found
  if (!Component) {
    console.warn(`Component not found for column ${column.key}`);
    return <span>{String(value)}</span>;
  }
  
  // Prepare options by combining column config options with runtime options
  const options = {
    ...column.config.options,
    allUsers,
    plasmidOptions,
  };
  
  // Create props for the component
  const componentProps: CellComponentProps = {
    value,
    row,
    isEditing: effectiveIsEditing, // Use the effectiveIsEditing flag which respects editDisabled
    options,
    onChange: (newValue) => {
      if (onCellChange) {
        console.log(`CellRenderer: onChange called for row=${row.id}, column=${column.key}, newValue=`, newValue);
        onCellChange(row.id, column.key, newValue);
      } else {
        console.warn(`CellRenderer: onChange called but onCellChange is undefined for row=${row.id}, column=${column.key}`);
      }
    },
  };
  
  // Render the component with the prepared props
  return <Component {...componentProps} />;
}

