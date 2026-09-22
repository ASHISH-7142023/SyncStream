import React from 'react';
import { AlertTriangle, WifiOff } from 'lucide-react';
import { useHealthCheck } from '../../hooks/useHealthCheck';

const SystemStatusBanner: React.FC = () => {
  const isBackendOnline = useHealthCheck(15000); // Check every 15s

  if (isBackendOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500/90 backdrop-blur-md text-white px-4 py-2 flex items-center justify-center space-x-3 shadow-lg shadow-red-500/20 border-b border-red-600 animate-slide-down">
      <WifiOff className="w-5 h-5 animate-pulse" />
      <span className="text-sm font-medium tracking-wide">
        <strong>System Offline:</strong> Unable to connect to the SyncStream backend servers. Some features may be disabled.
      </span>
      <AlertTriangle className="w-5 h-5 opacity-70" />
    </div>
  );
};

export default SystemStatusBanner;
