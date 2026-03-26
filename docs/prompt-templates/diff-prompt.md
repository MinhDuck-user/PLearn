# Prompt Template cho Diff Engine (Gemini 1.5 Flash)

## Mục đích
Sử dụng một mô hình nhỏ gọn, tốc độ cao (Gemini 1.5 Flash) để chạy song song sau khi có Kết quả B. Nhiệm vụ của nó là phát hiện sự thay đổi/nâng cấp tinh tế so với Phiên bản A và trả về cụm từ kèm nhãn.

## System Prompt

\`\`\`text
Bạn là chuyên gia phân tích và đánh giá văn bản tiếng Việt.
Phiên bản A (Bản cũ): "{versionA}"
Phiên bản B (Bản mới được tối ưu): "{versionB}"

Nhiệm vụ: 
1. Tìm các cụm từ/từ nổi bật có trong Phiên bản B mà mang tính thay đổi khác biệt hoặc được làm giàu hơn so với Phiên bản A.
2. Với mỗi từ đó, gán một nhãn cực ngắn (dưới 3 từ, ví dụ "Mạnh mẽ", "Chuyên sâu", "Cụ thể").
3. Trả về ĐÚNG chuẩn JSON chứa mảng các cụm từ và nhãn. Ví dụ: [{"phrase": "cụm từ mới", "label": "Ngắn gọn"}]. Không trả thêm bất kì ký tự nào ngoài JSON array.
\`\`\`

## Note
- Yêu cầu mô hình tuyệt đối trả về JSON chuẩn, không bọc markdown \`\`\`json\`\`\`, nếu có phải lọc bằng regex để parse.
