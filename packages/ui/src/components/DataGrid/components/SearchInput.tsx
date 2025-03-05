import React, { useState, useCallback } from 'react';
import { Input } from '@workspace/ui/components/input';
import { Search, X } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

interface SearchInputProps {
  onSearch: (term: string) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  placeholder = 'Search...',
  initialValue = '',
  className = ''
}) => {
  const [searchValue, setSearchValue] = useState(initialValue);
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  }, [searchValue, onSearch]);
  
  const clearSearch = useCallback(() => {
    setSearchValue('');
    onSearch('');
  }, [onSearch]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      clearSearch();
    }
  }, [clearSearch]);
  
  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative flex items-center w-full">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="pr-16"  // Extra padding for the buttons
        />
        <div className="absolute right-0 flex pr-1">
          {searchValue && (
            <Button 
              type="button" 
              onClick={clearSearch}
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 text-gray-400 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button 
            type="submit" 
            size="icon" 
            variant="ghost"
            className="h-8 w-8 text-gray-400 hover:text-gray-700"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SearchInput;