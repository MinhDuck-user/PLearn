import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Setup CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { payload, systemPrompt } = body;

    // Phân luồng Model (Dual Model Routing)
    // Nếu payload.modelMode === 'fast' -> dùng gemini-1.5-flash
    // Nếu payload.modelMode === 'pro'  -> dùng gemini-1.5-pro
    const GEMINI_MODEL = payload.modelMode === 'pro' 
      ? 'models/gemini-1.5-pro' 
      : 'models/gemini-1.5-flash';

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY environment variable");
    }

    // Nối raw payload sử dụng cấu trúc Bọc Kép (Double-Framing XML Tags)
    const parts = [];
    if (payload.role) parts.push(`<role>\nRole: ${payload.role}\n</role>`);
    if (payload.context) parts.push(`<context>\nContext: ${payload.context}\n</context>`);
    if (payload.task) parts.push(`<task>\nTask: ${payload.task}\n</task>`);
    if (payload.tone) parts.push(`<tone>\nTone: ${payload.tone}\n</tone>`);
    if (payload.lighting) parts.push(`<lighting>\nLighting: ${payload.lighting}\n</lighting>`);
    
    const userPrompt = parts.join('\n\n');

    // Gọi lên Google Gemini API với tham số `stream`
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL}:streamGenerateContent?key=${apiKey}`;

    const geminiPayload = {
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [{
        role: "user",
        parts: [{ text: userPrompt }]
      }]
    };

    const response = await fetch(geminiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload),
    });

    if (!response.ok) {
      console.error(await response.text());
      throw new Error('Failed to generate content from Gemini');
    }

    // Truyền dữ liệu SSE (Server-Sent Events) hoặc text/plain stream về phía client
    const { readable, writable } = new TransformStream();
    
    // Non-blocking stream processing
    (async () => {
      const writer = writable.getWriter();
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      const encoder = new TextEncoder();
      
      let buffer = "";

      try {
        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          
          // Trích xuất JSON Object bằng cơ chế quét ngoặc an toàn (Bỏ qua ký hiệu `[`, `,`)
          let startIdx = buffer.indexOf('{');
          
          while (startIdx !== -1) {
            let possibleEndIdx = -1;
            let braces = 0;
            let inString = false;
            let escape = false;

            // Quét tìm điểm kết thúc cấu trúc Object `{ ... }`
            for (let i = startIdx; i < buffer.length; i++) {
              const char = buffer[i];
              if (escape) { escape = false; continue; }
              if (char === '\\') { escape = true; continue; }
              if (char === '"') { inString = !inString; continue; }
              
              if (!inString) {
                if (char === '{') braces++;
                if (char === '}') {
                  braces--;
                  if (braces === 0) {
                    possibleEndIdx = i + 1;
                    break;
                  }
                }
              }
            }

            if (possibleEndIdx !== -1) {
              const potentialJson = buffer.substring(startIdx, possibleEndIdx);
              try {
                const jsonObj = JSON.parse(potentialJson); // Gọi V8 Native đảm bảo độ an toàn chuỗi
                const textChunk = jsonObj?.candidates?.[0]?.content?.parts?.[0]?.text;
                
                if (textChunk) {
                  // Chỉ đẩy văn bản trơn về client
                  await writer.write(encoder.encode(textChunk));
                }
                
                // Cắt buffer đã xử lý thành công
                buffer = buffer.substring(possibleEndIdx);
                startIdx = buffer.indexOf('{');
              } catch (e) {
                // Lỗi bất ngờ khi parse, nhảy sang bracket tiếp theo
                startIdx = buffer.indexOf('{', startIdx + 1);
              }
            } else {
              break; // Buffer bị ngắt ở giữa object JSON => Đợi chunk vòng lặp tới
            }
          }
        }
      } catch (err) {
        console.error("Stream execution error:", err);
        await writer.write(encoder.encode(`\n\n[Hệ thống AI gián đoạn (Stream Error): ${err.message}]`));
      } finally {
        writer.close();
      }
    })();

    return new Response(readable, {
      headers: { 
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff"
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
