import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, MessageSquare, AtSign, Bookmark, Plus, Sparkles, LogOut, ChevronLeft, Settings, Volume2
} from 'lucide-react';
import { useWebRTC } from '../../context/WebRTCContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useNotification } from '../../context/NotificationContext';
import SyncStreamLogo from '../ui/SyncStreamLogo';
import { SettingsModal } from '../modals/SettingsModal';
import { getAvatarForUser } from '../../utils/avatarHelper';

interface Room {
  id: string;
  name: string;
  isDirectMessage?: boolean;
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
  const { presenceUsers } = useSocket();
  const { unreadCount } = useNotification();
  const { joinCall, isCallActive, activeRoomId: webRtcRoomId, remoteStreams } = useWebRTC();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'threads', label: 'Threads', icon: MessageSquare, path: '/threads', badge: 0 },
    { id: 'mentions', label: 'Notifications', icon: AtSign, path: '/notifications', badge: unreadCount },
    { id: 'saved', label: 'Saved Messages', icon: Bookmark, path: '/saved', badge: 0 },
  ];

  const publicRooms = rooms.filter(r => !r.isDirectMessage);
  const directMessages = rooms.filter(r => r.isDirectMessage);

  const formatDMName = (name: string) => {
    if (name.startsWith('DM-')) {
      const parts = name.split('-');
      if (parts.length >= 3) {
        const otherId = parts[1] === user?.id ? parts[2] : parts[1];
        return `DM with ${otherId.substring(0, 6)}...`;
      }
    }
    return name;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
            {publicRooms.map((room) => {
              const isActive = activeRoomId === room.id;
              return (
                <div key={room.id} className="space-y-0.5">
                  <button
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

                  {/* Voice Channel */}
                  {!isCollapsed && (
                    <button
                      onClick={() => joinCall(room.id)}
                      className={`w-full flex items-center rounded-lg pl-8 pr-3 py-1.5 text-xs font-medium transition-all ${
                        isCallActive && webRtcRoomId === room.id
                          ? 'text-[#A78BFA] bg-[#7C3AED]/10' 
                          : 'text-[#94A3B8] hover:text-white hover:bg-[#111318]'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5 mr-2 shrink-0" />
                      <span className="truncate flex-1 text-left">General Voice</span>
                      {isCallActive && webRtcRoomId === room.id && (
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          <span className="text-[10px] text-green-500 font-bold">{Object.keys(remoteStreams).length + 1}</span>
                        </div>
                      )}
                    </button>
                  )}
                </div>
              );
            })}

            {!isCollapsed && publicRooms.length === 0 && (
              <span className="block px-3 py-2 text-[10px] text-[#64748B] italic">No active rooms</span>
            )}
          </div>
        </div>

        {/* Direct Messages Listing */}
        <div className="space-y-2 mt-6">
          <div className="flex items-center justify-between px-3 text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
            {!isCollapsed && <span>Direct Messages</span>}
            <button 
              onClick={() => navigate('/friends')}
              className="p-1 hover:bg-[#151923] text-[#CBD5E1] hover:text-[#F8FAFC] rounded transition-colors"
              title="Add Friend"
            >
              <Plus className="w-3.5 h-3.5 mx-auto" />
            </button>
          </div>

          <div className="space-y-1">
            {directMessages.map((room) => {
              const isActive = activeRoomId === room.id;
              const displayName = formatDMName(room.name);
              return (
                <div key={room.id} className="space-y-0.5">
                  <button
                    onClick={() => navigate(`/rooms/${room.id}`)}
                    className={`w-full flex items-center rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      isActive 
                        ? 'bg-[#7C3AED]/15 border-l-2 border-[#7C3AED] text-white' 
                        : 'text-[#CBD5E1] hover:bg-[#111318] hover:text-[#F8FAFC]'
                    }`}
                    title={isCollapsed ? displayName : undefined}
                  >
                    <div className={`w-5 h-5 rounded-full bg-[#7C3AED]/20 flex items-center justify-center shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-2.5'}`}>
                      <span className="text-[10px] text-white font-bold">{displayName.substring(0, 1).toUpperCase()}</span>
                    </div>
                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left">{displayName}</span>
                    )}
                  </button>
                </div>
              );
            })}

            {!isCollapsed && directMessages.length === 0 && (
              <span className="block px-3 py-2 text-[10px] text-[#64748B] italic">No active DMs</span>
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
      <div className="p-4 border-t border-[#1D2028] bg-obsidian-900 shrink-0 hover:bg-obsidian-800 transition-colors">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none group flex-1 min-w-0"
            onClick={() => navigate('/profile')}
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full border border-obsidian-600 bg-obsidian-750 flex items-center justify-center text-xl select-none">
                {getAvatarForUser(user ? user.username : 'User', presenceUsers)}
              </div>
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-obsidian-900 ${
                user && presenceUsers[user.id]?.status === 'OFFLINE' ? 'bg-status-offline' :
                user && presenceUsers[user.id]?.status === 'AWAY' ? 'bg-status-away' :
                'bg-green-500'
              }`} />
            </div>
            {!isCollapsed && (
              <div className="text-left flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate group-hover:text-[#A78BFA] transition-colors">
                  {user ? user.username : 'User'}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    user && presenceUsers[user.id]?.status === 'OFFLINE' ? 'bg-status-offline' :
                    user && presenceUsers[user.id]?.status === 'AWAY' ? 'bg-status-away' :
                    'bg-green-500'
                  }`}></div>
                  <div className={`text-xs ${
                    user && presenceUsers[user.id]?.status === 'OFFLINE' ? 'text-status-offline' :
                    user && presenceUsers[user.id]?.status === 'AWAY' ? 'text-status-away' :
                    'text-slate-400'
                  }`}>
                    {user && presenceUsers[user.id]?.status ? 
                      presenceUsers[user.id].status.charAt(0) + presenceUsers[user.id].status.slice(1).toLowerCase() 
                      : 'Online'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSettingsOpen(true);
                }}
                className="text-slate-500 hover:text-white p-1 transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </aside>
  );
};

export default AppSidebar;
