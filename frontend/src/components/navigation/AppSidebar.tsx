import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, MessageSquare, AtSign, Bookmark, Plus, Sparkles, LogOut, ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SyncStreamLogo from '../ui/SyncStreamLogo';

interface Room {
  id: string;
  name: string;
}

interface AppSidebarProps {
  rooms: Room[];
  activeRoomId?: string;
  onCreateRoomClick: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({
  rooms,
  activeRoomId,
  onCreateRoomClick,
  isCollapsed,
  onToggleCollapse,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'threads', label: 'Threads', icon: MessageSquare, path: '/threads', badge: 0 },
    { id: 'dms', label: 'Direct Messages', icon: MessageSquare, path: '/messages', badge: 3 },
    { id: 'mentions', label: 'Mentions', icon: AtSign, path: '/mentions', badge: 0 },
    { id: 'saved', label: 'Saved Messages', icon: Bookmark, path: '/saved', badge: 0 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Generate username avatar initials
  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside 
      className={`bg-[#0F1117] border-r border-[#27272A] flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header Logo */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#1D2028] shrink-0">
        {!isCollapsed && (
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <SyncStreamLogo className="w-8 h-8" />
            <img src="/name.png" alt="SyncStream" className="h-7 w-32 object-contain" />
          </div>
        )}
        {isCollapsed && (
          <div onClick={() => navigate('/dashboard')}>
            <SyncStreamLogo className="w-8 h-8 mx-auto cursor-pointer" />
          </div>
        )}
        
        {!isCollapsed && (
          <button 
            onClick={onToggleCollapse}
            className="p-1 hover:bg-[#151923] text-[#94A3B8] hover:text-[#F8FAFC] rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Navigation Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {/* Core Menu */}
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center rounded-lg px-3 py-2.5 text-xs font-semibold tracking-wide transition-all group ${
                  isActive 
                    ? 'bg-[#7C3AED] text-white' 
                    : 'text-[#CBD5E1] hover:bg-[#111318] hover:text-[#F8FAFC]'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                {!isCollapsed && (
                  <span className="flex-1 text-left">{item.label}</span>
                )}
                {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#EF4444] text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Rooms Listing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3 text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
            {!isCollapsed && <span>Rooms</span>}
            <button 
              onClick={onCreateRoomClick}
              className="p-1 hover:bg-[#151923] text-[#CBD5E1] hover:text-[#F8FAFC] rounded transition-colors"
              title="Create Room"
            >
              <Plus className="w-3.5 h-3.5 mx-auto" />
            </button>
          </div>

          <div className="space-y-1">
            {rooms.map((room) => {
              const isActive = activeRoomId === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => navigate(`/rooms/${room.id}`)}
                  className={`w-full flex items-center rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    isActive 
                      ? 'bg-[#7C3AED]/15 border-l-2 border-[#7C3AED] text-white' 
                      : 'text-[#CBD5E1] hover:bg-[#111318] hover:text-[#F8FAFC]'
                  }`}
                  title={isCollapsed ? `# ${room.name}` : undefined}
                >
                  <span className={`font-mono text-sm shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-2.5 text-[#94A3B8]'}`}>#</span>
                  {!isCollapsed && (
                    <span className="truncate flex-1 text-left">{room.name}</span>
                  )}
                </button>
              );
            })}

            {!isCollapsed && rooms.length === 0 && (
              <span className="block px-3 py-2 text-[10px] text-[#64748B] italic">No active rooms</span>
            )}
          </div>
        </div>

        {/* Upgrade Card Overlay */}
        {!isCollapsed && (
          <div className="bg-[#151923] border border-[#27272A] rounded-xl p-4 space-y-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#7C3AED]/10 rounded-full blur-xl transition-all duration-300 group-hover:scale-125" />
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-[#7C3AED]/20 text-[#A78BFA] rounded-lg">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-[#F8FAFC]">Upgrade to Pro</span>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Unlock unlimited files sharing, custom channels, and telemetry widgets.
            </p>
            <button 
              onClick={() => navigate('/upgrade')}
              className="w-full py-2 bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] hover:opacity-90 text-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all"
            >
              Upgrade Now
            </button>
          </div>
        )}
      </div>

      {/* User Session Footer Block */}
      <div className="p-3 border-t border-[#1D2028] bg-[#111318] shrink-0">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none group flex-1 min-w-0"
            onClick={() => navigate('/profile')}
          >
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] flex items-center justify-center font-bold text-[#F8FAFC] text-sm">
                {user ? getInitials(user.username) : 'U'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#111318] bg-[#22C55E] animate-pulse-online" />
            </div>
            {!isCollapsed && (
              <div className="text-left flex-1 min-w-0">
                <div className="text-xs font-bold text-[#F8FAFC] truncate group-hover:text-[#A78BFA] transition-colors">
                  {user ? user.username : 'User'}
                </div>
                <div className="text-[10px] text-[#94A3B8] font-medium tracking-wide">
                  Online
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-[#151923] text-[#94A3B8] hover:text-[#EF4444] rounded-lg transition-colors ml-1"
              title="Terminate Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
