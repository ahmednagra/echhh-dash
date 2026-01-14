// src/components/dashboard/campaign-funnel/outreach/CommentThreadPopup.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Send, X, ChevronDown, ChevronRight, Edit2, Trash2, MoreVertical, Loader } from 'react-feather';
import { CommentsClientService } from '@/services/comments';
import { Comment as CommentType, CreateCommentRequest, UpdateCommentRequest } from '@/types/comment';
import { getStoredUser } from '@/services/auth/auth.utils';

interface CommentThreadPopupProps {
  influencer: any | null;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onUpdate?: (influencerId: string, comments: CommentType[]) => void;
}

export default function CommentThreadPopup({ 
  influencer, 
  isOpen, 
  onClose,
  position,
  onUpdate
}: CommentThreadPopupProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showOptionsFor, setShowOptionsFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get current user ID on component mount
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCurrentUserId(user.id);
      console.log('Current user ID:', user.id);
    }
  }, []);

  // Fetch comments when popup opens
  useEffect(() => {
    if (influencer && isOpen) {
      fetchComments();
      setNewComment('');
      setReplyingTo(null);
      setReplyText('');
      setEditingComment(null);
      setCurrentPage(1);
      setError(null);
    }
  }, [influencer, isOpen]);

  // Fetch comments from API
  const fetchComments = async (page = 1, append = false) => {
    if (!influencer) return;

    const isLoadingMore = page > 1;
    isLoadingMore ? setLoadingMore(true) : setLoading(true);

    try {
      const response = await CommentsClientService.getCommentsByEntity({
        entity_type: 'campaign_influencer',
        entity_id: influencer.id,
        include_private: true,
        include_replies: true,
        page,
        size: 20
      });

      if (append) {
        setComments(prev => [...prev, ...response.comments]);
      } else {
        setComments(response.comments);
        // Expand all comments with replies by default
        const commentsWithReplies = new Set<string>();
        response.comments.forEach(comment => {
          if (comment.replies && comment.replies.length > 0) {
            commentsWithReplies.add(comment.id);
          }
        });
        setExpandedComments(commentsWithReplies);
      }

      setHasMore(response.pagination.has_next);
      setCurrentPage(page);
      setError(null);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || loadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      fetchComments(currentPage + 1, true);
    }
  }, [currentPage, loadingMore, hasMore, influencer]);

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>, setText: (text: string) => void) => {
    setText(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 80) + 'px';
  };

  // Focus textareas when needed
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (replyingTo && replyTextareaRef.current) {
      setTimeout(() => replyTextareaRef.current?.focus(), 100);
    }
  }, [replyingTo]);

  useEffect(() => {
    if (editingComment && editTextareaRef.current) {
      setTimeout(() => editTextareaRef.current?.focus(), 100);
    }
  }, [editingComment]);

  // Add new comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !influencer || submitting) return;

    setSubmitting(true);
    
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticComment: CommentType = {
      id: tempId,
      content: newComment.trim(),
      parent_comment_id: null,
      commenter_id: currentUserId || 'temp-user',
      entity_type: 'campaign_influencer',
      entity_id: influencer.id,
      status: 'active',
      comment_type: 'comment',
      is_private: false,
      is_pinned: false,
      reply_count: 0,
      like_count: 0,
      edited_at: null,
      edited_by: null,
      public_link_id: null,
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      commenter: {
        id: currentUserId || 'temp-user',
        username: 'You',
        first_name: 'You',
        last_name: '',
      },
      replies: []
    };

    setComments(prev => [optimisticComment, ...prev]);
    setNewComment('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '28px';
    }

    try {
      const request: CreateCommentRequest = {
        content: optimisticComment.content,
        entity_type: 'campaign_influencer',
        entity_id: influencer.id,
        comment_type: 'comment',
        is_private: false,
        comment_metadata: {
          priority: 'medium',
          tags: ['review']
        }
      };

      const newCommentFromApi = await CommentsClientService.createComment(request);
      
      // Replace optimistic comment with real one
      setComments(prev => prev.map(c => c.id === tempId ? newCommentFromApi : c));
      
      // Notify parent component
      onUpdate?.(influencer.id, comments);
    } catch (error) {
      // Remove optimistic comment on error
      setComments(prev => prev.filter(c => c.id !== tempId));
      setError('Failed to add comment');
      setNewComment(optimisticComment.content); // Restore text
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Add reply
  const handleAddReply = async (parentId: string) => {
    if (!replyText.trim() || !influencer || submitting) return;

    setSubmitting(true);
    const tempId = `temp-reply-${Date.now()}`;
    
    // Optimistic update
    const optimisticReply: CommentType = {
      id: tempId,
      content: replyText.trim(),
      parent_comment_id: parentId,
      commenter_id: currentUserId || 'temp-user',
      entity_type: 'campaign_influencer',
      entity_id: influencer.id,
      status: 'active',
      comment_type: 'comment',
      is_private: false,
      is_pinned: false,
      reply_count: 0,
      like_count: 0,
      edited_at: null,
      edited_by: null,
      public_link_id: null,
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      commenter: {
        id: currentUserId || 'temp-user',
        username: 'You',
        first_name: 'You',
        last_name: '',
      }
    };

    // Add reply optimistically
    setComments(prev => prev.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), optimisticReply],
          reply_count: comment.reply_count + 1
        };
      }
      return comment;
    }));

    setReplyText('');
    setReplyingTo(null);

    try {
      const request: CreateCommentRequest = {
        content: optimisticReply.content,
        entity_type: 'campaign_influencer',
        entity_id: influencer.id,
        comment_type: 'comment',
        is_private: false,
        parent_comment_id: parentId
      };

      const newReply = await CommentsClientService.createComment(request);
      
      // Replace optimistic reply with real one
      setComments(prev => prev.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies?.map(r => r.id === tempId ? newReply : r)
          };
        }
        return comment;
      }));
    } catch (error) {
      // Remove optimistic reply on error
      setComments(prev => prev.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies?.filter(r => r.id !== tempId),
            reply_count: comment.reply_count - 1
          };
        }
        return comment;
      }));
      setError('Failed to add reply');
      setReplyingTo(parentId);
      setReplyText(optimisticReply.content);
      console.error('Error adding reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Update comment
  const handleUpdateComment = async (commentId: string) => {
    if (!editText.trim() || submitting) return;

    setSubmitting(true);
    
    // Store original content for rollback
    let originalContent = '';
    const findAndStoreOriginal = (comments: CommentType[]): void => {
      comments.forEach(comment => {
        if (comment.id === commentId) {
          originalContent = comment.content;
        } else if (comment.replies) {
          findAndStoreOriginal(comment.replies);
        }
      });
    };
    findAndStoreOriginal(comments);
    
    // Optimistic update
    const updateCommentRecursively = (comments: CommentType[]): CommentType[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, content: editText.trim(), edited_at: new Date().toISOString() };
        }
        if (comment.replies) {
          return { ...comment, replies: updateCommentRecursively(comment.replies) };
        }
        return comment;
      });
    };

    setComments(prev => updateCommentRecursively(prev));
    setEditingComment(null);
    setEditText('');

    try {
      const request: UpdateCommentRequest = {
        content: editText.trim(),
      };

      const updatedComment = await CommentsClientService.updateComment(commentId, request);
      
      // Update with server response
      setComments(prev => updateCommentRecursively(prev));
    } catch (error) {
      // Revert optimistic update on error
      setComments(prev => updateCommentRecursively(prev).map(comment => {
        if (comment.id === commentId) {
          return { ...comment, content: originalContent, edited_at: null };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply => 
              reply.id === commentId 
                ? { ...reply, content: originalContent, edited_at: null }
                : reply
            )
          };
        }
        return comment;
      }));
      setError('Failed to update comment');
      console.error('Error updating comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    setSubmitting(true);
    
    // Store original state for rollback
    const originalComments = [...comments];
    
    // Optimistic delete
    const deleteCommentRecursively = (comments: CommentType[]): CommentType[] => {
      return comments.filter(c => c.id !== commentId).map(comment => ({
        ...comment,
        replies: comment.replies ? deleteCommentRecursively(comment.replies) : []
      }));
    };

    setComments(prev => deleteCommentRecursively(prev));

    try {
      await CommentsClientService.deleteComment(commentId);
    } catch (error) {
      // Rollback on error
      setComments(originalComments);
      setError('Failed to delete comment');
      console.error('Error deleting comment:', error);
    } finally {
      setSubmitting(false);
      setShowOptionsFor(null);
    }
  };

  const toggleCommentExpansion = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const formatTimestamp = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diff = now.getTime() - commentDate.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const renderComment = (comment: CommentType, isReply = false) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedComments.has(comment.id);
    const isEditing = editingComment === comment.id;
    // Fix: Check if the current user ID matches the commenter ID
    const isCurrentUser = currentUserId && comment?.commenter?.id === currentUserId;

    return (
      <div key={comment.id} className={`${isReply ? 'ml-6' : ''}`}>
        <div className="flex space-x-1.5 mb-1.5">
          <img
            src={`https://ui-avatars.com/api/?name=${comment?.commenter?.first_name}+${comment?.commenter?.last_name}&background=random`}
            alt={comment?.commenter?.first_name}
            className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5"
          />
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-1.5">
                <textarea
                  ref={editTextareaRef}
                  value={editText}
                  onChange={(e) => handleTextareaChange(e, setEditText)}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 resize-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={1}
                  style={{ height: '28px' }}
                />
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleUpdateComment(comment.id)}
                    disabled={submitting || !editText.trim()}
                    className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingComment(null);
                      setEditText('');
                    }}
                    className="px-2 py-0.5 text-gray-600 hover:text-gray-800 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 rounded-md px-2 py-1.5 group relative hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-gray-900">
                      {comment?.display_name === 'Anonymous' ? 'Client' : comment?.display_name}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(comment.edited_at || comment.created_at)}
                        {comment.edited_at && ' (edited)'}
                      </span>
                      {isCurrentUser && (
                        <div className="relative">
                          <button
                            onClick={() => setShowOptionsFor(showOptionsFor === comment.id ? null : comment.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-0.5 hover:bg-gray-200 rounded ml-1"
                            title="More options"
                          >
                            <MoreVertical className="w-3 h-3 text-gray-500" />
                          </button>
                          {showOptionsFor === comment.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-[80px]">
                              <button
                                onClick={() => {
                                  setEditingComment(comment.id);
                                  setEditText(comment.content);
                                  setShowOptionsFor(null);
                                }}
                                className="flex items-center space-x-1 px-2 py-1 hover:bg-gray-50 text-xs w-full text-left"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="flex items-center space-x-1 px-2 py-1 hover:bg-gray-50 text-xs w-full text-left text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-700">{comment.content}</p>
                </div>
                
                <div className="flex items-center space-x-2 mt-0.5 ml-1">
                  {hasReplies && (
                    <button
                      onClick={() => toggleCommentExpansion(comment.id)}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
                    >
                      {isExpanded ? <ChevronDown className="w-2.5 h-2.5 mr-0.5" /> : <ChevronRight className="w-2.5 h-2.5 mr-0.5" />}
                      {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
                    </button>
                  )}
                  {!isReply && (
                    <button
                      onClick={() => setReplyingTo(comment.id)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Reply
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Reply input */}
            {replyingTo === comment.id && (
              <div className="mt-1.5 ml-1">
                <div className="flex space-x-1">
                  <textarea
                    ref={replyTextareaRef}
                    value={replyText}
                    onChange={(e) => handleTextareaChange(e, setReplyText)}
                    placeholder="Write a reply..."
                    className="flex-1 border border-gray-300 rounded-md px-2 py-1 resize-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={1}
                    style={{ height: '28px' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddReply(comment.id);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleAddReply(comment.id)}
                    disabled={!replyText.trim() || submitting}
                    className="px-2 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    className="px-2 py-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Render replies */}
            {hasReplies && isExpanded && (
              <div className="mt-1.5">
                {comment.replies?.map(reply => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen || !influencer) return null;

  return (
    <>
      {/* Fixed overlay */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
        {/* Popup positioned absolutely */}
        <div 
          className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translateX(-100%)',
            width: '320px',
            maxHeight: '400px'
          }}
        >
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-gray-200">
          <div className="flex items-center space-x-1.5">
            <img
              src={influencer.social_account?.profile_pic_url || '/default-avatar.png'}
              alt={influencer.social_account?.full_name}
              className="w-5 h-5 rounded-full"
            />
            <span className="font-medium text-gray-900 text-xs truncate">
              {influencer.social_account?.full_name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="px-2 py-1 bg-red-50 border-b border-red-100">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}
        
        {/* Comments Section */}
        <div className="flex flex-col" style={{ height: 'calc(100% - 40px)' }}>
          {/* Comments List */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-2 max-h-[280px]"
          >
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader className="w-4 h-4 animate-spin text-gray-500" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-6">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
                <p className="text-xs text-gray-500">No comments yet</p>
                <p className="text-xs text-gray-400 mt-0.5">Be the first to comment</p>
              </div>
            ) : (
              <div className="space-y-2">
                {comments.map(comment => renderComment(comment))}
                {loadingMore && (
                  <div className="flex justify-center py-2">
                    <Loader className="w-3 h-3 animate-spin text-gray-500" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* New Comment Input */}
          <div className="border-t border-gray-200 p-2">
            <div className="flex space-x-1">
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => handleTextareaChange(e, setNewComment)}
                placeholder="Write a comment..."
                className="flex-1 border border-gray-300 rounded-md px-2 py-1 resize-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[28px] max-h-[80px]"
                disabled={submitting}
                rows={1}
                style={{ height: '28px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || submitting}
                className="px-2.5 py-1.5 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting ? (
                  <Loader className="w-3 h-3 animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}