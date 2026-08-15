import React from 'react';

interface SyncStreamLogoProps {
  className?: string;
  iconClassName?: string;
}

export const SyncStreamLogo: React.FC<SyncStreamLogoProps> = ({ 
  className = "w-8 h-8",
  iconClassName = "w-4.5 h-4.5"
}) => {
  return (
    <div className={`rounded-lg bg-[#7C3AED] flex items-center justify-center ${className} shrink-0 shadow-md`}>
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="white" 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={iconClassName}
      >
        {/* Chat bubble with double circular sync arrows */}
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    </div>
  );
};

export default SyncStreamLogo;
