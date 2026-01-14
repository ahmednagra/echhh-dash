// src/components/public/PublicSentimentAnalysis.tsx

import React from 'react';
import { PublicContentPost } from '@/types/public-content-posts';

interface PublicSentimentAnalysisProps {
  posts: PublicContentPost[];
  campaignName: string;
  onBack?: () => void;
}

const PublicSentimentAnalysis: React.FC<PublicSentimentAnalysisProps> = ({
  posts,
  campaignName,
  onBack,
}) => {
  // Mock sentiment data - in real app, this would come from API
  const sentimentData = {
    overall: 'Positive',
    score: 78,
    breakdown: {
      positive: 65,
      neutral: 25,
      negative: 10,
    },
    topKeywords: [
      { word: 'Amazing', count: 45 },
      { word: 'Beautiful', count: 38 },
      { word: 'Love', count: 32 },
      { word: 'Great', count: 28 },
      { word: 'Awesome', count: 25 },
    ],
    topEmojis: ['❤️', '😍', '🔥', '💯', '👏'],
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          {onBack && (
            <button
              onClick={onBack}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h2 className="text-2xl font-bold text-gray-900">Sentiment Analysis</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      {/* Overall Sentiment Score */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Sentiment</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="text-3xl font-bold text-green-600">{sentimentData.score}%</span>
                <span className="ml-3 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {sentimentData.overall}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                  style={{ width: `${sentimentData.score}%` }}
                />
              </div>
            </div>
            
            <div className="ml-8 text-6xl">
              😊
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sentiment Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Breakdown</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Positive</span>
                  <span className="text-sm font-semibold text-green-600">
                    {sentimentData.breakdown.positive}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${sentimentData.breakdown.positive}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Neutral</span>
                  <span className="text-sm font-semibold text-gray-600">
                    {sentimentData.breakdown.neutral}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-400 h-2 rounded-full"
                    style={{ width: `${sentimentData.breakdown.neutral}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Negative</span>
                  <span className="text-sm font-semibold text-red-600">
                    {sentimentData.breakdown.negative}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${sentimentData.breakdown.negative}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Keywords */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Keywords</h3>
            
            <div className="space-y-3">
              {sentimentData.topKeywords.map((keyword, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{keyword.word}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(keyword.count / 50) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8 text-right">{keyword.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Emojis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Emojis</h3>
            
            <div className="flex items-center justify-around text-4xl">
              {sentimentData.topEmojis.map((emoji, index) => (
                <div key={index} className="flex flex-col items-center">
                  <span className="mb-2">{emoji}</span>
                  <span className="text-xs text-gray-500">{25 - index * 3}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comments Analysis Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments Analysis</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Comments Analyzed</span>
                <span className="text-sm font-semibold text-gray-900">
                  {posts.reduce((sum, p) => sum + (p.engagement?.comment_count || 0), 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Sentiment Score</span>
                <span className="text-sm font-semibold text-green-600">+{sentimentData.score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Response Rate</span>
                <span className="text-sm font-semibold text-gray-900">24%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Response Time</span>
                <span className="text-sm font-semibold text-gray-900">2.5 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicSentimentAnalysis;