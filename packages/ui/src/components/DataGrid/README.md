# DataGrid Component

A flexible data grid component with support for sorting, filtering, and inline editing. This component is designed to be easily customizable with pluggable components for different column types.

## Features

- Inline cell editing
- Row editing
- Sorting (multi-column)
- Filtering
- Checkbox selection
- Custom cell renderers and editors
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
      },
      sortable: true
    },
    {
      key: "name",
      header: "Name",
      config: {
        renderer: "text",
        editor: "text"
      },
      sortable: true
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
    onAdd={handleAdd}
    isLoading={isLoading}
  />
);
```

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
    options: {           // Options passed to the components
      // Component-specific options
    }
  },
  sortable?: true,       // Whether this column can be sorted
  filterable?: true      // Whether this column can be filtered
}
```