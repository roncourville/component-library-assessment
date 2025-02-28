import { useState, useMemo, useCallback } from 'react';
import { GridSchema } from '../types';

export type SortDirection = "asc" | "desc" | null;
export type SortConfig = {
  key: string;
  direction: SortDirection;
  priority: number;
};

interface UseDataFilteringProps {
  data: Record<string, any>[];
  gridSchema: GridSchema;
}

export function useDataFiltering({ data, gridSchema }: UseDataFilteringProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([
    { key: "id", direction: "asc", priority: 1 }, // Default sort is ASC on ID
  ]);

  // Handle column sort
  const handleSort = useCallback((key: string) => {
    setSortConfigs((prevConfigs) => {
      // Find if this column is already being sorted
      const existingConfigIndex = prevConfigs.findIndex((config) => config.key === key);

      if (existingConfigIndex !== -1) {
        // Column is already being sorted, toggle direction or remove
        const existingConfig = prevConfigs[existingConfigIndex];
        const newConfigs = [...prevConfigs];

        if (existingConfig?.direction === "asc") {
          // Change to desc
          newConfigs[existingConfigIndex] = { ...existingConfig, direction: "desc" };
        } else if (existingConfig?.direction === "desc") {
          // Remove sort
          newConfigs.splice(existingConfigIndex, 1);
          // Update priorities
          return newConfigs.map((config, index) => ({
            ...config,
            priority: index + 1,
          }));
        }

        return newConfigs;
      } else {
        // Add new sort with highest priority
        return [...prevConfigs, { key, direction: "asc", priority: prevConfigs.length + 1 }];
      }
    });
  }, []);

  // Get sort config for a column
  const getSortConfig = useCallback((key: string) => {
    return sortConfigs.find((config) => config.key === key);
  }, [sortConfigs]);

  // Sort the data based on sort configs
  const sortedData = useMemo(() => {
    if (sortConfigs.length === 0) return [...data];

    // Sort by priority
    const sortedConfigs = [...sortConfigs].sort((a, b) => a.priority - b.priority);

    return [...data].sort((a, b) => {
      // Apply each sort config in order of priority
      for (const config of sortedConfigs) {
        const { key, direction } = config;

        if (!direction) continue;

        let valueA = a[key];
        let valueB = b[key];

        // Handle special cases for different column types
        const column = gridSchema.columns.find((col) => col.key === key);

        // Check if this is a user renderer
        const renderer = column?.config.renderer;
        const isUserRenderer = 
          (typeof renderer === 'string' && renderer === 'user') ||
          (typeof renderer !== 'string' && renderer.name === 'UserRenderer');
        
        if (isUserRenderer && Array.isArray(valueA) && Array.isArray(valueB)) {
          // Sort by first user's name
          valueA = valueA.length > 0 ? valueA[0].name : "";
          valueB = valueB.length > 0 ? valueB[0].name : "";
        }

        // Compare values
        if (valueA < valueB) {
          return direction === "asc" ? -1 : 1;
        }
        if (valueA > valueB) {
          return direction === "asc" ? 1 : -1;
        }
      }

      return 0;
    });
  }, [data, sortConfigs, gridSchema.columns]);

  // Add filtered data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm) return sortedData;

    return sortedData.filter((row) => {
      if (searchField === "all") {
        // Search in all fields
        return Object.entries(row).some(([key, value]) => {
          // Skip id field and handle different types
          if (key === "id") return false;

          if (key === "assignees" && Array.isArray(value)) {
            // For users, search in names
            return value.some((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
          }

          // For other fields, convert to string and search
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      } else {
        // Search in specific field
        const value = row[searchField];

        if (searchField === "assignees" && Array.isArray(value)) {
          // For users, search in names
          return value.some((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // For other fields, convert to string and search
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      }
    });
  }, [sortedData, searchTerm, searchField]);

  return {
    searchTerm,
    setSearchTerm,
    searchField,
    setSearchField,
    sortConfigs,
    setSortConfigs,
    handleSort,
    getSortConfig,
    sortedData,
    filteredData
  };
}