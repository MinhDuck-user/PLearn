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
      <h3>Cấu trúc Yêu cầu (Prompt Blocks)</h3>
      
      <div className="core-blocks">
        <label>
          Bối cảnh (Context)
          <textarea placeholder="Nhập bối cảnh..." value={context} onChange={(e) => setContext(e.target.value)} />
        </label>
        
        <label>
          Vai trò (Role)
          <input type="text" placeholder="Ví dụ: Chuyên gia Marketing..." value={role} onChange={(e) => setRole(e.target.value)} />
        </label>
        
        <label>
          Nhiệm vụ (Task)
          <textarea placeholder="Nhiệm vụ cụ thể..." value={task} onChange={(e) => setTask(e.target.value)} />
        </label>
      </div>

      <div className="dynamic-blocks">
        <label>
          Loại Field (Field Type)
          <select value={fieldType} onChange={(e) => setFieldType(e.target.value as FieldType)}>
            <option value="text">Văn bản</option>
            <option value="image">Hình ảnh</option>
          </select>
        </label>

        {fieldType === 'text' && (
          <label className="fade-in">
            Giọng văn (Tone)
            <input type="text" placeholder="Vd: Trang trọng, Quyết liệt" value={tone} onChange={(e) => setTone(e.target.value)} />
          </label>
        )}

        {fieldType === 'image' && (
          <label className="fade-in">
            Ánh sáng (Lighting)
            <input type="text" placeholder="Vd: Cinematic, Studio, Soft" value={lighting} onChange={(e) => setLighting(e.target.value)} />
          </label>
        )}
      </div>
    </div>
  );
};
