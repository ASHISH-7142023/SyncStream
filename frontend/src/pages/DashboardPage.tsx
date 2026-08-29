import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SyncStreamLogo from '../components/ui/SyncStreamLogo';
import { getAvatarForUser } from '../utils/avatarHelper';

interface Room {
  id: string;
  name: string;
  description?: string;
}

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { rooms, onOpenCreateModal } = useOutletContext<{ 
    rooms: Room[]; 
    onOpenCreateModal: () => void;
  }>();

  const [showTip, setShowTip] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keydown listener for hotkeys (Ctrl+K or Cmd+K focuses search, Esc blurs/clears)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        searchInputRef.current?.blur();
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = [
    { 
      title: 'Total Rooms', 
      value: rooms.length.toString(), 
      subtext: `${Math.max(1, Math.floor(rooms.length / 3))} new this week ↑`, 
      icon: <i className="fa-solid fa-user-group text-accent-purpleLight text-xl"></i>, 
      color: 'bg-accent-purple/10' 
    },
    { 
      title: 'Online Now', 
      value: (rooms.length * 3 + 5).toString(), 
      subtext: `+${Math.max(1, Math.floor(rooms.length / 2))} from yesterday`, 
      icon: <div className="w-4 h-4 bg-accent-green rounded-full shadow-[0_0_10px_rgba(72,187,120,0.5)]"></div>, 
      color: 'bg-accent-green/10' 
    },
    { 
      title: 'Messages Today', 
      value: (rooms.length * 38 + 120).toString(), 
      subtext: `+${Math.floor(rooms.length * 2.8 + 1.5)}% from yesterday`, 
      icon: <i className="fa-solid fa-message text-accent-blue text-xl"></i>, 
      color: 'bg-accent-blue/10' 
    },
    { 
      title: 'Files Shared', 
      value: (rooms.length * 6 + 14).toString(), 
      subtext: `+${Math.floor(rooms.length * 1.4 + 0.8)}% from yesterday`, 
      icon: <i className="fa-solid fa-file-lines text-orange-500 text-xl"></i>, 
      color: 'bg-orange-500/10' 
    },
  ];

  const recentActivity = [
    { user: 'Sarah Wilson', room: 'developers', action: 'Updated the authentication flow. Please review!', time: '10:32 AM', unread: true },
    { user: 'David Brown', room: 'product-updates', action: 'We just launched the new dashboard 🎉', time: '9:45 AM', unread: true },
    { user: 'Emily Davis', room: 'design-team', action: "Here's the new design system we discussed.", time: '9:21 AM', unread: false },
    { user: 'Michael Chen', room: 'general', action: 'Good morning everyone! ☕', time: '8:15 AM', unread: false },
    { user: 'Lisa Anderson', room: 'developers', action: 'Bug fix: Resolved payment gateway issue.', time: 'Yesterday', unread: false },
  ];

  const roomColors = [
    'bg-indigo-900/50 text-indigo-400',
    'bg-emerald-900/50 text-emerald-400',
    'bg-fuchsia-900/50 text-fuchsia-400',
    'bg-amber-900/50 text-amber-400',
    'bg-blue-900/50 text-blue-400'
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-bg-main text-text-main font-sans selection:bg-accent-purple selection:text-white">
      
      {/* Sidebar Backdrop for Mobile */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden cursor-pointer"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar Layout */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-bg-sidebar border-r border-gray-800 flex flex-col h-full shrink-0 text-left transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:flex md:z-0
        ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-white cursor-pointer" onClick={() => navigate('/dashboard')}>
            <SyncStreamLogo className="w-8 h-8" />
            <img src="/name.png" alt="SyncStream" className="h-6 w-auto object-contain" />
          </div>
          <button 
            onClick={() => setShowMobileSidebar(false)}
            className="md:hidden p-1 text-text-muted hover:text-white hover:bg-white/10 rounded cursor-pointer"
          >
            ✕
          </button>
          <button 
            onClick={() => alert("Sidebar collapse toggle is a Pro feature!")}
            className="hidden md:block text-text-muted hover:text-white transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-angles-left text-sm"></i>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3 flex flex-col gap-6">
          <div className="space-y-1">
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-accent-purple/20 to-transparent border-l-2 border-accent-purpleLight text-white rounded-r-lg group text-left">
              <i className="fa-solid fa-house w-5 text-accent-purpleLight"></i>
              <span className="font-medium text-sm">Home</span>
            </button>
            <button onClick={() => navigate('/rooms')} className="w-full flex items-center gap-3 px-3 py-2 text-text-muted hover:text-white hover:bg-bg-hover rounded-lg transition-colors group text-left">
              <i className="fa-solid fa-comment-dots w-5 group-hover:text-white transition-colors"></i>
              <span className="font-medium text-sm">Rooms Feed</span>
            </button>
            <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-3 py-2 text-text-muted hover:text-white hover:bg-bg-hover rounded-lg transition-colors group text-left">
              <i className="fa-regular fa-message w-5 group-hover:text-white transition-colors"></i>
              <span className="font-medium text-sm">My Profile</span>
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Rooms List</h3>
              <button onClick={onOpenCreateModal} className="text-text-muted hover:text-white transition-colors p-1 rounded-md hover:bg-bg-hover">
                <i className="fa-solid fa-plus text-xs"></i>
              </button>
            </div>
            <div className="space-y-0.5">
              {filteredRooms.map((r) => (
                <button 
                  key={r.id} 
                  onClick={() => navigate(`/rooms/${r.id}`)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-text-muted hover:text-white hover:bg-bg-hover rounded-lg transition-colors group text-left"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="text-accent-purpleLight font-bold w-4 text-center">#</span>
                    <span className="text-sm truncate">{r.name}</span>
                  </div>
                  {r.name === 'general' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>}
                </button>
              ))}
              {filteredRooms.length === 0 && (
                <div className="px-3 py-2 text-xs text-text-muted italic">No matching rooms</div>
              )}
            </div>
          </div>
        </nav>

        {/* Upgrade Banner */}
        <div className="p-4 mt-auto shrink-0">
          <div className="bg-bg-card rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center text-accent-purpleLight">
                <i className="fa-solid fa-bolt"></i>
              </div>
              <h4 className="font-semibold text-accent-purpleLight text-sm">Upgrade to Pro</h4>
            </div>
            <p className="text-xs text-text-muted mb-4 leading-relaxed">Get more storage, file sharing and advanced features.</p>
            <button onClick={() => setShowUpgradeModal(true)} className="w-full py-2 bg-gradient-to-r from-accent-purple to-accent-purpleLight hover:from-accent-purpleLight hover:to-accent-purple text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-accent-purple/20">
              Upgrade Now
            </button>
          </div>
        </div>

        {/* Profile Info block */}
        <div className="p-4 border-t border-gray-800 flex items-center justify-between cursor-pointer hover:bg-bg-hover transition-colors rounded-tr-2xl" onClick={() => navigate('/profile')}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center text-lg select-none">
                {getAvatarForUser(user ? user.username : 'Alex Johnson')}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-accent-green border-2 border-bg-sidebar rounded-full"></span>
            </div>
            <div className="text-left min-w-0">
              <div className="text-sm font-semibold leading-none mb-1 text-white truncate">{user ? user.username : 'Alex Johnson'}</div>
              <div className="text-xs text-text-muted">Online</div>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              logout();
            }}
            className="text-text-muted hover:text-red-400 p-1 transition-colors"
            title="Log Out"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </aside>

      {/* Main Workspace Column */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 md:px-8 border-b border-gray-800 bg-bg-main shrink-0">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button 
              onClick={() => setShowMobileSidebar(true)}
              className="md:hidden p-2 text-[#94a3b8] hover:text-white hover:bg-white/5 rounded-lg transition-colors shrink-0 cursor-pointer"
              title="Open Sidebar"
            >
              <i className="fa-solid fa-bars text-lg"></i>
            </button>
            <div className="relative group w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fa-solid fa-magnifying-glass text-text-muted group-focus-within:text-accent-purple transition-colors"></i>
              </div>
              <input 
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg-sidebar border border-gray-800 text-sm rounded-lg pl-10 pr-12 py-2 text-white placeholder-text-muted focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/50 transition-all" 
                placeholder="Search rooms, messages, or users..." 
                type="text"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-text-muted hover:text-white text-xs cursor-pointer px-1 hover:bg-white/10 rounded"
                  >
                    ✕
                  </button>
                )}
                <div className="flex items-center gap-1 text-[10px] font-mono text-text-muted bg-bg-card border border-gray-700 px-1.5 py-0.5 rounded pointer-events-none">
                  <span>⌘</span><span>K</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-5 ml-8">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-text-muted hover:text-white transition-colors relative p-1.5 rounded-full hover:bg-white/5 cursor-pointer"
              >
                <i className="fa-regular fa-bell text-base"></i>
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent-purpleLight rounded-full border border-bg-main"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-bg-card border border-gray-800 rounded-xl shadow-2xl z-50 p-4 animate-scale-in">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-800">
                    <h4 className="font-semibold text-sm text-white">Notifications</h4>
                    <button onClick={() => setShowNotifications(false)} className="text-xs text-accent-purpleLight hover:underline cursor-pointer">Mark all read</button>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    <div className="flex gap-3 text-xs leading-relaxed hover:bg-bg-hover p-1.5 rounded transition-colors cursor-pointer">
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-accent-purpleLight shrink-0"></div>
                      <div>
                        <p className="text-white"><strong>Sarah Wilson</strong> mentioned you in <strong>#developers</strong></p>
                        <p className="text-[10px] text-text-muted mt-0.5">5 mins ago</p>
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs leading-relaxed hover:bg-bg-hover p-1.5 rounded transition-colors cursor-pointer">
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-accent-purpleLight shrink-0"></div>
                      <div>
                        <p className="text-white">New room <strong>#product-updates</strong> was created by <strong>David</strong></p>
                        <p className="text-[10px] text-text-muted mt-0.5">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button 
              className="text-text-muted hover:text-white transition-colors cursor-pointer" 
              onClick={() => alert("Dashboard Help: You can view total active rooms, online member list, send new invites, or join rooms from the active feed.")}
            >
              <i className="fa-regular fa-circle-question text-base"></i>
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-gray-800 cursor-pointer group" onClick={() => navigate('/profile')}>
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#6B46C1] flex items-center justify-center font-bold text-xs text-white shadow-md">
                  {user ? user.username.slice(0, 2).toUpperCase() : 'AJ'}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-accent-green border border-bg-main rounded-full"></span>
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold text-white leading-none mb-0.5">{user ? user.username : 'Alex Johnson'}</div>
                <div className="text-[9px] text-[#48BB78] font-medium leading-none">Online</div>
              </div>
              <i className="fa-solid fa-chevron-down text-[10px] text-text-muted group-hover:text-white transition-colors"></i>
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Panel */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar text-left">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Welcome Row */}
            <div className="flex items-end justify-between gap-4 animate-fade-in-up">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">Welcome back, {user ? user.username : 'Alex'}! <span className="text-2xl animate-waving-hand origin-bottom-right">👋</span></h1>
                <p className="text-text-muted text-sm">Here's what's happening in your workspace today.</p>
              </div>
              <button 
                onClick={onOpenCreateModal}
                className="px-4 py-2.5 bg-accent-purpleLight hover:bg-accent-purple text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-accent-purple/20 shrink-0 hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
              >
                <i className="fa-solid fa-plus text-xs"></i> Create Room
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up animation-delay-100">
              {stats.map((stat, i) => (
                <div key={i} className="bg-bg-card border border-gray-800 rounded-xl p-5 flex items-start gap-4 hover:border-accent-purple/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 hover:shadow-lg hover:shadow-accent-purple/5 cursor-pointer">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${stat.color} transition-transform duration-300 group-hover:scale-110`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                    <p className="text-xs text-accent-green font-medium flex items-center gap-1">
                      {stat.subtext}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 2 Column Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up animation-delay-200">
              
              {/* Recent Activity */}
              <div className="lg:col-span-2 bg-bg-card border border-gray-800 rounded-xl flex flex-col h-[500px]">
                <div className="p-5 border-b border-gray-800 flex items-center justify-between shrink-0">
                  <h2 className="font-semibold text-lg">Recent Activity</h2>
                  <button 
                    onClick={() => navigate('/profile')}
                    className="text-sm text-accent-purpleLight hover:text-accent-purple transition-colors cursor-pointer"
                  >
                    View all
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                  {recentActivity.map((act, i) => (
                    <div 
                      key={i} 
                      onClick={() => {
                        const targetRoom = rooms.find(r => r.name.toLowerCase() === act.room.toLowerCase());
                        if (targetRoom) {
                          navigate(`/rooms/${targetRoom.id}`);
                        } else {
                          navigate('/rooms');
                        }
                      }}
                      className="flex gap-4 p-3 hover:bg-bg-hover rounded-lg transition-colors group cursor-pointer hover:translate-x-1 transition-transform"
                    >
                      <div className="w-10 h-10 rounded-full bg-accent-purple flex items-center justify-center font-bold text-sm text-white shrink-0 group-hover:scale-105 transition-transform">
                        {act.user.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium truncate">
                            {act.user} <span className="text-text-muted font-normal mx-1">in</span> <span className="text-accent-purpleLight font-semibold">#{act.room}</span>
                          </p>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-text-muted group-hover:text-gray-300">{act.time}</span>
                            {act.unread && <div className="w-2 h-2 bg-accent-blue rounded-full"></div>}
                          </div>
                        </div>
                        <p className="text-sm text-text-muted truncate">{act.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-800 shrink-0">
                  <button 
                    onClick={() => alert("You are fully up-to-date! No more activities found.")}
                    className="w-full py-2.5 text-sm font-medium text-accent-purpleLight hover:text-white hover:bg-bg-hover rounded-lg transition-colors cursor-pointer"
                  >
                    Load more
                  </button>
                </div>
              </div>

              {/* Right panel: shortcuts and status */}
              <div className="flex flex-col gap-6 h-[500px]">
                
                {/* Your Rooms list */}
                <div className="bg-bg-card border border-gray-800 rounded-xl flex flex-col flex-1 min-h-0">
                  <div className="p-5 border-b border-gray-800 flex items-center justify-between shrink-0">
                    <h2 className="font-semibold text-lg">Your Rooms</h2>
                    <button onClick={() => navigate('/rooms')} className="text-sm text-accent-purpleLight hover:text-accent-purple transition-colors cursor-pointer">View all</button>
                  </div>
                  <div className="flex-grow overflow-y-auto p-3 space-y-1 scrollbar-thin">
                    {filteredRooms.slice(0, 5).map((room, idx) => {
                      const colorClass = roomColors[idx % roomColors.length];
                      return (
                        <div 
                          key={room.id}
                          onClick={() => navigate(`/rooms/${room.id}`)}
                          className="flex items-center gap-3 p-3 hover:bg-bg-hover rounded-lg transition-all group cursor-pointer hover:translate-x-1 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${colorClass} group-hover:rotate-6 transition-transform`}>
                            #
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="font-semibold text-sm truncate group-hover:text-white">{room.name}</p>
                            <p className="text-xs text-text-muted truncate">{room.description || 'Join conversations'}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-text-muted flex items-center gap-1">
                              <i className="fa-regular fa-user text-[10px]"></i> {Math.floor(room.name.length * 1.5 + 4)}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-green shadow-[0_0_8px_rgba(72,187,120,0.4)]"></span>
                          </div>
                        </div>
                      );
                    })}
                    {filteredRooms.length === 0 && (
                      <div className="text-center py-12 text-xs text-text-muted italic">No matching rooms</div>
                    )}
                  </div>
                </div>

                {/* Online stack */}
                <div className="bg-bg-card border border-gray-800 rounded-xl shrink-0 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-lg">Online Members</h2>
                    <button 
                      onClick={() => alert(`Online Members (${rooms.length * 3 + 5}): Sarah Wilson, David Brown, Emily Davis, Michael Chen, Lisa Anderson, and ${rooms.length * 3} others.`)}
                      className="text-sm text-accent-purpleLight hover:text-accent-purple transition-colors cursor-pointer"
                    >
                      View all
                    </button>
                  </div>
                  <div className="flex items-center -space-x-2">
                    {['Sarah Wilson', 'David Brown', 'Emily Davis', 'Michael Chen', 'Lisa Anderson'].map((name, i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-bg-card bg-[#252d41] flex items-center justify-center text-xl relative group cursor-pointer hover:scale-110 hover:z-30 transition-transform select-none" title={name}>
                        {getAvatarForUser(name)}
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-accent-green border-2 border-bg-card rounded-full"></span>
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-bg-card bg-bg-sidebar flex items-center justify-center text-xs font-medium text-text-muted relative z-10 ml-2">
                      +{rooms.length * 3}
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Tip Banner */}
            {showTip && (
              <div className="bg-bg-card border border-gray-800 rounded-lg p-3 flex items-center justify-between text-sm shrink-0">
                <div className="flex items-center gap-3">
                  <i className="fa-regular fa-lightbulb text-accent-purpleLight"></i>
                  <p>
                    <span className="font-semibold">Tip:</span> Use 
                    <span className="bg-bg-sidebar border border-gray-700 px-1.5 py-0.5 rounded text-xs mx-1 font-mono">⌘ K</span> 
                    to quickly search across rooms, messages, and members.
                  </p>
                </div>
                <button 
                  onClick={() => setShowTip(false)}
                  className="text-text-muted hover:text-white transition-colors p-1"
                >
                  ✕
                </button>
              </div>
            )}

          </div>
        </div>

      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-bg-card border border-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl relative animate-scale-in text-left">
            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-white text-sm cursor-pointer"
            >
              ✕
            </button>
            <div className="w-12 h-12 rounded-xl bg-accent-purple/20 flex items-center justify-center text-accent-purpleLight text-xl mb-4">
              <i className="fa-solid fa-gem animate-bounce text-yellow-400"></i>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Upgrade to SyncStream Pro</h3>
            <p className="text-sm text-text-muted mb-6 leading-relaxed">
              Unlock unlimited rooms, high-fidelity file sharing (up to 100MB), custom themes, and full message history search.
            </p>
            <div className="bg-bg-sidebar border border-gray-800 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm text-white font-medium">Pro Plan</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">$9</span>
                  <span className="text-xs text-text-muted">/month</span>
                </div>
              </div>
              <ul className="text-xs text-text-muted space-y-2">
                <li>✓ Unlimited Rooms & Channels</li>
                <li>✓ 100MB File Attachments</li>
                <li>✓ Priority WebSocket routing</li>
                <li>✓ Custom styling themes</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  alert('Thank you for trying SyncStream! This is a demo checkout flow.');
                  setShowUpgradeModal(false);
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-accent-purple to-accent-purpleLight hover:from-accent-purpleLight hover:to-accent-purple text-white font-semibold rounded-lg text-sm shadow-lg shadow-accent-purple/35 transition-all text-center cursor-pointer"
              >
                Proceed to Checkout
              </button>
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2.5 bg-bg-sidebar border border-gray-800 text-text-muted hover:text-white rounded-lg text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardPage;
