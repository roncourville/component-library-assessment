import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { UserPicker } from './UserPicker';
import type { User } from './types';

const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', image: 'https://github.com/shadcn.png' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', image: 'https://github.com/shadcn.png' },
  { id: '3', name: 'Robert Johnson', email: 'robert@example.com', image: 'https://github.com/shadcn.png' },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com', image: 'https://github.com/shadcn.png' },
  { id: '5', name: 'Michael Brown', email: 'michael@example.com', image: 'https://github.com/shadcn.png' },
];

const meta: Meta<typeof UserPicker> = {
  title: 'UI/UserPicker',
  component: UserPicker,
  parameters: {
    layout: 'centered',
  },
  args: {
    users: mockUsers,
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
      mockUsers[0],
      mockUsers[2],
    ],
  },
};

export const ViewMode: Story = {
  args: {
    isEditing: false,
    selected: [
      mockUsers[0],
    ],
  },
};

export const ViewModeWithMultipleUsers: Story = {
  args: {
    isEditing: false,
    selected: [
      mockUsers[0],
      mockUsers[1],
      mockUsers[2],
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
      mockUsers[0],
    ],
  },
};