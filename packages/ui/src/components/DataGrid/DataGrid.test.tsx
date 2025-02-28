import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataGrid } from './index';
import { Column } from './types';

// Mock data for testing
const mockData = [
  { id: '1', name: 'Test Item 1', quantity: 10, category: 'A' },
  { id: '2', name: 'Test Item 2', quantity: 20, category: 'B' },
  { id: '3', name: 'Test Item 3', quantity: 30, category: 'A' },
];

// Mock columns for testing
const mockColumns: Column[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    cellType: 'text',
  },
  {
    id: 'quantity',
    header: 'Quantity',
    accessorKey: 'quantity',
    cellType: 'number',
  },
  {
    id: 'category',
    header: 'Category',
    accessorKey: 'category',
    cellType: 'tag',
    meta: {
      options: ['A', 'B', 'C'],
    },
  },
];

describe('DataGrid component', () => {
  // Rendering tests
  test('renders data grid with headers and data', () => {
    render(
      <DataGrid 
        data={mockData} 
        columns={mockColumns}
      />
    );
    
    // Check headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    
    // Check data
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  test('renders empty state when no data is provided', () => {
    render(
      <DataGrid 
        data={[]} 
        columns={mockColumns}
        emptyStateMessage="No items found"
      />
    );
    
    // Check empty state message
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  test('renders loading state when isLoading is true', () => {
    render(
      <DataGrid 
        data={mockData} 
        columns={mockColumns}
        isLoading={true}
        loadingText="Loading items..."
      />
    );
    
    // Check loading message
    expect(screen.getByText('Loading items...')).toBeInTheDocument();
  });

  // Search functionality tests
  test('filters data when search input changes', async () => {
    render(
      <DataGrid 
        data={mockData} 
        columns={mockColumns}
        enableSearch={true}
      />
    );
    
    // Get search input
    const searchInput = screen.getByPlaceholder('Search...');
    
    // Type into search input
    fireEvent.change(searchInput, { target: { value: 'Item 1' } });
    
    // Wait for filtering to complete
    await waitFor(() => {
      // Item 1 should be visible, Item 2 should not
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Item 2')).not.toBeInTheDocument();
    });
  });

  // CRUD tests
  test('calls onAdd callback when add button is clicked', () => {
    const handleAdd = jest.fn();
    
    render(
      <DataGrid 
        data={mockData} 
        columns={mockColumns}
        onAdd={handleAdd}
      />
    );
    
    // Find and click the add button
    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);
    
    // Check if onAdd callback was called
    expect(handleAdd).toHaveBeenCalled();
  });

  test('calls onDelete callback when delete button is clicked', async () => {
    const handleDelete = jest.fn();
    
    render(
      <DataGrid 
        data={mockData} 
        columns={mockColumns}
        onDelete={handleDelete}
      />
    );
    
    // Find and click the first delete button (may need to adjust selector based on actual implementation)
    const actionCells = screen.getAllByRole('cell');
    const actionCell = actionCells[actionCells.length - 1]; // Assuming action buttons are in the last cell
    const deleteButton = actionCell.querySelector('button[aria-label="Delete row"]');
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
      
      // Check if onDelete callback was called with the correct ID
      expect(handleDelete).toHaveBeenCalledWith('1');
    } else {
      fail('Delete button not found');
    }
  });

  test('allows editing a cell when clicked', async () => {
    const handleUpdate = jest.fn();
    
    render(
      <DataGrid 
        data={mockData} 
        columns={mockColumns}
        onUpdate={handleUpdate}
      />
    );
    
    // Find and click a cell to edit
    const nameCells = screen.getAllByText('Test Item 1');
    fireEvent.click(nameCells[0]);
    
    // Find and change the input (appears after clicking the cell)
    const input = screen.getByDisplayValue('Test Item 1');
    fireEvent.change(input, { target: { value: 'Updated Item 1' } });
    fireEvent.blur(input);
    
    // Check if onUpdate callback was called with the correct data
    await waitFor(() => {
      expect(handleUpdate).toHaveBeenCalledWith('1', 'name', 'Updated Item 1');
    });
  });

  // Pagination tests
  test('renders pagination controls when enablePagination is true', () => {
    render(
      <DataGrid 
        data={mockData} 
        columns={mockColumns}
        enablePagination={true}
        pageSize={2}
      />
    );
    
    // Check pagination controls
    expect(screen.getByText('1')).toBeInTheDocument(); // Current page
    expect(screen.getByText('2')).toBeInTheDocument(); // Next page
    
    // Only first 2 items should be visible due to pageSize
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    expect(screen.queryByText('Test Item 3')).not.toBeInTheDocument();
  });
});