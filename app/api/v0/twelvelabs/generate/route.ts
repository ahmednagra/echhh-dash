// src/app/api/twelvelabs/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = process.env.TL_API_KEY;
const API_BASE_URL = process.env.TL_API_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, prompt } = body;
    
    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    
    const response = await axios.post(
      `${API_BASE_URL}/generate`,
      { 
        video_id: videoId,
        prompt: prompt,
        temperature: 0.2,
        stream: false
      },
      { headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' } }
    );
    

    console.log("response Generate Id: ", response?.data.id)

    return NextResponse.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error generating analysis:', error instanceof Error ? error.message : error);
  
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error',
        errordata: error instanceof Error ? error : 'Unknown error'
      },
      { status: 500 }
    );
  }  
}