'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import { createInfluencer } from '@/services/influencerService';
import { getClients } from '@/services/clientService';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(1, 'Username is required'),
  client_id: z.number().min(1, 'Client is required'),
});

type FormData = z.infer<typeof schema>;

interface InfluencerFormProps {
  onSuccess: () => void;
}

interface Client {
  id: number;
  name: string;
}

export default function InfluencerForm({ onSuccess }: InfluencerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Fetch clients on mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await getClients();
        setClients(data);
      } catch (error) {
        console.error('Failed to load clients', error);
      } finally {
        setIsLoadingClients(false);
      }
    };
    loadClients();
  }, []);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    try {
      await createInfluencer(data);
      onSuccess();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to add influencer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Influencer</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            {...register('username')}
            id="username"
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.username ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
            placeholder="e.g., johndoe"
          />
          {errors.username && (
            <p className="text-sm text-red-600 mt-1">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="client_id" className="block text-sm font-medium text-gray-700">
            Client <span className="text-red-500">*</span>
          </label>
          <select
            {...register('client_id', { valueAsNumber: true })}
            id="client_id"
            disabled={isLoadingClients}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.client_id ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
            onChange={(e) => setValue('client_id', Number(e.target.value))}
          >
            <option value="">Select a client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          {errors.client_id && (
            <p className="text-sm text-red-600 mt-1">{errors.client_id.message}</p>
          )}
        </div>
        
        <div className="pt-2">
          <Button 
            type="submit" 
            disabled={isSubmitting || isLoadingClients}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Add Influencer'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}