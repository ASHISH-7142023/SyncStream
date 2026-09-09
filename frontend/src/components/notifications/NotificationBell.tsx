import React, { useState, useRef, useEffect } from 'react';
import { useNotification, Notification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '../../utils/dateUtils'; // assuming this exists, if not we inline it

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
    
    // Navigate based on type/referenceId
    if (notification.referenceId) {
      if (notification.type === 'MENTION' || notification.type === 'DIRECT_MESSAGE') {
        navigate(`/rooms/${notification.referenceId}`);
      }
    }
  };

  const formatNotificationTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return '';
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'MENTION': return <i className="fa-solid fa-at text-[#a78bfa]"></i>;
      case 'DIRECT_MESSAGE': return <i className="fa-solid fa-message text-[#38bdf8]"></i>;
      default: return <i className="fa-solid fa-bell text-[#fbbf24]"></i>;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl bg-bg-card border border-gray-800 flex items-center justify-center text-text-muted hover:text-white hover:border-gray-700 transition-colors relative cursor-pointer group shadow-sm hover:shadow-md"
        title="Notifications"
      >
        <i className="fa-regular fa-bell text-[18px] group-hover:scale-110 transition-transform"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm border-2 border-bg-card animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#1f2233] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-scale-in origin-top-right">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#151724]">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                className="text-xs text-brand-400 hover:text-brand-300 font-medium cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="flex-1 max-h-[400px] overflow-y-auto scrollbar-thin flex flex-col">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="w-16 h-16 bg-[#8b5cf6]/10 rounded-full flex items-center justify-center mb-3">
                  <i className="fa-regular fa-bell-slash text-2xl text-[#8b5cf6]/50"></i>
                </div>
                <p className="text-gray-300 font-medium mb-1">No notifications yet</p>
                <p className="text-xs text-gray-500">We'll let you know when something arrives.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex gap-3 p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group ${!notification.read ? 'bg-[#8b5cf6]/5' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!notification.read ? 'bg-[#8b5cf6]/20' : 'bg-[#151724] border border-white/10'}`}>
                    {getIconForType(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className={`text-sm truncate ${!notification.read ? 'font-semibold text-white' : 'font-medium text-gray-300'}`}>
                        {notification.title}
                      </span>
                      <span className="text-[10px] text-gray-500 shrink-0 ml-2">
                        {formatNotificationTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className={`text-xs line-clamp-2 ${!notification.read ? 'text-gray-300' : 'text-gray-500'}`}>
                      {notification.message}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-[#8b5cf6] mt-1.5 shrink-0"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
