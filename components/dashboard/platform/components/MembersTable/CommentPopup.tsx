// src/components/dashboard/platform/components/MembersTable/CommentPopup.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { AssignmentInfluencer } from '@/types/assignment-influencers';
import { updateAssignedInfluencerNotes } from '@/services/assigned-influencers/assigned-influencers.client';
import { toast } from 'react-hot-toast';

interface CommentPopupProps {
  member: AssignmentInfluencer | null;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onUpdate?: (member: AssignmentInfluencer) => void;
}

export default function CommentPopup({ 
  member, 
  isOpen, 
  onClose,
  position,
  onUpdate 
}: CommentPopupProps) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (member && isOpen) {
      setComment(member.notes || '');
    }
  }, [member, isOpen]);

  // Auto-resize textarea based on content
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    
    // Auto-resize functionality
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'; // Max height of 120px
  };

  // Focus and adjust textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      const textarea = textareaRef.current;
      
      // Focus the textarea
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }, 100);

      // Set initial height based on content
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(Math.min(textarea.scrollHeight, 120), 32) + 'px';
    }
  }, [isOpen]);

  const handleSaveComment = async () => {
    if (!member || !comment.trim()) return;

    setLoading(true);
    try {
      await updateAssignedInfluencerNotes(member.id, { notes: comment.trim() });
      
      toast.success('Comment updated successfully');
      
      const updatedMember = {
        ...member,
        notes: comment.trim()
      };
      
      onUpdate?.(updatedMember);
      onClose();
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !member) return null;

  return (
    <>
      {/* CHANGE: Fixed overlay still works fine */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* CHANGE: Use absolute positioning instead of fixed */}
      <div 
        className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200"
        style={{
          left: position.x,
          top: position.y,
          width: '300px'
        }}
      >
        <div className="flex items-center space-x-2 p-3 border-b border-gray-200">
          <img
            src={member.campaign_influencer.social_account.profile_pic_url || '/default-avatar.png'}
            alt={member.campaign_influencer.social_account.full_name}
            className="w-6 h-6 rounded-full"
          />
          <span className="font-medium text-gray-900 text-sm">
            {member.campaign_influencer.social_account.full_name}
          </span>
        </div>
        
        <div className="p-3">
          <textarea
            ref={textareaRef}
            value={comment}
            onChange={handleTextareaChange}
            placeholder="Comment or add notes..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-h-[32px] max-h-[120px] overflow-y-auto"
            disabled={loading}
            rows={1}
            style={{ height: '32px' }}
          />
          
          <div className="flex justify-end space-x-2 mt-3">
            <button
              onClick={onClose}
              className="px-3 py-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveComment}
              disabled={!comment.trim() || loading}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Comment'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}