import React, { useState } from 'react';
import { Download } from 'lucide-react';
import './ExportPromptButton.css';

interface ExportPromptButtonProps {
  promptText: string;
}

export const ExportPromptButton: React.FC<ExportPromptButtonProps> = ({ promptText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button className="export-btn" onClick={() => setIsOpen(true)}>
        <Download size={16} /> Keyword to Prompt
      </button>

      {isOpen && (
        <div className="export-modal-overlay">
          <div className="export-modal">
            <h3>Raw Prompt</h3>
            <textarea 
              className="export-textarea" 
              readOnly 
              value={promptText} 
            />
            <div className="export-modal-actions">
              <button className="btn-secondary" onClick={() => setIsOpen(false)}>Đóng</button>
              <button className="btn-primary" onClick={handleCopy}>
                {copied ? 'Đã Copy!' : 'Copy Prompt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
