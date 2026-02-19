import { useState, useEffect } from 'react';
import { petMatAI } from '../services/petMatAIService';

export function usePetMatAI() {
  const [services, setServices] = useState(petMatAI.getServices());
  const [issues, setIssues] = useState(petMatAI.getIssues());
  const [commands, setCommands] = useState(petMatAI.getCommands());
  const [stats, setStats] = useState(petMatAI.getSystemStats());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Start AI monitoring
    petMatAI.startMonitoring();

    // Update data periodically
    const interval = setInterval(() => {
      setServices(petMatAI.getServices());
      setIssues(petMatAI.getIssues());
      setCommands(petMatAI.getCommands());
      setStats(petMatAI.getSystemStats());
    }, 5000);

    return () => {
      clearInterval(interval);
      petMatAI.stopMonitoring();
    };
  }, []);

  const executeCommand = async (commandId: string, params?: any) => {
    setIsLoading(true);
    try {
      const result = await petMatAI.executeCommand(commandId, params);
      setCommands(petMatAI.getCommands());
      setIssues(petMatAI.getIssues());
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const scanForIssues = async () => {
    setIsLoading(true);
    try {
      const newIssues = await petMatAI.scanForIssues();
      setIssues(petMatAI.getIssues());
      return newIssues;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = (settings: { autoRepair?: boolean; monitoring?: boolean }) => {
    petMatAI.updateSettings(settings);
    setStats(petMatAI.getSystemStats());
  };

  return {
    services,
    issues,
    commands,
    stats,
    isLoading,
    executeCommand,
    scanForIssues,
    updateSettings
  };
}
