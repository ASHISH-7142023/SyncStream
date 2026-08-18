import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Room {
  id: string;
  name: string;
  description?: string;
}

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { rooms, onOpenCreateModal } = useOutletContext<{ 
    rooms: Room[]; 
    onOpenCreateModal: () => void;
  }>();

  const [activeTab, setActiveTab] = useState<'Overview' | 'Activity' | 'Rooms' | 'Preferences' | 'Security'>('Overview');
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [bio, setBio] = useState('Passionate about building scalable, real-time applications. I love clean code, great UX, and collaborating with amazing teams.');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(bio);

  const handleSaveBio = () => {
    setBio(tempBio);
    setIsEditingBio(false);
  };


  const badges = [
    { title: 'Early Adopter', desc: 'Joined early', icon: '🚀' },
    { title: 'Helpful User', desc: '25+ reactions', icon: '⚡' },
    { title: 'Community Member', desc: 'Active in 10+ rooms', icon: '👥' },
    { title: 'Supporter', desc: 'Helps others', icon: '🛡️' },
  ];

  const topRooms = [
    { name: 'developers', count: '453 messages', color: 'bg-green-500/10 text-green-500' },
    { name: 'product-updates', count: '312 messages', color: 'bg-orange-500/10 text-orange-500' },
    { name: 'design-team', count: '278 messages', color: 'bg-pink-500/10 text-pink-500' },
    { name: 'general', count: '215 messages', color: 'bg-indigo-500/10 text-indigo-500' },
    { name: 'help-support', count: '87 messages', color: 'bg-blue-500/10 text-blue-500' },
  ];

  const recentActivity = [
    { text: 'Sent a message in #developers', time: '2m ago', desc: "Reacted to Sarah Wilson's message", type: 'chat' },
    { text: 'Joined #marketing', time: '1h ago', desc: 'Started participating in the conversation', type: 'join' },
    { text: 'Invited David Brown to #product-updates', time: '2h ago', desc: '', type: 'invite' },
  ];

  return (
    <div className="h-screen flex overflow-hidden font-sans bg-obsidian-900 text-white selection:bg-purple-600 selection:text-white">
      
      {/* Sidebar Backdrop for Mobile */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden cursor-pointer"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-obsidian-900 border-r border-obsidian-700 flex flex-col h-full shrink-0 text-left transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:flex md:z-0
        ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-obsidian-700">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center relative">
              <i className="fa-solid fa-comment-dots text-white text-lg"></i>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-400 rounded-full border-2 border-obsidian-900"></div>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SyncStream</span>
          </div>
          <button 
            onClick={() => setShowMobileSidebar(false)}
            className="md:hidden p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-8 scrollbar-hide">
          <div className="space-y-1">
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-obsidian-700 rounded-md group transition-colors text-left">
              <i className="fa-solid fa-house w-5 text-center group-hover:text-purple-400"></i>
              <span className="font-medium text-sm">Home</span>
            </button>
            <button onClick={() => navigate('/rooms')} className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-obsidian-700 rounded-md group transition-colors text-left">
              <i className="fa-solid fa-comments w-5 text-center group-hover:text-purple-400"></i>
              <span className="font-medium text-sm">Rooms Feed</span>
            </button>
            <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-3 py-2 bg-obsidian-700 text-white rounded-md border-l-2 border-purple-500 text-left">
              <i className="fa-solid fa-user w-5 text-center text-purple-400"></i>
              <span className="font-medium text-sm ml-3">My Profile</span>
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rooms List</span>
              <button onClick={onOpenCreateModal} className="text-slate-400 hover:text-white"><i className="fa-solid fa-plus"></i></button>
            </div>
            <div className="space-y-1">
              {rooms.map((r) => (
                <button 
                  key={r.id} 
                  onClick={() => navigate(`/rooms/${r.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-obsidian-700 rounded-md group transition-colors text-left"
                >
                  <span className="text-slate-500 text-lg">#</span>
                  <span className="font-medium text-sm truncate">{r.name}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Upgrade Banner */}
        <div className="mx-3 mt-4 p-4 rounded-xl glass-panel relative overflow-hidden group border border-purple-500/20 hover:border-purple-500/40 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded bg-purple-600/20 text-purple-400 flex items-center justify-center">
                <i className="fa-solid fa-bolt"></i>
              </div>
              <h4 className="font-semibold text-sm text-purple-300">Upgrade to Pro</h4>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">Unlock unlimited rooms and advanced analytics.</p>
            <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)]">
              Upgrade Now
            </button>
          </div>
        </div>

        {/* Profile Footer */}
        <div className="p-4 border-t border-obsidian-700 mt-auto flex items-center justify-between cursor-pointer hover:bg-obsidian-700 transition-colors" onClick={() => navigate('/profile')}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-sm text-white border border-obsidian-600">
                {user ? user.username.slice(0, 2).toUpperCase() : 'AJ'}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-obsidian-900 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user ? user.username : 'Alex Johnson'}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <p className="text-xs text-slate-400">Online</p>
              </div>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              logout();
            }}
            className="text-slate-500 hover:text-red-400 p-1"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full bg-obsidian-800 overflow-hidden relative text-left">
        
        {/* Top Header Bar */}
        <header className="h-16 border-b border-obsidian-700 bg-obsidian-900/50 backdrop-blur-md flex items-center justify-between px-6 flex-shrink-0 z-20">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button 
              onClick={() => setShowMobileSidebar(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors shrink-0 cursor-pointer"
              title="Open Sidebar"
            >
              <i className="fa-solid fa-bars text-lg"></i>
            </button>
            <div className="relative group w-full">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors"></i>
              <input className="w-full bg-obsidian-700 border border-obsidian-600 rounded-lg pl-10 pr-12 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" placeholder="Search rooms, messages, or users..." type="text"/>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                <kbd className="px-2 py-0.5 bg-obsidian-600 border border-obsidian-500 rounded text-[10px] text-slate-400 font-mono hidden sm:inline-block">⌘ K</kbd>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-5 ml-4">
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <i className="fa-regular fa-bell text-lg"></i>
              <span className="absolute -top-1.5 -right-1.5 bg-purple-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-obsidian-900">3</span>
            </button>
            <button className="text-slate-400 hover:text-white transition-colors">
              <i className="fa-regular fa-circle-question text-lg"></i>
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-hide">
          
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex text-sm text-slate-400 mb-6">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <span className="hover:text-white transition-colors cursor-pointer" onClick={() => navigate('/dashboard')}>Profile</span>
              </li>
              <li>
                <div className="flex items-center">
                  <i className="fa-solid fa-chevron-right text-[10px] mx-2"></i>
                  <span className="text-purple-400 font-medium">Overview</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 w-full">
            
            {/* Center/Left Content (Span 3 on XL) */}
            <div className="xl:col-span-3 space-y-6">
              
              {/* Profile Header Hero */}
              <section className="rounded-2xl profile-bg border border-obsidian-600 p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  
                  {/* User Info */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-br from-purple-500 to-obsidian-800">
                        <div className="w-full h-full rounded-full bg-purple-600 flex items-center justify-center font-extrabold text-white text-3xl sm:text-4xl border-4 border-obsidian-800 uppercase select-none">
                          {user ? user.username.slice(0, 2) : 'AJ'}
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 border-4 border-obsidian-800 rounded-full"></div>
                    </div>
                    {/* Details */}
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{user ? user.username : 'Alex Johnson'}</h1>
                        <button 
                          onClick={() => setIsEditingBio(!isEditingBio)}
                          className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-medium rounded-lg border border-purple-500/30 transition-colors mx-auto sm:mx-0"
                        >
                          <i className="fa-solid fa-pen text-[10px]"></i> Edit Profile
                        </button>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-[#94a3b8] mb-3">
                        <span className="text-sm">@{user ? user.username.toLowerCase() : 'alexjohnson'}</span>
                        <button 
                          className="text-slate-500 hover:text-white transition-colors cursor-pointer p-0.5" 
                          title="Copy Username" 
                          onClick={() => navigator.clipboard.writeText(user ? `@${user.username.toLowerCase()}` : '@alexjohnson')}
                        >
                          <i className="fa-regular fa-copy text-xs"></i>
                        </button>
                      </div>
                      <p className="text-slate-300 font-medium mb-1">Full Stack Developer at SyncStream</p>
                      <p className="text-slate-400 text-sm mb-4">Building real-time experiences 🚀</p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <i className="fa-regular fa-calendar"></i>
                          <span>Joined May 12, 2024</span>
                        </div>
                        <span className="hidden sm:inline">•</span>
                        <div className="flex items-center gap-1.5">
                          <i className="fa-regular fa-clock"></i>
                          <span>10:24 AM (UTC+0)</span>
                        </div>
                        <span className="hidden sm:inline">•</span>
                        <div className="flex items-center gap-1.5">
                          <i className="fa-solid fa-location-dot"></i>
                          <span>San Francisco, USA</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Summary Grid */}
                  <div className="grid grid-cols-3 gap-x-6 gap-y-4 pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-obsidian-600/50 md:pl-8 w-full md:w-auto shrink-0 select-none">
                    <div className="text-center">
                      <p className="text-xl font-bold text-white mb-0.5">34</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Rooms</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-white mb-0.5">128</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Messages</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-white mb-0.5">56</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Threads</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-white mb-0.5">24</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Mentions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-white mb-0.5">18</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Reactions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-white mb-0.5">7</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Bookmarks</p>
                    </div>
                  </div>
                </div>

                {/* Profile Navigation Tabs */}
                <div className="mt-8 border-b border-obsidian-600 flex overflow-x-auto scrollbar-hide">
                  {(['Overview', 'Activity', 'Rooms', 'Preferences', 'Security'] as const).map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                        activeTab === tab 
                          ? 'text-purple-400 border-purple-500' 
                          : 'text-slate-400 border-transparent hover:text-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </section>

              {/* Tab Content Switching */}
              {activeTab === 'Overview' && (
                <div className="animate-fade-in-up space-y-6">
                  {/* Grid sections */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    
                    {/* About me */}
                    <div className="space-y-6">
                      <section className="glass-panel rounded-2xl p-6">
                        <h3 className="text-base font-semibold text-white mb-4">About Me</h3>
                        {isEditingBio ? (
                          <div className="space-y-3">
                            <textarea 
                              value={tempBio}
                              onChange={(e) => setTempBio(e.target.value)}
                              className="w-full bg-obsidian-900 border border-obsidian-750 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 resize-none outline-none"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <button onClick={handleSaveBio} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded cursor-pointer transition-colors">Save</button>
                              <button onClick={() => setIsEditingBio(false)} className="px-3 py-1.5 bg-transparent border border-obsidian-600 text-slate-300 text-xs font-semibold rounded cursor-pointer">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-slate-400 leading-relaxed mb-5">{bio}</p>
                            <button onClick={() => setIsEditingBio(true)} className="px-4 py-2 bg-obsidian-700 hover:bg-obsidian-600 text-slate-300 text-xs font-medium rounded-lg border border-obsidian-600 transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer">
                              Edit About
                            </button>
                          </>
                        )}
                      </section>

                      {/* Badges */}
                      <section className="glass-panel rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="text-base font-semibold text-white">Badges</h3>
                          <button onClick={() => setShowAllBadges(true)} className="text-xs font-medium text-purple-400 hover:text-purple-300 cursor-pointer">View all</button>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          {badges.map((badge, i) => (
                            <div key={i} className="flex flex-col items-center text-center group cursor-pointer hover:scale-[1.05] transition-all" onClick={() => setShowAllBadges(true)}>
                              <div className="w-12 h-12 mb-2 bg-obsidian-700 rounded-xl flex items-center justify-center text-lg shadow-lg hover:scale-110 transition-transform">
                                {badge.icon}
                              </div>
                              <span className="text-[11px] font-semibold text-slate-200 block leading-tight">{badge.title}</span>
                              <span className="text-[9px] text-slate-500 mt-0.5">{badge.desc}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    {/* Right grid column */}
                    <div className="space-y-6">
                      {/* Top Rooms */}
                      <section className="glass-panel rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="text-base font-semibold text-white">Top Rooms</h3>
                          <button onClick={() => setActiveTab('Rooms')} className="text-xs font-medium text-purple-400 hover:text-purple-300 cursor-pointer">View all</button>
                        </div>
                        <div className="space-y-3">
                          {topRooms.map((room, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-obsidian-800/50 border border-transparent hover:border-obsidian-600 transition-all hover:scale-[1.02] active:scale-[0.98] group cursor-pointer" onClick={() => setActiveTab('Rooms')}>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-purple-500/10 text-purple-400 flex items-center justify-center text-sm font-bold">#</div>
                                <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{room.name}</span>
                              </div>
                              <span className="text-xs text-slate-500">{room.count}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                  </div>

                  {/* Recent Activity */}
                  <section className="glass-panel rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base font-semibold text-white">Recent Activity</h3>
                      <button onClick={() => setActiveTab('Activity')} className="text-xs font-medium text-purple-400 hover:text-purple-300 cursor-pointer">View all</button>
                    </div>
                    <div className="space-y-6">
                      {recentActivity.map((act, i) => (
                        <div key={i} className="flex gap-4 hover:translate-x-1 transition-transform cursor-pointer">
                          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-1 text-purple-400 text-lg">
                            {act.type === 'chat' ? '💬' : act.type === 'join' ? '🚪' : '➕'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <p className="text-sm text-slate-300">
                                {act.text}
                              </p>
                              <span className="text-xs text-slate-500 whitespace-nowrap">{act.time}</span>
                            </div>
                            {act.desc && <p className="text-sm text-slate-500 mt-1">{act.desc}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'Activity' && (
                <div className="animate-fade-in-up">
                  <section className="glass-panel rounded-2xl p-6 text-left">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base font-semibold text-white">Recent Activity Logs</h3>
                    </div>
                    <div className="space-y-6 max-h-[450px] overflow-y-auto scrollbar-thin pr-2">
                      {[
                        { text: 'Sent a message in #developers', time: '2m ago', desc: "Reacted to Sarah Wilson's message with 👍", type: 'chat' },
                        { text: 'Joined #marketing', time: '1h ago', desc: 'Started participating in the conversation', type: 'join' },
                        { text: 'Invited David Brown to #product-updates', time: '2h ago', desc: 'Sent an invitation link', type: 'invite' },
                        { text: 'Created #help-support room', time: '1d ago', desc: 'Set up room configurations for general user inquiries', type: 'create' },
                        { text: 'Updated profile picture', time: '2d ago', desc: 'Uploaded new avatar image', type: 'profile' },
                        { text: 'Enabled Two-Factor Authentication', time: '3d ago', desc: 'Configured Authenticator App', type: 'security' },
                      ].map((act, i) => (
                        <div key={i} className="flex gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-1 text-purple-400 text-lg">
                            {act.type === 'chat' ? '💬' : act.type === 'join' ? '🚪' : act.type === 'invite' ? '➕' : act.type === 'create' ? '📁' : act.type === 'security' ? '🔑' : '👤'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <p className="text-sm font-semibold text-slate-200">
                                {act.text}
                              </p>
                              <span className="text-xs text-slate-500 whitespace-nowrap">{act.time}</span>
                            </div>
                            {act.desc && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{act.desc}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'Rooms' && (
                <div className="animate-fade-in-up">
                  <section className="glass-panel rounded-2xl p-6 text-left">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base font-semibold text-white">Active Rooms ({rooms.length})</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rooms.map((room) => (
                        <div 
                          key={room.id}
                          onClick={() => navigate(`/rooms/${room.id}`)}
                          className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between group hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-3 truncate">
                            <div className="w-10 h-10 bg-purple-600/15 text-[#a78bfa] rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                              #
                            </div>
                            <div className="truncate">
                              <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">#{room.name}</span>
                              <p className="text-xs text-slate-500 truncate leading-relaxed mt-0.5">{room.description || 'No description provided.'}</p>
                            </div>
                          </div>
                          <div className="text-[#a78bfa] text-xs shrink-0 pl-2">
                            Enter →
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'Preferences' && (
                <div className="animate-fade-in-up">
                  <section className="glass-panel rounded-2xl p-6 text-left">
                    <h3 className="text-base font-semibold text-white mb-6">User Preferences</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-1">Appearance Theme</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">Customize your app interface layout styling.</p>
                        </div>
                        <select className="bg-obsidian-900 border border-[#2e3346] text-white text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-purple-500 outline-none">
                          <option>Dark Obsidian (Default)</option>
                          <option>Frosted Glass Light</option>
                          <option>Midnight Blue</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-1">Desktop Notifications</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">Receive status alerts on new room notifications.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-9 h-5 bg-obsidian-750 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-1">Sound Effects</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">Play audible alerts on incoming messages.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-9 h-5 bg-obsidian-750 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-1">Language & Localization</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">Set your preferred display and messaging language.</p>
                        </div>
                        <select className="bg-obsidian-900 border border-[#2e3346] text-white text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-purple-500 outline-none">
                          <option>English (US)</option>
                          <option>Deutsch</option>
                          <option>Español</option>
                          <option>Français</option>
                        </select>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'Security' && (
                <div className="animate-fade-in-up">
                  <section className="glass-panel rounded-2xl p-6 text-left">
                    <h3 className="text-base font-semibold text-white mb-6">Security Settings</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-4">Change Password</h4>
                        <div className="space-y-4 max-w-md">
                          <div>
                            <label className="text-xs text-slate-400 block mb-1">Current Password</label>
                            <input type="password" placeholder="••••••••" className="w-full bg-obsidian-900 border border-white/5 text-xs text-white rounded-lg px-3 py-2 focus:border-purple-500 outline-none" />
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 block mb-1">New Password</label>
                            <input type="password" placeholder="••••••••" className="w-full bg-obsidian-900 border border-white/5 text-xs text-white rounded-lg px-3 py-2 focus:border-purple-500 outline-none" />
                          </div>
                          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer">
                            Update Password
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-6 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-1">Two-Factor Authentication (2FA)</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">Secures account using mobile verification apps.</p>
                        </div>
                        <button className="px-4 py-2 bg-red-600/20 hover:bg-red-600/35 border border-red-500/30 text-red-200 text-xs font-semibold rounded-lg transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer">
                          Disable 2FA
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              )}

            </div>

            {/* Right Sidebar (Completion stats, account settings, connections) */}
            <div className="space-y-6 shrink-0">
              
              <section className="glass-panel rounded-2xl p-6">
                <h3 className="text-base font-semibold text-white mb-6">Profile Completion</h3>
                <div className="flex items-center gap-5 mb-6">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle className="text-obsidian-700 stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
                      <circle className="text-purple-500 stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="50.24" strokeLinecap="round"></circle>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">80%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200 mb-1">Almost there!</p>
                    <p className="text-xs text-slate-400 leading-relaxed">Complete profile for more features.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Add profile picture', done: true },
                    { label: 'Set your display name', done: true },
                    { label: 'Add about you', done: true },
                    { label: 'Verify your email', done: true },
                    { label: 'Join a room', done: false },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs text-slate-300">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white shrink-0 ${item.done ? 'bg-purple-600' : 'border border-slate-650'}`}>
                        {item.done && '✓'}
                      </div>
                      <span className={item.done ? 'line-through text-slate-500' : ''}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="glass-panel rounded-2xl p-6">
                <h3 className="text-base font-semibold text-white mb-5">Account</h3>
                <div className="space-y-5">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Email</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-300 truncate pr-2">{user ? `${user.username.toLowerCase()}@example.com` : 'alex.johnson@example.com'}</p>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold rounded uppercase tracking-wide">Verified</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Username</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-300">@{user ? user.username.toLowerCase() : 'alexjohnson'}</p>
                      <button 
                        className="text-slate-500 hover:text-white transition-colors cursor-pointer" 
                        title="Copy Username" 
                        onClick={() => navigator.clipboard.writeText(user ? `@${user.username.toLowerCase()}` : '@alexjohnson')}
                      >
                        <i className="fa-regular fa-copy text-xs"></i>
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Password</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-355 tracking-widest">••••••••••</p>
                      <button className="text-xs font-semibold text-purple-400 hover:text-purple-300">Change</button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Two-Factor Authentication</p>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold rounded uppercase tracking-wide">Enabled</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="glass-panel rounded-2xl p-6">
                <h3 className="text-base font-semibold text-white mb-5">Connections</h3>
                <div className="flex items-center -space-x-1.5 animate-pulse">
                  {['SW', 'DB', 'ED', 'MC'].map((initial, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-obsidian-800 bg-[#262631] flex items-center justify-center font-bold text-[9px] text-white">
                      {initial}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-obsidian-800 bg-obsidian-700 flex items-center justify-center text-[8px] text-slate-300 font-semibold font-sans">
                    +12
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-4 leading-none">You have 18 connections</p>
              </section>

            </div>

          </div>

        </div>

      </main>

      {showAllBadges && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer"
          onClick={() => setShowAllBadges(false)}
        >
          <div 
            className="bg-[#151723] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative text-left cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowAllBadges(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-white/15 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer text-base"
              title="Close modal"
            >
              ✕
            </button>
            <h3 className="text-base font-bold text-white mb-4">All Badges</h3>
            <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
              {[
                { title: 'Early Adopter', desc: 'Joined early', icon: '🚀' },
                { title: 'Helpful User', desc: '25+ reactions', icon: '⚡' },
                { title: 'Community Member', desc: 'Active in 10+ rooms', icon: '👥' },
                { title: 'Supporter', desc: 'Helps others', icon: '🛡️' },
                { title: 'Conversation Starter', desc: 'Created a thread', icon: '💬' },
                { title: 'Super Sender', desc: '100+ messages sent', icon: '🔥' },
                { title: 'Night Owl', desc: 'Active past midnight', icon: '🦉' },
                { title: 'Bug Hunter', desc: 'Reported an issue', icon: '🐛' },
              ].map((badge, i) => (
                <div key={i} className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col items-center text-center">
                  <div className="text-2xl mb-2">{badge.icon}</div>
                  <span className="text-xs font-semibold text-white block">{badge.title}</span>
                  <span className="text-[10px] text-slate-400 mt-1 leading-tight">{badge.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
