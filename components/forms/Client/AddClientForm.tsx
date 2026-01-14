'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import { createClient } from '@/services/clientService';

// Form schema using Zod
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  company_name: z.string().min(1, 'Company Name is required'),
});

type FormData = z.infer<typeof schema>;

interface ClientFormProps {
  onSuccess: () => void; // Callback for successful form submission
}

export default function AddClientForm({ onSuccess }: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    try {
      await createClient(data);
      onSuccess(); // Call the onSuccess callback
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to add client.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Client</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name')}
            id="name"
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
            placeholder="e.g., John Doe"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('company_name')}
            id="company_name"
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.company_name ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
            placeholder="e.g., Microsoft, Meta"
          />
          {errors.company_name && (
            <p className="text-sm text-red-600 mt-1">{errors.company_name.message}</p>
          )}
        </div> 

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Add Client'}
        </Button>
      </form>
    </div>
  );
}