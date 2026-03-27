import React from 'react';
import './ResultSlider.css';
import { TooltipLabel } from '../TooltipLabel';
import { PromptResponse } from '../../types';

interface ResultSliderProps {
  result: PromptResponse | null;
  loading: boolean;
}

export const ResultSlider: React.FC<ResultSliderProps> = ({ result, loading }) => {
  const [showVersionB, setShowVersionB] = React.useState<boolean>(true);

  if (loading) {
    return <div className="loading-skeleton">Đang xử lý phân tích thông minh bằng Dual Model...</div>;
  }

  if (!result || !result.versionB) {
    return <div className="result-placeholder">Nhập Prompt vào các Box để xem Kết quả B tối ưu từ Gemini...</div>;
  }

  return (
    <div className="result-slider-container">
      <div className="slider-header">
        <h4>So sánh Kết quả (B - A Toggle)</h4>
        <div className="switch-wrapper">
          <span className={!showVersionB ? 'active-label' : ''}>A (Cũ)</span>
          <label className="switch">
            <input type="checkbox" checked={showVersionB} onChange={(e) => setShowVersionB(e.target.checked)} />
            <span className="slider round"></span>
          </label>
          <span className={showVersionB ? 'active-label' : ''}>B (Mới)</span>
        </div>
      </div>

      <div className="slider-viewport">
        <div className={`slider-track ${showVersionB ? 'view-b' : 'view-a'}`}>
          <div className="pane pane-a">
             {result.versionA ? result.versionA : 'Chưa có phiên bản A trước đó.'}
          </div>
          
          <div className="pane pane-b">
             {/* Component bọc nội dung Dangerously Set Inner HTML */}
             <TooltipLabel htmlContent={result.diffHtml || result.versionB} />
          </div>
        </div>
      </div>
    </div>
  );
};
