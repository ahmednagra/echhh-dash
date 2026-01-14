export function safeParseOpenAIResponse(rawAnalysis: any) {
    if (!rawAnalysis) {
        throw new Error('No analysis data found');
    }

    let markdownString = rawAnalysis;

    // Clean up the markdown code block
    let jsonString = markdownString
        .replace(/^```json/, '')
        .replace(/^```/, '')
        .replace(/```$/, '')
        .trim();

    // Fix common GPT mistakes
    jsonString = jsonString
        .replace(/(\d+)%/g, '"$1%"') // 90% => "90%"
        .replace(/(\w+):\s*([\d.]+)(?=\s*[,\}])/g, '"$1": $2') // fix unquoted keys and numbers
        .replace(/,\s*}/g, '}') // Remove trailing commas in objects
        .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
    console.log('jsonString:', jsonString)
    // Try parsing the cleaned-up JSON string
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Failed to parse JSON: ', error);
        console.warn('Broken JSON:', jsonString);
        throw new Error('Failed to parse OpenAI analysis JSON');
    }
}
