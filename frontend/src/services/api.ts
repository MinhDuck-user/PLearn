import { PromptPayload, PromptResponse } from '../types';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export async function processPromptAPI(payload: PromptPayload, versionA: string): Promise<PromptResponse | null> {
  const url = `${SUPABASE_URL}/functions/v1/process-prompt`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        payload,
        versionA, // Gửi phiên bản A cũ để server không phải cache (serverless architecture friendly)
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait before typing.');
      }
      throw new Error(`API returned ${response.status}`);
    }

    const data: PromptResponse = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
