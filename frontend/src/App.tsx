import React, { useState } from 'react';
import { PromptBlocks } from './components/PromptBlocks';
import { ResultSlider } from './components/ResultSlider';
import { OnboardingFlow } from './components/OnboardingFlow';
import { PromptPayload } from './types';
import { fetchPromptStream } from './services/api';
import { ArrowLeft } from 'lucide-react';
import './index.css';

function App() {
  const [currentStep, setCurrentStep] = useState<number>(0); // 0: Field, 1: Topic, 2: Workspace
  const [selectedTopicData, setSelectedTopicData] = useState<Partial<PromptPayload> | null>(null);
  
  // Streaming state
  const [resultText, setResultText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Map onboarding category to our new types
  const mapFieldToCategory = (topic: any): string => {
    const rawTopic = topic.category || topic.title || 'marketing';
    const lowerTopic = rawTopic.toLowerCase();
    if (lowerTopic.includes('mã') || lowerTopic.includes('code')) return 'coding';
    if (lowerTopic.includes('thiết kế') || lowerTopic.includes('design')) return 'design';
    return 'marketing';
  };

  const handleTopicSelect = (topic: any) => {
    setSelectedTopicData({
      category: mapFieldToCategory(topic),
      role: topic.role,
      context: topic.context,
      task: topic.task,
      fieldType: topic.fieldType || 'text'
    });
    setResultText(null); // clear old result
    setCurrentStep(2); // Go to Workspace
  };

  const handleRunTask = async (payload: PromptPayload, mode: 'fast' | 'pro') => {
    setIsProcessing(true);
    setResultText(''); // Reset result

    try {
      await fetchPromptStream(payload, (chunk) => {
        setResultText((prev) => (prev || '') + chunk);
      });
    } catch (error) {
      console.error(error);
      setResultText('**Lỗi:** Không thể kết nối tới máy chủ AI.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeywordToPrompt = (rawPromptText: string) => {
    setIsProcessing(false);
    setResultText(`### 📋 Raw Prompt\n\n\`\`\`text\n${rawPromptText}\n\`\`\`\n\n*Bạn có thể [Copy] đoạn text trên để sử dụng ở nền tảng AI khác.*`);
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
          <p>Hệ thống Block-based Prompting ({selectedTopicData?.category?.toUpperCase()} MODE)</p>
        </header>
        
        <main className="app-container">
          <section className="left-panel">
            {currentStep === 2 && (
              <PromptBlocks 
                key={`${selectedTopicData?.category}-${selectedTopicData?.task}`} 
                initialPayload={selectedTopicData || {}} 
                onRunMode={handleRunTask} 
                onKeywordToPrompt={handleKeywordToPrompt}
              />
            )}
          </section>
          
          <section className="right-panel">
            <ResultSlider 
              result={resultText} 
              loading={isProcessing} 
              category={selectedTopicData?.category} 
            />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
