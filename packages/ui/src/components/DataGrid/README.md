# DataGrid Component

A flexible data grid component with support for pagination and inline editing. This component is designed to be easily customizable with pluggable components for different column types.

## Features

- Inline cell editing
- Row editing
- Pagination
- Search functionality
- Checkbox selection
- Custom cell renderers and editors
- Loading animations
- Responsive layout

## Pluggable Component System

The DataGrid component uses a plugin registry system that allows for easy registration of custom cell renderers and editors. Built-in components include:

- Text (plain text display)
- Number (with optional units)
- Link (clickable links with configurable base URL)
- Tag (for categorization with dropdown selection)
- User (for user assignment with a specialized picker)

You can also register your own custom components for specialized cell types.

## Usage

```tsx
import { DataGrid, PluginRegistry } from '@workspace/ui/components/DataGrid';
import { GridSchema } from '@workspace/ui/components/DataGrid/types';
import { CustomComponent } from './MyCustomComponent';

// Register a custom component if needed
PluginRegistry.registerComponent('custom-component', CustomComponent);

// Define your schema
const gridSchema: GridSchema = {
  columns: [
    {
      key: "id",
      header: "ID",
      config: {
        renderer: "link",
        editor: "text",
        options: { baseUrl: "/items/" }
      }
    },
    {
      key: "name",
      header: "Name",
      config: {
        renderer: "text",
        editor: "text"
      }
    },
    {
      key: "customField",
      header: "Custom Field",
      config: {
        renderer: "custom-component",
        editor: "custom-component"
      }
    }
  ],
  uniqueKey: "id"
};

// Later in your component
return (
  <DataGrid
    data={myData}
    gridSchema={gridSchema}
    onUpdate={handleUpdate}
    onDelete={handleDelete}
    isLoading={isLoading}
  />
);
```

## Component Props

| Prop Name           | Type                                        | Default Value      | Description                                           |
|---------------------|---------------------------------------------|-------------------|-------------------------------------------------------|
| data                | Record<string, any>[]                       | -                 | The data to display in the grid                        |
| gridSchema          | GridSchema                                  | -                 | Schema defining the columns and their configuration    |
| isLoading           | boolean                                     | false             | Whether the grid is in a loading state                 |
| loadingText         | string                                      | "Loading data..." | Text to display in the loading overlay                 |
| emptyStateMessage   | string                                      | "No data available." | Message to display when there is no data             |
| enablePagination    | boolean                                     | true              | Whether to enable pagination                           |
| enableSearch        | boolean                                     | true              | Whether to enable search functionality                  |
| pageSize            | number                                      | 10                | Number of items per page when pagination is enabled    |
| disableEditMode     | boolean                                     | false             | Disable all cell and row editing (view-only mode)      |
| disableDelete       | boolean                                     | false             | Disable row deletion                                   |
| hideActionsColumn   | boolean                                     | false             | Hide the actions column completely                     |
| onUpdate            | (rowId: string, data: Record<string, any>) => void | -         | Callback when updating a row                           |
| onDelete            | (rowId: string) => void                     | -                 | Callback when deleting a row                           |
| onEdit              | (id: string, data?: Record<string, any>) => void | -          | Callback when editing a row                            |

## Extending with Custom Components

You can create custom cell renderers and editors by implementing the `CellComponentProps` interface:

```tsx
import { CellComponentProps } from '@workspace/ui/components/DataGrid/types';

export const MyCustomRenderer = ({ value, options }: CellComponentProps<string>) => {
  return (
    <div style={{ color: options?.color || 'black' }}>
      {value}
    </div>
  );
};

export const MyCustomEditor = ({ value, onChange, options }: CellComponentProps<string>) => {
  return (
    <input
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      style={{ color: options?.color || 'black' }}
    />
  );
};

// Register them
PluginRegistry.registerComponent('my-custom', MyCustomRenderer, MyCustomEditor);
```

## Column Configuration Options

Each column in the grid schema can have the following configuration:

```typescript
{
  key: "fieldName",      // Unique identifier (maps to data object field)
  header: "Display Name", // Column header shown in the UI
  width?: "w-48",        // Optional Tailwind width class
  fixedWidth?: "200px",  // Optional CSS fixed width
  dbField?: "field_name", // Optional database field name if different from key
  editDisabled?: true,   // Whether this column can be edited
  config: {
    renderer: "text",    // Component name for view mode
    editor: "text",      // Component name for edit mode
    persistCellEditOnBlur?: true, // Whether to keep the cell in edit mode on blur (useful for dropdowns)
    saveEvent?: "change" | "blur", // When to save cell changes (default is "blur")
    options: {           // Options passed to the components
      // Component-specific options
    }
  }
}
```

## Usage Examples

### View-Only Mode
```tsx
<DataGrid
  data={myData}
  gridSchema={gridSchema}
  disableEditMode={true}
  disableDelete={true}
/>
```

### Read-Only Mode (No Actions Column)
```tsx
<DataGrid
  data={myData}
  gridSchema={gridSchema}
  disableEditMode={true}
  disableDelete={true}
  hideActionsColumn={true}
/>
```

### With Pagination
```tsx
<DataGrid
  data={myData}
  gridSchema={gridSchema}
  enablePagination={true}
  pageSize={5}
/>
```

### With Search Disabled
```tsx
<DataGrid
  data={myData}
  gridSchema={gridSchema}
  enableSearch={false}
  serverSidePagination={true}
/>
```

### With All Features
```tsx
<DataGrid
  data={myData}
  gridSchema={gridSchema}
  enablePagination={true}
  enableSearch={true}
  pageSize={5}
  serverSidePagination={true}
/>
```

