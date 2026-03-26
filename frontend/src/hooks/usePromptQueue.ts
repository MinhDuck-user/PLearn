import { useState, useRef, useCallback } from 'react';
import { PromptPayload, PromptResponse } from '../types';
import { processPromptAPI } from '../services/api';

export function usePromptQueue() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSuccessfulPayload, setLastSuccessfulPayload] = useState<string | null>(null);
  const [currentVersionA, setCurrentVersionA] = useState<string>(''); // Session storage for Version A
  const lastRequestTime = useRef<number>(0);

  const processPayload = useCallback(async (payload: PromptPayload) => {
    const payloadStr = JSON.stringify(payload);
    
    // 1. Duplicate Check
    if (payloadStr === lastSuccessfulPayload) {
      console.log('Duplicate Request: Payload is identical to the last successful one. Ignored.');
      return null;
    }

    // 2. Throttling / Queue Validation
    // Yêu cầu: "chỉ được xử lý cách nhau tối thiểu 2 giây"
    const now = Date.now();
    const timeSinceLast = now - lastRequestTime.current;
    if (timeSinceLast < 2000) {
      // Simulate waiting or reject (Frontend throttling mechanism to protect Backend API Limit)
      console.warn('Throttling: Request sent too fast. Please wait.');
      // Actually we will wait until the 2 seconds passes
      await new Promise((resolve) => setTimeout(resolve, 2000 - timeSinceLast));
    }

    setIsProcessing(true);
    lastRequestTime.current = Date.now();

    try {
      const response = await processPromptAPI(payload, currentVersionA);
      
      if (response && response.success) {
        setLastSuccessfulPayload(payloadStr);
        // After successful generation, the next 'Version A' becomes this 'Version B'
        setCurrentVersionA(response.versionB);
        return response;
      }
      return null;
    } catch (error) {
      console.error('Error processing prompt in queue:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [lastSuccessfulPayload, currentVersionA]);

  return {
    processPayload,
    isProcessing,
  };
}
