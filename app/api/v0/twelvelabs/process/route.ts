// src/app/api/twelvelabs/process/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import FormData from 'form-data';

const API_KEY = process.env.TL_API_KEY;
const API_BASE_URL = process.env.TL_API_BASE_URL;

if (!API_KEY || !API_BASE_URL) {
  console.log('API_KEY: ', API_KEY)
  console.log('API_BASE_URL: ', API_BASE_URL)
  console.error('Twelve Labs API configuration is missing');
  throw new Error('Server configuration error');
}

interface Index {
  _id: string;
  index_name: string;
  created_at: string;
  updated_at: string;
}

interface IndexesResponse {
  data: Index[];
  page_info: {
    page: number;
    limit_per_page: number;
    total_page: number;
    total_results: number;
  };
}

interface CreateIndexResponse {
  _id: string;
}

interface Video {
  video_id: string;
  task_id: string;
  metadata: {
    filename: string;
    [key: string]: any;
  };
}

interface VideoSearchResponse {
  data: Video[];
  page_info: {
    page: number;
    limit_per_page: number;
    total_page: number;
    total_results: number;
  };
}


interface Video {
    _id: string,
    video_id: string;
    created_at: string,
    updated_at: string,
    status: string,
    index_id: string

    system_metadata: {
      duration: number;
      filename: string;
      height: number;
      width: number;
    };
  }
  
  
async function getOrCreateIndex(userId: string, date: string): Promise<string> {
  const indexName = `instagram_${userId}`;
  // const indexName = `instagram_${userId}_${date}`;
  // instagram_1687017949_2025-04-26
  const url = `${API_BASE_URL}/indexes`;
  // return '6809061ae47341ee8314dc9c';
  
  if (!API_KEY) {
    throw new Error('Twelve Labs API key is not configured');
  }

  // First try to find existing index
  try {
    const indexUrl = `${url}?index_name=${encodeURIComponent(indexName)}`;
    const response = await fetch(indexUrl, {
      method: 'GET',
      headers: { 'x-api-key': API_KEY }
    });

    if (!response.ok) throw new Error(`Failed to fetch indexes: ${response.statusText}`);

    const indexesData: IndexesResponse = await response.json();
    
    if (indexesData.data.length > 0) {
      console.log(`Using existing index: ${indexesData.data[0]._id}`);
      return indexesData.data[0]._id;
    }
  } catch (error) {
    console.warn('Failed to check for existing index, attempting to create new one:', error);
  }

  // If not found, create new index
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        index_name: indexName,
        models: [{
          "model_name": "pegasus1.2",
          "model_options": ["visual", "audio"]
        }]
      })
    });

    if (!response.ok) throw new Error(`Failed to create index: ${response.statusText}`);

    const indexResponse: CreateIndexResponse = await response.json();
    // console.log(`Created new index: ${indexResponse._id}`);
    return indexResponse._id;
  } catch (error) {
    console.error('Failed to create new index:', error);
    throw new Error('Failed to create or retrieve index');
  }
}


async function findExistingVideo(indexId: string, shortcode: string): Promise<Video | null> {

  if (!API_KEY) {
    throw new Error('Twelve Labs API key is not configured');
  }
  
  try {
    const taskUrl = `${API_BASE_URL}/tasks?filename=${shortcode}.mp4&index_id=${indexId}`;
    console.log('video url: ', taskUrl)

    const response = await fetch(taskUrl, {
      method: 'GET',
      headers: { 'x-api-key': API_KEY }
    });
    
    if (!response.ok) throw new Error(`Failed to fetch existing video: ${response.statusText}`);

    const searchResponse = await response.json();
    console.log('Found Video: ', searchResponse.data[0]._id)
    if (searchResponse.data?.length > 0) {
      const firstVideo = searchResponse.data[0];
      return firstVideo;
    }
    
    return null;
  } catch (error) {
    console.warn('Error checking for existing video:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, videos } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    if (!videos || !Array.isArray(videos) || videos.length === 0) {
      return NextResponse.json({ error: 'Videos array is required and must not be empty' }, { status: 400 });
    }

    if (!API_KEY) {
        throw new Error('Twelve Labs API key is not configured');
    }
    
    // Create folder for this user's videos
    const date = new Date().toISOString().split('T')[0];
    const folderName = `${userId}_instagram_${date}`;
    const tempDir = path.join(process.cwd(), 'temp', folderName);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Get or create index
    const indexId = await getOrCreateIndex(userId, date);

    // Process each video
    const processingResults = [];

    for (const video of videos) {
        try {
            // First check if this video already exists in the index
            const existingVideo = await findExistingVideo(indexId, video.shortcode);
            
            if (existingVideo) {
                // If video already exists, just return its ID without re-uploading
                processingResults.push({
                    shortcode: video.shortcode,
                    videoId: existingVideo.video_id,
                    taskId: existingVideo._id,
                    status: existingVideo.status,
                    reused: true
                });
                continue; // Skip to next video
            }
            
            // If video doesn't exist, proceed with download and upload
            const videoPath = path.join(tempDir, `${video.shortcode}.mp4`);
            
            // Download video from URL
            const downloadResponse = await axios({
                method: 'GET',
                url: video.url,
                responseType: 'stream',
            });
            
            await pipeline(downloadResponse.data, createWriteStream(videoPath));
            
            // Create form data for video upload
            const form = new FormData();
            form.append('index_id', indexId);
            form.append('video_file', fs.createReadStream(videoPath), {
                filename: path.basename(videoPath),
                contentType: 'video/mp4',
            });
            
            // Add shortcode as metadata to help identify the video later
            form.append('metadata', JSON.stringify({
                shortcode: video.shortcode,
                source: 'instagram'
            }));
            
            // Create indexing task
            const taskResponse = await axios({
                method: 'POST',
                url: `${API_BASE_URL}/tasks`,
                headers: {
                    'x-api-key': API_KEY,
                    ...form.getHeaders()
                },
                data: form
            });
            
            processingResults.push({
                shortcode: video.shortcode,
                videoId: taskResponse.data.video_id,
                taskId: taskResponse.data._id,
                status: taskResponse.status,
                reused: false
            });
            
            // Clean up the downloaded file
            if (fs.existsSync(videoPath)) {
                fs.unlinkSync(videoPath);
            }
        } catch (videoError) {
            console.error(`Error processing video ${video.shortcode}:`, videoError);
            processingResults.push({
                shortcode: video.shortcode,
                error: videoError instanceof Error ? videoError.message : 'Video processing failed'
            });
        }
    }
    
    // Clean up directory if empty
    if(fs.existsSync(tempDir)) {
      try {
        if (fs.readdirSync(tempDir).length === 0) {
          fs.rmdirSync(tempDir);
        }
      } catch (dirError) {
        console.error('Error cleaning up temp directory:', dirError);
      }
    }
    
    return NextResponse.json({
      success: true,
      indexId,
      results: processingResults
    });
  } catch (error) {
    console.error('Error processing videos:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}