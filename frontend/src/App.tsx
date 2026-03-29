import React, { useState } from 'react';
import { PromptBlocks } from './components/PromptBlocks';
import { ResultSlider } from './components/ResultSlider';
import { OnboardingFlow } from './components/OnboardingFlow';
import { usePromptQueue } from './hooks/usePromptQueue';
import { PromptPayload, PromptResponse } from './types';
import { ArrowLeft } from 'lucide-react';
import './index.css';

function App() {
  const [currentStep, setCurrentStep] = useState<number>(0); // 0: Field, 1: Topic (handled in OnboardingFlow), 2: Workspace
  const [selectedTopicData, setSelectedTopicData] = useState<Partial<PromptPayload> | null>(null);
  const [result, setResult] = useState<PromptResponse | null>(null);
  
  const { processPayload, isProcessing } = usePromptQueue();

  const handlePayloadChange = async (payload: PromptPayload) => {
    // Only fetch if core blocks have substantial text so we don't spam the API with empty payload requests
    if (!payload.role && !payload.context && !payload.task) return;
    
    // Gửi lên backend thông qua queue hook, handle throttle 2s + deduplication
    const data = await processPayload(payload);
    if (data) {
      setResult(data);
    }
  };

  const handleTopicSelect = (topic: any) => {
    setSelectedTopicData({
      role: topic.role,
      context: topic.context,
      task: topic.task,
    });
    setCurrentStep(2); // Go to Workspace
  };

  return (
    <div className="app-main">
      {/* ONBOARDING FLOW OVERLAY */}
      <div className={currentStep === 2 ? 'hidden' : 'fade-in'}>
        <OnboardingFlow onSelectTopic={handleTopicSelect} />
      </div>

      {/* MAIN WORKSPACE */}
      <div className={`workspace-wrapper ${currentStep === 2 ? 'fade-in' : 'hidden'}`}>
        <header className="app-header relative-header">
          <button className="back-to-topics-btn" onClick={() => setCurrentStep(1)}>
            <ArrowLeft size={18} /> Chọn đề bài khác
          </button>
          <h1>Smart Prompt Orchestrator</h1>
          <p>Hệ thống tự động biên dịch và phân tích mô hình kép (Dual Model AI)</p>
        </header>
        
        <main className="app-container">
          <section className="left-panel">
            {/* 
              React 'key' forces unmount/remount when selectedTopicData changes,
              wiping old state and ensuring pure data population.
            */}
            {currentStep === 2 && (
              <PromptBlocks 
                key={selectedTopicData?.task} 
                initialPayload={selectedTopicData || {}} 
                onPayloadChange={handlePayloadChange} 
              />
            )}
          </section>
          
          <section className="right-panel">
            <ResultSlider result={result} loading={isProcessing} />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
