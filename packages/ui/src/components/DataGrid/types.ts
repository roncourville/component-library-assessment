import React from 'react';

export interface CellComponentProps<T = any> {
  value: T;
  row?: Record<string, any>;
  isEditing: boolean;
  onChange?: (newValue: T) => void;
  options?: Record<string, any>;
}

export type ComponentType = React.ComponentType<CellComponentProps<any>>;

export type ColumnType = {
  renderer: string | ComponentType; // Name of registered component or direct React component
  editor?: string | ComponentType; // Name of registered component or direct React component
  options?: Record<string, any>; // Configuration options for components
  saveEvent?: 'blur' | 'change'; // When to save the cell value and exit edit mode - 'blur' (default) or 'change'
};

export interface ColumnDefinition {
  key: string; // Unique identifier
  header: string; // Column header for UI
  width?: string;
  fixedWidth?: string;
  dbField?: string; // Maps to Supabase column name
  config: ColumnType; // Defines the renderer & editor
  sortable?: boolean;
  filterable?: boolean;
  editDisabled?: boolean;
}

export interface GridSchema {
  columns: ColumnDefinition[];
  uniqueKey: string; // Unique identifier for rows
  defaultEditorMode?: "inline" | "modal"; // Defines how editing is handled
  customRenderers?: Record<string, (props: any) => JSX.Element>; // For dynamically registered renderers
  customEditors?: Record<string, (props: any) => JSX.Element>; // For dynamically registered editors
}