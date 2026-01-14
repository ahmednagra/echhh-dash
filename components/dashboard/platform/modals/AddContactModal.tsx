// src/components/dashboard/platform/modals/AddContactModal.tsx
'use client';
import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Mail, Phone, MessageSquare, ExternalLink, CheckCircle, Eye } from 'react-feather';
import { AssignmentInfluencer } from '@/types/assignment-influencers';
import { ContactType, CreateInfluencerContactRequest } from '@/types/influencer-contacts';
import { createInfluencerContact } from '@/services/influencer-contacts/influencer-contacts.service';
import InlineSpinner from '@/components/ui/InlineSpinner';

interface AddContactModalProps {
  member: AssignmentInfluencer | null;
  isOpen: boolean;
  onClose: () => void;
  onContactAdded: () => void;
  onViewContacts?: () => void; // Add this prop
}

const CONTACT_TYPES: { value: ContactType; label: string; icon: React.ReactNode }[] = [
  { value: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { value: 'phone', label: 'Phone', icon: <Phone className="w-4 h-4" /> },
  { value: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="w-4 h-4" /> },
  { value: 'telegram', label: 'Telegram', icon: <MessageSquare className="w-4 h-4" /> },
  { value: 'other', label: 'Other', icon: <MessageSquare className="w-4 h-4" /> },
];

export default function AddContactModal({
  member,
  isOpen,
  onClose,
  onContactAdded,
  onViewContacts
}: AddContactModalProps) {
  const [formData, setFormData] = useState({
    contact_type: 'email' as ContactType,
    contact_value: '',
    name: '',
    is_primary: false,
    platform_specific: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (member && isOpen) {
      setFormData({
        contact_type: 'email',
        contact_value: '',
        name: '',
        is_primary: false,
        platform_specific: false
      });
      setError(null);
      setSuccess(false);
    }
  }, [member, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!member) return;
    
    // Validation
    if (!formData.contact_value.trim()) {
      setError('Contact value is required');
      return;
    }
    
    if (formData.contact_type === 'email' && !validateEmail(formData.contact_value)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (formData.contact_type === 'phone' && !validatePhone(formData.contact_value)) {
      setError('Please enter a valid phone number');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const contactData: CreateInfluencerContactRequest = {
        social_account_id: member.campaign_influencer.social_account.id,
        contact_type: formData.contact_type,
        contact_value: formData.contact_value.trim(),
        name: formData.name.trim() || '',
        is_primary: formData.is_primary,
        platform_specific: formData.platform_specific
      };
      
      await createInfluencerContact(contactData);
      
      setSuccess(true);
      onContactAdded();
      
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error adding contact:', error);
      setError(error instanceof Error ? error.message : 'Failed to add contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add Contact</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mx-4 mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-800 text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Contact added successfully!
            </div>
          </div>
        )}

        {error && (
          <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-800 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Influencer Info */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <img
              src={member.campaign_influencer.social_account.profile_pic_url}
              alt={member.campaign_influencer.social_account.full_name}
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-avatar.png';
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {member.campaign_influencer.social_account.full_name}
              </div>
              <div className="text-xs text-gray-500 flex items-center">
                <a
                  href={member.campaign_influencer.social_account.account_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-600 flex items-center"
                >
                  @{member.campaign_influencer.social_account.account_handle}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
                {member.campaign_influencer.social_account.is_verified && (
                  <CheckCircle className="w-3 h-3 ml-1 text-blue-500" />
                )}
              </div>
              <div className="text-xs text-gray-400">
                {formatNumber(member.campaign_influencer.social_account.followers_count)} followers
              </div>
            </div>
          </div>

          {/* Header with View All Button */}
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-900">Contact Details</h4>
            {onViewContacts && (
              <button
                type="button"
                onClick={() => {
                  onClose(); // Close add modal first
                  onViewContacts(); // Then open view modal
                }}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center text-xs"
              >
                <Eye className="w-3 h-3 mr-1" />
                View All
              </button>
            )}
          </div>

          {/* Contact Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Type
            </label>
            <select
              name="contact_type"
              value={formData.contact_type}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
            >
              {CONTACT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.contact_type === 'email' ? 'Email Address' : 
               formData.contact_type === 'phone' ? 'Phone Number' : 
               formData.contact_type === 'whatsapp' ? 'WhatsApp Number' :
               formData.contact_type === 'telegram' ? 'Telegram Username' : 'Contact Value'}
            </label>
            <input
              type={formData.contact_type === 'email' ? 'email' : 'text'}
              name="contact_value"
              value={formData.contact_value}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              placeholder={
                formData.contact_type === 'email' ? 'example@email.com' :
                formData.contact_type === 'phone' ? '+1234567890' :
                formData.contact_type === 'whatsapp' ? '+1234567890' :
                formData.contact_type === 'telegram' ? '@username' :
                'Enter contact information'
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
            />
          </div>

          {/* Contact Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isSubmitting}
              placeholder="Manager, Assistant, etc."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_primary"
                checked={formData.is_primary}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Primary contact
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="platform_specific"
                checked={formData.platform_specific}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Platform-specific
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || success}
              className="px-3 py-2 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <InlineSpinner size="sm" />
                  <span className="ml-2">Adding...</span>
                </>
              ) : success ? (
                <span>Added</span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Add Contact
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}