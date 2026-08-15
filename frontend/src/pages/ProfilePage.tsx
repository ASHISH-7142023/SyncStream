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
      
      {/* Left Sidebar */}
      <aside className="w-64 bg-obsidian-900 border-r border-obsidian-700 flex flex-col h-full flex-shrink-0 text-left">
        <div className="h-16 flex items-center px-6 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center relative">
              <i className="fa-solid fa-comment-dots text-white text-lg"></i>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-400 rounded-full border-2 border-obsidian-900"></div>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SyncStream</span>
          </div>
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
          <div className="flex-1 max-w-xl">
            <div className="relative group">
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
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-400 mb-3">
                        <span className="text-sm">@{user ? user.username.toLowerCase() : 'alexjohnson'}</span>
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

                  {/* Stats Summary */}
                  <div className="flex sm:flex-col md:flex-row items-center gap-6 md:gap-8 pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-obsidian-600/50 md:pl-8 w-full md:w-auto justify-around md:justify-start">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white mb-1">34</p>
                      <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Rooms</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white mb-1">128</p>
                      <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Messages</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white mb-1">56</p>
                      <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Threads</p>
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

              {/* Grid sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* About me */}
                <div className="space-y-6">
                  <section className="glass-panel rounded-2xl p-6">
                    <h3 className="text-base font-semibold text-white mb-4">About Me</h3>
                    {isEditingBio ? (
                      <div className="space-y-3">
                        <textarea 
                          value={tempBio}
                          onChange={(e) => setTempBio(e.target.value)}
                          className="w-full bg-obsidian-900 border border-obsidian-750 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 resize-none"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button onClick={handleSaveBio} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded">Save</button>
                          <button onClick={() => setIsEditingBio(false)} className="px-3 py-1.5 bg-transparent border border-obsidian-600 text-slate-300 text-xs font-semibold rounded">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-slate-400 leading-relaxed mb-5">{bio}</p>
                        <button onClick={() => setIsEditingBio(true)} className="px-4 py-2 bg-obsidian-700 hover:bg-obsidian-600 text-slate-300 text-xs font-medium rounded-lg border border-obsidian-600 transition-colors">
                          Edit About
                        </button>
                      </>
                    )}
                  </section>

                  {/* Badges */}
                  <section className="glass-panel rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-base font-semibold text-white">Badges</h3>
                      <button className="text-xs font-medium text-purple-400 hover:text-purple-300">View all</button>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {badges.map((badge, i) => (
                        <div key={i} className="flex flex-col items-center text-center group cursor-pointer">
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
                      <button className="text-xs font-medium text-purple-400 hover:text-purple-300">View all</button>
                    </div>
                    <div className="space-y-3">
                      {topRooms.map((room, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-obsidian-800/50 border border-transparent hover:border-obsidian-600 transition-colors group cursor-pointer">
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
                  <button className="text-xs font-medium text-purple-400 hover:text-purple-300">View all</button>
                </div>
                <div className="space-y-6">
                  {recentActivity.map((act, i) => (
                    <div key={i} className="flex gap-4">
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
                    <p className="text-xs text-slate-300">@{user ? user.username.toLowerCase() : 'alexjohnson'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Password</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-350 tracking-widest">••••••••••</p>
                      <button className="text-xs font-medium text-purple-400 hover:text-purple-300">Change</button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="glass-panel rounded-2xl p-6">
                <h3 className="text-base font-semibold text-white mb-5">Connections</h3>
                <div className="flex items-center -space-x-1.5">
                  {['SW', 'DB', 'ED', 'MC'].map((initial, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-obsidian-800 bg-[#262631] flex items-center justify-center font-bold text-[9px] text-white">
                      {initial}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-obsidian-800 bg-obsidian-700 flex items-center justify-center text-[8px] text-slate-300 font-semibold">
                    +12
                  </div>
                </div>
              </section>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default ProfilePage;
