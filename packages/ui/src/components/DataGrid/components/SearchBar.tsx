import React from 'react';
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { GridSchema } from '../types';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchField: string;
  setSearchField: (field: string) => void;
  gridSchema: GridSchema;
  searchPlaceholder?: string;
  enableSearch?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  searchField,
  setSearchField,
  gridSchema,
  searchPlaceholder = "Search...",
  enableSearch = true,
}) => {
  if (!enableSearch) return null;
  return (
    <div className="w-full max-w-[600px]">
      <div className="flex">
        <Select value={searchField} onValueChange={setSearchField}>
          <SelectTrigger className="w-[240px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0 border-gray-300">
            <SelectValue placeholder="Search in..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fields</SelectItem>
            {gridSchema.columns.map((column) => (
              <SelectItem key={column.key} value={column.key}>
                {column.header}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder={
            searchField === "all"
              ? searchPlaceholder
              : `Search ${gridSchema.columns.find((col) => col.key === searchField)?.header.toLowerCase() || ""}...`
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-l-none focus:ring-0 focus:ring-offset-0 border-gray-300"
        />
      </div>
    </div>
  );
};

export default SearchBar;