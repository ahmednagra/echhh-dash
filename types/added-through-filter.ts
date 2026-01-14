// src/types/added-through-filter.ts

export type AddedThroughValue = 'import' | 'search' | 'discovery';

export type AddedThroughFilterOption = 'all' | AddedThroughValue;

export interface AddedThroughFilterProps {
  currentFilter: AddedThroughFilterOption;
  onFilterChange: (filter: AddedThroughFilterOption) => void;
  filterCounts: AddedThroughFilterCounts;
}

export interface AddedThroughFilterCounts {
  all: number;
  'import': number;
  'search': number;
  'discovery': number;
}

export interface AddedThroughFilterOptionConfig {
  value: AddedThroughFilterOption;
  label: string;
  icon?: React.ReactNode;
}