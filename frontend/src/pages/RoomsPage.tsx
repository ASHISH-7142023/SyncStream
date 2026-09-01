import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getAvatarForUser } from '../utils/avatarHelper';

interface Room {
  id: string;
  name: string;
  description?: string;
  isPrivate?: boolean;
  isDirectMessage?: boolean;
}

const RoomsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { rooms, fetchRooms, onOpenCreateModal } = useOutletContext<{ 
    rooms: Room[]; 
    fetchRooms: () => Promise<void>;
    onOpenCreateModal: () => void;
  }>();

  const [activeTab, setActiveTab] = useState<'All' | 'Joined' | 'Public' | 'Archived'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Recently Active');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const handleJoinAndNavigate = async (room: Room) => {
    try {
      const alreadyJoined = rooms.some((r) => r.id === room.id);
      if (!alreadyJoined) {
        await api.post(`/api/rooms/${room.id}/join`);
        await fetchRooms();
      }
      navigate(`/rooms/${room.id}`);
    } catch (err) {
      console.error('Failed to join room', err);
      navigate(`/rooms/${room.id}`);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    if (room.isDirectMessage) return false;
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (room.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'Joined') return matchesSearch; 
    if (activeTab === 'Public') return matchesSearch && !room.isPrivate;
    return matchesSearch;
  });

  const filteredDMs = rooms.filter(room => room.isDirectMessage);

  const roomColors = [
    'room-icon-purple',
    'room-icon-green',
    'room-icon-blue',
    'room-icon-orange',
    'room-icon-pink',
    'room-icon-teal'
  ];

  return (
    <div className="h-screen flex overflow-hidden text-sm selection:bg-brand selection:text-white bg-surface text-bright font-sans">
      
      {/* Sidebar Backdrop for Mobile */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden cursor-pointer"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#121316] border-r border-[#28292d] flex flex-col h-full shrink-0 text-left transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:flex md:z-0
        ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-4 shrink-0 border-b border-[#28292d]">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <img src="/chat.png" alt="Logo" className="w-8 h-8 object-contain" />
            <img src="/name.png" alt="SyncStream" className="h-7 w-32 object-contain" />
          </div>
          <button 
            onClick={() => setShowMobileSidebar(false)}
            className="md:hidden p-1 text-dim hover:text-bright hover:bg-white/10 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-hide">
          <div className="space-y-1">
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-dim hover:text-bright hover:bg-surface-200 transition-colors group text-left">
              <svg className="group-hover:text-brand transition-colors" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              <span className="font-medium">Home</span>
            </button>
            <button onClick={() => navigate('/rooms')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-brand bg-[rgba(99,102,241,0.15)] transition-colors text-left">
              <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"></path><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path></svg>
              <span className="font-medium ml-3">Rooms Feed</span>
            </button>
            <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-dim hover:text-bright hover:bg-surface-200 transition-colors group text-left">
              <svg className="group-hover:text-brand transition-colors" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span className="font-medium ml-3">My Profile</span>
            </button>
            <button onClick={() => navigate('/friends')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-dim hover:text-bright hover:bg-surface-200 transition-colors group text-left">
              <svg className="group-hover:text-brand transition-colors" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              <span className="font-medium ml-3">Friends</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <h3 className="text-xs font-semibold text-dim uppercase tracking-wider">Rooms List</h3>
              <button onClick={onOpenCreateModal} className="text-dim hover:text-bright hover:bg-surface-200 p-1 rounded-md transition-colors">
                <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
              </button>
            </div>
            <div className="space-y-0.5">
              {rooms.filter(r => !r.isDirectMessage).map((r) => (
                <button 
                  key={r.id} 
                  onClick={() => navigate(`/rooms/${r.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-dim hover:text-bright hover:bg-surface-200 transition-colors text-left"
                >
                  <span className="text-xl leading-none text-surface-400 font-light">#</span>
                  <span className="font-medium truncate">{r.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <h3 className="text-xs font-semibold text-dim uppercase tracking-wider">Direct Messages</h3>
            </div>
            <div className="space-y-0.5">
              {filteredDMs.map((r) => (
                <button 
                  key={r.id} 
                  onClick={() => navigate(`/rooms/${r.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-dim hover:text-bright hover:bg-surface-200 transition-colors text-left"
                >
                  <div className="w-5 h-5 rounded-full bg-brand/20 flex items-center justify-center text-[10px] text-brand shrink-0 font-bold">
                    {r.name.replace('DM-', '').slice(0,2).toUpperCase()}
                  </div>
                  <span className="font-medium truncate">Chat</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Upgrade Promo */}
        <div className="p-4 shrink-0">
          <div className="bg-[#18191c] border border-[#28292d] rounded-2xl p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="text-brand" fill="none" height="48" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="48" xmlns="http://www.w3.org/2000/svg"><path d="m13 2-2 2.5h3L12 22l2-2.5h-3L13 2z"></path></svg>
            </div>
            <div className="flex items-start gap-3 mb-3 relative z-10">
              <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 flex items-center justify-center text-brand shrink-0">
                <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="m13 2-2 2.5h3L12 22l2-2.5h-3L13 2z"></path></svg>
              </div>
              <div>
                <h4 className="font-semibold text-brand text-sm mb-1">Upgrade to Pro</h4>
                <p className="text-xs text-dim leading-relaxed">Unlock unlimited storage and features.</p>
              </div>
            </div>
            <button 
              onClick={() => alert("Redirecting to Pro Payment Gateway...")}
              className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-medium py-2 px-4 rounded-xl transition-colors shadow-sm relative z-10 text-sm cursor-pointer"
            >
              Upgrade Now
            </button>
          </div>
        </div>

        {/* Profile Footer */}
        <div className="p-4 shrink-0 border-t border-[#28292d] flex items-center justify-between cursor-pointer hover:bg-surface-100 transition-colors rounded-tr-2xl" onClick={() => navigate('/profile')}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#6366f1]/20 flex items-center justify-center text-xl text-white select-none">
                {getAvatarForUser(user ? user.username : 'Alex Johnson')}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-surface-50 rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-bright text-sm">{user ? user.username : 'Alex Johnson'}</span>
              <span className="text-xs text-dim flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Online
              </span>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              logout();
            }}
            className="text-dim hover:text-red-400 p-1"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col h-full overflow-hidden bg-surface relative text-left">
        
        {/* Top Header */}
        <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-[#28292d] bg-surface/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <button 
              onClick={() => setShowMobileSidebar(true)}
              className="md:hidden p-2 text-dim hover:text-bright hover:bg-white/5 rounded-lg transition-colors shrink-0 cursor-pointer"
              title="Open Sidebar"
            >
              <i className="fa-solid fa-bars text-lg"></i>
            </button>
            <div className="relative group w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="text-dim group-focus-within:text-brand transition-colors" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
              </div>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#18191c] border border-[#28292d] text-bright rounded-xl pl-10 pr-12 py-2 focus:ring-1 focus:ring-brand focus:border-brand focus:bg-surface transition-all placeholder:text-surface-400 text-sm h-10" 
                placeholder="Search rooms, messages, or users..." 
                type="text"
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-200 border border-[#28292d] text-xs font-medium text-dim font-sans shadow-sm">
                  <svg fill="none" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="12" xmlns="http://www.w3.org/2000/svg"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path></svg> K
                </kbd>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 ml-4 shrink-0">
            <button 
              onClick={() => alert("You have no new notifications.")}
              aria-label="Notifications" 
              className="relative p-2 rounded-xl text-dim hover:text-bright hover:bg-surface-100 transition-colors cursor-pointer"
            >
              <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-surface"></span>
            </button>
            <button 
              onClick={() => alert("SyncStream Help Center: Search for rooms or use the 'Create Room' button to create custom spaces.")}
              aria-label="Help" 
              className="p-2 rounded-xl text-dim hover:text-bright hover:bg-surface-100 transition-colors cursor-pointer"
            >
              <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>
            </button>
            <button onClick={onOpenCreateModal} className="bg-[#6366f1] hover:bg-[#4f46e5] text-white font-medium py-2 px-4 rounded-xl flex items-center gap-2 transition-colors shadow-sm text-sm h-10">
              <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
              Create Room
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mb-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-bright mb-2 tracking-tight">Rooms</h1>
            <p className="text-dim text-base">Organize conversations in dedicated rooms and collaborate in real-time.</p>
          </div>

          <div className="flex flex-col xl:flex-row gap-8 max-w-5xl mx-auto w-full">
            
            {/* Rooms list panel */}
            <div className="flex-1 flex flex-col min-w-0">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#28292d] pb-4 shrink-0">
                <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide -mb-[17px]">
                  {(['All', 'Joined', 'Public', 'Archived'] as const).map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                        activeTab === tab 
                          ? 'text-[#6366f1] border-[#6366f1]' 
                          : 'text-[#a0a0a5] hover:text-white border-transparent hover:border-[#232428]'
                      }`}
                    >
                      {tab} Rooms
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <input 
                    type="text"
                    placeholder="Search rooms..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 bg-[#18191c] border border-[#28292d] text-bright rounded-lg pl-8 pr-3 py-1.5 focus:ring-1 focus:ring-brand focus:border-brand transition-all placeholder:text-[#a0a0a5]/50 text-sm outline-none"
                  />
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-[#18191c] border border-[#28292d] text-bright rounded-lg pl-3 pr-8 py-1.5 focus:ring-1 focus:ring-brand focus:border-brand transition-all text-sm cursor-pointer outline-none"
                  >
                    <option>Sort: Recently Active</option>
                    <option>Sort: Name (A-Z)</option>
                    <option>Sort: Most Members</option>
                  </select>
                </div>
              </div>

              {/* Grid of rooms cards */}
              <div className="space-y-3">
                {filteredRooms.map((room, idx) => {
                  const colorClass = roomColors[idx % roomColors.length];
                  const isDevelopers = room.name.toLowerCase() === 'developers';
                  return (
                    <div 
                      key={room.id}
                      onClick={() => handleJoinAndNavigate(room)}
                      className={`group border rounded-2xl p-4 flex items-center gap-4 hover:bg-[#18191c] transition-all cursor-pointer shadow-sm relative overflow-hidden ${
                        isDevelopers 
                          ? 'bg-[#18191c] border-[#6366f1]/50 ring-1 ring-[#6366f1]/20' 
                          : 'bg-[#121316] border-[#28292d] hover:border-[#3f4045]'
                      }`}
                    >
                      {isDevelopers && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6366f1] rounded-l-2xl"></div>
                      )}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner text-2xl font-light ${colorClass}`}>
                        #
                      </div>
                      <div className="flex-grow min-w-0 text-left">
                        <h3 className="text-base font-semibold text-bright truncate mb-0.5 group-hover:text-brand transition-colors">{room.name}</h3>
                        <p className="text-sm text-dim truncate">{room.description || 'No description provided.'}</p>
                      </div>
                      <div className="flex items-center gap-6 shrink-0 text-sm">
                        <div className="text-center min-w-[3rem]">
                          <div className="flex items-center justify-center gap-1.5 text-bright font-medium">
                            👥 {Math.floor(room.name.length * 1.5 + 4)}
                          </div>
                          <div className="text-xs text-dim">Members</div>
                        </div>
                        <div className="text-center min-w-[3rem]">
                          <div className="flex items-center justify-center gap-1.5 text-bright font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-success"></span> {Math.max(1, Math.floor(room.name.length / 2))}
                          </div>
                          <div className="text-xs text-dim">Online</div>
                        </div>
                        <div className="text-right min-w-[4rem] hidden sm:block">
                          <div className="text-bright">{room.name.length % 2 === 0 ? `${room.name.length}m ago` : `${Math.floor(room.name.length / 3) + 1}h ago`}</div>
                          <div className="text-xs text-dim">Last active</div>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Room settings for #${room.name}: Join, invite, or view archives.`);
                        }}
                        className="p-2 rounded-lg text-dim hover:text-bright hover:bg-surface-200 transition-colors ml-2 shrink-0 z-10 cursor-pointer"
                        title="Options"
                      >
                        <i className="fa-solid fa-ellipsis-vertical text-sm"></i>
                      </button>
                    </div>
                  );
                })}

                {filteredRooms.length === 0 && (
                  <div className="text-center py-16 bg-[#121316] border border-[#28292d] rounded-2xl p-6">
                    <span className="text-3xl">🔍</span>
                    <h3 className="text-base font-semibold text-bright mt-2">No rooms found</h3>
                    <p className="text-sm text-dim mt-1">Try adjusting your filters or search query.</p>
                  </div>
                )}
              </div>

              {/* Pagination footer */}
              {filteredRooms.length > 0 && (
                <div className="flex items-center justify-between border-t border-[#28292d] pt-4 mt-6 text-sm shrink-0">
                  <span className="text-dim">Showing 1 to {filteredRooms.length} of {filteredRooms.length} rooms</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => alert("You are on the first page.")}
                      className="p-1.5 rounded-lg border border-[#28292d] text-dim hover:text-bright hover:bg-surface-200 transition-colors cursor-pointer"
                    >
                      <i className="fa-solid fa-chevron-left text-xs"></i>
                    </button>
                    <button 
                      onClick={() => alert("You are on page 1.")}
                      className="px-3 py-1 rounded-lg bg-[#6366f1] text-white font-semibold text-xs cursor-pointer"
                    >
                      1
                    </button>
                    <button 
                      onClick={() => alert("You are on the first page.")}
                      className="p-1.5 rounded-lg border border-[#28292d] text-dim hover:text-bright hover:bg-surface-200 transition-colors cursor-pointer"
                    >
                      <i className="fa-solid fa-chevron-right text-xs"></i>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Right sidebar info */}
            <div className="w-full xl:w-80 flex flex-col gap-6 shrink-0 text-left">
              <div className="bg-[#121316] border border-[#28292d] rounded-2xl p-5">
                <h2 className="font-semibold text-base mb-4 text-bright">Room Categories</h2>
                <div className="space-y-1">
                  {[
                    { label: 'All Rooms', count: rooms.length, active: activeTab === 'All', action: () => setActiveTab('All') },
                    { label: 'Joined Rooms', count: rooms.length, active: activeTab === 'Joined', action: () => setActiveTab('Joined') },
                    { label: 'Public Rooms', count: rooms.filter(r => !r.isPrivate).length, active: activeTab === 'Public', action: () => setActiveTab('Public') },
                    { label: 'Archived Rooms', count: 0, active: activeTab === 'Archived', action: () => setActiveTab('Archived') },
                  ].map((cat, i) => (
                    <button 
                      key={i}
                      onClick={cat.action}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        cat.active 
                          ? 'bg-[#6366f1]/15 text-[#c7d2fe] font-semibold' 
                          : 'text-dim hover:text-bright hover:bg-surface-100'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${cat.active ? 'bg-[#6366f1] text-white' : 'bg-surface-200'}`}>
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Create a New Room sidebar shortcut */}
              <div className="bg-[#121316] border border-[#28292d] rounded-2xl p-5">
                <h2 className="font-semibold text-base mb-1 text-bright">Create a New Room</h2>
                <p className="text-xs text-dim mb-4 leading-relaxed">Bring your team together in a dedicated space.</p>
                <button 
                  onClick={onOpenCreateModal}
                  className="w-full py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20"
                >
                  <svg fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                  Create Room
                </button>
              </div>

              <div className="bg-[#121316] border border-[#28292d] rounded-2xl p-5">
                <h2 className="font-semibold text-base mb-4 text-bright">Tips</h2>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="text-xl">💬</span>
                    <div>
                      <h4 className="font-semibold text-sm text-bright">Use threads</h4>
                      <p className="text-xs text-dim leading-relaxed">Keep conversations focused by replying in threads instead of the main feed.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-xl">👥</span>
                    <div>
                      <h4 className="font-semibold text-sm text-bright">Invite members</h4>
                      <p className="text-xs text-dim leading-relaxed">Share invitations with your team members to bring them into the room.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>

    </div>
  );
};

export default RoomsPage;
