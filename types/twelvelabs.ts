// src/types/twelvelabs.ts
export interface TwelveLabsIndex {
    _id: string;
    index_name: string;
    created_at: string;
  }
  
  export interface TwelveLabsTask {
    _id: string;
    index_id: string;
    status: 'processing' | 'completed' | 'failed';
    video_id?: string;
    error?: string;
  }
  
  export interface TwelveLabsSummary {
    _id: string;
    video_id: string;
    summary: string;
    created_at: string;
  }
  
  export interface TwelveLabsError {
    error: string;
    details?: string;
  }