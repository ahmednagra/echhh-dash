// src/types/public-comments.ts

export interface PublicCommenter {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image_url: string | null;
}

export interface PublicComment {
  id: string;
  parent_comment_id: string | null;
  commenter_id: string;
  content: string;
  entity_type: string;
  entity_id: string;
  status: string;
  comment_type: string;
  comment_metadata: any | null;
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
  commenter: PublicCommenter;
  editor: PublicCommenter | null;
  replies: PublicComment[];
  is_client_comment: boolean;
  display_name: string;
  client_info: any | null;
}

export interface PublicCommentsPagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PublicCommentsEntityInfo {
  entity_type: string;
  entity_id: string;
  total_comments: number;
  public_comments: number;
  private_comments: number;
}

export interface PublicCommentsData {
  comments: PublicComment[];
  pagination: PublicCommentsPagination;
  entity_info: PublicCommentsEntityInfo;
}

export interface PublicCommentsResponse {
  success: boolean;
  data: PublicCommentsData;
}

export interface GetPublicCommentsParams {
  entity_type: string;
  entity_id: string;
  token: string;
  page?: number;
  limit?: number;
}

export interface PublicCommentsError {
  detail: string | Array<{
    type: string;
    loc: string[];
    msg: string;
    input: any;
  }>;
}

export interface CreatePublicCommentRequest {
  content: string;
  entity_type: string;
  entity_id: string;
  comment_type?: 'comment' | 'note';
  is_private?: boolean;
  parent_comment_id?: string | null;
  comment_metadata?: {
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
    [key: string]: any;
  };
  token: string; // Required for public comments
}

export interface CreatePublicCommentResponse {
  success: boolean;
  data: PublicComment;
  message?: string;
}

// The actual response from FastAPI backend (direct PublicComment object)
export interface CreatePublicCommentBackendResponse extends PublicComment {
  // This matches the actual backend response structure
}