// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/OutreachMessageForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown } from 'react-feather';

interface MessageTemplate {
  id: string;
  subject: string;
  content: string;
  campaign_id: string;
  company_id: string;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  message: string;
}

interface OutreachMessageFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: { subject: string; message: string; campaignId?: string }) => void;
  messageTemplates?: MessageTemplate[];
  isLoadingTemplates?: boolean;
  isSavingTemplate?: boolean;
}

const OutreachMessageForm: React.FC<OutreachMessageFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  messageTemplates = [],
  isLoadingTemplates = false,
  isSavingTemplate = false
}) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [showPreviousTemplates, setShowPreviousTemplates] = useState(false);
  const [errors, setErrors] = useState<{ subject?: string; message?: string }>({});

  // Convert MessageTemplate to Campaign format for compatibility with existing code
  const previousCampaigns: Campaign[] = messageTemplates.map(template => ({
    id: template.id,
    name: `Template - ${new Date(template.created_at).toLocaleDateString()}`,
    subject: template.subject,
    message: template.content
  }));

  // Default message template
  const defaultMessage = `Hi {{influencer_username}},

I hope this message finds you well! I'm reaching out from {{brand_name}} because we absolutely love your content, especially your recent post about {{recent_post_topic}}.

We're launching our {{campaign_name}} campaign and think you'd be a perfect fit. We'd love to collaborate with you and offer:

• {{collaboration_offer}}
• {{product_value}} worth of products
• {{additional_benefits}}

Would you be interested in learning more? I'd love to send you the campaign details!

Best regards,
{{agent_name}}
{{brand_name}} Influencer Team`;

  // Initialize with default message when form opens
  useEffect(() => {
    if (isOpen && !subject && !message) {
      setSubject('Collaboration Opportunity with {{brand_name}}');
      setMessage(defaultMessage);
    }
  }, [isOpen]);

  // Handle campaign selection
  const handleCampaignSelect = (campaign: Campaign) => {
    // Find the corresponding template
    const template = messageTemplates.find(t => t.id === campaign.id);
    setSelectedTemplate(template || null);
    setSubject(campaign.subject);
    setMessage(campaign.message);
    setShowPreviousTemplates(false);
    setErrors({}); // Clear any existing errors
  };

  // Handle form validation
  const validateForm = () => {
    const newErrors: { subject?: string; message?: string } = {};
    
    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (onSubmit) {
        onSubmit({
          subject: subject.trim(),
          message: message.trim(),
          campaignId: selectedTemplate?.id
        });
      }
      console.log('Form submitted:', { subject, message, campaignId: selectedTemplate?.id });
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPreviousTemplates) {
        const target = event.target as Element;
        if (!target.closest('.campaign-dropdown')) {
          setShowPreviousTemplates(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showPreviousTemplates]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop - Very light gray overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity transition-opacity duration-300"
        onClick={handleBackdropClick}
        style={{ opacity: '50%' }}
      />
      
      {/* New arrow button on the left side outside the form - closer to form */}
      <button
        onClick={onClose}
        className="fixed right-[600px] top-1/2 transform -translate-y-1/2 z-50 p-3 bg-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 hover:bg-gray-50 transition-all duration-300 ease-out group"
        title="Close"
      >
        <svg className="h-5 w-5 text-gray-500 group-hover:text-gray-700 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* Sliding Form Panel - Increased width to 640px */}
      <div className={`absolute right-0 top-0 h-full w-[580px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header with both arrow buttons */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 relative">
            <div className="flex items-center flex-1">
              <h2 className="text-lg font-semibold text-gray-900 flex-1">Outreach Message</h2>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Subject Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (errors.subject) setErrors(prev => ({ ...prev, subject: undefined }));
                  }}
                  placeholder="Message Subject"
                  disabled={isSavingTemplate}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:opacity-50 ${
                    errors.subject ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                )}
              </div>

              {/* Previous Campaign Selection */}
              <div className="relative campaign-dropdown">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Previous Campaign:
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPreviousTemplates(!showPreviousTemplates)}
                    disabled={isLoadingTemplates || isSavingTemplate}
                    className="inline-flex items-center px-3 py-1 text-sm text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isLoadingTemplates ? 'Loading...' : '+add'}
                  </button>
                  
                  {/* Deselect button - only show when campaign is selected */}
                  {selectedTemplate && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(null);
                        setSubject('Message Subject');
                        setMessage(defaultMessage);
                      }}
                      disabled={isSavingTemplate}
                      className="inline-flex items-center px-2 py-1 text-xs text-red-600 hover:text-red-700 transition-colors border border-red-200 rounded disabled:opacity-50"
                      title="Deselect template"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                {/* Previous Campaigns Dropdown */}
                {showPreviousTemplates && (
                  <div className="absolute left-0 mt-1 w-80 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                    <div className="py-1">
                      {isLoadingTemplates ? (
                        <div className="px-4 py-3 text-sm text-gray-500 flex items-center">
                          <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full mr-2" />
                          Loading templates...
                        </div>
                      ) : previousCampaigns.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No previous templates found
                        </div>
                      ) : (
                        previousCampaigns.map((campaign) => (
                          <button
                            key={campaign.id}
                            type="button"
                            onClick={() => handleCampaignSelect(campaign)}
                            className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium">{campaign.name}</div>
                            <div className="text-xs text-gray-500 mt-1 truncate">{campaign.subject}</div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
                
                {selectedTemplate && (
                  <div className="mt-2 p-2 bg-purple-50 rounded-md">
                    <p className="text-sm text-purple-700">
                      Selected: <span className="font-medium">Template - {new Date(selectedTemplate.created_at).toLocaleDateString()}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Message Field - Increased height but adjusted for proper footer visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors(prev => ({ ...prev, message: undefined }));
                  }}
                  placeholder="Write your message here..."
                  rows={16}
                  disabled={isSavingTemplate}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none disabled:opacity-50 ${
                    errors.message ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    title="Add attachment"
                    disabled={isSavingTemplate}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    title="Add emoji"
                    disabled={isSavingTemplate}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={isSavingTemplate}
                  className="px-6 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingTemplate ? (
                    <div className="flex items-center">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Saving...
                    </div>
                  ) : (
                    'Start Outreach →'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OutreachMessageForm;