import React from 'react';

interface SyncStreamLogoProps {
  className?: string;
  iconClassName?: string;
}

export const SyncStreamLogo: React.FC<SyncStreamLogoProps> = ({ 
  className = "w-8 h-8"
}) => {
  return (
    <img 
      src="/logo.png?v=2" 
      alt="SyncStream Logo" 
      className={`rounded-lg object-cover shrink-0 shadow-md ${className}`}
    />
  );
};

export default SyncStreamLogo;
