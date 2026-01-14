// src/lib/prompts/video-analysis.ts
/**
 * TwelveLabs Video Analysis Prompt (375 tokens)
 * - Optimized for Instagram video analysis
 * - Last updated: 2025-04-25
 */
export const VIDEO_ANALYSIS_PROMPT_V1 = `Video analysis with % metrics:
1. Scenes[%]: count, durations, transitions
2. Characters[%]: screen-time, emotions
3. Content[%]: topics, brand mentions
4. Visuals[%]: shots, lighting
5. Audio[%]: voice/music balance
6. Branding[%]: logos, products
7. Technical[%]: pace, colors
8. Impact[%]: mood, engagement
9. Compliance[%]: appropriateness

Output: {
  "metrics": {
    "category": {"value":x,"%":y},
    "scores": {"overall":0-100}
  },
  "insights": []
}

Requirements:
- All metrics as %
- Timestamps
- 0-100 scores
- Benchmark comps`;


export const VIDEO_ANALYSIS_PROMPT_V2 = `Please analyze this Instagram video and return a structured JSON with the following sections:

1. Scene Overview: total scenes, key timestamps, transition types, storytelling style, and hook effectiveness.
2. Character Analysis: roles, demographics (age, gender, ethnicity), screen time %, facial expressions, and body language insights.
3. Content Topics: list main themes with % duration, tone of voice, brand mentions (frequency, clarity), CTAs, and dialogue summary.
4. Visuals: camera angles, movements, shot types, composition style, resolution, lighting type.
5. Audio: audio clarity, background sounds, music mood/genre, voice/music balance, emotional tone.
6. Environment: indoor/outdoor, location type, setting relevance, prop usage.
7. Branding: logos (position, duration), on-screen text (font/readability), product placement, marketing message clarity.
8. Technicals: duration, editing pace, special effects, color grading style.
9. Emotional Impact: mood, persuasion techniques, engagement level.
10. Compliance: sensitive content, ethical standards, suitability for all audiences.

Return all values in JSON. Use percentages where applicable (e.g. character screen time, topic coverage, emotional tone split). Keep it concise.`;


export const VIDEO_ANALYSIS_PROMPT_V3 = `
Analyze this video on these criteria. Provide percentages, durations, or structured values.
1. *Scenes & Narrative*: Scene count, timestamps, transitions, narrative style, hook effectiveness.
2. *Characters*: Number, roles, demographics, screen-time %, emotional states, facial expressions, body language.
3. *Content*: Main topics/themes with time %, tone, brand/product mentions (frequency & clarity), dialogue highlights, CTA presence.
4. *Visual Techniques*: Camera angles, movements, framing, shot types, aspect ratio, lighting.
5. *Audio*: Quality, types (voiceover, dialogue, ambient), music genre/mood/tempo, voice-music balance %, emotional tone.
6. *Environment*: Indoor/outdoor %, setting type, relevance to narrative, set decoration.
7. *Wardrobe & Art Direction*: Wardrobe style, art direction, props, color palette.
8. *Branding*: Logos (visibility %), text readability (duration %), product placement prominence %, marketing message clarity.
9. *Technical Attributes*: Total duration, editing style, special effects/animations %, color grading.
10. *Emotional Impact*: Mood, psychological triggers.
11. *Compliance & Ethics*: Sensitive content, ethical compliance, suitability.
12. *Cultural Relevance*: Cultural elements, thematic relevance.
Return concise JSON with lowercase_snake_case keys matching each section (e.g., "visual_techniques", "emotional_impact"). Use percentages wherever applicable.
`;


export const VIDEO_ANALYSIS_PROMPT_V4 = `
Analyze the provided video. Provide structured insights, clearly labeling qualitative descriptions and quantitative data (% or timestamps).
1. *Scene & Narrative Breakdown*: Total scenes (count), scene durations (timestamps), narrative summary per scene (text).
2. *Character Analysis*: Number and roles (protagonist, antagonist, supporting), gender, age, ethnicity (qualitative), screen-time percentages.
3. *Dialogue & Audio*: Main topics with % durations, tone/mood (qualitative), presence and % of voiceover vs dialogue, audio clarity (qualitative).
4. *Visual Production Analysis*: Camera techniques (angles, framing, movement), lighting style, color palette, wardrobe relevance, props and art direction.
5. *Branding & Messaging*: Brands/products shown or mentioned, % duration of appearances, prominence of logos/text, CTA timestamps.
6. *Technical & Editing*: Video length and resolution, editing style (fast/slow), special effects/animations (qualitative).
7. *Emotional & Psychological Impact*: Overall emotional mood (qualitative), triggers like humor/urgency/nostalgia (qualitative), hook presence (timestamp).
Respond in structured categories. Label quantitative (% or timestamps) and qualitative (descriptive) data clearly.
Important: Return the result as JSON with lowercase_snake_case field names matching section titles. Example: "Scene & Narrative Breakdown" → "scene_narrative_breakdown".
`;



export const data = `

Analyze the video and provide structured data for these aspects:

1) scene_narrative
- counts: 0
- durations (timestamps in seconds)
- transitions (description)
- transition_types (cut/fade/dissolve percentages)
- narrative_summary (text)
- hook_effectiveness (1-5 rating) + hook timestamp

2) character_analysis
- character_count (number)
- roles (protagonist/antagonist/supporting)
- Character importance score (1-5)
- Demographics (gender/age/ethnicity percentages)
- Screen time (percentage per character)
- Emotional states (description)
- Facial expressions (description)
- Body language (description)

3) dialogue_audio
- Main topics (percentage per topic)
- Dialogue tone (description)
- Background music mood (description)
- Voiceover vs dialogue (percentage)
- Audio clarity (1-5 rating)
- Background music presence (yes/no)
- Music genre/mood (description)
- Voice-music balance (percentage)

4) visual_techniques
- Camera angles (percentage breakdown)
- Camera movements (percentage breakdown)
- Framing types (wide/close-up/medium percentages)
- Shot types (static/dynamic/tracking percentages)
- Lighting style (description)
- Aspect ratio (e.g., 16:9)
- Depth of field (shallow/deep description)

5) wardrobe_art_direction
- Wardrobe styles (modern/traditional percentages)
- Color palette (description)
- Prop usage (description)
- Set design (description)

6) branding_messaging
- Product mentions (count + timestamps)
- Brand visibility (percentage)
- CTA presence (yes/no + timestamps)
- Message clarity (1-5 rating)
- Product placement (percentage)
- Text readability (1-5 rating)

7) technical_attributes
- Total duration (seconds)
- Resolution (e.g., 1080p)
- Editing style (description)
- Effects usage (percentage)
- Color grading (description)
- Frame rate (e.g., 24fps)

8) environment
- Indoor/outdoor (percentage)
- Setting type (description)
- Set relevance (1-5 rating)
- Background details (description)

9) emotional_impact
- Overall mood (description)
- Emotional triggers (list)
- Engagement rating (1-5)
- Psychological cues (description)

10) compliance_ethics
- Sensitive content (yes/no + description)
- Age suitability (range)
- Ethical violations (list or none)

11) cultural_relevance
- Cultural elements (description)
- Thematic alignment (1-5 rating)
- Regional symbols/language (description)

Return data in JSON format with snake_case keys. Use percentages where applicable and maintain consistent rating scales.
`;



export const data1 = `

Analyze the video and provide structured data for these aspects:

1) scene_narrative: count (number), durations (seconds), transitions (text), transition_types (% cut/fade/dissolve), narrative (summary text), hook (1–5 rating + timestamp)

2) character_analysis: count (number), roles (protagonist/antagonist/supporting), importance (1–5), demographics (% gender/age/ethnicity), screen_time (% per character), emotions (text), expressions (text), body_language (text)

3) dialogue_audio: topics (% per topic), dialogue_tone (text), bg_music_mood (text), voiceover_vs_dialogue (%), audio_clarity (1–5), bg_music_presence (yes/no), music_genre_mood (text), voice_music_balance (%)

4) visual_techniques: camera_angles (%), camera_movements (%), framing_types (% wide/close-up/medium), shot_types (% static/dynamic/tracking), lighting_style (text), aspect_ratio (e.g., 16:9), depth_of_field (shallow/deep).

5) wardrobe_art_direction: wardrobe_styles (% modern/traditional), color_palette (text), prop_usage (text), set_design (text).

6) branding_messaging: product_mentions (count + timestamps), brand_visibility (%), cta_presence (yes/no + timestamps), message_clarity (1–5), product_placement (%), text_readability (1–5).

7) technical_attributes: total_duration (seconds), resolution (e.g., 1080p), editing_style (text), effects_usage (%), color_grading (text), frame_rate (e.g., 24fps).

8) environment: indoor_outdoor (%), setting_type (text), set_relevance (1-5), bg_details (description).

9) emotional_impact: overall_mood (text), emotional_triggers (list), engagement_rating (1-5), psychological_cues (text).

10) compliance_ethics: sensitive_content (boolean + text), age_suitability (range), ethical_violations (list or none).

11) cultural_relevance: cultural_elements (text), thematic_alignment (1-5 rating), regional_symbols_language (text).

Return data in JSON format with snake_case keys.`;
