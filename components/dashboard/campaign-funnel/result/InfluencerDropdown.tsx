// src/components/dashboard/campaign-funnel/result/InfluencerDropdown.tsx
'use client';

import { useState, useEffect } from 'react';
import { Campaign } from '@/types/campaign';
import { getCampaignListMembers } from '@/services/campaign/campaign-list.service';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Influencer {
  id: string; // campaign_influencer_id
  social_account_id: string;
  full_name: string;
  username: string;
  profile_pic_url: string;
  followers_count: number;
  is_verified: boolean;
  email?: string;
  status: string;
  social_account?: any;
}

interface VideoResult {
  user?: {
    username?: string;
    user_ig_id?: string;
    full_name?: string;
    profile_pic_url?: string;
    followers_count?: number;
    is_verified?: boolean;
    external_id?: string | null;
    platform_url?: string | null;
  };
  raw_response?: {
    data?: Array<{
      url?: string | null;
      profile?: {
        platform_username?: string;
        external_id?: string | null;
        url?: string | null;
      };
      collaborators?: Array<{
        platform_username?: string;
      }>;
      mentions?: Array<{
        platform_username?: string;
      }>;
    }>;
  };
  platform?: string;
}

// NEW: Selected influencer data interface for callback
export interface SelectedInfluencerData {
  id: string;
  name: string;
  username: string;
  profilePicUrl: string;
  followersCount: number;
  isVerified: boolean;
  email?: string;
}

interface InfluencerDropdownProps {
  campaignData: Campaign;
  value: string;
  onChange: (campaignInfluencerId: string) => void;
  error?: string;
  videoResult?: VideoResult | null;
  renderMode?: 'dropdown' | 'info-card';
  platform?: string | null;
  // NEW: Optional callback to pass full influencer data when selected
  onInfluencerSelect?: (influencerData: SelectedInfluencerData | null) => void;
}

interface MatchResult {
  matched: boolean;
  campaign_influencer_id: string | null;
  confidence: 'high' | 'medium' | 'low' | 'none';
  matched_by: 'platform_id' | 'username' | 'account_handle' | 'none';
  influencer_data?: Influencer;
}

// ============================================================================
// MATCHING UTILITY FUNCTIONS
// ============================================================================

const normalizeString = (str: string | undefined | null): string => {
  if (!str) return '';
  return str.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
};

const extractUsernameFromUrl = (url: string | null): string | null => {
  if (!url) return null;
  
  try {
    const youtubeHandleMatch = url.match(/youtube\.com\/@([\w.-]+)/i);
    if (youtubeHandleMatch) return youtubeHandleMatch[1];
    
    const youtubeChannelMatch = url.match(/youtube\.com\/channel\/([\w-]+)/i);
    if (youtubeChannelMatch) return youtubeChannelMatch[1];
    
    const tiktokMatch = url.match(/tiktok\.com\/@([\w.-]+)/i);
    if (tiktokMatch) return tiktokMatch[1];
    
    const instagramMatch = url.match(/instagram\.com\/([\w.-]+)/i);
    if (instagramMatch && !['p', 'reel', 'tv', 'reels', 'stories'].includes(instagramMatch[1])) {
      return instagramMatch[1];
    }
    
    return null;
  } catch {
    return null;
  }
};

const matchInfluencerFromVideo = (
  videoResult: VideoResult | null,
  influencers: Influencer[]
): MatchResult => {
  if (!videoResult || !influencers?.length) {
    return {
      matched: false,
      campaign_influencer_id: null,
      confidence: 'none',
      matched_by: 'none',
    };
  }

  const normalize = (v?: string | null) =>
    (v || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  const videoUser = videoResult.user || {};
  const rawData = videoResult?.raw_response?.data?.[0];
  const rawProfile = rawData?.profile || {};

  const usernamesToCheck = new Set<string>();
  const externalIdsToCheck = new Set<string>();
  const urlsToCheck = new Set<string>();
  
  const addUsername = (v?: string | null) => v && usernamesToCheck.add(normalize(v));
  const addExternalId = (v?: string | null) => v && externalIdsToCheck.add(v.trim());
  const addUrl = (v?: string | null) => v && urlsToCheck.add(v.toLowerCase().trim());

  addUsername(videoUser.username);
  addUsername(videoUser.user_ig_id);
  addUsername(rawProfile.platform_username);
  
  addExternalId(videoUser.external_id);
  addExternalId(rawProfile.external_id);
  
  addUrl(videoUser.platform_url);
  addUrl(rawProfile.url);
  addUrl(rawData?.url);

  urlsToCheck.forEach(url => {
    const extractedUsername = extractUsernameFromUrl(url);
    if (extractedUsername) {
      addUsername(extractedUsername);
    }
  });

  rawData?.collaborators?.forEach((c: any) => addUsername(c.platform_username));
  rawData?.mentions?.forEach((m: any) => addUsername(m.platform_username));

  const videoFullName = normalize(videoUser.full_name);

  let bestMatch: MatchResult = {
    matched: false,
    campaign_influencer_id: null,
    confidence: 'none',
    matched_by: 'none',
  };
  let highestScore = 0;

  for (const inf of influencers) {
    const acc = inf.social_account || {};
    const metrics = (acc.additional_metrics || {}) as any;

    const influencerUsernames = [
      acc.account_handle,
      metrics.username,
      metrics.platform_username,
      inf.username,
    ].filter(Boolean).map(normalize);

    const influencerExternalIds = [
      acc.external_id,
      metrics.external_id,
      acc.platform_user_id,
    ].filter(Boolean).map((id: string) => id.trim());

    const influencerUrls = [
      acc.account_url,
      metrics.url,
      metrics.profile_url,
    ].filter(Boolean).map((url: string) => url.toLowerCase().trim());

    influencerUrls.forEach(url => {
      const extractedUsername = extractUsernameFromUrl(url);
      if (extractedUsername) {
        influencerUsernames.push(normalize(extractedUsername));
      }
    });

    const influencerFullName = normalize(inf.full_name);

    let score = 0;
    let matchedBy: MatchResult['matched_by'] = 'none';

    if (influencerUsernames.some(h => usernamesToCheck.has(h) && h.length > 0)) {
      score = 1.0;
      matchedBy = 'username';
    }
    else if (influencerExternalIds.some(id => externalIdsToCheck.has(id) && id.length > 0)) {
      score = 0.95;
      matchedBy = 'platform_id';
    }
    else if (urlsToCheck.size > 0 && influencerUsernames.length > 0) {
      for (const url of urlsToCheck) {
        for (const username of influencerUsernames) {
          if (username.length >= 3 && (url.includes(`@${username}`) || url.includes(`/${username}`))) {
            score = 0.9;
            matchedBy = 'account_handle';
            break;
          }
        }
        if (score > 0) break;
      }
    }
    
    if (score === 0 && influencerUrls.length > 0) {
      for (const infUrl of influencerUrls) {
        for (const videoUsername of usernamesToCheck) {
          if (videoUsername.length >= 3 && (infUrl.includes(`@${videoUsername}`) || infUrl.includes(`/${videoUsername}`))) {
            score = 0.85;
            matchedBy = 'account_handle';
            break;
          }
        }
        if (score > 0) break;
      }
    }

    if (score === 0 && videoFullName && influencerFullName && 
        videoFullName.length >= 3 && influencerFullName === videoFullName) {
      score = 0.8;
      matchedBy = 'username';
    }
    else if (score === 0 && videoFullName && influencerFullName && 
             videoFullName.length >= 5 && influencerFullName.length >= 5) {
      if (influencerFullName.includes(videoFullName) || videoFullName.includes(influencerFullName)) {
        score = 0.7;
        matchedBy = 'username';
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = {
        matched: score >= 0.7,
        campaign_influencer_id: inf.id,
        confidence:
          score >= 0.95
            ? 'high'
            : score >= 0.85
            ? 'medium'
            : score >= 0.7
            ? 'low'
            : 'none',
        matched_by: matchedBy,
        influencer_data: inf,
      };
    }
  }

  return bestMatch;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const InfluencerDropdown: React.FC<InfluencerDropdownProps> = ({
  campaignData,
  value,
  onChange,
  error,
  videoResult = null,
  renderMode = 'dropdown',
  platform = null,
  onInfluencerSelect, // NEW: Optional callback
}) => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>('');
  const [isMatching, setIsMatching] = useState(false);
  const [autoMatched, setAutoMatched] = useState(false);
  const [matchConfidence, setMatchConfidence] = useState<'high' | 'medium' | 'low' | 'none'>('none');
  const [matchedInfluencer, setMatchedInfluencer] = useState<Influencer | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); // NEW: Search functionality

  const campaignListId = campaignData?.campaign_lists?.[0]?.id;

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (campaignListId) {
      fetchInfluencers();
    } else {
      setIsLoading(false);
      setFetchError('No campaign list found');
    }
  }, [campaignListId]);

  useEffect(() => {
    if (videoResult && influencers.length > 0 && !value) {
      performAutoMatch();
    }
  }, [videoResult, influencers]);

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const fetchInfluencers = async () => {
    if (!campaignListId) return;

    try {
      setIsLoading(true);
      setFetchError('');

      const response = (await getCampaignListMembers(campaignListId, 1, 1000)) as any;
      
      if (!response?.success || !response?.influencers) {
        throw new Error(response?.error || 'Invalid response format');
      }

      const fetchedInfluencers: Influencer[] = response.influencers.map((item: any) => {
        const socialAccount = item.social_account;
        const emailContact = socialAccount?.additional_metrics?.contact_details?.find(
          (contact: any) => contact.type === 'email' && contact.is_primary
        );

        return {
          id: item.id,
          social_account_id: socialAccount?.id || '',
          full_name: socialAccount?.full_name || socialAccount?.account_handle || 'Unknown',
          username: socialAccount?.account_handle || 'unknown',
          profile_pic_url: socialAccount?.profile_pic_url || '',
          followers_count: socialAccount?.followers_count || 0,
          is_verified: socialAccount?.is_verified || false,
          email: emailContact?.value || null,
          status: item.status?.name || 'discovered',
          social_account: socialAccount,
        };
      });

      setInfluencers(fetchedInfluencers);
    } catch (err) {
      console.error('❌ Error fetching influencers:', err);
      setFetchError(err instanceof Error ? err.message : 'Failed to load influencers');
    } finally {
      setIsLoading(false);
    }
  };

  const performAutoMatch = async () => {
    try {
      setIsMatching(true);
      console.log('🎯 Attempting auto-match Influencer...');
     
      const matchResult = matchInfluencerFromVideo(videoResult, influencers);

      if (matchResult.matched && matchResult.campaign_influencer_id) {
        onChange(matchResult.campaign_influencer_id);
        setAutoMatched(true);
        setMatchConfidence(matchResult.confidence);
        setMatchedInfluencer(matchResult.influencer_data || null);

        // NEW: Call optional callback with influencer data
        if (onInfluencerSelect && matchResult.influencer_data) {
          const inf = matchResult.influencer_data;
          onInfluencerSelect({
            id: inf.id,
            name: inf.full_name,
            username: inf.username,
            profilePicUrl: inf.profile_pic_url,
            followersCount: inf.followers_count,
            isVerified: inf.is_verified,
            email: inf.email,
          });
        }
      } else {
        setAutoMatched(false);
        setMatchConfidence('none');
        setMatchedInfluencer(null);
        onInfluencerSelect?.(null);
      }
    } catch (error) {
      console.error('❌ Auto-match error:', error);
      setAutoMatched(false);
      setMatchConfidence('none');
    } finally {
      setIsMatching(false);
    }
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleInfluencerChange = (campaignInfluencerId: string) => {
    onChange(campaignInfluencerId);

    // NEW: Find the selected influencer and pass data via callback
    const selectedInf = influencers.find(inf => inf.id === campaignInfluencerId);
    if (selectedInf && onInfluencerSelect) {
      onInfluencerSelect({
        id: selectedInf.id,
        name: selectedInf.full_name,
        username: selectedInf.username,
        profilePicUrl: selectedInf.profile_pic_url,
        followersCount: selectedInf.followers_count,
        isVerified: selectedInf.is_verified,
        email: selectedInf.email,
      });
    } else if (!campaignInfluencerId && onInfluencerSelect) {
      onInfluencerSelect(null);
    }

    if (autoMatched && campaignInfluencerId !== value) {
      setAutoMatched(false);
      setMatchConfidence('none');
    }
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatFollowers = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // NEW: Filter influencers by search query
  const filteredInfluencers = influencers.filter(inf => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      inf.full_name.toLowerCase().includes(query) ||
      inf.username.toLowerCase().includes(query) ||
      (inf.email && inf.email.toLowerCase().includes(query))
    );
  });

  // ============================================================================
  // RENDER: INFO CARD MODE
  // ============================================================================

  if (renderMode === 'info-card') {
    if (isLoading || isMatching) {
      return (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
            <span className="text-sm text-blue-700 font-medium">
              {isLoading ? 'Loading influencers...' : 'Matching influencer...'}
            </span>
          </div>
        </div>
      );
    }

    if (autoMatched && matchedInfluencer && videoResult?.user) {
      return (
        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl p-5 border-2 border-green-300 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Matched Influencer
            </h4>
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full border border-green-300">
              🎯 Auto-matched
            </span>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={matchedInfluencer.profile_pic_url || '/user/profile-placeholder.png'}
                  alt={matchedInfluencer.username}
                  className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/user/profile-placeholder.png';
                  }}
                />
                {matchedInfluencer.is_verified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="font-bold text-gray-900 truncate text-lg">
                    {matchedInfluencer.full_name}
                  </p>
                </div>
                <p className="text-sm text-gray-600 truncate mb-2">
                  @{matchedInfluencer.username}
                </p>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">
                      {formatFollowers(matchedInfluencer.followers_count)} followers
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  Match confidence: <span className="font-semibold text-green-700">{matchConfidence}</span>
                </span>
                <button
                  onClick={() => {
                    setAutoMatched(false);
                    setMatchedInfluencer(null);
                    onChange('');
                    onInfluencerSelect?.(null);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Change influencer
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // No match found - show dropdown
    return (
      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-300">
        <div className="flex items-start space-x-3 mb-4">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-yellow-900">No matching influencer found</p>
            <p className="text-xs text-yellow-700 mt-1">Please select the influencer manually from the list below</p>
          </div>
        </div>

        {renderDropdown()}
      </div>
    );
  }

  // ============================================================================
  // RENDER: DROPDOWN MODE
  // ============================================================================

  return renderDropdown();

  // ============================================================================
  // DROPDOWN RENDERER - Custom Searchable Dropdown with Influencer Cards
  // ============================================================================

  function renderDropdown() {
    // Find currently selected influencer for display
    const selectedInf = influencers.find(inf => inf.id === value);

    return (
      <div>
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-700">
            Select Influencer <span className="text-red-500">*</span>
          </label>
          {autoMatched && (
            <span className="bg-green-100 text-green-800 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-green-300">
              🎯 Auto-matched
            </span>
          )}
        </div>

        {isLoading && (
          <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-pink-500 border-t-transparent" />
              <span className="text-gray-500 text-xs sm:text-sm">Loading influencers...</span>
            </div>
          </div>
        )}

        {isMatching && !isLoading && (
          <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-blue-300 rounded-lg bg-blue-50 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-blue-500 border-t-transparent" />
              <span className="text-blue-600 text-xs sm:text-sm">Matching influencer...</span>
            </div>
          </div>
        )}

        {!isLoading && !isMatching && fetchError && (
          <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-red-300 rounded-lg bg-red-50">
            <p className="text-red-600 text-xs sm:text-sm flex items-center">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="truncate">{fetchError}</span>
            </p>
          </div>
        )}

        {!isLoading && !isMatching && !fetchError && influencers.length === 0 && (
          <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-yellow-300 rounded-lg bg-yellow-50">
            <p className="text-yellow-700 text-xs sm:text-sm">No influencers found. Add influencers in the Discover tab.</p>
          </div>
        )}

        {!isLoading && !isMatching && !fetchError && influencers.length > 0 && (
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            {/* Search Input - Responsive */}
            <div className="p-1.5 sm:p-2 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search influencers..."
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 pl-8 sm:pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-xs sm:text-sm bg-white"
                />
                <svg
                  className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Influencer List - Responsive */}
            <div className="max-h-36 sm:max-h-48 overflow-y-auto">
              {filteredInfluencers.length === 0 ? (
                <div className="p-3 sm:p-4 text-center text-gray-500 text-xs sm:text-sm">
                  No influencers match your search.
                </div>
              ) : (
                filteredInfluencers.map((influencer) => (
                  <button
                    key={influencer.id}
                    type="button"
                    onClick={() => handleInfluencerChange(influencer.id)}
                    className={`w-full flex items-center p-2 sm:p-3 hover:bg-pink-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                      value === influencer.id ? 'bg-pink-50 border-l-2 border-l-pink-500' : ''
                    }`}
                  >
                    {/* Profile Picture - Responsive */}
                    <img
                      src={influencer.profile_pic_url || '/user/profile-placeholder.png'}
                      alt={influencer.username}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/user/profile-placeholder.png';
                      }}
                    />
                    
                    {/* Influencer Info - Responsive */}
                    <div className="ml-2 sm:ml-3 flex-1 text-left min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                          {influencer.full_name}
                        </span>
                        {influencer.is_verified && (
                          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
                        <span className="truncate">@{influencer.username}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">{formatFollowers(influencer.followers_count)} followers</span>
                        <span className="sm:hidden">{formatFollowers(influencer.followers_count)}</span>
                      </div>
                    </div>

                    {/* Selected Indicator - Responsive */}
                    {value === influencer.id && (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Selected Influencer Display - Responsive */}
            {selectedInf && (
              <div className="p-1.5 sm:p-2 border-t border-gray-200 bg-green-50">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-[10px] sm:text-xs text-green-700 truncate">
                    Selected: <strong className="font-semibold">{selectedInf.full_name}</strong>
                    <span className="hidden sm:inline"> (@{selectedInf.username})</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-red-500 text-xs sm:text-sm mt-1.5 sm:mt-2 flex items-center">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
};

export default InfluencerDropdown;