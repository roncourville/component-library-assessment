import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Assignees } from '../components/assignees';
import type { User } from '../components/assignees';

const meta: Meta<typeof Assignees> = {
  title: 'Example/Assignees',
  component: Assignees,
  parameters: {
    layout: 'centered',
  },
  args: {
    users: [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    ],
    selected: [],
    onChange: fn(),
    multiple: true,
    disabled: false,
    isEditing: true,
    isLoading: false,
  },
} satisfies Meta<typeof Assignees>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

