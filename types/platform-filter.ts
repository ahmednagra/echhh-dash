// src/types/platform-filter.ts
import { ReactNode } from 'react';

export type PlatformFilterOption = 'all' | 'instagram' | 'tiktok' | 'youtube';

export interface PlatformFilterCounts {
  all: number;
  instagram: number;
  tiktok: number;
  youtube: number;
}

export interface PlatformFilterProps {
  currentFilter: PlatformFilterOption;
  onFilterChange: (filter: PlatformFilterOption) => void;
  filterCounts: PlatformFilterCounts;
}

export interface PlatformFilterOptionConfig {
  value: PlatformFilterOption;
  label: string;
  icon: ReactNode;
  color?: string;
}
