import React, { useRef, useState, useEffect } from 'react';
import './TooltipLabel.css';

interface TooltipLabelProps {
  htmlContent: string;
}

export const TooltipLabel: React.FC<TooltipLabelProps> = ({ htmlContent }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string; visible: boolean }>({
    x: 0,
    y: 0,
    text: '',
    visible: false,
  });

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.classList.contains('highlight')) {
        const label = target.getAttribute('data-label');
        if (label) {
          const rect = target.getBoundingClientRect();
          const containerRect = containerRef.current?.getBoundingClientRect();

          setTooltip({
            x: rect.left - (containerRect?.left || 0) + (rect.width / 2),
            y: rect.top - (containerRect?.top || 0) - 10,
            text: label,
            visible: true,
          });
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.classList.contains('highlight')) {
        setTooltip((prev) => ({ ...prev, visible: false }));
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mouseover', handleMouseOver);
      container.addEventListener('mouseout', handleMouseOut);
    }

    return () => {
      if (container) {
        container.removeEventListener('mouseover', handleMouseOver);
        container.removeEventListener('mouseout', handleMouseOut);
      }
    };
  }, [htmlContent]);

  return (
    <div className="tooltip-label-wrapper" ref={containerRef}>
      <div 
        className="html-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
      {tooltip.visible && (
        <div 
          className="tooltip-popover"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};
