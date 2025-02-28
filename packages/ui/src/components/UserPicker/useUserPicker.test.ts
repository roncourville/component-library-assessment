import { renderHook, act } from '@testing-library/react';
import { useUserPicker } from './useUserPicker';
import { User } from './types';

const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Robert Johnson', email: 'robert@example.com' },
];

describe('useUserPicker hook', () => {
  // Initial state tests
  test('returns correct initial state', () => {
    const { result } = renderHook(() => useUserPicker({
      selected: [],
      onChange: jest.fn(),
    }));
    
    expect(result.current.open).toBe(false);
    expect(typeof result.current.setOpen).toBe('function');
    expect(typeof result.current.handleSelect).toBe('function');
    expect(typeof result.current.handleRemove).toBe('function');
  });

  // User selection tests
  test('handleSelect adds user to selection in multiple mode', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useUserPicker({
      selected: [mockUsers[0]],
      onChange,
      multiple: true,
    }));
    
    act(() => {
      result.current.handleSelect(mockUsers[1]);
    });
    
    expect(onChange).toHaveBeenCalledWith([mockUsers[0], mockUsers[1]]);
  });

  test('handleSelect replaces selection in single mode', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useUserPicker({
      selected: [mockUsers[0]],
      onChange,
      multiple: false,
    }));
    
    act(() => {
      result.current.handleSelect(mockUsers[1]);
    });
    
    expect(onChange).toHaveBeenCalledWith([mockUsers[1]]);
  });

  test('handleSelect removes user if already selected in multiple mode', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useUserPicker({
      selected: [mockUsers[0], mockUsers[1]],
      onChange,
      multiple: true,
    }));
    
    act(() => {
      result.current.handleSelect(mockUsers[0]);
    });
    
    expect(onChange).toHaveBeenCalledWith([mockUsers[1]]);
  });

  test('handleSelect closes popover in single mode', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useUserPicker({
      selected: [],
      onChange,
      multiple: false,
    }));
    
    // First, open the popover
    act(() => {
      result.current.setOpen(true);
    });
    
    expect(result.current.open).toBe(true);
    
    // Then select a user, which should close the popover
    act(() => {
      result.current.handleSelect(mockUsers[0]);
    });
    
    expect(result.current.open).toBe(false);
  });

  // User removal tests
  test('handleRemove removes user by ID', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useUserPicker({
      selected: [mockUsers[0], mockUsers[1]],
      onChange,
    }));
    
    act(() => {
      result.current.handleRemove('1'); // Remove user with ID '1'
    });
    
    expect(onChange).toHaveBeenCalledWith([mockUsers[1]]);
  });

  // Disabled state tests
  test('callbacks do nothing when disabled is true', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useUserPicker({
      selected: [mockUsers[0]],
      onChange,
      disabled: true,
    }));
    
    act(() => {
      result.current.handleSelect(mockUsers[1]);
      result.current.handleRemove('1');
    });
    
    expect(onChange).not.toHaveBeenCalled();
  });

  // State change tests
  test('setOpen changes the open state', () => {
    const { result } = renderHook(() => useUserPicker({
      selected: [],
      onChange: jest.fn(),
    }));
    
    expect(result.current.open).toBe(false);
    
    act(() => {
      result.current.setOpen(true);
    });
    
    expect(result.current.open).toBe(true);
    
    act(() => {
      result.current.setOpen(false);
    });
    
    expect(result.current.open).toBe(false);
  });
});