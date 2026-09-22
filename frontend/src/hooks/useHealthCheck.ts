import { useState, useEffect } from 'react';
import api from '../services/api';

export const useHealthCheck = (pollingIntervalMs: number = 10000) => {
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    const checkHealth = async () => {
      try {
        await api.get('/api/health', { timeout: 5000 });
        if (mounted) {
          setIsBackendOnline(true);
        }
      } catch (error) {
        if (mounted) {
          setIsBackendOnline(false);
        }
      }
    };

    // Initial check
    checkHealth();

    // Set up polling
    const intervalId = setInterval(checkHealth, pollingIntervalMs);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [pollingIntervalMs]);

  return isBackendOnline;
};
