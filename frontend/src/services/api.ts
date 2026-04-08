import { PromptPayload } from '../types';
import { getSystemPrompt } from '../config/systemPrompts';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// If there's an actual endpoint in the edge function, we will point here:
const API_URL = `${SUPABASE_URL}/functions/v1/process-prompt-stream`;

export async function fetchPromptStream(
  payload: PromptPayload, 
  onChunk: (chunk: string) => void
): Promise<void> {

  // For real edge streaming:
  /*
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ 
      payload,
      systemPrompt: getSystemPrompt(payload.category)
    }),
  });

  if (!response.ok) {
    throw new Error('Network error');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let done = false;

  while (reader && !done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunkValue = decoder.decode(value);
    onChunk(chunkValue);
  }
  */

  // ----------------------------------------------------
  // MOCK LOGIC SINCE WE DON'T HAVE A REAL STREAM ENDPOINT
  // We simulate a typing effect stream returning markdown.
  // ----------------------------------------------------
  
  return new Promise((resolve, reject) => {
    let mockResult = "";
    const systemPrompt = getSystemPrompt(payload.category);
    
    // Create a markdown response based on payload
    if (payload.category === 'marketing') {
      mockResult = `## Chiến dịch Marketing: ${payload.task}
      
**Vai trò:** ${payload.role}
**Bối cảnh:** ${payload.context}
**Tone:** ${payload.tone}
      
Dưới đây là một số ý tưởng copy nổi bật:
      
1. "Chưa bao giờ việc quản lý dữ liệu lại dễ dàng đến thế!"
2. "Bứt phá doanh thu với giải pháp tự động hóa 100%."
      
> *Lưu ý: Bạn có thể điều chỉnh CTA để phù hợp hơn với sản phẩm.*`;

    } else if (payload.category === 'coding') {
      mockResult = `## Giải pháp Kỹ thuật: ${payload.task}
      
Dựa vào yêu cầu của bạn, đây là cấu trúc \`React Component\` tối ưu:

\`\`\`tsx
import React, { useState } from 'react';

export const MyComponent = () => {
  const [active, setActive] = useState(false);
  
  return (
    <div onClick={() => setActive(!active)}>
      {active ? 'Bật' : 'Tắt'}
    </div>
  );
};
\`\`\`
      
**Giải thích:**
- Sử dụng hook \`useState\` chuẩn xác.
- Mã nguồn ngắn gọn, phù hợp với ${payload.role}.`;
      
    } else if (payload.category === 'design') {
      mockResult = `## Ý tưởng Thiết kế
      
Với bối cảnh: ${payload.context}
Lighting: ${payload.lighting}
      
Tôi đề xuất một layout *hiện đại, minimalist*. Dưới đây là mường tượng về UI:

![Mockup Layout](https://i.ibb.co/L5w2N1B/placeholder.png)

*Sử dụng typography to, rõ ràng và khoảng trắng (whitespace) hợp lý.*`;
    } else {
      mockResult = `Đây là kết quả mặc định cho yêu cầu của bạn.\n\nRole: ${payload.role}\nTask: ${payload.task}\nSystem: ${systemPrompt.slice(0, 30)}...`;
    }

    let currentIndex = 0;
    const tokens = mockResult.split(''); // Simulate char by char stream

    const interval = setInterval(() => {
      if (currentIndex < tokens.length) {
        onChunk(tokens[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
        resolve();
      }
    }, 15); // streaming delay 15ms per character
  });
}
