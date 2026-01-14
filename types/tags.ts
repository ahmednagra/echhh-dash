// src/types/tags.ts

/**
 * Tag entity returned from API
 */
export interface Tag {
  id: string;
  entity_type: string;
  entity_id: string;
  tag: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    full_name: string;
    email: string;
  };
}

/**
 * Simplified tag for display (used in campaign influencer response)
 */
export interface InfluencerTag {
  id: string;
  tag: string;
}

/**
 * Request to add tag to campaign influencer
 */
export interface AddTagToInfluencerRequest {
  tag_id?: string;
  tag_name?: string;
}

/**
 * Response from adding tag to campaign influencer
 */
export interface AddTagToInfluencerResponse {
  campaign_influencer_id: string;
  tags: InfluencerTag[];
  tag_created: boolean;
  added_tag: InfluencerTag;
}

/**
 * Request to create bulk tags
 */
export interface CreateBulkTagsRequest {
  entity_type: string;
  entity_id: string;
  tags: string[];
}

/**
 * Response from bulk tag creation
 */
export interface CreateBulkTagsResponse {
  success: boolean;
  message: string;
  created_count: number;
  tags: Tag[];
}

/**
 * Paginated response for fetching all tags
 */
export interface GetAllTagsResponse {
  tags: Tag[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/**
 * Request to remove tag from campaign influencer
 */
export interface RemoveTagFromInfluencerRequest {
  tag_id: string;
}

/**
 * Response from removing tag from campaign influencer
 */
export interface RemoveTagFromInfluencerResponse {
  success: boolean;
  message: string;
  campaign_influencer_id: string;
  removed_tag_id: string;
  remaining_tags: InfluencerTag[];
}