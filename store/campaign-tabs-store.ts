// src/store/campaign-tabs-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { DiscoverInfluencer } from '@/lib/types';
import { DiscoveredCreatorsResults } from '@/types/insights-iq';
import { CampaignListMembersResponse } from '@/services/campaign/campaign-list.service';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';
import { Platform } from '@/types/platform';

// Define state shape for each tab
interface DiscoverTabState {
  activeFilter: 'discovered' | 'shortlisted';
  influencers: DiscoverInfluencer[];
  discoveredCreatorsResults: DiscoveredCreatorsResults | null;
  totalResults: number;
  searchParams: InfluencerSearchFilter | null;
  selectedPlatform: Platform | null;
  // shortlistedMembers: CampaignListMembersResponse | null;
  // shortlistedCount: number;
  currentPage: number;
  pageSize: number;
  platforms: Platform[];
}

interface OutreachTabState {
  selectedInfluencers: string[];
  messageTemplates: any[];
}

interface ManagementTabState {
  campaignStatus: string;
}

interface ResultTabState {
  activeView: 'scheduled' | 'published';
  analyticsData: any;
}

interface PaymentsTabState {
  paymentStatus: string;
}

// Main store state
interface CampaignTabsState {
  // Store states by campaign ID
  discoverStates: Record<string, DiscoverTabState>;
  outreachStates: Record<string, OutreachTabState>;
  managementStates: Record<string, ManagementTabState>;
  resultStates: Record<string, ResultTabState>;
  paymentsStates: Record<string, PaymentsTabState>;
  
  // Actions for Discover tab
  getDiscoverState: (campaignId: string) => DiscoverTabState | undefined;
  setDiscoverState: (campaignId: string, state: Partial<DiscoverTabState>) => void;
  clearDiscoverState: (campaignId: string) => void;
  
  // Actions for Outreach tab
  getOutreachState: (campaignId: string) => OutreachTabState | undefined;
  setOutreachState: (campaignId: string, state: Partial<OutreachTabState>) => void;
  clearOutreachState: (campaignId: string) => void;
  
  // Actions for Management tab
  getManagementState: (campaignId: string) => ManagementTabState | undefined;
  setManagementState: (campaignId: string, state: Partial<ManagementTabState>) => void;
  clearManagementState: (campaignId: string) => void;
  
  // Actions for Result tab
  getResultState: (campaignId: string) => ResultTabState | undefined;
  setResultState: (campaignId: string, state: Partial<ResultTabState>) => void;
  clearResultState: (campaignId: string) => void;
  
  // Actions for Payments tab
  getPaymentsState: (campaignId: string) => PaymentsTabState | undefined;
  setPaymentsState: (campaignId: string, state: Partial<PaymentsTabState>) => void;
  clearPaymentsState: (campaignId: string) => void;
  
  // Global actions
  clearAllStates: () => void;
  clearCampaignStates: (campaignId: string) => void;
}

// Create the store with persistence
export const useCampaignTabsStore = create<CampaignTabsState>()(
  persist(
    immer((set, get) => ({
      // Initial states
      discoverStates: {},
      outreachStates: {},
      managementStates: {},
      resultStates: {},
      paymentsStates: {},
      
      // Discover tab actions
      getDiscoverState: (campaignId: string) => {
        return get().discoverStates[campaignId];
      },
      
      setDiscoverState: (campaignId: string, state: Partial<DiscoverTabState>) => {
        set((draft) => {
          if (!draft.discoverStates[campaignId]) {
            draft.discoverStates[campaignId] = {} as DiscoverTabState;
          }
          Object.assign(draft.discoverStates[campaignId], state);
        });
      },
      
      clearDiscoverState: (campaignId: string) => {
        set((draft) => {
          delete draft.discoverStates[campaignId];
        });
      },
      
      // Outreach tab actions
      getOutreachState: (campaignId: string) => {
        return get().outreachStates[campaignId];
      },
      
      setOutreachState: (campaignId: string, state: Partial<OutreachTabState>) => {
        set((draft) => {
          if (!draft.outreachStates[campaignId]) {
            draft.outreachStates[campaignId] = {} as OutreachTabState;
          }
          Object.assign(draft.outreachStates[campaignId], state);
        });
      },
      
      clearOutreachState: (campaignId: string) => {
        set((draft) => {
          delete draft.outreachStates[campaignId];
        });
      },
      
      // Management tab actions
      getManagementState: (campaignId: string) => {
        return get().managementStates[campaignId];
      },
      
      setManagementState: (campaignId: string, state: Partial<ManagementTabState>) => {
        set((draft) => {
          if (!draft.managementStates[campaignId]) {
            draft.managementStates[campaignId] = {} as ManagementTabState;
          }
          Object.assign(draft.managementStates[campaignId], state);
        });
      },
      
      clearManagementState: (campaignId: string) => {
        set((draft) => {
          delete draft.managementStates[campaignId];
        });
      },
      
      // Result tab actions
      getResultState: (campaignId: string) => {
        return get().resultStates[campaignId];
      },
      
      setResultState: (campaignId: string, state: Partial<ResultTabState>) => {
        set((draft) => {
          if (!draft.resultStates[campaignId]) {
            draft.resultStates[campaignId] = {} as ResultTabState;
          }
          Object.assign(draft.resultStates[campaignId], state);
        });
      },
      
      clearResultState: (campaignId: string) => {
        set((draft) => {
          delete draft.resultStates[campaignId];
        });
      },
      
      // Payments tab actions
      getPaymentsState: (campaignId: string) => {
        return get().paymentsStates[campaignId];
      },
      
      setPaymentsState: (campaignId: string, state: Partial<PaymentsTabState>) => {
        set((draft) => {
          if (!draft.paymentsStates[campaignId]) {
            draft.paymentsStates[campaignId] = {} as PaymentsTabState;
          }
          Object.assign(draft.paymentsStates[campaignId], state);
        });
      },
      
      clearPaymentsState: (campaignId: string) => {
        set((draft) => {
          delete draft.paymentsStates[campaignId];
        });
      },
      
      // Global actions
      clearAllStates: () => {
        set((draft) => {
          draft.discoverStates = {};
          draft.outreachStates = {};
          draft.managementStates = {};
          draft.resultStates = {};
          draft.paymentsStates = {};
        });
      },
      
      clearCampaignStates: (campaignId: string) => {
        set((draft) => {
          delete draft.discoverStates[campaignId];
          delete draft.outreachStates[campaignId];
          delete draft.managementStates[campaignId];
          delete draft.resultStates[campaignId];
          delete draft.paymentsStates[campaignId];
        });
      },
    })),
    {
      name: 'campaign-tabs-storage', // name of the item in storage
      storage: createJSONStorage(() => sessionStorage), // use sessionStorage for tab persistence
      partialize: (state) => ({
        // Only persist the state data, not the actions
        discoverStates: state.discoverStates,
        outreachStates: state.outreachStates,
        managementStates: state.managementStates,
        resultStates: state.resultStates,
        paymentsStates: state.paymentsStates,
      }),
    }
  )
);

// Custom hooks for each tab
export const useDiscoverTabState = (campaignId: string) => {
  const store = useCampaignTabsStore();
  return {
    state: store.getDiscoverState(campaignId),
    setState: (state: Partial<DiscoverTabState>) => store.setDiscoverState(campaignId, state),
    clearState: () => store.clearDiscoverState(campaignId),
  };
};

export const useOutreachTabState = (campaignId: string) => {
  const store = useCampaignTabsStore();
  return {
    state: store.getOutreachState(campaignId),
    setState: (state: Partial<OutreachTabState>) => store.setOutreachState(campaignId, state),
    clearState: () => store.clearOutreachState(campaignId),
  };
};

export const useManagementTabState = (campaignId: string) => {
  const store = useCampaignTabsStore();
  return {
    state: store.getManagementState(campaignId),
    setState: (state: Partial<ManagementTabState>) => store.setManagementState(campaignId, state),
    clearState: () => store.clearManagementState(campaignId),
  };
};

export const useResultTabState = (campaignId: string) => {
  const store = useCampaignTabsStore();
  return {
    state: store.getResultState(campaignId),
    setState: (state: Partial<ResultTabState>) => store.setResultState(campaignId, state),
    clearState: () => store.clearResultState(campaignId),
  };
};

export const usePaymentsTabState = (campaignId: string) => {
  const store = useCampaignTabsStore();
  return {
    state: store.getPaymentsState(campaignId),
    setState: (state: Partial<PaymentsTabState>) => store.setPaymentsState(campaignId, state),
    clearState: () => store.clearPaymentsState(campaignId),
  };
};