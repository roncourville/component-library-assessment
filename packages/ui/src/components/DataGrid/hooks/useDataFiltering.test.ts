import { renderHook, act } from '@testing-library/react';
import { useDataFiltering } from './useDataFiltering';

// Mock data for testing
const mockData = [
  { id: '1', name: 'Apple', category: 'Fruit', price: 1.99 },
  { id: '2', name: 'Banana', category: 'Fruit', price: 0.99 },
  { id: '3', name: 'Carrot', category: 'Vegetable', price: 0.50 },
  { id: '4', name: 'Donut', category: 'Bakery', price: 2.49 },
];

describe('useDataFiltering hook', () => {
  // Initialization tests
  test('initializes with empty search term and all data visible', () => {
    const { result } = renderHook(() => useDataFiltering({
      data: mockData,
    }));
    
    expect(result.current.searchTerm).toBe('');
    expect(result.current.filteredData).toEqual(mockData);
  });

  // Search functionality tests
  test('filters data based on search term', () => {
    const { result } = renderHook(() => useDataFiltering({
      data: mockData,
    }));
    
    // Search for 'fruit'
    act(() => {
      result.current.setSearchTerm('fruit');
    });
    
    // Should find Apple and Banana (both have category 'Fruit')
    expect(result.current.filteredData).toHaveLength(2);
    expect(result.current.filteredData).toContainEqual(mockData[0]);
    expect(result.current.filteredData).toContainEqual(mockData[1]);
    
    // Search for 'a'
    act(() => {
      result.current.setSearchTerm('a');
    });
    
    // Should find Apple, Banana, Carrot, and Bakery
    expect(result.current.filteredData).toHaveLength(4);
    
    // Search for 'z' (no matches)
    act(() => {
      result.current.setSearchTerm('z');
    });
    
    // Should find nothing
    expect(result.current.filteredData).toHaveLength(0);
  });

  // Sort functionality tests
  test('sorts data based on sort column and direction', () => {
    const { result } = renderHook(() => useDataFiltering({
      data: mockData,
    }));
    
    // Sort by name ascending
    act(() => {
      result.current.setSortColumn('name');
      result.current.setSortDirection('asc');
    });
    
    // Check if sorted correctly (Apple, Banana, Carrot, Donut)
    expect(result.current.filteredData[0].name).toBe('Apple');
    expect(result.current.filteredData[1].name).toBe('Banana');
    expect(result.current.filteredData[2].name).toBe('Carrot');
    expect(result.current.filteredData[3].name).toBe('Donut');
    
    // Sort by name descending
    act(() => {
      result.current.setSortDirection('desc');
    });
    
    // Check if sorted correctly (Donut, Carrot, Banana, Apple)
    expect(result.current.filteredData[0].name).toBe('Donut');
    expect(result.current.filteredData[1].name).toBe('Carrot');
    expect(result.current.filteredData[2].name).toBe('Banana');
    expect(result.current.filteredData[3].name).toBe('Apple');
    
    // Sort by price ascending
    act(() => {
      result.current.setSortColumn('price');
      result.current.setSortDirection('asc');
    });
    
    // Check if sorted correctly (Carrot, Banana, Apple, Donut)
    expect(result.current.filteredData[0].name).toBe('Carrot'); // 0.50
    expect(result.current.filteredData[1].name).toBe('Banana'); // 0.99
    expect(result.current.filteredData[2].name).toBe('Apple');  // 1.99
    expect(result.current.filteredData[3].name).toBe('Donut');  // 2.49
  });

  // Combined search and sort tests
  test('combines search and sort correctly', () => {
    const { result } = renderHook(() => useDataFiltering({
      data: mockData,
    }));
    
    // Search for 'fruit' and sort by name descending
    act(() => {
      result.current.setSearchTerm('fruit');
      result.current.setSortColumn('name');
      result.current.setSortDirection('desc');
    });
    
    // Should find Banana and Apple in that order
    expect(result.current.filteredData).toHaveLength(2);
    expect(result.current.filteredData[0].name).toBe('Banana');
    expect(result.current.filteredData[1].name).toBe('Apple');
  });

  // Data updates tests
  test('updates filtered data when original data changes', () => {
    const { result, rerender } = renderHook(
      (props) => useDataFiltering(props),
      { initialProps: { data: mockData } }
    );
    
    // Search for 'fruit'
    act(() => {
      result.current.setSearchTerm('fruit');
    });
    
    // Should have 2 results initially
    expect(result.current.filteredData).toHaveLength(2);
    
    // Add a new fruit item
    const updatedData = [
      ...mockData,
      { id: '5', name: 'Elderberry', category: 'Fruit', price: 3.99 },
    ];
    
    // Rerender with new data
    rerender({ data: updatedData });
    
    // Should now have 3 results (all items with 'fruit')
    expect(result.current.filteredData).toHaveLength(3);
    expect(result.current.filteredData.some(item => item.name === 'Elderberry')).toBe(true);
  });

  // Reset search tests
  test('clears search term', () => {
    const { result } = renderHook(() => useDataFiltering({
      data: mockData,
    }));
    
    // Set search term
    act(() => {
      result.current.setSearchTerm('fruit');
    });
    
    // Verify filtered results
    expect(result.current.filteredData).toHaveLength(2);
    
    // Clear search
    act(() => {
      result.current.clearSearch();
    });
    
    // Should return to all data
    expect(result.current.searchTerm).toBe('');
    expect(result.current.filteredData).toHaveLength(mockData.length);
  });
});