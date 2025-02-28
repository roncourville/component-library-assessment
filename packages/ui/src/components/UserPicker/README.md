# UserPicker Component

A flexible React component for selecting and displaying users in both view and edit modes.

## Features

- **Multiple Selection Mode**: Select one or multiple users
- **Editing and View Modes**: Switch between a user selection interface and a display-only view
- **Search Functionality**: Filter users by name
- **Loading State**: Display a loading indicator during async operations
- **Accessibility**: Keyboard navigation and screen reader support
- **Responsive Design**: Works well on all screen sizes

## Installation

This component is part of the UI workspace package and is available internally.

## Usage

```tsx
import { UserPicker } from "@workspace/ui/components/UserPicker";
import { User } from "@workspace/ui/components/UserPicker/types";

// Example user data
const users: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", image: "/avatars/john.jpg" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", image: "/avatars/jane.jpg" },
  // ...more users
];

// Component with single selection
export function SingleUserSelect() {
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);
  
  return (
    <UserPicker
      users={users}
      selected={selectedUsers}
      onChange={setSelectedUsers}
      isEditing={true}
    />
  );
}

// Component with multiple selection
export function MultipleUserSelect() {
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);
  
  return (
    <UserPicker
      users={users}
      selected={selectedUsers}
      onChange={setSelectedUsers}
      multiple={true}
      isEditing={true}
    />
  );
}

// View-only mode (for displaying selected users)
export function UserDisplay({ selectedUsers }: { selectedUsers: User[] }) {
  return (
    <UserPicker
      selected={selectedUsers}
      isEditing={false}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `users` | `User[]` | `[]` | Array of available users to select from |
| `selected` | `User[]` | `[]` | Array of currently selected users |
| `onChange` | `(users: User[]) => void` | `undefined` | Callback fired when selection changes |
| `multiple` | `boolean` | `false` | Allow multiple user selection when true |
| `disabled` | `boolean` | `false` | Disable the component when true |
| `isEditing` | `boolean` | `false` | Show editing UI when true, view-only UI when false |
| `isLoading` | `boolean` | `false` | Show loading state when true |

## Component Architecture

The UserPicker is composed of several smaller components:

- `UserPicker.tsx`: Main component orchestrating the behavior
- `useUserPicker.ts`: Custom hook containing selection logic and state
- `UserBadge.tsx`: Component for displaying selected users as badges in edit mode
- `UserList.tsx`: Component for displaying users in view mode
- `types.ts`: TypeScript interfaces used by the component

## Accessibility

- Fully keyboard navigable
- ARIA attributes for screen readers
- Focus management for popover components
- Color contrast following WCAG guidelines

## Examples

### Basic Usage with Data Grid

```tsx
import { DataGrid } from "@workspace/ui/components/DataGrid";
import { UserPicker } from "@workspace/ui/components/UserPicker";

const columns = [
  // ... other columns
  {
    id: "assignees",
    header: "Assignees",
    accessorKey: "assignees",
    cell: ({ row, column, table }) => {
      const value = row.getValue(column.id) || [];
      const isEditing = table.options.meta?.editingCell?.row === row.id && 
                        table.options.meta?.editingCell?.column === column.id;
                        
      return (
        <UserPicker
          users={allUsers}
          selected={value}
          onChange={(newUsers) => {
            table.options.meta?.updateData(row.id, column.id, newUsers);
          }}
          multiple={true}
          isEditing={isEditing}
          disabled={!isEditing}
        />
      );
    }
  }
];
```