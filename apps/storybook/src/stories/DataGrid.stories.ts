import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import DataGrid from '@workspace/ui/components/DataGrid/DataGrid';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface UserPickerState {
  open: boolean;
}

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
  editDisabled?: boolean;
}

export interface GridSchema {
  columns: ColumnDefinition[];
  uniqueKey: string; // Unique identifier for rows
  defaultEditorMode?: "inline" | "modal"; // Defines how editing is handled
  customRenderers?: Record<string, (props: any) => JSX.Element>; // For dynamically registered renderers
  customEditors?: Record<string, (props: any) => JSX.Element>; // For dynamically registered editors
}
const users: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', image: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', image: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: '3', name: 'Robert Johnson', email: 'robert@example.com', image: 'https://randomuser.me/api/portraits/men/2.jpgpng' },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com', image: 'https://randomuser.me/api/portraits/women/1.jpg' },
];

const sampleData = [
  {
    id: 'inv-GT-plasmid-1',
    plasmid: 'GT-plasmids-1: lentiCRISPR v2',
    volume: 50,
    length: 14873,
    storageLocation: 'Freezer 2 Box A1',
    assignees: [users[0]],
    notes: 'High copy number, ampicillin resistance',
  },
  {
    id: 'inv-GT-plasmid-2',
    plasmid: 'GT-plasmids-2: psPAX2',
    volume: 25,
    length: 10703,
    storageLocation: 'Freezer 1 Box C3',
    assignees: [users[1], users[2]],
    notes: 'Lentiviral packaging plasmid',
  },
  {
    id: 'inv-GT-plasmid-3',
    plasmid: 'GT-plasmids-3: pMD2.G',
    volume: 35,
    length: 5824,
    storageLocation: 'Freezer 3 Box B2',
    assignees: [],
    notes: 'VSV-G envelope expressing plasmid',
  },
  {
    id: 'inv-GT-plasmid-4',
    plasmid: 'GT-plasmids-4: CRISPRoff-v2.1',
    volume: 15,
    length: 9542,
    storageLocation: 'Freezer 2 Box D4',
    assignees: [users[3]],
    notes: 'Epigenetic silencing of genes',
  },
];

const plasmidOptions = [
  'GT-plasmids-1: lentiCRISPR v2',
  'GT-plasmids-2: psPAX2',
  'GT-plasmids-3: pMD2.G',
  'GT-plasmids-4: CRISPRoff-v2.1',
  'GT-plasmids-5: pLKO.1',
  'GT-plasmids-6: pLJM1',
  'GT-plasmids-7: pX330',
  'GT-plasmids-8: pX458',
  'GT-plasmids-9: pLenti-CRISPR',
  'GT-plasmids-10: pAAV-CRISPR',
];

const columns: ColumnDefinition[] = [
  {
    key: 'plasmid',
    header: 'Plasmid',
    config: {
      renderer: 'tag',
      editor: 'tag',
      options: {
        plasmidOptions,
      },
    },
  },
  {
    key: 'volume',
    header: 'Volume (µL)',
    config: {
      renderer: 'number',
      editor: 'number',
      options: {
        unit: 'µL',
      },
    },
  },
  {
    key: 'length',
    header: 'Length (bp)',
    config: {
      renderer: 'number',
      editor: 'number',
      options: {
        unit: 'bp',
      },
    },
  },
  {
    key: 'storageLocation',
    header: 'Storage',
    config: {
      renderer: 'text',
      editor: 'text',
    },
  },
  {
    key: 'assignees',
    header: 'Assignees',
    config: {
      renderer: 'user',
      editor: 'user',
      options: {
        allUsers: users,
        multiple: true,
      },
    },
  },
  {
    key: 'notes',
    header: 'Notes',
    config: {
      renderer: 'text',
      editor: 'text',
    },
  },
];

const meta: Meta<typeof DataGrid> = {
  title: 'UI/DataGrid',
  component: DataGrid,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    data: sampleData,
    gridSchema: {
      columns: columns,
      uniqueKey: 'id',
      defaultEditorMode: 'inline'
    },
    onAdd: fn(),
    onUpdate: fn(),
    onDelete: fn(),
    isLoading: false,
  },
} satisfies Meta<typeof DataGrid>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};

export const MinimalFeatures: Story = { 
  args: { 
    disableEditMode: true, 
    disableDelete: true,
    hideActionsColumn: true,
    enablePagination: false
  } 
};

export const ViewOnly: Story = { 
  args: { 
    disableEditMode: true, 
    disableDelete: true,
    hideActionsColumn: true
  } 
};

export const Loading: Story = { args: { isLoading: true, loadingText: 'Loading data...' } };

export const EmptyState: Story = { args: { data: [], emptyStateMessage: 'No plasmids found.' } };

export const WithPagination: Story = { args: { pageSize: 2, enablePagination: true } };

export const WithAllFeatures: Story = { args: { enablePagination: true, pageSize: 3 } };
