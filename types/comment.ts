// src/types/comment.ts

export interface CommentUser {
  id: string;
  username: string;
  email?: string;
  first_name: string;
  last_name: string;
  role?: string;
}

export interface CommentMetadata {
  reviewer?: string;
  category?: string;
  rating?: number;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  due_date?: string;
  last_updated_reason?: string;
}

export interface Comment {
  id: string;
  parent_comment_id: string | null;
  commenter_id: string;
  content: string;
  entity_type: 'campaign_influencer' | 'campaign' | 'influencer';
  entity_id: string;
  status: 'active' | 'inactive' | 'archived';
  comment_type: 'comment' | 'note' | 'system';
  comment_metadata?: CommentMetadata | null;
  is_private: boolean;
  is_pinned: boolean;
  reply_count: number;
  like_count: number;
  edited_at: string | null;
  edited_by: string | null;
  public_link_id: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
  commenter: CommentUser;
  editor?: CommentUser | null;
  deleter?: CommentUser | null;
  parent_comment?: Comment | null;
  replies?: Comment[];
  display_name?: string;
}

export interface CreateCommentRequest {
  content: string;
  entity_type: 'campaign_influencer' | 'campaign' | 'influencer';
  entity_id: string;
  comment_type: 'comment' | 'note';
  is_private: boolean;
  parent_comment_id?: string | null;
  comment_metadata?: CommentMetadata;
}

export interface UpdateCommentRequest {
  content: string;
  comment_type?: 'comment' | 'note';
  is_private?: boolean;
  is_pinned?: boolean;
  comment_metadata?: CommentMetadata;
}

export interface CommentPagination {
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface EntityInfo {
  entity_type: string;
  entity_id: string;
  total_comments: number;
  public_comments: number;
  private_comments: number;
}

export interface GetCommentsResponse {
  comments: Comment[];
  pagination: CommentPagination;
  entity_info: EntityInfo;
}

export interface DeleteCommentResponse {
  message: string;
  comment_id: string;
  deleted_at: string;
  deleted_by: string;
}

export interface GetCommentsParams {
  entity_type: 'campaign_influencer' | 'campaign' | 'influencer';
  entity_id: string;
  include_private?: boolean;
  include_replies?: boolean;
  page?: number;
  size?: number;
}