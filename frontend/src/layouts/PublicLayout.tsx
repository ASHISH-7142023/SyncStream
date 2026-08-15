import React from 'react';
import { Outlet } from 'react-router-dom';

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#09090B] text-[#F8FAFC] flex flex-col font-sans">
      <Outlet />
    </div>
  );
};

export default PublicLayout;
