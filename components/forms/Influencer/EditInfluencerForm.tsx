'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import { getInfluencerById, updateInfluencer } from '@/services/influencerService';

const schema = z.object({
  username: z.string().min(1, 'Name is required'),
  client_id: z.number().min(1,'Invalid email address'),
});

type FormData = z.infer<typeof schema>;

export default function EditInfluencerForm({ id, onSuccess }: { id: number; onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchInfluencer = async () => {
      try {
        const influencer = await getInfluencerById(id);
        setValue('username', influencer.username);
        setValue('client_id', influencer.client_id);
        // setValue('platform', influencer.platform);
      } catch (error) {
        console.error('Error fetching influencer:', error);
      }
    };
    fetchInfluencer();
  }, [id, setValue]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    try {
      await updateInfluencer(id, data);
      onSuccess();
    } catch (error) {
      console.error('Error updating influencer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          {...register('username')}
          id="name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
      </div>
      <div>
        <label htmlFor="client_id" className="block text-sm font-medium text-gray-700">
            Client ID
        </label>
        <input
            {...register('client_id')}
            id="client_id"
            type="number"
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
        />
        {errors.client_id && <p className="text-xs text-red-600 mt-1">{errors.client_id.message}</p>}
        </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Updating...' : 'Update Influencer'}
      </Button>
    </form>
  );
}