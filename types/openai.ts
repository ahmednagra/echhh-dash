export interface OpenAIAnalysis {
    success: boolean;
    analysis: string;
    model: string;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }
  