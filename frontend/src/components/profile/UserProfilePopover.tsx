import React, { useEffect, useState } from 'react';
import ClickAwayListener from 'react-click-away-listener';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';

interface UserProfile {
  id: string;
  username: string;
  gender?: string;
  avatar?: string;
  createdAt?: string;
  themeColor?: string;
  customStatusText?: string;
}

interface UserProfilePopoverProps {
  username: string;
  onClose: () => void;
  position: { x: number; y: number };
}

const getAvatarInitial = (username: string) => {
  return username ? username.charAt(0).toUpperCase() : '?';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ONLINE': return 'bg-emerald-500';
    case 'AWAY': return 'bg-amber-500';
    case 'DO_NOT_DISTURB': return 'bg-red-500';
    case 'OFFLINE': default: return 'bg-gray-500';
  }
};

const getStatusText = (status: string, customStatus?: string) => {
  if (customStatus) return customStatus;
  switch (status) {
    case 'ONLINE': return 'Online';
    case 'AWAY': return 'Idle';
    case 'DO_NOT_DISTURB': return 'Do Not Disturb';
    case 'OFFLINE': default: return 'Offline';
  }
};

const UserProfilePopover: React.FC<UserProfilePopoverProps> = ({ username, onClose, position }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { presenceUsers } = useSocket();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/api/users/${username}`);
        setProfile(response.data);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const presence = Object.values(presenceUsers).find(p => p.username === username);
  const status = presence?.status || 'OFFLINE';
  const customStatusText = profile?.customStatusText || presence?.customStatusText;

  const joinDate = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Unknown';

  const themeColor = profile?.themeColor || '#8b5cf6'; // default primary color

  return (
    <ClickAwayListener onClickAway={onClose}>
      <div 
        className="fixed z-50 w-72 rounded-xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl bg-[#151723]/95 animate-in fade-in zoom-in-95 duration-200"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(10px, -50%)', 
        }}
      >
        {/* Header Background */}
        <div 
          className="h-20 w-full"
          style={{ backgroundColor: themeColor }}
        />

        {/* Profile Info */}
        <div className="px-5 pb-5 relative">
          {/* Avatar Area */}
          <div className="absolute -top-10 left-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-[6px] border-[#151723] bg-[#2a2d3e] flex items-center justify-center overflow-hidden">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt={username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-semibold text-white">{getAvatarInitial(username)}</span>
                )}
              </div>
              {/* Status Indicator */}
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full border-[4px] border-[#151723] bg-[#151723] flex items-center justify-center">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
              </div>
            </div>
          </div>

          <div className="pt-12">
            <h3 className="text-xl font-bold text-white tracking-tight">{username}</h3>
            
            <div className="mt-3 bg-white/5 rounded-lg p-3 border border-white/5">
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Status</h4>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
                <span className="text-sm text-gray-200">{getStatusText(status, customStatusText)}</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">SyncStream Member Since</h4>
                <p className="text-sm text-gray-300 mt-0.5">{loading ? 'Loading...' : joinDate}</p>
              </div>
            </div>

            <div className="mt-5">
              <input
                type="text"
                placeholder={`Message @${username}`}
                className="w-full bg-[#0f111a] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    alert(`Message feature to ${username} coming soon!`);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </ClickAwayListener>
  );
};

export default UserProfilePopover;
