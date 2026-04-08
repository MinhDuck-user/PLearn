import React, { useState, useEffect, useRef } from 'react';
import { PromptPayload, FieldType } from '../../types';
import taxonomyData from '../../data/taxonomy.json';
import './PromptBlocks.css';
import { Play, Download } from 'lucide-react';

interface PromptBlocksProps {
  initialPayload?: Partial<PromptPayload>;
  onRunMode: (payload: PromptPayload, mode: 'fast' | 'pro') => void;
  onKeywordToPrompt: (rawPromptText: string) => void;
}

type TaxonomyData = typeof taxonomyData;
type CategoryKey = keyof TaxonomyData;
type BlockKey = 'role' | 'context' | 'task' | 'tone' | 'lighting';

export const PromptBlocks: React.FC<PromptBlocksProps> = ({ 
  initialPayload,
  onRunMode 
}) => {
  const [role, setRole] = useState(initialPayload?.role || '');
  const [context, setContext] = useState(initialPayload?.context || '');
  const [task, setTask] = useState(initialPayload?.task || '');
  
  const fieldType: FieldType = initialPayload?.fieldType || 'text';
  const category = (initialPayload?.category as CategoryKey) || null;

  const [tone, setTone] = useState('');
  const [lighting, setLighting] = useState('');

  // Suggestion UI state
  const [activeBlock, setActiveBlock] = useState<BlockKey | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout when unmounting or changing blocks
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleFocus = (blockName: BlockKey, value: string) => {
    setActiveBlock(blockName);
    setSuggestions([]); // hide any existing suggestion immediately
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Only start timeout if value is empty and category is valid
    if (!value && category && taxonomyData[category]) {
      timeoutRef.current = setTimeout(() => {
        // Find tags for this block in the taxonomy
        const categoryData = taxonomyData[category] as any;
        if (categoryData[blockName]) {
          setSuggestions(categoryData[blockName]);
        }
      }, 5000);
    }
  };

  const handleChange = (blockName: BlockKey, setter: React.Dispatch<React.SetStateAction<string>>, val: string) => {
    setter(val);
    setSuggestions([]); // hide suggestions as soon as user types
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleSelectSuggestion = (setter: React.Dispatch<React.SetStateAction<string>>, text: string) => {
    setter(text);
    setSuggestions([]);
    setActiveBlock(null);
  };

  const getRawPromptString = () => {
    const parts = [];
    if (role) parts.push(`Role: ${role}`);
    if (context) parts.push(`Context: ${context}`);
    if (task) parts.push(`Task: ${task}`);
    if (fieldType === 'text' && tone) parts.push(`Tone: ${tone}`);
    if (fieldType === 'image' && lighting) parts.push(`Lighting: ${lighting}`);
    return parts.join('\\n\\n');
  };

  const handleRun = (mode: 'fast' | 'pro') => {
    const payload: PromptPayload = {
      category: category || '',
      modelMode: mode,
      fieldType,
      role,
      context,
      task,
      tone: tone || undefined,
      lighting: lighting || undefined
    };
    onRunMode(payload, mode);
  };

  const renderDropdown = (blockName: BlockKey, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (activeBlock !== blockName || suggestions.length === 0) return null;
    return (
      <div className="suggestions-dropdown fade-in">
        {suggestions.map((s, idx) => (
          <div key={idx} className="suggestion-item" onMouseDown={(e) => {
            e.preventDefault(); // Prevent blur
            handleSelectSuggestion(setter, s);
          }}>
            {s}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="prompt-blocks-container">
      <div className="blocks-header">
        <h3 className="section-title">Cấu trúc Yêu cầu</h3>
        <button 
          className="export-btn" 
          onClick={() => onKeywordToPrompt(getRawPromptString())}
        >
          <Download size={16} /> Keyword to Prompt
        </button>
      </div>
      
      <div className="core-blocks">
        <div className="prompt-block">
          <label className="block-label">Vai trò (Role)</label>
          <div className="relative-block">
            <textarea 
              className="block-textarea"
              placeholder="(nhập vào đây)"
              value={role}
              onFocus={(e) => handleFocus('role', e.target.value)}
              onBlur={() => { setActiveBlock(null); setSuggestions([]); }}
              onChange={(e) => handleChange('role', setRole, e.target.value)} 
            />
            {renderDropdown('role', setRole)}
          </div>
        </div>

        <div className="prompt-block">
          <label className="block-label">Bối cảnh (Context)</label>
          <div className="relative-block">
            <textarea 
              className="block-textarea"
              placeholder="(nhập vào đây)"
              value={context} 
              onFocus={(e) => handleFocus('context', e.target.value)}
              onBlur={() => { setActiveBlock(null); setSuggestions([]); }}
              onChange={(e) => handleChange('context', setContext, e.target.value)} 
            />
            {renderDropdown('context', setContext)}
          </div>
        </div>
        
        <div className="prompt-block">
          <label className="block-label">Nhiệm vụ (Task)</label>
          <div className="relative-block">
            <textarea 
              className="block-textarea"
              placeholder="(nhập vào đây)"
              value={task} 
              onFocus={(e) => handleFocus('task', e.target.value)}
              onBlur={() => { setActiveBlock(null); setSuggestions([]); }}
              onChange={(e) => handleChange('task', setTask, e.target.value)} 
            />
            {renderDropdown('task', setTask)}
          </div>
        </div>
      </div>

      <div className="dynamic-blocks">
        {fieldType === 'text' && (
          <div className="prompt-block compact fade-in relative-block">
            <label className="block-label">Giọng văn (Tone)</label>
            <input type="text" className="block-input" placeholder="Vd: Trang trọng, Quyết liệt"
              value={tone} 
              onFocus={(e) => handleFocus('tone', e.target.value)}
              onBlur={() => { setActiveBlock(null); setSuggestions([]); }}
              onChange={(e) => handleChange('tone', setTone, e.target.value)} />
            {renderDropdown('tone', setTone)}
          </div>
        )}

        {fieldType === 'image' && (
          <div className="prompt-block compact fade-in relative-block">
            <label className="block-label">Ánh sáng (Lighting)</label>
            <input type="text" className="block-input" placeholder="Vd: Cinematic, Studio, Soft"
              value={lighting} 
              onFocus={(e) => handleFocus('lighting', e.target.value)}
              onBlur={() => { setActiveBlock(null); setSuggestions([]); }}
              onChange={(e) => handleChange('lighting', setLighting, e.target.value)} />
             {renderDropdown('lighting', setLighting)}
          </div>
        )}
      </div>

      <div className="run-actions">
        <button className="run-fast-btn fade-in" onClick={() => handleRun('fast')}>
          <Play size={16} /> Chạy (Fast Mode)
        </button>
        <button className="run-pro-btn fade-in" onClick={() => handleRun('pro')}>
          <Play size={16} /> Chạy (Pro Mode)
        </button>
      </div>

    </div>
  );
};
