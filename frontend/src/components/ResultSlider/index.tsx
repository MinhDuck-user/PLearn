import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ResultSlider.css';
import { SmartLoading } from '../SmartLoading';

interface ResultSliderProps {
  result: string | null;
  loading: boolean;
  category?: string;
}

export const ResultSlider: React.FC<ResultSliderProps> = ({ result, loading, category }) => {
  if (loading && !result) {
    return <SmartLoading category={category || 'general'} />;
  }

  if (!result && !loading) {
    return <div className="result-placeholder">Nhập Prompt vào các Box và nhấn "Chạy" để xem kết quả từ AI...</div>;
  }

  return (
    <div className="result-slider-container">
      <div className="slider-header">
        <h4>Kết quả AI</h4>
      </div>

      <div className="slider-viewport view-single">
        <div className="pane-single markdown-body fade-in">
           <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {result || ''}
           </ReactMarkdown>
           {loading && <span className="typing-cursor">|</span>}
        </div>
      </div>
    </div>
  );
};
