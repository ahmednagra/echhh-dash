// /src/components/forms/Influencer/InfluencerBulkForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import Button from '@/components/ui/Button';
import { bulkImportInfluencers } from '@/services/influencerService';
import { getClients } from '@/services/clientService';

const schema = z.object({
  client_id: z.number().min(1, 'Client is required'),
  file: z.any().refine((file) => file?.length > 0, "File is required")
});

type FormData = z.infer<typeof schema>;

interface BulkImportFormProps {
  onSuccess?: () => void;
}

interface Client {
  id: number;
  name: string;
}

export default function InfluencerBulkForm({ onSuccess }: BulkImportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filePreview, setFilePreview] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const selectedFile = watch('file');

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValue('file', e.target.files);
    setErrorMessage(null);

    // Preview file contents
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        setFilePreview(jsonData.slice(0, 5)); // Show first 5 rows as preview
      } catch (error) {
        console.error('Error parsing file', error);
        setErrorMessage('Invalid file format. Please upload a valid Excel file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onSubmit = async (data: FormData) => {
    if (!selectedFile?.[0]) {
      setErrorMessage('Please select a file');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await bulkImportInfluencers(data.client_id, selectedFile[0]);
      
      if (onSuccess) {
        onSuccess();
      }

      // Show success message
      alert(`Successfully imported ${response.success} influencers. ${response.failed > 0 ? `${response.failed} failed.` : ''}`);
      
      // Reset form
      reset();
      setFilePreview([]);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to import influencers. Please check file format.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Bulk Import Influencers</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

        <div className="space-y-2">
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">
            Excel File <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              {selectedFile?.[0] && (
                <p className="text-xs text-gray-500">{selectedFile[0].name}</p>
              )}
              <p className="text-xs text-gray-500">XLSX, XLS or CSV up to 10MB</p>
            </div>
          </div>
          {errors?.file && (
            <p className="text-sm text-red-600 mt-1">{errors?.file?.message}</p>
          )}
        </div>

        {filePreview.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">File Preview (first 5 rows)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(filePreview[0]).map((key) => (
                      <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filePreview.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((value, j) => (
                        <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {errorMessage}
          </div>
        )}
        
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
                Importing...
              </span>
            ) : (
              'Import Influencers'
            )}
          </Button>
        </div>
      </form>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-800 mb-2">File Format Requirements</h3>
        <p className="text-sm text-gray-600 mb-4">
          Your Excel/CSV file should include these columns (column names must match exactly):
        </p>
        <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
          <li><span className="font-mono">name</span> (optional) - Display name</li>
          <li><span className="font-mono">username</span> (required) - Influencer's username</li>
        </ul>
        <div className="mt-4">
          <a 
            href="/templates/influencers-import-template.xlsx" 
            download
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Download Template File
          </a>
        </div>
      </div>
    </div>
  );
}