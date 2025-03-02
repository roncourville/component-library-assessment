import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { UserPicker } from '@workspace/ui/components/UserPicker/UserPicker';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface UserPickerState {
  open: boolean;
}

const meta: Meta<typeof UserPicker> = {
  title: 'UI/UserPicker',
  component: UserPicker,
  parameters: {
    layout: 'centered',
  },
  args: {
    users: [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      { id: '3', name: 'Robert Johnson', email: 'robert@example.com' },
      { id: '4', name: 'Emily Davis', email: 'emily@example.com' },
      { id: '5', name: 'Michael Brown', email: 'michael@example.com' },
    ],
    selected: [],
    onChange: fn(),
    multiple: true,
    disabled: false,
    isEditing: true,
    isLoading: false,
  },
} satisfies Meta<typeof UserPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleSelection: Story = {
  args: {
    multiple: false,
  },
};

export const WithSelectedUsers: Story = {
  args: {
    selected: [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '3', name: 'Robert Johnson', email: 'robert@example.com' },
    ],
  },
};

export const ViewMode: Story = {
  args: {
    isEditing: false,
    selected: [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
    ],
  },
};

export const ViewModeWithMultipleUsers: Story = {
  args: {
    isEditing: false,
    selected: [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      { id: '3', name: 'Robert Johnson', email: 'robert@example.com' },
    ],
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    selected: [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
    ],
  },
};