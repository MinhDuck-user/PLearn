import React, { useState, useEffect } from 'react';
import './SmartLoading.css';

const TIPS: Record<string, string[]> = {
  marketing: [
    "Tip: Hãy xác định rõ chân dung khách hàng mục tiêu để AI viết sát hơn.",
    "Tip: Thêm yếu tố 'Call to Action' vào phần 'Task' để tăng tương tác.",
    "Tip: Yêu cầu AI đóng vai trò như một chuyên gia để ngôn từ chuyên nghiệp hơn.",
  ],
  coding: [
    "Tip: Đừng quên cung cấp framework và version (ví dụ: React 18, Next 14).",
    "Tip: Yêu cầu AI giải thích từng dòng nếu bạn muốn học cách code hoạt động.",
    "Tip: Nếu code dài, hãy mô tả rõ 'Bottleneck' bạn đang gặp phải.",
  ],
  design: [
    "Tip: Mô tả rõ ràng về ánh sáng và góc camera giúp ảnh render đẹp hơn.",
    "Tip: Sử dụng các từ khóa như 'Minimalist, Flat design, UI/UX' để định hướng phong cách.",
    "Tip: Với ảnh chụp, thêm từ khóa độ phân giải (4k, 8k, photorealistic).",
  ]
};

interface SmartLoadingProps {
  category: string;
}

export const SmartLoading: React.FC<SmartLoadingProps> = ({ category }) => {
  const [currentTip, setCurrentTip] = useState("");

  useEffect(() => {
    const list = TIPS[category] || TIPS['marketing'];
    const randomTip = list[Math.floor(Math.random() * list.length)];
    setCurrentTip(randomTip);

    const interval = setInterval(() => {
      const nextRandom = list[Math.floor(Math.random() * list.length)];
      setCurrentTip(nextRandom);
    }, 4000);

    return () => clearInterval(interval);
  }, [category]);

  return (
    <div className="smart-loading-container fade-in">
      <div className="spinner"></div>
      <div className="loading-text">Đang phân tích yêu cầu...</div>
      <div className="smart-tip">{currentTip}</div>
    </div>
  );
};
