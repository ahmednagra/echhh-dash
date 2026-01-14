// =====================================
// src/components/dashboard/platform/components/MembersTable/InlineContactAdder.tsx
// =====================================

'use client';

import { useState } from 'react';
import { Users, Check, XCircle } from 'react-feather';
import { AssignmentInfluencer } from '@/types/assignment-influencers';
import { ContactType } from '@/types/influencer-contacts';
import { createInfluencerContact } from '@/services/influencer-contacts/influencer-contacts.service';
import InlineSpinner from '@/components/ui/InlineSpinner';

interface InlineContactAdderProps {
  member: AssignmentInfluencer;
  onContactAdded: (member: AssignmentInfluencer) => void;
}

export default function InlineContactAdder({ 
  member, 
  onContactAdded 
}: InlineContactAdderProps) {
  const [isActive, setIsActive] = useState(false);
  const [contactType, setContactType] = useState<ContactType>('email');
  const [contactValue, setContactValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactTypes = [
    { value: 'email' as ContactType, label: 'Em' },
    { value: 'whatsapp' as ContactType, label: 'Wh' },
    { value: 'telegram' as ContactType, label: 'Te' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactValue.trim()) return;

    setIsSubmitting(true);
    try {
      await createInfluencerContact({
        social_account_id: member.campaign_influencer.social_account.id,
        contact_type: contactType,
        contact_value: contactValue.trim(),
        is_primary: true,
        platform_specific: false,
        name: ''
      });

      setContactValue('');
      setIsActive(false);
      onContactAdded(member);
    } catch (error) {
      console.error('Error adding contact:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isActive) {
    return (
      <button
        onClick={() => setIsActive(true)}
        className="text-teal-600 hover:text-teal-700 text-sm flex items-center"
      >
        <Users className="w-4 h-4 mr-1" />
        Add
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-1 min-w-0">
      <select
        value={contactType}
        onChange={(e) => setContactType(e.target.value as ContactType)}
        className="text-xs border border-gray-300 rounded px-1 py-1 w-12"
        disabled={isSubmitting}
      >
        {contactTypes.map(type => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
      <input
        type={contactType === 'email' ? 'email' : 'text'}
        value={contactValue}
        onChange={(e) => setContactValue(e.target.value)}
        placeholder={contactType === 'email' ? 'email@...' : 'contact...'}
        className="text-xs border border-gray-300 rounded px-2 py-1 flex-1 min-w-0"
        disabled={isSubmitting}
        autoFocus
      />
      <div className="flex space-x-1">
        <button
          type="submit"
          disabled={isSubmitting || !contactValue.trim()}
          className="text-teal-600 hover:text-teal-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            <InlineSpinner size="sm" />
          ) : (
            <Check className="w-3 h-3" />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsActive(false);
            setContactValue('');
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircle className="w-3 h-3" />
        </button>
      </div>
    </form>
  );
}