import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import { Radio, Plus, LogOut, User, ArrowRight, Trash2, MessageSquare } from 'lucide-react';

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
  const [showModal, setShowModal] = useState(false);
  
  // Create Room fields
  const [roomName, setRoomName] = useState('');
  const [roomDesc, setRoomDesc] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
      
      // Auto-join room in WebSocket broker
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

  return (
    <div className="min-h-screen bg-background text-text flex flex-col md:flex-row">
      {/* Sidebar - User summary panel */}
      <aside className="w-full md:w-64 bg-surface border-b md:border-b-0 md:border-r border-border p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center">
              <Radio className="w-6 h-6 text-background stroke-[2.5]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">SyncStream</span>
          </div>

          <div className="space-y-4">
            <div className="text-[10px] font-bold text-muted uppercase tracking-wider">
              Profile Session
            </div>
            
            <Link to="/profile" className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/80 hover:border-primary/40 hover:bg-background transition-all group">
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <User className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate group-hover:text-primary transition-colors">
                  {user?.username}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    connectionStatus === 'CONNECTED' ? 'bg-success' : 'bg-danger'
                  }`} />
                  <span className="text-[10px] text-muted capitalize truncate">
                    {connectionStatus.toLowerCase()}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-border/60">
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center justify-center gap-2 p-3 text-xs font-semibold text-danger bg-danger/5 border border-danger/10 hover:bg-danger hover:text-white rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto max-h-screen">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Active Rooms</h1>
            <p className="text-xs text-muted mt-1">Select a workspace or create a new one to start collaborating</p>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-background font-semibold hover:bg-primary/95 transition-all text-sm shadow-lg shadow-primary/10"
          >
            <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
            New Room
          </button>
        </div>

        {/* Rooms Cards Grid */}
        {rooms.length === 0 ? (
          <div className="border border-dashed border-border rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center mx-auto text-muted">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No active rooms found</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Create the first room to get started, or wait for another user to publish a new channel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => {
              const isOwner = room.ownerId === user?.id;
              const isMember = room.members.includes(user?.id || '');

              return (
                <div
                  key={room.id}
                  onClick={() => handleJoinOrEnter(room)}
                  className="p-6 rounded-2xl border border-border bg-surface/30 hover:border-primary/50 hover:bg-surface/50 transition-all cursor-pointer flex flex-col justify-between h-48 group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors truncate pr-8">
                        # {room.name}
                      </h3>
                      {isOwner && (
                        <button
                          onClick={(e) => handleDeleteRoom(room.id, e)}
                          className="p-1.5 rounded-lg border border-border hover:border-danger/30 text-muted hover:text-danger bg-background/50 hover:bg-danger/10 transition-all absolute right-6 top-6"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-muted line-clamp-3 leading-relaxed">
                      {room.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex justify-between items-center border-t border-border/40 pt-4 mt-2">
                    <span className="text-[10px] font-medium text-muted">
                      {room.members.length} member{room.members.length !== 1 ? 's' : ''}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                      {isMember ? 'Enter' : 'Join'}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* New Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full border border-border bg-surface rounded-2xl p-6 shadow-2xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Create Room</h3>
              <p className="text-xs text-muted mt-1">Initialize a new messaging workspace channel</p>
            </div>

            {createError && (
              <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-medium">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Room Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. general, developers"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="What is this channel about?"
                  value={roomDesc}
                  onChange={(e) => setRoomDesc(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setCreateError(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted hover:text-white hover:bg-border/30 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !roomName}
                  className="px-5 py-2.5 rounded-xl bg-primary text-background font-semibold text-xs hover:bg-primary/95 transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Room'}
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
