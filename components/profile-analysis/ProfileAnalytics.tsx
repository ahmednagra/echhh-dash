// src/components/profile-analysis/ProfileAnalytics.tsx
'use client';

import { useState } from 'react';
import { 
  ArrowUpDown, 
  BarChart3, 
  Layers, 
  TrendingUp, 
  Users, 
  Award
} from 'lucide-react';
import { InstagramUserDetails } from '@/types/instagram';
import AIContentInsights from './AIContentInsights';
import IndividualVideos from './IndividualVideos';

interface ProfileAnalyticsProps {
  profile: InstagramUserDetails;
  analysisResults: any;
  isAnalyzing: boolean;
  openaiAnalysis: any;
}

export default function ProfileAnalytics({ 
  profile, 
  analysisResults,
  isAnalyzing,
  openaiAnalysis
}: ProfileAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'insights' | 'videos'>('insights');
  
  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-lg font-medium text-gray-700">Analyzing profile content...</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700 mt-4">
          <p>This may take a few minutes as we process all video content and generate insights.</p>
        </div>
      </div>
    );
  }
  
  if (!analysisResults) {
    return null;
  }

  // Extract metrics from analysis results
  const videoCount = analysisResults.videos?.length || 0;
  
  // Calculate sample metrics for summary stats
  const sortedVideos = [...(analysisResults.videos || [])].sort((a, b) => {
    const aViews = a.metrics?.video_view_count || 0;
    const aLikes = a.metrics?.edge_media_preview_like?.count || a.metrics?.like_count || 0;
    const aComments = a.metrics?.edge_media_to_comment?.count || a.metrics?.comment_count || 0;
    
    const bViews = b.metrics?.video_view_count || 0;
    const bLikes = b.metrics?.edge_media_preview_like?.count || b.metrics?.like_count || 0;
    const bComments = b.metrics?.edge_media_to_comment?.count || b.metrics?.comment_count || 0;
    
    const aTotal = aViews + aLikes + aComments;
    const bTotal = bViews + bLikes + bComments;
    
    return bTotal - aTotal; // Sort in descending order
  });
  
  // Calculate sample metrics
  const avgEngagement = sortedVideos.reduce((total: number, video: any) => {
    const likes = video.metrics?.edge_media_preview_like?.count || video.metrics?.like_count || 0;
    const comments = video.metrics?.edge_media_to_comment?.count || video.metrics?.comment_count || 0;
    const views = video.metrics?.video_view_count || 0;
    return total + ((likes + comments) / (views || 1) * 100);
  }, 0) / (videoCount || 1);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-4">
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <BarChart3 className="mr-2 w-5 h-5 text-blue-600" />
        Profile Analysis for @{profile.username}
      </h2>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center text-blue-600 mb-2">
            <Layers className="w-5 h-5 mr-2" />
            <h3 className="font-medium">Videos Analyzed</h3>
          </div>
          <p className="text-2xl font-bold">{videoCount}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center text-green-600 mb-2">
            <TrendingUp className="w-5 h-5 mr-2" />
            <h3 className="font-medium">Avg. Engagement</h3>
          </div>
          <p className="text-2xl font-bold">{avgEngagement.toFixed(2)}%</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center text-purple-600 mb-2">
            <Users className="w-5 h-5 mr-2" />
            <h3 className="font-medium">Follower/Following</h3>
          </div>
          <p className="text-2xl font-bold">
            {(profile.follower_count / (profile.following_count || 1)).toFixed(2)}
          </p>
        </div>
        
        <div className="bg-amber-50 p-4 rounded-lg">
          <div className="flex items-center text-amber-600 mb-2">
            <ArrowUpDown className="w-5 h-5 mr-2" />
            <h3 className="font-medium">Content Consistency</h3>
          </div>
          <p className="text-2xl font-bold">{videoCount > 3 ? 'High' : 'Low'}</p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex -mb-px">
          <button
            className={`py-2 px-4 font-medium text-sm mr-8 border-b-2 ${
              activeTab === 'insights' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('insights')}
          >
            AI Content Insights
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'videos' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('videos')}
          >
            Individual Videos
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'insights' ? (
        <AIContentInsights 
          openaiAnalysis={openaiAnalysis} 
          profile={profile}
        />
      ) : (
        <IndividualVideos 
        analysisResults={sortedVideos} 
        />
      )}
      
      {/* Key Findings - Show on both tabs */}
      
    </div>
  );
}