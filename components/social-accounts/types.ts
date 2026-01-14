// src/components/social-accounts/types.ts
import { SocialAccount } from '@/services/social-accounts/social-accounts.service';

export interface Pagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface EnhancedSocialAccountsTableProps {
  accounts: SocialAccount[];
  isLoading: boolean;
  searchText: string;
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onDeleteAccount: (accountId: string, influencerId: string, username: string) => void;
  deleteLoading: Record<string, boolean>;
}

export interface ContactData {
  id: string;
  type: string;
  value: string;
  isPrimary: boolean;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  popular: boolean;
}

export interface ContactType {
  value: string;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
}