import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import SyncStreamLogo from '../components/ui/SyncStreamLogo';
import { getAvatarForUser } from '../utils/avatarHelper';

interface Room {
  id: string;
  name: string;
  description?: string;
  isDirectMessage?: boolean;
}

interface UserDto {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  gender?: string;
}

const FriendsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { rooms, onOpenCreateModal } = useOutletContext<{ 
    rooms: Room[]; 
    onOpenCreateModal: () => void;
  }>();

  const [activeTab, setActiveTab] = useState<'Friends' | 'Pending' | 'Find'>('Friends');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const [friends, setFriends] = useState<UserDto[]>([]);
  const [pendingRequests, setPendingRequests] = useState<UserDto[]>([]);
  const [searchResults, setSearchResults] = useState<UserDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'Friends') {
      fetchFriends();
    } else if (activeTab === 'Pending') {
      fetchPendingRequests();
    }
  }, [activeTab]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/friends');
      setFriends(res.data);
    } catch (error) {
      console.error('Failed to fetch friends', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/friends/pending');
      setPendingRequests(res.data);
    } catch (error) {
      console.error('Failed to fetch pending requests', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      const res = await api.get(`/api/users/search?query=${encodeURIComponent(searchQuery)}`);
      // Filter out self
      setSearchResults(res.data.filter((u: UserDto) => u.id !== user?.id));
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (targetId: string) => {
    try {
      await api.post(`/api/friends/request/${targetId}`);
      alert('Friend request sent!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send request');
    }
  };

  const acceptRequest = async (targetId: string) => {
    try {
      await api.post(`/api/friends/accept/${targetId}`);
      fetchPendingRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const declineRequest = async (targetId: string) => {
    try {
      await api.post(`/api/friends/decline/${targetId}`);
      fetchPendingRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to decline request');
    }
  };

  const messageFriend = async (targetId: string) => {
    try {
      const res = await api.post(`/api/rooms/dm/${targetId}`);
      navigate(`/rooms/${res.data.id}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create DM');
    }
  };

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
        <div className="h-16 flex items-center justify-between px-4 shrink-0 border-b border-gray-800">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-white cursor-pointer" onClick={() => navigate('/dashboard')}>
            <SyncStreamLogo className="w-8 h-8" />
            <img src="/name.png" alt="SyncStream" className="h-7 w-32 object-contain" />
          </div>
          <button 
            onClick={() => setShowMobileSidebar(false)}
            className="md:hidden p-1 text-text-muted hover:text-white hover:bg-white/10 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3 flex flex-col gap-6">
          <div className="space-y-1">
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-3 py-2 text-text-muted hover:text-white hover:bg-bg-hover rounded-lg transition-colors group text-left">
              <i className="fa-solid fa-house w-5 group-hover:text-white transition-colors"></i>
              <span className="font-medium text-sm">Home</span>
            </button>
            <button onClick={() => navigate('/rooms')} className="w-full flex items-center gap-3 px-3 py-2 text-text-muted hover:text-white hover:bg-bg-hover rounded-lg transition-colors group text-left">
              <i className="fa-solid fa-comment-dots w-5 group-hover:text-white transition-colors"></i>
              <span className="font-medium text-sm">Rooms Feed</span>
            </button>
            <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-3 py-2 text-text-muted hover:text-white hover:bg-bg-hover rounded-lg transition-colors group text-left">
              <i className="fa-regular fa-user w-5 group-hover:text-white transition-colors"></i>
              <span className="font-medium text-sm">My Profile</span>
            </button>
            <button onClick={() => navigate('/friends')} className="w-full flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-accent-purple/20 to-transparent border-l-2 border-accent-purpleLight text-white rounded-r-lg group text-left">
              <i className="fa-solid fa-user-friends w-5 text-accent-purpleLight transition-colors"></i>
              <span className="font-medium text-sm">Friends</span>
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
              {rooms.slice(0, 10).map((r) => (
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
            </div>
          </div>
        </nav>

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
            >
              <i className="fa-solid fa-bars text-lg"></i>
            </button>
            <h1 className="text-lg font-bold">Friends & Direct Messages</h1>
          </div>
        </header>

        {/* Scrollable Dashboard Panel */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar text-left">
          <div className="max-w-4xl mx-auto space-y-8">
            
            <div className="flex gap-4 border-b border-gray-800 pb-2">
              <button 
                onClick={() => setActiveTab('Friends')}
                className={`px-4 py-2 font-semibold transition-colors rounded-t-lg ${activeTab === 'Friends' ? 'text-accent-purpleLight border-b-2 border-accent-purpleLight bg-white/5' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
              >
                My Friends
              </button>
              <button 
                onClick={() => setActiveTab('Pending')}
                className={`px-4 py-2 font-semibold transition-colors rounded-t-lg ${activeTab === 'Pending' ? 'text-accent-purpleLight border-b-2 border-accent-purpleLight bg-white/5' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
              >
                Pending Requests {pendingRequests.length > 0 && <span className="ml-2 bg-accent-purpleLight text-white text-xs px-2 py-0.5 rounded-full">{pendingRequests.length}</span>}
              </button>
              <button 
                onClick={() => setActiveTab('Find')}
                className={`px-4 py-2 font-semibold transition-colors rounded-t-lg ${activeTab === 'Find' ? 'text-accent-purpleLight border-b-2 border-accent-purpleLight bg-white/5' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
              >
                Find Friends
              </button>
            </div>

            {activeTab === 'Find' && (
              <div className="space-y-6 animate-fade-in-up">
                <form onSubmit={handleSearch} className="flex gap-4">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by username..." 
                    className="flex-1 bg-bg-card border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-purple/50"
                  />
                  <button type="submit" disabled={loading} className="px-6 py-3 bg-accent-purpleLight hover:bg-accent-purple text-white rounded-lg font-semibold transition-colors">
                    <i className="fa-solid fa-magnifying-glass mr-2"></i> Search
                  </button>
                </form>

                <div className="space-y-3">
                  {searchResults.map(u => (
                    <div key={u.id} className="bg-bg-card border border-gray-800 rounded-xl p-4 flex items-center justify-between hover:border-accent-purple/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-accent-purple/20 flex items-center justify-center text-2xl select-none">
                          {getAvatarForUser(u.username)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-white">{u.username}</h4>
                          {u.gender && <p className="text-xs text-text-muted capitalize">{u.gender}</p>}
                        </div>
                      </div>
                      <button onClick={() => sendRequest(u.id)} className="px-4 py-2 bg-accent-green/20 text-accent-green hover:bg-accent-green hover:text-white rounded-lg text-sm font-semibold transition-colors">
                        Add Friend
                      </button>
                    </div>
                  ))}
                  {searchResults.length === 0 && !loading && searchQuery && (
                    <div className="text-center py-12 text-text-muted">No users found for "{searchQuery}"</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'Pending' && (
              <div className="space-y-3 animate-fade-in-up">
                {pendingRequests.map(u => (
                  <div key={u.id} className="bg-bg-card border border-gray-800 rounded-xl p-4 flex items-center justify-between hover:border-accent-purple/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent-purple/20 flex items-center justify-center text-2xl select-none">
                        {getAvatarForUser(u.username)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-white">{u.username}</h4>
                        <p className="text-xs text-text-muted">Sent you a friend request</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => acceptRequest(u.id)} className="px-4 py-2 bg-accent-green hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-colors">
                        Accept
                      </button>
                      <button onClick={() => declineRequest(u.id)} className="px-4 py-2 bg-bg-sidebar border border-gray-700 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 text-text-muted rounded-lg text-sm font-semibold transition-colors">
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
                {pendingRequests.length === 0 && !loading && (
                  <div className="text-center py-12 text-text-muted flex flex-col items-center">
                    <i className="fa-solid fa-inbox text-4xl mb-4 text-gray-700"></i>
                    <p>No pending friend requests</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Friends' && (
              <div className="space-y-3 animate-fade-in-up">
                {friends.map(u => (
                  <div key={u.id} className="bg-bg-card border border-gray-800 rounded-xl p-4 flex items-center justify-between hover:border-accent-purple/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent-purple/20 flex items-center justify-center text-2xl select-none relative">
                        {getAvatarForUser(u.username)}
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-accent-green border-2 border-bg-card rounded-full"></span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-white">{u.username}</h4>
                        <p className="text-xs text-text-muted">Online</p>
                      </div>
                    </div>
                    <button onClick={() => messageFriend(u.id)} className="px-4 py-2 bg-accent-purpleLight hover:bg-accent-purple text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-accent-purple/20 flex items-center gap-2">
                      <i className="fa-solid fa-paper-plane"></i> Message
                    </button>
                  </div>
                ))}
                {friends.length === 0 && !loading && (
                  <div className="text-center py-12 text-text-muted flex flex-col items-center">
                    <i className="fa-solid fa-user-group text-4xl mb-4 text-gray-700"></i>
                    <p>You haven't added any friends yet.</p>
                    <button onClick={() => setActiveTab('Find')} className="mt-4 text-accent-purpleLight hover:underline">
                      Find Friends
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </main>
    </div>
  );
};

export default FriendsPage;
