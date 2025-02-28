import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { DataGrid } from '@workspace/ui/components/DataGrid';
import type { User } from '@workspace/ui/components/UserPicker';

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

const columns = [
  {
    id: 'plasmid',
    header: 'Plasmid',
    accessorKey: 'plasmid',
    cellType: 'tag',
    meta: {
      plasmidOptions,
    },
  },
  {
    id: 'volume',
    header: 'Volume (µL)',
    accessorKey: 'volume',
    cellType: 'number',
    meta: {
      unit: 'µL',
    },
  },
  {
    id: 'length',
    header: 'Length (bp)',
    accessorKey: 'length',
    cellType: 'number',
    meta: {
      unit: 'bp',
    },
  },
  {
    id: 'storageLocation',
    header: 'Storage',
    accessorKey: 'storageLocation',
    cellType: 'text',
  },
  {
    id: 'assignees',
    header: 'Assignees',
    accessorKey: 'assignees',
    cellType: 'user',
    meta: {
      allUsers: users,
      multiple: true,
    },
  },
  {
    id: 'notes',
    header: 'Notes',
    accessorKey: 'notes',
    cellType: 'text',
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
    columns: columns,
    onAdd: fn(),
    onUpdate: fn(),
    onDelete: fn(),
    isLoading: false,
  },
} satisfies Meta<typeof DataGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSearch: Story = {
  args: {
    enableSearch: true,
    searchPlaceholder: 'Search plasmids...'
  }
};

export const WithPagination: Story = {
  args: {
    pageSize: 2,
    enablePagination: true
  }
};

export const WithSorting: Story = {
  args: {
    enableSorting: true
  }
};

export const WithAllFeatures: Story = {
  args: {
    enableSearch: true,
    enableSorting: true,
    enablePagination: true,
    pageSize: 3,
    searchPlaceholder: 'Search by any field...'
  }
};

export const Loading: Story = {
  args: {
    isLoading: true,
    loadingText: 'Loading plasmids...'
  }
};

export const EmptyState: Story = {
  args: {
    data: [],
    emptyStateMessage: 'No plasmids found. Click "Add" to create a new entry.'
  }
};
