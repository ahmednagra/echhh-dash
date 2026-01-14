//src/components/profile-analysis/ProfileDetails.tsx
'use client';

import { ArrowLeft, BarChart3, Heart, MessageSquare, Eye, GridIcon, ListIcon, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { InstagramUserDetails, InstagramPostsResponse } from '@/types/instagram';
import { formatNumber } from '@/utils/format';
import { useState, useRef } from 'react';
import ProfileAnalytics from './ProfileAnalytics';
import Image from 'next/image';

interface ProfileDetailsProps {
  profile: InstagramUserDetails;
  posts: InstagramPostsResponse | null;
  onGenerateAnalysis: () => void;
  onBack: () => void;
  onClear: () => void;
  isAnalyzing: boolean;
  analysisResults: any;
  openaiAnalysis?: any;
}

export default function ProfileDetails({ 
  profile, 
  onGenerateAnalysis,
  onBack,
  onClear,
  posts,
  isAnalyzing,
  analysisResults,
  openaiAnalysis
}: ProfileDetailsProps) {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [postsExpanded, setPostsExpanded] = useState<boolean>(true);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const handleVideoPlay = (postId: string) => {
    if (playingVideo && playingVideo !== postId) {
      const prevVideo = videoRefs.current[playingVideo];
      if (prevVideo) {
        prevVideo.pause();
      }
    }
    setPlayingVideo(postId);
  };

  const setVideoRef = (postId: string) => (el: HTMLVideoElement | null) => {
    videoRefs.current[postId] = el;
  };
  
  const openInstagramPost = (postId: string) => {
    window.open(`https://www.instagram.com/p/${postId}`, '_blank');
  };

  // Toggle posts expanded/collapsed
  const togglePosts = () => {
    setPostsExpanded(!postsExpanded);
    
    // When generating analysis, auto-collapse posts
    if (isAnalyzing && postsExpanded) {
      setPostsExpanded(false);
    }
  };
  
  // Auto-collapse posts when analysis is done
  if (analysisResults && postsExpanded) {
    setPostsExpanded(false);
  }

  if (!profile) {
    return (
      <div className="mt-6">
        <button 
          onClick={onBack}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to search
        </button>
        
        <div className="bg-red-50 border border-red-300 p-6 rounded-lg text-center">
          <p className="text-red-700">Profile information could not be loaded.</p>
          <button 
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Go back to search
          </button>
        </div>
      </div>
    );
  }

  // Count how many videos are available
  const videoCount = posts?.posts?.filter(post => post.is_video)?.length || 0;
  
  return (
    <div className="mt-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start justify-between">
          {/* Left side - Profile picture and info */}
          <div className="flex items-start">
          <div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={profile.profile_pic_url_hd || profile.profile_pic_url || '/user/profile-placeholder.png'}
              alt={profile.username}
              width={64}
              height={64}
              className="object-cover"
              unoptimized
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/user/profile-placeholder.png';
              }}
            />
          </div>
            
            <div className="ml-4">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                {profile.is_verified && (
                  <span className="ml-2 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-1">@{profile.username}</p>
              
              {profile.category && (
                <p className="text-sm text-gray-500">{profile.category}</p>
              )}
            </div>
          </div>

          {/* Right side - Analysis button */}
          <button
            onClick={onGenerateAnalysis}
            disabled={isAnalyzing || videoCount === 0}
            className={`flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg transition self-start ${
              isAnalyzing || videoCount === 0 ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="mr-2 w-5 h-5" />
                Generate Profile Analysis
              </>
            )}
          </button>

          <button
            onClick={onClear}
            disabled={isAnalyzing || videoCount === 0}
            className={`flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg transition self-start ${
              isAnalyzing || videoCount === 0 ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >Clear Report</button>
        </div>
        
        {/* PROFILE STATS */}
        <div className="grid grid-cols-3 gap-4 my-6 text-center">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold">{formatNumber(profile.follower_count)}</div>
            <div className="text-gray-500 text-sm">Followers</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold">{formatNumber(profile.following_count)}</div>
            <div className="text-gray-500 text-sm">Following</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold">{formatNumber(profile.media_count)}</div>
            <div className="text-gray-500 text-sm">Posts</div>
          </div>
        </div>
        
        {/* BIO SECTION */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Bio</h3>
          <p className="text-gray-700 whitespace-pre-line">{profile.biography || 'No biography available'}</p>
        </div>

        {/* POSTS SECTION - COLLAPSIBLE */}
        {posts && posts.posts && Array.isArray(posts.posts) && posts.posts.length > 0 ? (
          <div className="mt-8">
            <div 
              className="flex justify-between items-center mb-4 cursor-pointer p-2 rounded hover:bg-gray-50"
              onClick={togglePosts}
            >
              <h3 className="font-semibold text-lg flex items-center">
                <span>Recent Posts ({posts.count || posts.posts.length})</span>
                <button 
                  className="ml-2 p-1 rounded-full hover:bg-gray-200 focus:outline-none"
                  aria-label={postsExpanded ? "Collapse posts" : "Expand posts"}
                >
                  {postsExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </h3>
              
              {/* View Toggle Buttons - Only show when expanded */}
              {postsExpanded && (
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewMode('grid');
                    }}
                    className={`flex items-center px-4 py-2 ${viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    aria-label="Grid view"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    Grid
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewMode('table');
                    }}
                    className={`flex items-center px-4 py-2 ${viewMode === 'table' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    aria-label="Table view"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                    Table
                  </button>
                </div>
              )}
            </div>

            {/* Posts content - conditionally rendered based on expanded state */}
            {postsExpanded && (
              <>
                {/* Grid View */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {posts.posts.map((post, index) => {
                      const postId = post.shortcode || `post-${index}`;
                      const isVideo = post.is_video;
                      const videoUrl = post.video_url;
                      const likeCount = post.like_count || 0;
                      const commentCount = post.comment_count || 0;
                      const viewCount = post.video_view_count || 0;
                      const playCount = post.video_play_count || 0;
                      
                      return (
                        <div 
                          key={post.id || `post-${index}`} 
                          className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => openInstagramPost(postId)}
                        >
                          <div className="relative aspect-square group">
                            {/* Video Player */}
                            {isVideo && videoUrl && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <video
                                  ref={setVideoRef(postId)}
                                  src={videoUrl}
                                  className="w-full h-full object-cover"
                                  controls={playingVideo === postId}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVideoPlay(postId);
                                  }}
                                  onPlay={() => handleVideoPlay(postId)}
                                  muted
                                  loop
                                />
                              </div>
                            )}
                            
                            {/* Image Thumbnail */}
                            {(!isVideo || (isVideo && playingVideo !== postId)) && (
                              <Image
                                src={post.display_url || post.thumbnail_src || '/post-placeholder.jpg'}
                                alt="Instagram post"
                                fill
                                className="object-cover"
                                unoptimized
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.onerror = null
                                  target.src = '/post-placeholder.jpg'
                                }}
                              />
                            )}
                            
                            {/* Video Indicator */}
                            {isVideo && (
                              <div className="absolute top-2 right-2 bg-black bg-opacity-70 rounded-full p-1">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                              </div>
                            )}
                            
                            {/* Engagement Stats Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                              <div className="flex items-center justify-between text-white text-xs">
                                <div className="flex items-center space-x-2">
                                  <Heart className="w-3 h-3" />
                                  <span>{formatNumber(likeCount)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MessageSquare className="w-3 h-3" />
                                  <span>{formatNumber(commentCount)}</span>
                                </div>
                                {isVideo && (
                                  <div className="flex items-center space-x-2">
                                    <Eye className="w-3 h-3" />
                                    <span>{formatNumber(viewCount || playCount)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                              <span className="text-white font-medium text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
                                View on Instagram
                              </span>
                            </div>
                          </div>
                          
                          {/* Post caption and date */}
                          <div className="p-3">
                            {post.edge_media_to_caption?.edges?.length > 0 && (
                              <p className="text-sm text-gray-700 line-clamp-2">
                                {post.edge_media_to_caption.edges[0].node.text}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {post.taken_at_timestamp 
                                ? new Date(post.taken_at_timestamp * 1000).toLocaleDateString()
                                : 'Date unknown'
                              }
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Table/Detail View */}
                {viewMode === 'table' && (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Post
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Caption
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center space-x-1">
                              <Heart className="w-3 h-3" />
                              <span>Likes</span>
                            </div>
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="w-3 h-3" />
                              <span>Comments</span>
                            </div>
                          </th>
                          {/* Add view count column conditionally */}
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>Views</span>
                            </div>
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {posts.posts.map((post, index) => {
                          const postId = post.shortcode || `post-${index}`;
                          const isVideo = post.is_video;
                          const likeCount = post.like_count || 0;
                          const commentCount = post.comment_count || 0;
                          const viewCount = post.video_view_count || post.video_play_count || 0;
                          const caption = post.caption || '';
                          const postDate = post.taken_at_timestamp 
                            ? new Date(post.taken_at_timestamp * 1000).toLocaleDateString()
                            : 'Unknown date';
                            
                          return (
                            <tr key={post.id || `post-${index}`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-12 w-12 rounded overflow-hidden">
                                    <Image
                                      src={post.thumbnail_src || post.display_url || '/post-placeholder.jpg'}
                                      alt="Post thumbnail"
                                      fill
                                      className="object-cover"
                                      unoptimized={true} // Recommended for dynamic external images
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = '/post-placeholder.jpg';
                                      }}
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      Post #{index + 1}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {isVideo ? 'Video' : 'Image'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 line-clamp-2">
                                  {caption || 'No caption'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {postDate}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatNumber(likeCount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatNumber(commentCount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {isVideo ? formatNumber(viewCount) : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <a 
                                  href={`https://www.instagram.com/p/${postId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  View
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="mt-8 bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-700">No posts available for this profile.</p>
          </div>
        )}
      </div>
      
      {/* Profile Analytics section */}
      {(isAnalyzing || analysisResults) && (
        <ProfileAnalytics 
          profile={profile}
          analysisResults={analysisResults}
          isAnalyzing={isAnalyzing}
          openaiAnalysis={openaiAnalysis}
        />
      )}
    </div>
  );
}