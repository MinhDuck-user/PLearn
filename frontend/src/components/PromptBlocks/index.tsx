import React, { useState, useEffect } from 'react';
import { PromptPayload, FieldType } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import './PromptBlocks.css';

interface PromptBlocksProps {
  onPayloadChange: (payload: PromptPayload) => void;
}

export const PromptBlocks: React.FC<PromptBlocksProps> = ({ onPayloadChange }) => {
  const [role, setRole] = useState('');
  const [context, setContext] = useState('');
  const [task, setTask] = useState('');
  const [fieldType, setFieldType] = useState<FieldType>('text');
  
  // Dynamic
  const [tone, setTone] = useState('');
  const [lighting, setLighting] = useState('');

  const rawPayload: PromptPayload = { role, context, task, fieldType, tone, lighting };
  
  // Debounce 2s - user must stop typing for 2s
  const debouncedPayload = useDebounce(rawPayload, 2000);

  useEffect(() => {
    // Kích hoạt khi giá trị debounced thay đổi (nghĩa là đã ngưng gõ 2s)
    if (debouncedPayload.role || debouncedPayload.task || debouncedPayload.context) {
      onPayloadChange(debouncedPayload);
    }
  }, [debouncedPayload, onPayloadChange]);

  return (
    <div className="prompt-blocks-container">
      <h3 className="section-title">Cấu trúc Yêu cầu</h3>
      
      <div className="core-blocks">
        <div className="prompt-block">
          <label className="block-label">Vai trò (Role)</label>
          <textarea 
            className="block-textarea"
            placeholder="Ví dụ: Chuyên gia Marketing, Lập trình viên Senior..." 
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
          />
        </div>

        <div className="prompt-block">
          <label className="block-label">Bối cảnh (Context)</label>
          <textarea 
            className="block-textarea"
            placeholder="Mô tả bối cảnh..." 
            value={context} 
            onChange={(e) => setContext(e.target.value)} 
          />
        </div>
        
        <div className="prompt-block">
          <label className="block-label">Nhiệm vụ (Task)</label>
          <textarea 
            className="block-textarea"
            placeholder="Nhiệm vụ cụ thể cần thực hiện..." 
            value={task} 
            onChange={(e) => setTask(e.target.value)} 
          />
        </div>
      </div>

      <div className="dynamic-blocks">
        <div className="prompt-block compact">
          <label className="block-label">Loại Yêu cầu (Field Type)</label>
          <select className="block-select" value={fieldType} onChange={(e) => setFieldType(e.target.value as FieldType)}>
            <option value="text">Văn bản</option>
            <option value="image">Hình ảnh</option>
          </select>
        </div>

        {fieldType === 'text' && (
          <div className="prompt-block compact fade-in">
            <label className="block-label">Giọng văn (Tone)</label>
            <input type="text" className="block-input" placeholder="Vd: Trang trọng, Quyết liệt" value={tone} onChange={(e) => setTone(e.target.value)} />
          </div>
        )}

        {fieldType === 'image' && (
          <div className="prompt-block compact fade-in">
            <label className="block-label">Ánh sáng (Lighting)</label>
            <input type="text" className="block-input" placeholder="Vd: Cinematic, Studio, Soft" value={lighting} onChange={(e) => setLighting(e.target.value)} />
          </div>
        )}
      </div>
    </div>
  );
};
