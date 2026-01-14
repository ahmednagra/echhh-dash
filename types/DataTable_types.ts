// src/types/DataTable_types.ts

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export interface FilterConfig {
  field: string;
  type: 'text' | 'select' | 'date' | 'daterange';
  label: string;
  options?: { label: string; value: string }[];
}

export interface InlineFilterOption {
  label: string;
  value: string;
}

export interface InlineFilter {
  field: string;
  label: string;
  options: InlineFilterOption[];
  value?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pagination?: PaginationConfig;
  filters?: FilterConfig[];
  inlineFilters?: InlineFilter[];
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
  onInlineFilterChange?: (field: string, value: string) => void;
  actions?: (row: T) => React.ReactNode;
  bulkActions?: React.ReactNode;
  loading?: boolean;
  emptyState?: React.ReactNode;
}