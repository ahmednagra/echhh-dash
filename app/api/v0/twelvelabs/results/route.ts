// src/app/api/twelvelabs/results/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = process.env.TL_API_KEY;
const API_BASE_URL = process.env.TL_API_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }
    
    const response = await axios.get(
      `${API_BASE_URL}/tasks/${taskId}`,
      { headers: { 'x-api-key': API_KEY } }
    );
    
    return NextResponse.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error getting task results:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}