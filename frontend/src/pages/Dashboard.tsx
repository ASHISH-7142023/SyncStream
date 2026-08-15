import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import { Plus, LogOut, ArrowRight, Trash2, MessageSquare, Search, X, Home, Settings, Bell } from 'lucide-react';
import gsap from 'gsap';

interface Room {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[];
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { connectionStatus, joinRoom } = useSocket();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Create Room fields
  const [roomName, setRoomName] = useState('');
  const [roomDesc, setRoomDesc] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/api/rooms');
      setRooms(response.data);
    } catch (e) {
      console.error('Failed to load rooms', e);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // GSAP animations for mounting main dashboard elements
  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      gsap.from('.swiss-anim-sidebar', {
        x: -40,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
      });
      gsap.from('.swiss-anim-main', {
        opacity: 0,
        scale: 0.98,
        duration: 0.7,
        delay: 0.1,
        ease: 'power2.out'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // GSAP animation for staggered room cards load
  useEffect(() => {
    if (rooms.length > 0) {
      gsap.fromTo(
        '.room-card-el',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [rooms.length, searchQuery]);

  // GSAP modal opening animation
  useEffect(() => {
    if (showModal && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.5)' }
      );
    }
  }, [showModal]);

  // Generate dynamic gradient from username hash
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

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setLoading(true);
    setCreateError(null);
    try {
      const response = await api.post('/api/rooms', {
        name: roomName.trim(),
        description: roomDesc.trim(),
      });
      const newRoom = response.data;
      
      joinRoom(newRoom.id);
      
      setRoomName('');
      setRoomDesc('');
      setShowModal(false);
      fetchRooms();
      navigate(`/rooms/${newRoom.id}`);
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create room.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOrEnter = async (room: Room) => {
    const isMember = room.members.includes(user?.id || '');
    if (isMember) {
      joinRoom(room.id);
      navigate(`/rooms/${room.id}`);
    } else {
      try {
        await api.post(`/api/rooms/${room.id}/join`);
        joinRoom(room.id);
        navigate(`/rooms/${room.id}`);
      } catch (err) {
        console.error('Failed to join room', err);
      }
    }
  };

  const handleDeleteRoom = async (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this room? All message history will be permanently deleted.')) return;

    try {
      await api.delete(`/api/rooms/${roomId}`);
      fetchRooms();
    } catch (err) {
      console.error('Failed to delete room', err);
      alert('Only the room creator can delete this room.');
    }
  };

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={containerRef} className="min-h-screen text-[#F8FAFC] flex items-center justify-center p-4 md:p-6 lg:p-8 font-sans relative z-10">
      
      {/* Outer Floating Desktop Window matching reference */}
      <div className="w-full max-w-7xl h-[88vh] bg-glass rounded-[2.5rem] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] flex overflow-hidden p-6 gap-6 relative">
        
        {/* Column 1: Left Vertical Dock Sidebar (Exactly like reference left dock) */}
        <aside className="w-16 bg-white/5 backdrop-blur-xl border border-white/5 rounded-3xl flex flex-col items-center justify-between py-6 shrink-0 swiss-anim-sidebar">
          
          <div className="flex flex-col items-center space-y-8 w-full">
            {/* Top User Profile Avatar with Online Status Indicator */}
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
                className="p-2.5 text-[#10B981] bg-white/5 rounded-2xl border border-white/10 transition-colors"
                title="Workspace Dashboard"
              >
                <Home className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setShowModal(true)}
                className="p-2.5 text-zinc-400 hover:text-white transition-colors hover:bg-white/5 rounded-2xl"
                title="Initialize Room"
              >
                <Plus className="w-4 h-4" />
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
                className="p-2.5 text-zinc-400 hover:text-white transition-colors hover:bg-white/5 rounded-2xl"
                title="Session Telemetry Parameters"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Logout Power button */}
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="p-2.5 text-red-400 hover:text-[#09090B] hover:bg-red-500 rounded-2xl transition-all border border-red-500/10"
            title="Terminate Active Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </aside>

        {/* Column 2: Dashboard Content panel */}
        <section className="flex-1 flex flex-col min-w-0 bg-white/5 rounded-3xl border border-white/5 p-6 md:p-8 overflow-y-auto swiss-anim-main scrollbar-thin">
          
          {/* Header Panel */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-white/5">
            <div>
              <span className="text-[9px] font-mono text-[#10B981] uppercase tracking-widest">DASHBOARD MODULE / 01</span>
              <h1 className="text-3xl font-extrabold text-white tracking-tight uppercase mt-1">Active Workspaces</h1>
              <p className="text-xs text-zinc-400 mt-1">Choose a channel or create a new room to start collaborating.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              
              {/* Search Pill Input bar matching reference design */}
              <div className="relative flex-1 lg:flex-none">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="SEARCH CHANNELS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full lg:w-60 bg-white/5 border border-white/5 rounded-full pl-11 pr-4 py-2.5 text-[10px] text-white placeholder-zinc-500 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all font-mono tracking-wider"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#10B981] hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-full transition-colors w-full lg:w-auto"
              >
                <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
                New Workspace
              </button>
            </div>
          </div>

          {/* Rooms Grid */}
          {filteredRooms.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-zinc-500">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">No Channels Cataloged</h3>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto mt-1">
                  Initialize a new channel, or clear your query filter to verify other servers.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
              {filteredRooms.map((room) => {
                const isOwner = room.ownerId === user?.id;
                const isMember = room.members.includes(user?.id || '');

                return (
                  <div
                    key={room.id}
                    onClick={() => handleJoinOrEnter(room)}
                    className="room-card-el p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-[#10B981]/50 hover:bg-white/10 transition-all cursor-pointer flex flex-col justify-between h-48 group relative overflow-hidden opacity-0"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-bold text-white group-hover:text-[#10B981] transition-colors truncate pr-8 uppercase tracking-wide">
                          # {room.name}
                        </h3>
                        {isOwner && (
                          <button
                            onClick={(e) => handleDeleteRoom(room.id, e)}
                            className="p-1.5 rounded-full border border-white/5 hover:border-red-500/30 text-zinc-500 hover:text-red-400 bg-white/5 hover:bg-red-500/10 transition-all absolute right-5 top-5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                        {room.description || 'No description cataloged.'}
                      </p>
                    </div>

                    <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-2">
                      <span className="text-[9px] font-mono uppercase text-zinc-500">
                        {room.members.length} Peer{room.members.length !== 1 ? 's' : ''} Linked
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#10B981]">
                        {isMember ? 'CONNECT' : 'LINK'}
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* New Room Glass Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            ref={modalRef}
            className="max-w-md w-full rounded-3xl bg-glass border border-white/10 p-6 shadow-2xl space-y-6 relative"
          >
            <div className="absolute top-0 left-0 w-full h-[3px] bg-[#10B981]" />

            <div>
              <span className="text-[9px] font-mono text-[#10B981] uppercase tracking-wider block">CHANNEL BUILDER</span>
              <h3 className="text-xl font-extrabold text-white uppercase tracking-tight mt-1">Initialize Channel</h3>
            </div>

            {createError && (
              <div className="p-3.5 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateRoom} className="space-y-4 font-mono">
              <div className="space-y-1.5">
                <label className="text-[9px] text-zinc-400 uppercase tracking-wider block pl-2 font-sans font-bold">
                  Channel Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="general, developers"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                  className="w-full bg-white/5 border border-white/5 rounded-full px-5 py-3 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all font-mono uppercase tracking-wider"
                />
              </div>

              <div className="space-y-1.5 font-sans">
                <label className="text-[9px] text-zinc-400 uppercase tracking-wider block pl-2 font-bold">
                  Description / Topic
                </label>
                <textarea
                  rows={3}
                  placeholder="Catalog descriptive details..."
                  value={roomDesc}
                  onChange={(e) => setRoomDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setCreateError(null);
                  }}
                  className="px-4 py-2 border border-white/10 rounded-full text-[10px] tracking-wider uppercase font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !roomName}
                  className="px-5 py-2 bg-[#10B981] text-slate-950 font-bold text-[10px] tracking-wider uppercase rounded-full hover:bg-emerald-400 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  {loading ? 'Processing...' : 'Run Init'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
