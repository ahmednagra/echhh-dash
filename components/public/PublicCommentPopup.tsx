// src/components/public/PublicCommentPopup.tsx
'use client';

import React from 'react';
import { X } from 'react-feather';
import { PublicComment } from '@/types/public-comments';

interface PublicCommentPopupProps {
  influencer: any | null;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  comments: PublicComment[];
  loading: boolean;
  error?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const PublicCommentPopup: React.FC<PublicCommentPopupProps> = ({
  influencer,
  isOpen,
  onClose,
  position,
  comments,
  loading,
  error,
  onLoadMore,
  hasMore
}) => {
  if (!isOpen || !influencer) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1d ago';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderComment = (comment: PublicComment, isReply = false) => (
    <div 
      key={comment.id} 
      className={`${isReply ? 'ml-8 pl-4 border-l-2 border-gray-100' : ''} mb-4`}
    >
      <div className="flex items-start space-x-3">
        <img
          src={
            comment.commenter.profile_image_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.commenter.full_name)}&background=6366f1&color=fff&size=32`
          }
          alt={comment.commenter.full_name}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm text-gray-900">
              {comment.display_name || comment.commenter.full_name}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(comment.created_at)}
            </span>
            {comment.edited_at && (
              <span className="text-xs text-gray-400 italic">edited</span>
            )}
          </div>
          <div className="text-sm text-gray-700 leading-relaxed">
            {comment.content}
          </div>
          {comment.reply_count > 0 && !isReply && (
            <div className="mt-2 text-xs text-gray-500">
              {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
            </div>
          )}
        </div>
      </div>
      
      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
        style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      />
      
      {/* Popup */}
      <div 
        className="absolute z-50 bg-white rounded-lg shadow-2xl overflow-hidden"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translateX(-100%)',
          width: '400px',
          maxHeight: '500px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <img
              src={
                influencer.social_account?.profile_pic_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.social_account?.full_name || 'Unknown')}&background=6366f1&color=fff&size=32`
              }
              alt={influencer.social_account?.full_name || 'Unknown'}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {influencer.social_account?.full_name || 'Unknown'}
              </h3>
              <p className="text-xs text-gray-500">
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {error ? (
            <div className="p-4 text-center">
              <div className="text-red-500 text-sm mb-2">Error loading comments</div>
              <div className="text-xs text-gray-500">{error}</div>
            </div>
          ) : comments.length === 0 && !loading ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No comments yet</p>
            </div>
          ) : (
            <div className="p-4">
              {comments.map(comment => renderComment(comment))}
              
              {/* Load More Button */}
              {hasMore && onLoadMore && (
                <div className="text-center mt-4">
                  <button
                    onClick={onLoadMore}
                    disabled={loading}
                    className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Load more comments'}
                  </button>
                </div>
              )}
              
              {/* Loading Indicator */}
              {loading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-500">Loading comments...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PublicCommentPopup;