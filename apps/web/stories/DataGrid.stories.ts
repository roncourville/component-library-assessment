import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import DataGrid from '../app/datagrid/data-grid';
import type { User } from '../components/assignees';

const meta: Meta<typeof DataGrid> = {
  title: 'Example/DataGrid',
  component: DataGrid,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    data: [
      {
        id: 'inv-GT-plasmid-1',
        plasmid: 'GT-plasmids-1: lentiCRISPR v2',
        volume: 50,
        length: 14873,
        storageLocation: 'Freezer 2 Box A1',
        assignees: [],
      },
    ],
    allUsers: [],
    plasmidOptions: [
      'GT-plasmids-1: lentiCRISPR v2',
      'GT-plasmids-2: psPAX2',
      'GT-plasmids-3: pMD2.G',
      'GT-plasmids-4: CRISPRoff-v2.1',
    ],
    onAdd: fn(),
    onUpdate: fn(),
    onDelete: fn(),
    isLoadingUsers: false,
  },
} satisfies Meta<typeof DataGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
