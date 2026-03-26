import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { generateImprovedPrompt } from "./models.ts";
import { comparePrompts } from "./diff-engine.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Xử lý Preflight request từ Frontend
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { payload, versionA } = await req.json();

    // 1. Dual Model Strategy - Step 1: Dùng mô hình Lớn (Pro) để sinh Kết quả B
    const versionB = await generateImprovedPrompt(payload);

    // 2. Dual Model Strategy - Step 2: Dùng mô hình Nhỏ (Flash) để so sánh nếu có Version A
    let diffHtml = versionB;
    let labels: { phrase: string, label: string }[] = [];
    
    // Nếu Frontend gửi lên version A (nghĩa là không phải lần đầu gửi form)
    if (versionA && versionA.trim().length > 0) {
      const diffResult = await comparePrompts(versionA, versionB);
      diffHtml = diffResult.diffHtml;
      labels = diffResult.labels;
    } else {
      // Giả lập highlighting cho lần đầu tiên user dùng nếu thích (Optionally disabled per rules)
      // Lần đầu thì Version B chính là Version A sau này
    }

    const responseData = {
      success: true,
      versionA, 
      versionB,
      diffHtml,
      labels,
    };

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("Xảy ra lỗi trong luồng Process:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
