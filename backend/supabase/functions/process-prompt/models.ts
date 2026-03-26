import { GoogleGenerativeAI } from "npm:@google/generative-ai";

// Hàm xử lý gọi Gemini 1.5 Pro
export async function generateImprovedPrompt(payload: any): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY") || "";
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  // Sử dụng mô hình lớn Gemini 1.5 Pro cho tác vụ sinh văn bản khó
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
  
  const systemPrompt = `Bạn là một Prompt Engineer xuất sắc. Hãy nhận JSON payload (chứa yêu cầu người dùng) dưới đây và viết lại nó thành một câu lệnh Prompt (bằng tiếng Việt) hoàn chỉnh, trực tiếp, tối ưu và chi tiết nhất có thể để sử dụng cho ChatGPT/Midjourney (tùy thuộc vào fieldType):

Nội dung JSON:
${JSON.stringify(payload, null, 2)}

Hãy viết lại thành một đoạn văn bản thống nhất thành một câu lệnh mạnh mẽ. Không được trả về định dạng code markdown. Chỉ trả về văn bản thành quả cuối cùng trực tiếp.
  `;

  const result = await model.generateContent(systemPrompt);
  return result.response.text();
}
