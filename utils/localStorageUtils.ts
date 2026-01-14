// src/utils/localStorageUtils.ts
export const saveAnalysisToLocal = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };
  
  export const loadAnalysisFromLocal = (key: string) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return null;
  };
  
  export const clearAnalysisFromLocal = (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  };
  


  // Save individual video analysis
export const saveVideoAnalysis = (shortcode: string, data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`video_analysis_${shortcode}`, JSON.stringify(data));
    }
  };
  
  // Load individual video analysis
  export const loadVideoAnalysis = (shortcode: string) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`video_analysis_${shortcode}`);
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return null;
  };
  
  // Clear specific video analysis
  export const clearVideoAnalysis = (shortcode: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`video_analysis_${shortcode}`);
    }
  };
  