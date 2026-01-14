// src/components/profile-analysis/ProfileSearch.tsx
'use client';

import { useState, useRef } from 'react';
import { Search } from 'lucide-react';

interface ProfileSearchProps {
  onSearch: (keyword: string) => void;
  isLoading: boolean;
}

export default function ProfileSearch({ onSearch, isLoading }: ProfileSearchProps) {
  const [keyword, setKeyword] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // No automatic search on typing - this was causing the issues
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim() && keyword.length >= 2) {
      onSearch(keyword);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={handleKeywordChange}
            placeholder="Search Instagram profiles..."
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
            // Add autoComplete off to help with focus issues
            autoComplete="off"
          />
          <button 
            type="submit"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            ) : (
              <Search className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </form>
      <p className="mt-2 text-sm text-gray-500">
        Enter an Instagram username or keyword to search for profiles
      </p>
    </div>
  );
}