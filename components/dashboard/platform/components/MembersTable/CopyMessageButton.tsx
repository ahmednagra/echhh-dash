// =====================================
// src/components/dashboard/platform/components/MembersTable/CopyMessageButton.tsx
// =====================================

'use client';

import { useState } from 'react';
import { Copy, Check } from 'react-feather';
import { AssignmentInfluencer } from '@/types/assignment-influencers';
import { AgentAssignment, MessageTemplate } from '@/types/assignments';

interface CopyMessageButtonProps {
  member: AssignmentInfluencer;
  messageTemplates: MessageTemplate[];
  assignment: AgentAssignment;
  onCopy?: () => void;
}

export default function CopyMessageButton({ 
  member, 
  messageTemplates,
  assignment,
  onCopy
}: CopyMessageButtonProps) {
  const [copied, setCopied] = useState(false);
  
  const getMessageTemplate = (): MessageTemplate | null => {
    if (!messageTemplates || messageTemplates.length === 0) {
      return null;
    }
    
    const attemptsCount = member.attempts_made || 0;
    
    if (attemptsCount === 0) {
      return messageTemplates.find(template => template.template_type === 'initial') || null;
    } else {
      const followupTemplate = messageTemplates.find(template => 
        template.template_type === 'followup' && 
        template.followup_sequence === attemptsCount
      );
      
      if (!followupTemplate) {
        const allFollowups = messageTemplates
          .filter(template => template.template_type === 'followup')
          .sort((a, b) => (b.followup_sequence || 0) - (a.followup_sequence || 0));
        
        return allFollowups[0] || null;
      }
      
      return followupTemplate;
    }
  };
  
  const handleCopyMessage = async () => {
    const template = getMessageTemplate();
    
    if (!template) {
      alert('No message template available for this attempt level');
      return;
    }
    
    const brandName = assignment?.campaign?.brand_name || 'Your Brand';
    const campaignName = assignment?.campaign?.name || 'Campaign';
    
    // Get influencer username from account_handle
    const influencerUsername = member.campaign_influencer.social_account.account_handle;
    
    const replacements = {
      '{{influencer_username}}': influencerUsername,
      '{{influencer_name}}': influencerUsername, // Keeping both for backward compatibility
      '{{brand_name}}': brandName,
      '{{campaign_name}}': campaignName,
      '{{agent_name}}': 'Agent',
      '{{recent_post_topic}}': 'your amazing content',
      '{{collaboration_offer}}': 'exciting collaboration opportunity',
      '{{product_value}}': '$XXX',
      '{{additional_benefits}}': 'additional perks and benefits'
    };
    
    let processedSubject = template.subject || '';
    let processedContent = template.content || '';
    
    Object.entries(replacements).forEach(([placeholder, value]) => {
      processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), value);
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
    });
    
    const fullMessage = processedSubject ? 
      `${processedSubject}\n\n${processedContent}` : 
      processedContent;
    
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      onCopy?.();
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };
  
  const template = getMessageTemplate();
  
  return (
    <button
      onClick={handleCopyMessage}
      disabled={!template}
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
        copied 
          ? 'bg-green-100 text-green-700 border border-green-300'
          : template
            ? 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
            : 'bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed'
      }`}
      title={template ? `${template.template_type} message` : 'No message template available'}
    >
      {copied ? (
        <Check className="w-3 h-3 mr-1" />
      ) : (
        <Copy className="w-3 h-3 mr-1" />
      )}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}