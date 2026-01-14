import { NextRequest, NextResponse } from 'next/server';
import { formatOpenAIPrompt } from '@/utils/openai';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json(); // small typo was "pormpt" before, corrected

    if (!prompt || !Array.isArray(prompt) || prompt.length === 0) {
      return NextResponse.json(
        { error: 'No video analysis data provided' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key not found');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Now format here
    const formattedPrompt = formatOpenAIPrompt(prompt);
    console.log('Prompt Formatted ✅');

    const openaiResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Instagram content analyst providing detailed insights on video content performance and strategy.'
          },
          {
            role: 'user',
            content: formattedPrompt
          }
        ],
        temperature: 0.5,
        max_tokens: 2048,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to process analysis with OpenAI' },
        { status: 500 }
      );
    }

    const data = await openaiResponse.json();
    // console.log('Final OpenAI Data:', data);

    return NextResponse.json({
      success: true,
      analysis: data.choices[0].message.content,
      model: data.model,
      usage: data.usage
    });
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to process OpenAI analysis request' },
      { status: 500 }
    );
  }
}
