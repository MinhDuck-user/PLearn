import React, { useState, useEffect } from 'react';
import { PromptPayload, FieldType } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import './PromptBlocks.css';

interface PromptBlocksProps {
  initialPayload?: Partial<PromptPayload>;
  onPayloadChange: (payload: PromptPayload) => void;
}

export const PromptBlocks: React.FC<PromptBlocksProps> = ({ 
  initialPayload,
  onPayloadChange 
}) => {
  const [role, setRole] = useState(initialPayload?.role || '');
  const [context, setContext] = useState(initialPayload?.context || '');
  const [task, setTask] = useState(initialPayload?.task || '');
  
  // Use fixed fieldType or inherit from payload since we removed the selector
  const fieldType: FieldType = initialPayload?.fieldType || 'text';
  
  // Placeholders
  const [rolePlaceholder, setRolePlaceholder] = useState('(nhập vào đây)');
  const [contextPlaceholder, setContextPlaceholder] = useState('(nhập vào đây)');
  const [taskPlaceholder, setTaskPlaceholder] = useState('(nhập vào đây)');

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
            placeholder={rolePlaceholder}
            onFocus={() => setRolePlaceholder('')}
            onBlur={() => setRolePlaceholder('(nhập vào đây)')}
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
          />
        </div>

        <div className="prompt-block">
          <label className="block-label">Bối cảnh (Context)</label>
          <textarea 
            className="block-textarea"
            placeholder={contextPlaceholder}
            onFocus={() => setContextPlaceholder('')}
            onBlur={() => setContextPlaceholder('(nhập vào đây)')}
            value={context} 
            onChange={(e) => setContext(e.target.value)} 
          />
        </div>
        
        <div className="prompt-block">
          <label className="block-label">Nhiệm vụ (Task)</label>
          <textarea 
            className="block-textarea"
            placeholder={taskPlaceholder}
            onFocus={() => setTaskPlaceholder('')}
            onBlur={() => setTaskPlaceholder('(nhập vào đây)')}
            value={task} 
            onChange={(e) => setTask(e.target.value)} 
          />
        </div>
      </div>

      <div className="dynamic-blocks">
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
