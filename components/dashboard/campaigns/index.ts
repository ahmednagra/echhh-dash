// src/components/dashboard/campaigns/index.ts

// Layout Components
export { default as CampaignsLayout } from './CampaignsLayout';
export { default as CampaignsContent } from './CampaignsContent';

// Header and Hero Components
export { default as CampaignsHero } from './CampaignsHero';
export { default as CampaignsHeader } from './CampaignsHeader';

// Search and Filter Components
export { default as CampaignsSearchBar } from './CampaignsSearchBar';

// Campaign Display Components
export { default as CampaignCard } from './CampaignCard';
export { default as CampaignsGrid } from './CampaignsGrid';
export { default as CampaignsEmptyState } from './CampaignsEmptyState';

// Modal and Error Components
export { default as DeleteConfirmationModal } from './DeleteConfirmationModal';
export { default as ErrorMessage } from './ErrorMessage';

// Re-export types if needed
export type { Campaign } from '@/types/campaign';