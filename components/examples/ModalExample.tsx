// src/components/examples/ModalExample.tsx

'use client';

import { useState } from 'react';
import Modal, { ModalAction } from '@/components/ui/Modal';
import UserAvatar from '@/components/ui/UserAvatar';

export default function ModalExample() {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Confirm Delete Modal Example
  const deleteActions: ModalAction[] = [
    {
      label: 'Cancel',
      onClick: () => setShowConfirmDelete(false),
      variant: 'secondary',
    },
    {
      label: 'Delete',
      onClick: async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false);
        setShowConfirmDelete(false);
      },
      variant: 'danger',
      loading: loading,
    },
  ];

  // Form Modal Example
  const formActions: ModalAction[] = [
    {
      label: 'Cancel',
      onClick: () => setShowFormModal(false),
      variant: 'secondary',
    },
    {
      label: 'Save Changes',
      onClick: () => {
        console.log('Save changes');
        setShowFormModal(false);
      },
      variant: 'primary',
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Modal Examples</h2>
      
      <div className="space-x-2">
        <button 
          onClick={() => setShowConfirmDelete(true)}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Show Confirm Delete
        </button>
        
        <button 
          onClick={() => setShowFormModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Show Form Modal
        </button>
      </div>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        title="Confirm Delete"
        size="xs"
        actions={deleteActions}
        loading={loading}
      >
        <div className="p-4">
          <UserAvatar 
            name="John Smith"
            imageUrl="https://example.com/avatar.jpg"
            className="mb-3"
          />
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this item? This action cannot be undone.
          </p>
        </div>
      </Modal>

      {/* Form Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title="Edit Profile"
        size="md"
        actions={formActions}
      >
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input 
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input 
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea 
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter description"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}