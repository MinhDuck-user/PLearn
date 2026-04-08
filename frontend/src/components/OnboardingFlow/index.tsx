  import React, { useState } from 'react';
  import { Cpu, Megaphone, PenTool, Image as ImageIcon, ArrowLeft } from 'lucide-react';
  import './OnboardingFlow.css';

  interface Topic {
    id: string;
    title: string;
    role: string;
    context: string;
    task: string;
  }

  interface Field {
    id: string;
    label: string;
    color: string;
    icon: React.ReactNode;
    topics: Topic[];
  }

  const FIELDS: Field[] = [
    {
      id: 'technology',
      label: 'Technology',
      color: '#3b82f6', // Blue
      icon: <Cpu size={32} />,
      topics: [
        { id: 'tech-1', title: 'Code Review & Optimize', role: 'Senior Software Engineer', context: 'Tôi có một đoạn code đang chạy chậm hoặc có thể chứa bug tiềm ẩn.', task: 'Phân tích đoạn code sau, chỉ ra lỗi sai (nếu có) và viết lại phiên bản tối ưu hơn về mặt hiệu suất.' },
        { id: 'tech-2', title: 'API Documentation', role: 'Technical Writer', context: 'Chúng tôi vừa hoàn thành một RESTful API mới cho dự án.', task: 'Viết tài liệu API rõ ràng bao gồm endpoint, method, ý nghĩa các tham số, và ví dụ JSON response.' },
        { id: 'tech-3', title: 'System Architecture', role: 'Cloud Architect', context: 'Dự án chuẩn bị ra mắt cần phục vụ 100,000 user truy cập đồng thời.', task: 'Đề xuất kiến trúc hệ thống AWS / GCP chi tiết để đảm bảo high availability và xử lý tải tốt.' }
      ]
    },
    {
      id: 'marketing',
      label: 'Marketing',
      color: '#f59e0b', // Orange
      icon: <Megaphone size={32} />,
      topics: [
        { id: 'mark-1', title: 'Facebook Ads Copy', role: 'Digital Marketing Expert', context: 'Sản phẩm mới chuẩn bị ra mắt là một ứng dụng quản lý tài chính cá nhân dành cho giới trẻ.', task: 'Viết 3 phiên bản kịch bản quảng cáo Facebook bám sát mô hình AIDA, tone giọng năng động.' },
        { id: 'mark-2', title: 'Email Campaign', role: 'Email Marketer', context: 'Chiến dịch Black Friday sắp đến, cần gửi email nhắc khách hàng VIP.', task: 'Soạn thảo 1 email giật tít, khơi gợi sự tò mò và gắn CTA mạnh mẽ để chốt sale.' },
        { id: 'mark-3', title: 'SEO Blog Post', role: 'SEO Content Specialist', context: 'Từ khóa mục tiêu là "Các cách tiết kiệm tiền cho sinh viên".', task: 'Lên dàn ý chuẩn SEO gồm thẻ H1, H2, H3 và gợi ý số lượng từ cho mỗi đoạn.' }
      ]
    },
    {
      id: 'writing',
      label: 'Writing',
      color: '#8b5cf6', // Purple
      icon: <PenTool size={32} />,
      topics: [
        { id: 'writ-1', title: 'Creative Story', role: 'Novelist', context: 'Bối cảnh là một thành phố Cyberpunk năm 2150, nơi con người có thể tải ký ức lên đám mây.', task: 'Viết mở đầu câu chuyện thật kịch tính (khoảng 500 chữ) bằng góc nhìn của nhân vật chính đang bị truy đuổi.' },
        { id: 'writ-2', title: 'Proofreading', role: 'Editor', context: 'Một đoạn văn bản dài có thể chứa nhiều lỗi ngữ pháp và cách dùng từ lủng củng.', task: 'Chỉnh sửa lại ngữ pháp, cải thiện cấu trúc câu để văn phong mượt mà, rành mạch hơn.' },
        { id: 'writ-3', title: 'Speech Writing', role: 'Professional Speechwriter', context: 'Phát biểu tại lễ tốt nghiệp Đại học trước 5000 sinh viên.', task: 'Viết bài phát biểu truyền cảm hứng dài 3 phút, lồng ghép khiếu hài hước và bài học về sự kiên trì.' }
      ]
    },
    {
      id: 'designer',
      label: 'Designer',
      color: '#81ecfc', // Blue Light
      icon: <ImageIcon size={32} />,
      topics: [
        { id: 'des-1', title: 'Midjourney Prompt', role: 'AI Artist / Prompt Engineer', context: 'Cần tạo ra ảnh chân dung một phi hành gia đang cầm một bông hoa phát sáng trên sao Hỏa.', task: 'Viết prompt chi tiết bằng tiếng Anh (dành cho Midjourney v6), bao gồm mô tả ánh sáng, góc máy, tiêu cự, và phong cách render.' },
        { id: 'des-2', title: 'UX/UI Feedback', role: 'UX/UI Reviewer', context: 'App thiết kế có màu chủ đạo quá tối, nút bấm call-to-action bị chìm.', task: 'Phân tích dựa trên các luật UX cơ bản (Heuristic) và đưa ra ít nhất 3 lời khuyên để cải thiện tỷ lệ chuyển đổi (CR).' },
        { id: 'des-3', title: 'Brand Identity', role: 'Brand Designer', context: 'Một quán cà phê khởi nghiệp dành cho dân công sở cần làm lại branding.', task: 'Gợi ý bảng màu (Hex codes), phông chữ, và ý tưởng logo thiết kế theo phong cách Minimalist.' }
      ]
    }
  ];

  interface OnboardingFlowProps {
    onSelectTopic: (topic: Topic) => void;
  }

  export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onSelectTopic }) => {
    const [selectedField, setSelectedField] = useState<Field | null>(null);
    const [isFadingOut, setIsFadingOut] = useState(false);

    const handleFieldSelect = (field: Field) => {
      setIsFadingOut(true);
      setTimeout(() => {
        setSelectedField(field);
        setIsFadingOut(false);
      }, 250); // wait for fade out
    };

    const handleBack = () => {
      setIsFadingOut(true);
      setTimeout(() => {
        setSelectedField(null);
        setIsFadingOut(false);
      }, 250);
    };

    return (
      <div className="onboarding-overlay">
        <div className="onboarding-modal-container">
          
          {!selectedField ? (
            // STEP 1: FIELD SELECTOR
            <div className={`step-container ${isFadingOut ? 'fade-out' : 'fade-in'}`}>
              <div className="onboarding-header">
                <h2>Chọn một Lĩnh vực</h2>
                <p>Khám phá các mẫu đề bài (Prompt) tối ưu nhất cho công việc của bạn</p>
              </div>
              <div className="fields-grid">
                {FIELDS.map(field => (
                  <button 
                    key={field.id} 
                    className="field-card"
                    onClick={() => handleFieldSelect(field)}
                    style={{ '--field-color': field.color } as React.CSSProperties}
                  >
                    <div className="field-icon" style={{ color: field.color }}>
                      {field.icon}
                    </div>
                    <h3>{field.label}</h3>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // STEP 2: TOPIC LIST
            <div className={`step-container ${isFadingOut ? 'fade-out' : 'fade-in'}`}>
              <div className="onboarding-header list-header">
                <button className="back-btn" onClick={handleBack} title="Quay lại">
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2>{selectedField.label}</h2>
                  <p>Chọn một đề bài cụ thể để bắt đầu</p>
                </div>
              </div>
              
              <div className="topics-list layout-scrollbar">
                {selectedField.topics.map((topic, index) => (
                  <button 
                    key={topic.id} 
                    className="topic-item" 
                    onClick={() => onSelectTopic(topic)}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="topic-info">
                      <h4>{topic.title}</h4>
                      <span className="topic-role">{topic.role}</span>
                    </div>
                    <p className="topic-desc">{topic.task}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  };
