'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import { getClientById, updateClient } from '@/services/clientService';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  company_name: z.string().min(2, 'Company Name is required'),
});

type FormData = z.infer<typeof schema>;

export default function EditClientForm({ id, onSuccess }: { id: number; onSuccess: () => void }) {
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
    const fetchClient = async () => {
      try {
        const client = await getClientById(id);
        setValue('name', client.name);
        setValue('company_name', client.company_name);
        // setValue('platform', client.platform);
      } catch (error) {
        console.error('Error fetching client:', error);
      }
    };
    fetchClient();
  }, [id, setValue]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    try {
      await updateClient(id, data);
      onSuccess();
    } catch (error) {
      console.error('Error updating client:', error);
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
          {...register('name')}
          id="name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
            Client ID
        </label>
        <input
            {...register('company_name')}
            id="company_name"
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
        />
        {errors.company_name && <p className="text-xs text-red-600 mt-1">{errors.company_name.message}</p>}
        </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Updating...' : 'Update Client'}
      </Button>
    </form>
  );
}