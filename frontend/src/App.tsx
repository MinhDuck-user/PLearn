import React, { useState } from 'react';
import { PromptBlocks } from './components/PromptBlocks';
import { ResultSlider } from './components/ResultSlider';
import { usePromptQueue } from './hooks/usePromptQueue';
import { PromptPayload, PromptResponse } from './types';
import 'index.css';

function App() {
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

  return (
    <div className="app-main">
      <header className="app-header">
        <h1>Smart Prompt Orchestrator</h1>
        <p>Hệ thống tự động biên dịch và phân tích mô hình kép (Dual Model AI)</p>
      </header>
      
      <main className="app-container">
        <section className="left-panel">
          <PromptBlocks onPayloadChange={handlePayloadChange} />
        </section>
        
        <section className="right-panel">
          <ResultSlider result={result} loading={isProcessing} />
        </section>
      </main>
    </div>
  );
}

export default App;
