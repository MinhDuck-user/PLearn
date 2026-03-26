import { GoogleGenerativeAI } from "npm:@google/generative-ai";

interface DiffResult {
  phrase: string;
  label: string;
}

export async function comparePrompts(versionA: string, versionB: string): Promise<{ diffHtml: string, labels: DiffResult[] }> {
  const apiKey = Deno.env.get("GEMINI_API_KEY") || "";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Sử dụng mô hình nhỏ và nhanh Gemini 1.5 Flash cho tác vụ so sánh & phân loại nhẹ nhàng
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  
  const prompt = `Bạn là chuyên gia phân tích và đánh giá văn bản tiếng Việt.
Phiên bản A (Bản cũ): "${versionA}"
Phiên bản B (Bản mới được tối ưu): "${versionB}"

Nhiệm vụ: 
1. Tìm các cụm từ/từ nổi bật có trong Phiên bản B mà mang tính thay đổi khác biệt hoặc được làm giàu hơn so với Phiên bản A.
2. Với mỗi từ đó, gán một nhãn cực ngắn (dưới 3 từ, ví dụ "Mạnh mẽ", "Chuyên sâu", "Cụ thể").
3. Trả về ĐÚNG chuẩn JSON chứa mảng các cụm từ và nhãn. Ví dụ: [{"phrase": "cụm từ mới", "label": "Ngắn gọn"}]. Không trả thêm bất kì ký tự nào ngoài JSON array.`;

  try {
    const result = await model.generateContent(prompt);
    let jsonString = result.response.text();
    // Làm sạch kết quả trả về nếu có chứa markdown string
    jsonString = jsonString.replace(/```json/gi, '').replace(/```/g, '').trim();

    const labels: DiffResult[] = JSON.parse(jsonString);
    let diffHtml = versionB;
    
    // Replace các phrase trong version B bằng HTML mark
    for (const item of labels) {
      if (item.phrase) {
        // Chỉ bôi đen chữ xuất hiện ở phiên bản B
        const regex = new RegExp(`(${item.phrase})`, 'gi');
        diffHtml = diffHtml.replace(regex, `<span class="highlight" data-label="${item.label}">$1</span>`);
      }
    }
    
    return { diffHtml, labels };
  } catch (error) {
    console.error("Lỗi parse JSON so sánh từ Gemini Flash:", error);
    return { diffHtml: versionB, labels: [] }; // Fallback trả nguyên version B nếu lỗi logic diff fail
  }
}
