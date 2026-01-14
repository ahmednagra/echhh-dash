// src/utils/openai.ts
import { 
    VIDEO_ANALYSIS_PROMPT_V4
  } from '@/lib/prompts';

type VideoAnalysis = {
    id: string;
    shortcode: string;
    videoId: string;
    metrics: {
      id: string;
      shortcode: string;
      display_url: string;
      is_video: boolean;
      video_url: string;
      caption: string;
      taken_at_timestamp: number;
      like_count: number;
      video_view_count: number;
      comments_disabled: boolean;
      comment_count: number;
      thumbnail_src: string;
      dimensions: { height: number; width: number };
      has_audio: boolean;
      is_paid_partnership: boolean;
      like_and_view_counts_disabled: boolean;
      location: any;
      product_type: string;
      sensitivity_friction_info: any;
      viewer_can_reshare: boolean;
    };
    analysis: {
      id: string;
      data: string; // JSON string returned from TwelveLabs
      usage: { output_tokens: number };
    };
  };
  
  type OpenAIResponse = {
    success: boolean;
    data?: any;
    error?: string;
  };

/**
 * Generate OpenAI analysis based on video analysis data
 */
export async function generateOpenAIAnalysis(analysisResults: VideoAnalysis[]): Promise<OpenAIResponse> {
    try {
      if (!analysisResults || !Array.isArray(analysisResults) || analysisResults.length === 0) {
        throw new Error('No video analysis data provided');
      }
  
      console.log('Formatted Data Before Prompt:', analysisResults);
  
      // Send to your API
      const response = await fetch('/api/openai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: analysisResults,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate OpenAI analysis');
      }
  
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('OpenAI analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate OpenAI analysis'
      };
    }
  }
  
  /**
   * Helper function to format the OpenAI prompt
   */

  export function formatOpenAIPrompt(analysisResults: VideoAnalysis[]): string {
    const videos = analysisResults.map(video => {
      const engagementScore =
        (video.metrics.like_count || 0) +
        (video.metrics.comment_count || 0) +
        (video.metrics.video_view_count || 0);
      return { ...video, engagementScore };
    });
  
    videos.sort((a, b) => b.engagementScore - a.engagementScore);
  
    const third = Math.ceil(videos.length / 3);
    const topVideos = videos.slice(0, third);
    const avgVideos = videos.slice(third, 2 * third);
    const lowVideos = videos.slice(2 * third);
  
    const formatVideoSummary = (video: any) => `
    Shortcode: ${video.shortcode}
    Engagement Score: ${video.engagementScore}
    Likes: ${video.metrics.like_count}
    Comments: ${video.metrics.comment_count}
    Views: ${video.metrics.video_view_count}
    Caption: ${video.metrics.caption}
    Analysis Summary: ${video.analysis.data}
    `.trim();
    
    return `
    Each video analysis was generated using the following detailed instruction prompt:
    
    """
    ${VIDEO_ANALYSIS_PROMPT_V4.trim()}
    """
    
    You are now provided with ${videos.length} Instagram videos, divided based on engagement scores:
    
    🔹 Top-Performing Videos (Shortcodes: [${topVideos.map(v => `"${v.shortcode}"`).join(", ")}]):
    ${topVideos.map(v => formatVideoSummary(v)).join('\n\n')}
    
    🔸 Average-Performing Videos (Shortcodes: [${avgVideos.map(v => `"${v.shortcode}"`).join(", ")}]):
    ${avgVideos.map(v => formatVideoSummary(v)).join('\n\n')}
    
    🔻 Least-Performing Videos (Shortcodes: [${lowVideos.map(v => `"${v.shortcode}"`).join(", ")}]):
    ${lowVideos.map(v => formatVideoSummary(v)).join('\n\n')}
    
    ---
    
    Your Analysis Tasks:
    
    1. For each group (Top, Average, Least):
        - Return the list of Shortcodes for easy reference.
        - Analyze **Quantitative patterns**:
            - Scene counts (average, min, max)
            - Scene durations (min, max)
            - Character gender/age/ethnicity distributions
            - Screen-time percentages (protagonist/supporting)
            - Audio clarity
            - % of voiceover vs dialogue
            - Lighting styles
            - Color palettes
            - Prop usage types
            - CTA frequency & timestamps
            - Editing styles (fast/slow pacing)
            - Special effects usage
            - Emotional triggers (humor %, urgency %, nostalgia %)
    
        - Analyze **Qualitative patterns**:
            - Themes
            - Storytelling styles
            - Emotional tones
            - Branding techniques
            - Visual styles (camera angles, movements, wardrobe, lighting consistency)
            - Audience targeting strategies
    
    2. Carefully handle **averages vs ranges**:
        - If metrics have **low variance**, provide average.
        - If metrics vary **widely**, provide min/max ranges instead.
    
    3. Provide **Comparisons**:
        - Top vs Average vs Least performing groups.
        - Quantify differences wherever possible (e.g., "Top videos had 25% more humor triggers compared to least-performing videos").
    
    4. Return the data **ready for visual graphs and dashboards**:
        - Make sure every quantitative metric is easy to plot.
        - Structure numbers cleanly for:
            - Bar charts
            - Pie charts
            - Line charts
            - Comparison graphs
    
    5. IMPORTANT JSON FORMATTING RULES:
        - For all percentage values, use strings with quotes (e.g., "100%", "80%", "33%") NOT raw numbers with % symbols
        - Make sure all numerical data is properly formatted as numbers without symbols unless specified otherwise
    
    6. Final Output Format:
    Return the result inside **following example JSON structure**:
    
    \`\`\`json
    {
      "top_performing_summary": {
        "shortcodes": ["shortcode1", "shortcode2", "..."],
        "quantitative": {
          "scene_counts": { "min": 5, "max": 12, "average": 7 },
          "scene_durations": { "min": 2, "max": 61 },
          "character_gender_distribution": { "male": 85, "female": 15 },
          "character_age_distribution": { "adult": 100 },
          "character_ethnicity_distribution": { "South Asian": 100 },
          "screen_time_percentages": { "protagonist": 60, "supporting": 40 },
          "audio_clarity": 95,
          "voiceover_percentage": 10,
          "lighting_quality": 9,
          "color_palettes": { "warm": 60, "neutral": 40 },
          "prop_usage_types": { "minimal": 70, "extensive": 30 },
          "cta_frequency": { "average": 0.5, "timestamps": ["43s", "46s"] },
          "editing_styles": { "fast_paced": 50, "smooth_transitions": 50 },
          "special_effects_usage": 0,
          "wardrobe_consistency": 9,
          "audio_sync_with_visuals": 9,
          "music_volume_balance": 8,
          "emotional_triggers": { "humor": 20, "urgency": 10, "nostalgia": 20 }
          "visual_styles": {
            "camera_angles": {"close_ups": 40, "wide_shots": 40, "tracking_shots": 20 }
            "camera_movement": { "handheld": 30, "zoom": 50, "static": 20 },
            "wardrobe_styles": { "modern": 60, "traditional": 30, "uniform": 10 },
            "lighting_styles": { "natural": 80, "artificial": 20 },
          }
        },
        "qualitative": {
          "themes": ["Family", "Celebration", "Reunion"],
          "storytelling_styles": ["Narrative", "Sequential"],
          "emotional_tones": ["Joyful", "Heartwarming"],
          "branding_techniques": ["Subtle", "Integrated"],
          "audience_targeting_strategies": ["Broad", "Family-oriented"]
        }
      },
      "average_performing_summary": {
        "shortcodes": ["shortcode3", "shortcode4", "..."],
        "quantitative": {
          "scene_counts": { "min": 4, "max": 10, "average": 6 },
          "scene_durations": { "min": 3, "max": 57 },
          "character_gender_distribution": { "male": 90, "female": 10 },
          "character_age_distribution": { "adult": 100 },
          "character_ethnicity_distribution": { "South Asian": 100 },
          "screen_time_percentages": { "protagonist": 70, "supporting": 30 },
          "audio_clarity": 85,
          "voiceover_percentage": 20,
          "lighting_quality": 7,
          "color_palettes": { "warm": 50, "neutral": 50 },
          "prop_usage_types": { "minimal": 60, "extensive": 40 },
          "cta_frequency": { "average": 0.7, "timestamps": ["22s", "24s"] },
          "editing_styles": { "fast_paced": 60, "smooth_transitions": 40 },
          "special_effects_usage": 10,
          "wardrobe_consistency": 7,
          "audio_sync_with_visuals": 7,
          "music_volume_balance": 7,
          "emotional_triggers": { "humor": 10, "urgency": 20, "nostalgia": 10 }
          "visual_styles": {
            "camera_angles": { "close_ups": 40, "medium_shots": 40, "wide": 20 },
            "camera_movement": { "handheld": 40, "zoom": 30, "static": 30 },
            "wardrobe_styles": { "modern": 60, "traditional": 30, "uniform": 10 },
            "lighting_styles": { "natural": 65, "artificial": 35 },
          }
        },
        "qualitative": {
          "themes": ["Adventure", "Exploration", "Journey"],
          "storytelling_styles": ["Documentary", "Experiential"],
          "emotional_tones": ["Inspiring", "Reflective"],
          "branding_techniques": ["Overt", "Prominent"],
          "audience_targeting_strategies": ["Niche", "Youth-oriented"]
        }
      },
      "least_performing_summary": {
        "shortcodes": ["shortcode5", "shortcode6", "..."],
        "quantitative": {
          "scene_counts": { "min": 3, "max": 7, "average": 5 },
          "scene_durations": { "min": 1, "max": 76 },
          "character_gender_distribution": { "male": 30, "female": 55, "other": 15 },
          "character_age_distribution": { "adult": 65, "teen": 15, "child": 5, "senior": 5, "young adult": 10 },
          "character_ethnicity_distribution": { "South Asian": 55, "East Asia": 35, "Central Asia": 10 },
          "screen_time_percentages": { "protagonist": 60, "supporting": 40 },
          "audio_clarity": 63,
          "voiceover_percentage": 40,
          "lighting_quality": 4,
          "color_palettes": { "warm": 30, "neutral": 50, "cool": 20 },
          "prop_usage_types": { "minimal": 30, "extensive": 70 },
          "cta_frequency": { "average": 0.3, "timestamps": ["35s"] },
          "editing_styles": { "fast_paced": 70, "smooth_transitions": 30 },
          "special_effects_usage": 5,
          "wardrobe_consistency": 5,
          "audio_sync_with_visuals": 5,
          "music_volume_balance": 4,
          "emotional_triggers": { "humor": 5, "urgency": 30, "nostalgia": 5 }
          "visual_styles": {
            "camera_angles": { "dynamic_angles": 30, "close_ups": 25, "wide_shots": 20, "static_shots": 15, "tracking_shots": 10 },
            "camera_movement": { "handheld": 60, "zoom": 20, "static": 20 },
            "wardrobe_styles": { "modern": 60, "traditional": 30, "uniform": 10 },
            "lighting_styles": { "natural": 50, "artificial": 50 },
          }

        },
        "qualitative": {
          "themes": ["Confusion", "Complexity"],
          "storytelling_styles": ["Informative", "Direct"],
          "emotional_tones": ["Tension", "Stress"],
          "branding_techniques": ["Direct", "Explicit"],
          "audience_targeting_strategies": ["Unclear", "Generic"]
        }
      },
      "overall_recommendations": {
        "strategy": "Improve clarity, reduce complexity, and ensure consistency across visual and narrative elements.",
        "specific_suggestions": [
          "Enhance audio clarity and synchronization in all videos to increase engagement.",
          "Use more natural lighting and improve lighting quality scores.",
          "Balance camera angles and motion to avoid static and unengaging shots.",
          "Maintain consistent and thematic wardrobe styling throughout the videos.",
          "Ensure background music is well-mixed and doesn't overpower dialogue or voiceovers.",
          "Incorporate clear emotional triggers like humor, joy, or nostalgia to connect with viewers.",
          "Avoid overwhelming viewers with excessive prop usage or effects.",
          "Adopt narrative or experiential storytelling styles to improve viewer retention."
        ]
      }
    }
    \`\`\`
    
    Important:
    - Always refer to videos by their **Shortcodes**.
    - Ensure all numbers are properly formatted for **easy graph plotting**.
    - Prefer **concise but detailed descriptions** so both humans and machines can easily understand the results.
    - Make sure all required fields (like quantitative and qualitative) are present and not null.
    - Ensure the JSON is valid, with all objects and arrays properly closed and formatted.
    `.trim();
}


// export function formatOpenAIPrompt(analysisResults: VideoAnalysis[]): string {
//     const videos = analysisResults.map(video => {
//       const engagementScore =
//         (video.metrics.like_count || 0) +
//         (video.metrics.comment_count || 0) +
//         (video.metrics.video_view_count || 0);
//       return { ...video, engagementScore };
//     });
  
//     videos.sort((a, b) => b.engagementScore - a.engagementScore);
  
//     const third = Math.ceil(videos.length / 3);
//     const topVideos = videos.slice(0, third);
//     const avgVideos = videos.slice(third, 2 * third);
//     const lowVideos = videos.slice(2 * third);
  
//     const formatVideoSummary = (video: any) => `
//     Shortcode: ${video.shortcode}
//     Engagement Score: ${video.engagementScore}
//     Likes: ${video.metrics.like_count}
//     Comments: ${video.metrics.comment_count}
//     Views: ${video.metrics.video_view_count}
//     Caption: ${video.metrics.caption}
//     Analysis Summary: ${video.analysis.data}
//     `.trim();
    
//         return `
//     Each video analysis was generated using the following detailed instruction prompt:
    
//     """
//     ${VIDEO_ANALYSIS_PROMPT_V4.trim()}
//     """
    
//     You are now provided with ${videos.length} Instagram videos, divided based on engagement scores:
    
//     🔹 Top-Performing Videos (Shortcodes: [${topVideos.map(v => `"${v.shortcode}"`).join(", ")}]):
//     ${topVideos.map(v => formatVideoSummary(v)).join('\n\n')}
    
//     🔸 Average-Performing Videos (Shortcodes: [${avgVideos.map(v => `"${v.shortcode}"`).join(", ")}]):
//     ${avgVideos.map(v => formatVideoSummary(v)).join('\n\n')}
    
//     🔻 Least-Performing Videos (Shortcodes: [${lowVideos.map(v => `"${v.shortcode}"`).join(", ")}]):
//     ${lowVideos.map(v => formatVideoSummary(v)).join('\n\n')}
    
//     ---
    
//     Your Analysis Tasks:
    
//     1. For each group (Top, Average, Least):
//         - Return the list of Shortcodes for easy reference.
//         - Analyze **Quantitative patterns**:
//             - Scene counts (average, min, max)
//             - Scene durations (min, max)
//             - Character gender/age/ethnicity distributions
//             - Screen-time percentages (protagonist/supporting)
//             - Audio clarity
//             - % of voiceover vs dialogue
//             - Lighting styles
//             - Color palettes
//             - Prop usage types
//             - CTA frequency & timestamps
//             - Editing styles (fast/slow pacing)
//             - Special effects usage
//             - Emotional triggers (humor %, urgency %, nostalgia %)
    
//         - Analyze **Qualitative patterns**:
//             - Themes
//             - Storytelling styles
//             - Emotional tones
//             - Branding techniques
//             - Visual styles (camera angles, movements, wardrobe, lighting consistency)
//             - Audience targeting strategies
    
//     2. Carefully handle **averages vs ranges**:
//         - If metrics have **low variance**, provide average.
//         - If metrics vary **widely**, provide min/max ranges instead.
    
//     3. Provide **Comparisons**:
//         - Top vs Average vs Least performing groups.
//         - Quantify differences wherever possible (e.g., "Top videos had 25% more humor triggers compared to least-performing videos").
    
//     4. Return the data **ready for visual graphs and dashboards**:
//         - Make sure every quantitative metric is easy to plot.
//         - Structure numbers cleanly for:
//             - Bar charts
//             - Pie charts
//             - Line charts
//             - Comparison graphs
    
//     5. Final Output Format:
//     Return the result inside **this JSON structure**:
    
//     \`\`\`json
//     {
//         "top_performing_summary": {
//         "shortcodes": ["shortcode1", "shortcode2", "..."],
//         "quantitative": { ... },
//         "qualitative": { ... }
//         },
//         "average_performing_summary": {
//         "shortcodes": ["shortcode3", "shortcode4", "..."],
//         "quantitative": { ... },
//         "qualitative": { ... }
//         },
//         "least_performing_summary": {
//         "shortcodes": ["shortcode5", "shortcode6", "..."],
//         "quantitative": { ... },
//         "qualitative": { ... }
//         },
//         "overall_recommendations": {
//         "strategy": "...",
//         "specific_suggestions": ["..."]
//         }
//     }
//     \`\`\`
    
//     Important:
//     - Always refer to videos by their **Shortcodes**.
//     - Ensure all numbers are properly formatted for **easy graph plotting** (percentages, averages, min/max).
//     - Prefer **concise but detailed descriptions** so both humans and machines can easily understand the results.
//     `.trim();
// }
  



//Number 2
// export function formatOpenAIPrompt(analysisResults: VideoAnalysis[]): string {
//     console.log('Inside formatOpenAIPrompt', analysisResults);
  
//     const videos = analysisResults.map(video => {
//       const engagementScore =
//         (video.metrics.like_count || 0) +
//         (video.metrics.comment_count || 0) +
//         (video.metrics.video_view_count || 0);
//       return { ...video, engagementScore };
//     });
  
//     // Sort videos by engagement
//     videos.sort((a, b) => b.engagementScore - a.engagementScore);
  
//     const third = Math.ceil(videos.length / 3);
//     const topVideos = videos.slice(0, third);
//     const avgVideos = videos.slice(third, 2 * third);
//     const lowVideos = videos.slice(2 * third);
  
//     const formatVideoSummary = (video: any) => `
//   Shortcode: ${video.shortcode}
//   Engagement Score: ${video.engagementScore}
//   Likes: ${video.metrics.like_count}
//   Comments: ${video.metrics.comment_count}
//   Views: ${video.metrics.video_view_count}
//   Caption: ${video.metrics.caption}
//   Analysis Summary: ${video.analysis.data}
//   `.trim();
  
//     return `
//   We have ${videos.length} Instagram videos divided into three groups based on engagement (likes + comments + views):
  
//   🔹 Top-Performing Videos:
//   ${topVideos.map(v => formatVideoSummary(v)).join('\n\n')}
  
//   🔸 Average-Performing Videos:
//   ${avgVideos.map(v => formatVideoSummary(v)).join('\n\n')}
  
//   🔻 Least-Performing Videos:
//   ${lowVideos.map(v => formatVideoSummary(v)).join('\n\n')}
  
//   Your Tasks:
//   1. Analyze each group individually. Find common patterns among Top-Performing, Average-Performing, and Least-Performing videos.
//   2. Focus on aspects like: themes, storytelling, visual style, emotional tone, branding, calls-to-action, audience targeting.
//   3. Identify weaknesses causing poor performance.
//   4. Suggest actionable strategies for improving future content.
  
//   Important:
//   - Always reference videos by their Shortcode when describing examples.
//   - Return the analysis results as a JSON object with fields:
//       - top_performing_summary
//       - average_performing_summary
//       - least_performing_summary
//       - overall_recommendations
//   `.trim();
// }

//Number 3
// export function formatOpenAIPrompt(analysisResults: VideoAnalysis[]): string {
//     console.log('Inside formatOpenAIPrompt', analysisResults);

//     const videos = analysisResults.map(video => {
//         const engagementScore =
//         (video.metrics.like_count || 0) +
//         (video.metrics.comment_count || 0) +
//         (video.metrics.video_view_count || 0);
//         return { ...video, engagementScore };
//     });

//     // Sort videos by engagement
//     videos.sort((a, b) => b.engagementScore - a.engagementScore);

//     const third = Math.ceil(videos.length / 3);
//     const topVideos = videos.slice(0, third);
//     const avgVideos = videos.slice(third, 2 * third);
//     const lowVideos = videos.slice(2 * third);

//     const formatVideoSummary = (video: any) => `
//     Shortcode: ${video.shortcode}
//     Engagement Score: ${video.engagementScore}
//     Likes: ${video.metrics.like_count}
//     Comments: ${video.metrics.comment_count}
//     Views: ${video.metrics.video_view_count}
//     Caption: ${video.metrics.caption}
//     Analysis Summary: ${video.analysis.data}
//     `.trim();

//     return `
//     We have ${videos.length} Instagram videos divided into three groups based on engagement (likes + comments + views):

//     🔹 Top-Performing Videos:
//     ${topVideos.map(v => formatVideoSummary(v)).join('\n\n')}

//     🔸 Average-Performing Videos:
//     ${avgVideos.map(v => formatVideoSummary(v)).join('\n\n')}

//     🔻 Least-Performing Videos:
//     ${lowVideos.map(v => formatVideoSummary(v)).join('\n\n')}

//     Your Analysis Tasks:

//     1. For each group (Top, Average, Least):
//         - Analyze common **quantitative patterns**:
//             - Calculate averages for metrics (scene count, durations, CTA appearances, screen-time %).
//             - Only calculate averages when standard deviation is low (i.e., when values are close together).
//             - Otherwise, list ranges (Min, Max) separately if metrics vary a lot.
//             - Return percentages wherever applicable.
//         - Analyze common **qualitative patterns**:
//             - Themes, storytelling styles, emotional tones, brand placement style, audience focus.
//             - Visual style (camera techniques, lighting, wardrobe/art direction consistency).

//     2. Compare the **Top** vs **Average** vs **Least** groups:
//         - Highlight specific differences with numbers (e.g., "Top-performing videos had 20% higher emotional engagement score").
//         - Find which attributes are clearly responsible for better performance.

//     3. Provide detailed, **data-rich** summary:
//         - Return a **structured JSON object** as output.

//     Your JSON format must be:

//     {
//     "top_performing_summary": {
//         "quantitative": { ... },
//         "qualitative": { ... }
//     },
//     "average_performing_summary": {
//         "quantitative": { ... },
//         "qualitative": { ... }
//     },
//     "least_performing_summary": {
//         "quantitative": { ... },
//         "qualitative": { ... }
//     },
//     "overall_recommendations": {
//         "strategy": "...",
//         "specific_suggestions": [...]
//     }
//     }

//     Important:
//     - Always reference videos by their Shortcode when giving examples.
//     - Use numeric data so that it can easily be used to generate graphs and dashboards later.
//     - Keep your explanations concise but data-rich.
//     `.trim();
// }



//Number 4
// export function formatOpenAIPrompt(analysisResults: VideoAnalysis[]): string {
//   const videos = analysisResults.map(video => {
//     const engagementScore =
//       (video.metrics.like_count || 0) +
//       (video.metrics.comment_count || 0) +
//       (video.metrics.video_view_count || 0);
//     return { ...video, engagementScore };
//   });

//   videos.sort((a, b) => b.engagementScore - a.engagementScore);

//   const third = Math.ceil(videos.length / 3);
//   const topVideos = videos.slice(0, third);
//   const avgVideos = videos.slice(third, 2 * third);
//   const lowVideos = videos.slice(2 * third);

//   const formatVideoSummary = (video: any) => `
//     Shortcode: ${video.shortcode}
//     Engagement Score: ${video.engagementScore}
//     Likes: ${video.metrics.like_count}
//     Comments: ${video.metrics.comment_count}
//     Views: ${video.metrics.video_view_count}
//     Caption: ${video.metrics.caption}
//     Analysis Summary: ${video.analysis.data}
//     `.trim();

//     return `
//     Each video analysis was generated using the following detailed instruction prompt:

//     """
//     ${VIDEO_ANALYSIS_PROMPT_V4.trim()}
//     """

//     You are now provided with ${videos.length} Instagram videos, divided based on engagement scores:

//     🔹 Top-Performing Videos (Shortcodes: [${topVideos.map(v => `"${v.shortcode}"`).join(", ")}]):
//     ${topVideos.map(v => formatVideoSummary(v)).join('\n\n')}

//     🔸 Average-Performing Videos (Shortcodes: [${avgVideos.map(v => `"${v.shortcode}"`).join(", ")}]):
//     ${avgVideos.map(v => formatVideoSummary(v)).join('\n\n')}

//     🔻 Least-Performing Videos (Shortcodes: [${lowVideos.map(v => `"${v.shortcode}"`).join(", ")}]):
//     ${lowVideos.map(v => formatVideoSummary(v)).join('\n\n')}

//     ---

//     Your Analysis Tasks:

//     1. For each group (Top, Average, Least):
//         - Return the list of shortcodes included in that group. Example: ["shortcode1", "shortcode2", "shortcode3"]
//         - Analyze and find **common quantitative patterns**:
//             - Scene count
//             - Average scene durations
//             - Character gender/age/ethnicity distributions
//             - Screen-time percentages
//             - Audio clarity ratings
//             - % of voiceover vs dialogue
//             - Lighting styles
//             - Color palettes
//             - Prop usage types
//             - CTA frequency & timestamps
//             - Editing styles (fast-paced, slow-paced)
//             - Special effects usage
//             - Emotional triggers (humor, urgency, nostalgia %)
//         - Analyze **qualitative patterns**:
//             - Themes
//             - Storytelling styles
//             - Emotional tones
//             - Branding techniques (subtle vs heavy branding)
//             - Visual styles (camera angles,Wardrobe/Art Direction, movements, lighting, consistency)
//             - Audience targeting approaches

//     2. Handle averaging carefully:
//         - If values have **low variation**, provide averages.
//         - If values vary **a lot**, provide Min/Max ranges instead.

//     3. Compare:
//         - Top vs Average vs Least performing groups
//         - Quantify differences where possible (e.g., "Top-performing videos had 20% higher emotional tone consistency than least-performing videos").

//     4. Final Output Format:
//     Return your results in **this JSON structure**:

//     \`\`\`json
//     {
//     "top_performing_summary": {
//         "shortcodes": ["shortcode1", "shortcode2"],
//         "quantitative": { ... },
//         "qualitative": { ... }
//     },
//     "average_performing_summary": {
//         "shortcodes": ["shortcode3", "shortcode4"],
//         "quantitative": { ... },
//         "qualitative": { ... }
//     },
//     "least_performing_summary": {
//         "shortcodes": ["shortcode5", "shortcode6"],
//         "quantitative": { ... },
//         "qualitative": { ... }
//     },
//     "overall_recommendations": {
//         "strategy": "...",
//         "specific_suggestions": ["..."]
//     }
//     }
//     \`\`\`

//     Important:
//     - Always reference videos by their **Shortcodes** when describing examples.
//     - Make sure the results are **rich in numbers and easy to visualize** for dashboards and graphs.
//     `.trim();
// }
