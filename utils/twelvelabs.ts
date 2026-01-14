// src/utils/twelvelabs.ts

/**
 * Process Instagram videos using Twelve Labs API
 */
export async function processVideos(userId: number, videos: Array<{ url: string, shortcode: string }>) {
  try {
    const response = await fetch('/api/twelvelabs/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Time': Date.now().toString(), // Prevent caching
      },
      body: JSON.stringify({
        userId,
        videos,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process videos');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in processVideos utility:', error);
    throw error;
  }
}

/**
 * Get analysis results for a specific task
 */
export async function getAnalysisResults(taskId: string) {
  try {
    const response = await fetch(`/api/twelvelabs/results?taskId=${encodeURIComponent(taskId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Time': Date.now().toString(), // Prevent caching
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get analysis results');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getAnalysisResults utility:', error);
    throw error;
  }
}

/**
 * Generate text analysis for a video
 */
export async function generateTLAnalysis(videoId: string, prompt: string) {
  try {
    const response = await fetch('/api/twelvelabs/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Time': Date.now().toString(), // Prevent caching
      },
      body: JSON.stringify({
        videoId,
        prompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate analysis');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in generateTLAnalysis utility:', error);
    throw error;
  }
}