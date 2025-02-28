import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserPicker } from './UserPicker';
import { User } from './types';

const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Robert Johnson', email: 'robert@example.com' },
];

describe('UserPicker component', () => {
  // Rendering tests
  test('renders in view mode correctly with a selected user', () => {
    render(
      <UserPicker 
        selected={[mockUsers[0]]} 
        isEditing={false} 
      />
    );
    
    // Check if the user name is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('renders nothing in view mode when no users are selected', () => {
    const { container } = render(
      <UserPicker 
        selected={[]} 
        isEditing={false} 
      />
    );
    
    // Container should be empty (only containing nullish elements)
    expect(container.firstChild).toBeNull();
  });

  test('renders in edit mode correctly with "Add User" button', () => {
    render(
      <UserPicker 
        users={mockUsers}
        selected={[mockUsers[0]]} 
        isEditing={true} 
      />
    );
    
    // Check if the user badge is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    
    // Check if the "Add User" button is present
    expect(screen.getByText('Add User')).toBeInTheDocument();
  });

  test('shows loading state when isLoading is true', () => {
    render(
      <UserPicker 
        users={mockUsers}
        selected={[]} 
        isEditing={true}
        isLoading={true}
      />
    );
    
    // Check if loading text is displayed
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('displays multiple selected users as badges in edit mode', () => {
    render(
      <UserPicker 
        users={mockUsers}
        selected={[mockUsers[0], mockUsers[1]]} 
        isEditing={true}
      />
    );
    
    // Check if both user badges are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  // Interaction tests
  test('calls onChange when removing a user', () => {
    const handleChange = jest.fn();
    
    render(
      <UserPicker 
        users={mockUsers}
        selected={[mockUsers[0], mockUsers[1]]} 
        onChange={handleChange}
        isEditing={true}
      />
    );
    
    // Find and click the remove button for the first user
    const removeButtons = screen.getAllByRole('button');
    const firstUserRemoveButton = removeButtons.find(button => 
      button.closest('.flex.items-center.gap-2')?.textContent?.includes('John Doe'));
    
    if (firstUserRemoveButton) {
      fireEvent.click(firstUserRemoveButton);
      
      // Check if onChange was called with the correct users
      expect(handleChange).toHaveBeenCalledWith([mockUsers[1]]);
    } else {
      fail('Remove button not found');
    }
  });

  test('does not call onChange when component is disabled', () => {
    const handleChange = jest.fn();
    
    render(
      <UserPicker 
        users={mockUsers}
        selected={[mockUsers[0]]} 
        onChange={handleChange}
        isEditing={true}
        disabled={true}
      />
    );
    
    // Find and click the remove button for the user
    const removeButtons = screen.getAllByRole('button');
    const userRemoveButton = removeButtons.find(button => 
      button.closest('.flex.items-center.gap-2')?.textContent?.includes('John Doe'));
    
    if (userRemoveButton) {
      fireEvent.click(userRemoveButton);
      
      // Check that onChange was not called
      expect(handleChange).not.toHaveBeenCalled();
    } else {
      fail('Remove button not found');
    }
  });

  // View mode tests
  test('displays the first user and a count in view mode when multiple users are selected', () => {
    render(
      <UserPicker 
        selected={[mockUsers[0], mockUsers[1], mockUsers[2]]} 
        isEditing={false}
      />
    );
    
    // Check if the first user is shown
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    
    // Check if the counter shows +2 (for the two remaining users)
    expect(screen.getByText('+2')).toBeInTheDocument();
  });
});