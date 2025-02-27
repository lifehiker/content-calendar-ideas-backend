import Anthropic from '@anthropic-ai/sdk';
import { OpenAI } from 'openai';

// Initialize LLM clients
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com/v1', // DeepSeek API is OpenAI compatible
});

const claude = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || '',
});

// System prompts
const CONTENT_SYSTEM_PROMPT = `
You are a professional content marketing strategist who specializes in creating content calendar ideas.
Based on the user's keywords and niche, generate creative, specific, and actionable content ideas.
Each idea should include:
1. A clear, engaging title
2. The content format (blog post, video, infographic, etc.)
3. One sentence describing the key points to cover

Output format should be a JSON array of objects with structure:
{
  "title": "Title of the content piece",
  "format": "Content format",
  "description": "Brief description of what to cover",
  "date": null  // This will be assigned by the frontend
}

Make the ideas specific, not generic.
For example, instead of "How to improve SEO" use "5 Hidden SEO Techniques That Increased Our Traffic by 327% in 2025"
`;

const DEFAULT_DAYS = 30;

interface ContentParams {
  keywords: string;
  days?: number;
  style?: 'casual' | 'professional';
  premium?: boolean;
}

export const generateContentIdeas = async ({
  keywords,
  days = DEFAULT_DAYS,
  style = 'casual',
  premium = false,
}: ContentParams) => {
  try {
    const userPrompt = `
    Generate ${days} content ideas related to: ${keywords}
    
    Style preference: ${style === 'casual' ? 'Conversational and approachable' : 'Professional and authoritative'}
    
    ${premium ? 'Make these ideas extra creative and high-value, as this is for a premium user.' : ''}
    
    Return ONLY the JSON array with no additional text or explanation.
    `;

    try {
      // First try DeepSeek
      const deepseekResponse = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: CONTENT_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 4000,
      });

      const content = deepseekResponse.choices[0]?.message?.content || '';
      
      // Parse JSON from the response or throw error
      try {
        const jsonStart = content.indexOf('[');
        const jsonEnd = content.lastIndexOf(']') + 1;
        const jsonContent = content.substring(jsonStart, jsonEnd);
        return JSON.parse(jsonContent);
      } catch (parseError) {
        throw new Error('Failed to parse DeepSeek response');
      }
      
    } catch (deepseekError) {
      console.error('DeepSeek API error, falling back to Claude:', deepseekError);
      
      // Fallback to Claude
      const claudeResponse = await claude.messages.create({
        model: 'claude-3-7-sonnet-latest',
        max_tokens: 4000,
        temperature: 0.8,
        messages: [
          { 
            role: 'user', 
            content: userPrompt 
          }
        ],
        system: CONTENT_SYSTEM_PROMPT,
      });

      // Update for new SDK - content is an array of content blocks
      const content = claudeResponse.content.find(block => block.type === 'text')?.text || '';
      
      // Parse JSON from the response
      try {
        const jsonStart = content.indexOf('[');
        const jsonEnd = content.lastIndexOf(']') + 1;
        const jsonContent = content.substring(jsonStart, jsonEnd);
        return JSON.parse(jsonContent);
      } catch (parseError) {
        throw new Error('Failed to parse Claude response');
      }
    }
    
  } catch (error) {
    console.error('Content generation error:', error);
    throw error;
  }
}; 