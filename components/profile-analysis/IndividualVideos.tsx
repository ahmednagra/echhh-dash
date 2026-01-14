// src/components/profile-analysis/IndividualVideos.tsx
'use client';

import { useState, useMemo } from 'react';
import { Video, Eye, ThumbsUp, MessageCircle, Clock, SortAsc, SortDesc, Filter } from 'lucide-react';
import { InstagramUserDetails } from '@/types/instagram';

interface IndividualVideosProps {
  analysisResults: any;
}

type SortOption = 'performance' | 'views' | 'likes' | 'comments' | 'date';
type SortDirection = 'asc' | 'desc';

export default function IndividualVideos({ 
  analysisResults
}: IndividualVideosProps) {
  const [sortBy, setSortBy] = useState<SortOption>('performance');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Check if we have video data to display
  if (!analysisResults || analysisResults.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-700">No video analysis data available.</p>
      </div>
    );
  }
  

  // Sort videos based on selected criteria
  const sortedVideos = useMemo(() => {
    if (!analysisResults) return [];
    
    return [...analysisResults].sort((a, b) => {
    
      let aValue, bValue;
      
      switch (sortBy) {
        case 'views':
          aValue = a.metrics?.video_view_count || 0;
          bValue = b.metrics?.video_view_count || 0;
          break;
        case 'likes':
          aValue = a.metrics?.edge_media_preview_like?.count || a.metrics?.like_count || 0;
          bValue = b.metrics?.edge_media_preview_like?.count || b.metrics?.like_count || 0;
          break;
        case 'comments':
          aValue = a.metrics?.edge_media_to_comment?.count || a.metrics?.comment_count || 0;
          bValue = b.metrics?.edge_media_to_comment?.count || b.metrics?.comment_count || 0;
          break;
        case 'date':
          aValue = a.metrics?.taken_at_timestamp || 0;
          bValue = b.metrics?.taken_at_timestamp || 0;
          break;
        case 'performance':
        default:
          // Calculate total engagement score
          const aViews = a.metrics?.video_view_count || 0;
          const aLikes = a.metrics?.edge_media_preview_like?.count || a.metrics?.like_count || 0;
          const aComments = a.metrics?.edge_media_to_comment?.count || a.metrics?.comment_count || 0;
          
          const bViews = b.metrics?.video_view_count || 0;
          const bLikes = b.metrics?.edge_media_preview_like?.count || b.metrics?.like_count || 0;
          const bComments = b.metrics?.edge_media_to_comment?.count || b.metrics?.comment_count || 0;
          
          aValue = aViews + aLikes + aComments;
          bValue = bViews + bLikes + bComments;
          break;
      }
      
      return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
    });
  }, [analysisResults?.videos, sortBy, sortDirection]);

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // Change sort criteria
  const changeSortCriteria = (criteria: SortOption) => {
    if (sortBy === criteria) {
      toggleSortDirection();
    } else {
      setSortBy(criteria);
      setSortDirection('desc'); // Default to descending when changing criteria
    }
  };
// console.log('sortedVideos33: ', sortedVideos)
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Video className="mr-2 w-5 h-5 text-blue-600" />
        Video Content Analysis
      </h3>
      
      {/* Sorting controls */}
      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg mb-4">
        <div className="flex items-center mr-4">
          <Filter className="w-4 h-4 mr-1 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
        </div>
        
        <button 
          onClick={() => changeSortCriteria('performance')}
          className={`px-3 py-1 text-sm rounded-full flex items-center ${
            sortBy === 'performance' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Performance
          {sortBy === 'performance' && (
            sortDirection === 'desc' 
              ? <SortDesc className="ml-1 w-3 h-3" /> 
              : <SortAsc className="ml-1 w-3 h-3" />
          )}
        </button>
        
        <button 
          onClick={() => changeSortCriteria('views')}
          className={`px-3 py-1 text-sm rounded-full flex items-center ${
            sortBy === 'views' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Views
          {sortBy === 'views' && (
            sortDirection === 'desc' 
              ? <SortDesc className="ml-1 w-3 h-3" /> 
              : <SortAsc className="ml-1 w-3 h-3" />
          )}
        </button>
        
        <button 
          onClick={() => changeSortCriteria('likes')}
          className={`px-3 py-1 text-sm rounded-full flex items-center ${
            sortBy === 'likes' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Likes
          {sortBy === 'likes' && (
            sortDirection === 'desc' 
              ? <SortDesc className="ml-1 w-3 h-3" /> 
              : <SortAsc className="ml-1 w-3 h-3" />
          )}
        </button>
        
        <button 
          onClick={() => changeSortCriteria('comments')}
          className={`px-3 py-1 text-sm rounded-full flex items-center ${
            sortBy === 'comments' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Comments
          {sortBy === 'comments' && (
            sortDirection === 'desc' 
              ? <SortDesc className="ml-1 w-3 h-3" /> 
              : <SortAsc className="ml-1 w-3 h-3" />
          )}
        </button>
        
        <button 
          onClick={() => changeSortCriteria('date')}
          className={`px-3 py-1 text-sm rounded-full flex items-center ${
            sortBy === 'date' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Date
          {sortBy === 'date' && (
            sortDirection === 'desc' 
              ? <SortDesc className="ml-1 w-3 h-3" /> 
              : <SortAsc className="ml-1 w-3 h-3" />
          )}
        </button>
      </div>
      
      {/* Videos grid */}
      <div className="grid grid-cols-1 gap-6">
        {sortedVideos.map((videoAnalysis: any, index: number) => {
          // Calculate metrics
          const views = videoAnalysis.metrics?.video_view_count || 0;
          const likes = videoAnalysis.metrics?.edge_media_preview_like?.count || videoAnalysis.metrics?.like_count || 0;
          const comments = videoAnalysis.metrics?.edge_media_to_comment?.count || videoAnalysis.metrics?.comment_count || 0;
          const totalScore = views + likes + comments;
          const engagementRate = views > 0 ? ((likes + comments) / views * 100).toFixed(2) : '0.00';
          
          return (
            <div key={videoAnalysis.shortcode} className="border rounded-lg overflow-hidden shadow-sm">
              <div className="bg-gray-50 p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Video #{index + 1}</h4>
                  <span className="text-xs text-gray-500">Performance Score: {totalScore.toLocaleString()}</span>
                </div>
                <a 
                  href={`https://www.instagram.com/p/${videoAnalysis.shortcode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm hover:underline flex items-center"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View on Instagram
                </a>
              </div>
              
              <div className="p-4">
                {/* Video metrics */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div className="p-3 bg-gray-50 rounded flex flex-col items-center">
                    <Eye className="w-4 h-4 text-blue-500 mb-1" />
                    <div className="text-sm text-gray-500">Views</div>
                    <div className="font-semibold">
                      {views.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded flex flex-col items-center">
                    <ThumbsUp className="w-4 h-4 text-green-500 mb-1" />
                    <div className="text-sm text-gray-500">Likes</div>
                    <div className="font-semibold">
                      {likes.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded flex flex-col items-center">
                    <MessageCircle className="w-4 h-4 text-purple-500 mb-1" />
                    <div className="text-sm text-gray-500">Comments</div>
                    <div className="font-semibold">
                      {comments.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                {/* Video caption */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Caption:</h5>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {videoAnalysis.metrics?.edge_media_to_caption?.edges?.[0]?.node?.text || 
                      videoAnalysis.metrics?.caption || 'No caption'}
                  </p>
                </div>
                
                {/* Engagement rate */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Engagement Rate:</h5>
                  <div className="bg-blue-50 text-blue-700 p-2 rounded text-sm">
                    {`${engagementRate}% (${likes + comments} engagements / ${views} views)`}
                  </div>
                </div>
                
                {/* Posted date */}
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Posted:</h5>
                    <p className="text-sm text-gray-600">
                      {videoAnalysis.metrics?.taken_at_timestamp 
                        ? new Date(videoAnalysis.metrics.taken_at_timestamp * 1000).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Unknown date'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Summary stats */}
      <div className="bg-blue-50 p-4 rounded-lg mt-6">
        <h4 className="font-medium text-blue-700 mb-2">Video Content Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-3 rounded shadow-sm">
            <div className="text-sm text-gray-500">Total Videos</div>
            <div className="font-semibold text-lg">{sortedVideos.length}</div>
          </div>
          <div className="bg-white p-3 rounded shadow-sm">
            <div className="text-sm text-gray-500">Avg. Views</div>
            <div className="font-semibold text-lg">
              {Math.round(sortedVideos.reduce((sum, video) => 
                sum + (video.metrics?.video_view_count || 0), 0) / sortedVideos.length).toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-3 rounded shadow-sm">
            <div className="text-sm text-gray-500">Avg. Likes</div>
            <div className="font-semibold text-lg">
              {Math.round(sortedVideos.reduce((sum, video) => 
                sum + (video.metrics?.edge_media_preview_like?.count || video.metrics?.like_count || 0), 0) / sortedVideos.length).toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-3 rounded shadow-sm">
            <div className="text-sm text-gray-500">Avg. Comments</div>
            <div className="font-semibold text-lg">
              {Math.round(sortedVideos.reduce((sum, video) => 
                sum + (video.metrics?.edge_media_to_comment?.count || video.metrics?.comment_count || 0), 0) / sortedVideos.length).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}