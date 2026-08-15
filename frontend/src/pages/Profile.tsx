import React, { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { LogOut, ArrowLeft, Shield, Activity, Terminal, Home, Bell, Settings } from 'lucide-react';
import gsap from 'gsap';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { connectionStatus, presenceUsers } = useSocket();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Find local user presence server info if cached
  const localPresence = user ? presenceUsers[user.id] : null;

  // Stagger load the console items
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.swiss-console-item', {
        y: 15,
        opacity: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power2.out'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Generate unique gradient based on username hash
  const getAvatarGradient = (username: string = 'U') => {
    const gradients = [
      'from-[#F97316] to-[#EF4444]',
      'from-[#10B981] to-[#047857]',
      'from-[#38BDF8] to-[#1D4ED8]',
      'from-[#8B5CF6] to-[#EC4899]',
      'from-[#FBBF24] to-[#D97706]',
      'from-[#06B6D4] to-[#0891B2]',
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  return (
    <div ref={containerRef} className="min-h-screen text-[#F8FAFC] flex items-center justify-center p-4 md:p-6 lg:p-8 font-sans relative z-10">
      
      {/* Outer Floating Desktop Window matching reference */}
      <div className="w-full max-w-7xl h-[88vh] bg-glass rounded-[2.5rem] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] flex overflow-hidden p-6 gap-6 relative">
        
        {/* Column 1: Left Vertical Dock Sidebar */}
        <aside className="w-16 bg-white/5 backdrop-blur-xl border border-white/5 rounded-3xl flex flex-col items-center justify-between py-6 shrink-0 z-20">
          <div className="flex flex-col items-center space-y-8 w-full">
            {/* Top User Profile Avatar */}
            <Link to="/profile" className="relative group">
              <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${getAvatarGradient(user?.username)} flex items-center justify-center font-bold text-xs text-[#09090B] select-none border border-white/20 transition-transform duration-300 group-hover:scale-105`}>
                {user?.username?.substring(0, 1).toUpperCase()}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-900 bg-[#10B981] ${
                connectionStatus === 'CONNECTED' ? 'animate-status-pulse' : 'bg-red-500'
              }`} />
            </Link>

            {/* Navigation Icons list */}
            <div className="flex flex-col items-center space-y-6 pt-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="p-2.5 text-zinc-400 hover:text-white transition-colors hover:bg-white/5 rounded-2xl"
                title="Workspace Dashboard"
              >
                <Home className="w-4 h-4" />
              </button>
              <button 
                className="p-2.5 text-zinc-400 hover:text-white transition-colors hover:bg-white/5 rounded-2xl"
                title="Notifications"
                onClick={() => alert('No new notifications.')}
              >
                <Bell className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate('/profile')}
                className="p-2.5 text-[#10B981] bg-white/5 rounded-2xl border border-white/10 transition-colors"
                title="Session Telemetry Parameters"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Logout Power button */}
          <button
            onClick={handleLogout}
            className="p-2.5 text-red-400 hover:text-[#09090B] hover:bg-red-500 rounded-2xl transition-all border border-red-500/10"
            title="Terminate Active Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </aside>

        {/* Column 2: Profile Content area */}
        <section className="flex-1 flex flex-col min-w-0 bg-white/5 rounded-3xl border border-white/5 p-6 md:p-8 overflow-y-auto scrollbar-thin">
          
          {/* Back link tag */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors mb-6 group swiss-console-item"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Channels
          </Link>

          {/* Card Frame Content */}
          <div className="border border-white/5 bg-white/5 p-8 rounded-3xl relative overflow-hidden swiss-console-item">
            
            {/* User Meta info */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-white/5 swiss-console-item">
              <div className={`w-16 h-16 bg-gradient-to-tr ${getAvatarGradient(user?.username)} flex items-center justify-center font-bold text-xl text-[#09090B] rounded-full`}>
                {user?.username?.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-center sm:text-left">
                <span className="text-[9px] font-mono text-[#10B981] uppercase tracking-wider block">CLIENT NODE / AUTHENTICATED</span>
                <h2 className="text-2xl font-extrabold text-white uppercase tracking-tighter mt-1">{user?.username}</h2>
                <span className="text-[10px] font-mono text-zinc-500 block mt-1">UUID: {user?.id}</span>
              </div>
            </div>

            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/5 rounded-2xl overflow-hidden bg-white/5 my-8 swiss-console-item">
              <div className="p-5 text-center">
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">CHANNELS BONDED</span>
                <span className="text-2xl font-black text-white font-mono block mt-1">12</span>
              </div>
              <div className="p-5 text-center">
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">SOCKET LATENCY</span>
                <span className="text-2xl font-black text-[#10B981] font-mono block mt-1">14ms</span>
              </div>
              <div className="p-5 text-center">
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">FRAME DELIVERY RATIO</span>
                <span className="text-2xl font-black text-[#38BDF8] font-mono block mt-1">100%</span>
              </div>
            </div>

            {/* Telemetry info details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              
              {/* Account Parameters */}
              <div className="p-6 border border-white/5 rounded-2xl bg-white/5 space-y-4 swiss-console-item">
                <div className="flex items-center gap-2.5 text-xs font-bold text-white uppercase tracking-wider">
                  <Shield className="w-4 h-4 text-[#10B981]" />
                  Client Profile Info
                </div>
                
                <div className="space-y-2.5 pt-2 border-t border-white/5 font-mono text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">USERNAME ID:</span>
                    <span className="text-white font-bold">{user?.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">LEDGER DATE:</span>
                    <span className="text-white font-bold">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'UNKNOWN'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">AUTHORITY ROLE:</span>
                    <span className="text-white font-bold text-[#10B981]">ADMINISTRATOR</span>
                  </div>
                </div>
              </div>

              {/* Network telemetry */}
              <div className="p-6 border border-white/5 rounded-2xl bg-white/5 space-y-4 swiss-console-item">
                <div className="flex items-center gap-2.5 text-xs font-bold text-white uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-[#38BDF8]" />
                  Network Telemetry
                </div>
                
                <div className="space-y-2.5 pt-2 border-t border-white/5 font-mono text-[10px]">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">SOCKET CLUSTER:</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                      connectionStatus === 'CONNECTED' ? 'bg-[#10B981]/15 text-[#10B981]' :
                      connectionStatus === 'CONNECTING' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {connectionStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">ACTIVE PEER NODE:</span>
                    <span className="text-[#38BDF8] text-[9px]">
                      {localPresence?.serverId ? localPresence.serverId.substring(0, 12) : 'NODE-DEFAULT'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">SUBSCRIBED PROTOCOL:</span>
                    <span className="text-white">STOMP v1.2</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabular Swiss Technical Logs Console */}
            <div className="mt-8 p-6 border border-white/5 rounded-2xl bg-white/5 space-y-4 swiss-console-item font-mono text-[10px] text-zinc-500">
              <div className="flex items-center gap-2.5 text-xs font-bold text-white uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-purple-400" />
                Cluster Logs Console
              </div>
              <div className="border-t border-white/5 pt-4 space-y-2 text-[9px]">
                <div className="flex items-start gap-4">
                  <span className="text-[#10B981] shrink-0">[ OK ]</span>
                  <span>Initializing STOMP connection pool on cluster-peer-2...</span>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-[#10B981] shrink-0">[ OK ]</span>
                  <span>Connected successfully to Upstash Redis session channel.</span>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-[#38BDF8] shrink-0">[ INFO ]</span>
                  <span>Subscribing payload channels for active client session. Ready.</span>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
