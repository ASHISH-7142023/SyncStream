import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAvatarForUser } from '../../utils/avatarHelper';
import HelpModal from '../modals/HelpModal';
import { useState } from 'react';

interface TopbarProps {
  notificationsCount?: number;
  onNotificationsClick?: () => void;
  onSearchFocus?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({
  notificationsCount = 3,
  onNotificationsClick,
  onSearchFocus,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isHelpOpen, setIsHelpOpen] = useState(false);


  return (
    <header className="h-16 border-b border-[#27272A] bg-[#0F1117] flex items-center justify-between px-6 shrink-0 relative z-20">
      
      {/* Search Bar Block */}
      <div className="flex-1 max-w-md">
        <div 
          onClick={onSearchFocus}
          className="w-full flex items-center bg-[#111318] border border-[#27272A] hover:border-[#7C3AED] rounded-lg px-3.5 py-2 text-xs text-[#CBD5E1] cursor-pointer group transition-all"
        >
          <Search className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F8FAFC] mr-3 shrink-0" />
          <span className="flex-1 text-[#94A3B8]">Search rooms, messages, or users...</span>
          <span className="px-1.5 py-0.5 bg-[#151923] border border-[#27272A] rounded text-[10px] font-mono text-[#94A3B8] tracking-widest font-semibold shrink-0">
            ⌘K
          </span>
        </div>
      </div>

      {/* Control Actions & User Dropdown */}
      <div className="flex items-center space-x-4">
        {/* Notifications Icon Button */}
        <button 
          onClick={onNotificationsClick}
          className="p-2 hover:bg-[#151923] text-[#94A3B8] hover:text-[#F8FAFC] rounded-lg transition-colors relative"
          title="Recent updates"
        >
          <Bell className="w-4.5 h-4.5" />
          {notificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#8B5CF6] rounded-full ring-2 ring-[#0F1117]" />
          )}
        </button>

        {/* Help Center */}
        <button 
          onClick={() => setIsHelpOpen(true)}
          className="p-2 hover:bg-[#151923] text-[#94A3B8] hover:text-[#F8FAFC] rounded-lg transition-colors"
          title="SyncStream Help Center"
        >
          <HelpCircle className="w-4.5 h-4.5" />
        </button>

        {/* Vertical Divider */}
        <span className="w-px h-5 bg-[#27272A]" />

        {/* Active Profile Info */}
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 rounded-full border border-obsidian-600 bg-obsidian-750 flex items-center justify-center font-bold text-white text-[15px] ring-1 ring-white/10 group-hover:ring-[#7C3AED]/50 transition-all shrink-0 aspect-square select-none">
            {getAvatarForUser(user ? user.username : 'User')}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#A78BFA] transition-colors">
              {user ? user.username : 'User'}
            </div>
            <div className="text-[10px] text-[#94A3B8] font-medium tracking-wide">
              Member
            </div>
          </div>
        </div>
      </div>

      {/* Render the Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </header>
  );
};

export default Topbar;
