// src/components/campaigns/CampaignNotFound.tsx
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Search } from 'react-feather'; // Changed FileX to AlertCircle

interface CampaignNotFoundProps {
  error?: string | null; 
}

export default function CampaignNotFound({ error }: CampaignNotFoundProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center p-8 max-w-md mx-auto">
        <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-12 w-12 text-purple-500" /> {/* Changed from FileX */}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Campaign Not Found</h1>
        
        <p className="text-gray-600 mb-8">
          {error || "We couldn't find the campaign you're looking for. It may have been deleted or you might not have access to it."}
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/campaigns" 
            className="block bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-md"
          >
            <ArrowLeft className="inline h-4 w-4 mr-2" />
            Back to Campaigns
          </Link>
          
          <Link 
            href="/campaigns/new" 
            className="block text-purple-600 border border-purple-300 bg-white px-6 py-3 rounded-lg font-medium hover:bg-purple-50 transition-colors"
          >
            Create New Campaign
          </Link>
        </div>
      </div>
    </div>
  );
}