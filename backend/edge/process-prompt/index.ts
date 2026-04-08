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

    // Nối raw payload thành văn bản user prompt
    const parts = [];
    if (payload.role) parts.push(`Role: ${payload.role}`);
    if (payload.context) parts.push(`Context: ${payload.context}`);
    if (payload.task) parts.push(`Task: ${payload.task}`);
    if (payload.tone) parts.push(`Tone: ${payload.tone}`);
    if (payload.lighting) parts.push(`Lighting: ${payload.lighting}`);
    
    const userPrompt = parts.join('\n');

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

      try {
        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value);
          // Parsing Server-Sent Events from Gemini
          // Mẫu kết quả của Gemini stream là chuỗi JSON array bắt đầu với [ và kết thúc với ] phẩy phẩy
          // Trong môi trường React client, ta gửi dồn chunk text thuần
          
          await writer.write(encoder.encode(chunkText));
        }
      } catch (err) {
        console.error("Stream execution error:", err);
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
