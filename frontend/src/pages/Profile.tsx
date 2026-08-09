import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Radio, LogOut, ArrowLeft, Shield, Activity, User as UserIcon } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { connectionStatus, presenceUsers } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Find local user presence server info if cached
  const localPresence = user ? presenceUsers[user.id] : null;

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center">
              <Radio className="w-6 h-6 text-background stroke-[2.5]" />
            </div>
            <Link to="/dashboard" className="text-xl font-bold text-white tracking-tight hover:text-primary transition-colors">
              SyncStream
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-semibold text-danger bg-danger/10 border border-danger/20 hover:bg-danger hover:text-white px-4 py-2 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Back Link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4.5 h-4.5 group-hover:-translate-x-1 transition-transform" />
          Back to Chat Workspace
        </Link>

        {/* Profile Card */}
        <div className="border border-border bg-surface/40 rounded-2xl p-8 shadow-xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px]" />
          
          <div className="flex items-center gap-5 pb-6 border-b border-border/60">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <UserIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
              <span className="text-xs text-muted">ID: {user?.id}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 border border-border bg-background/50 rounded-xl space-y-3">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-primary uppercase tracking-wider">
                <Shield className="w-4.5 h-4.5" />
                Account Details
              </div>
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Username:</span>
                  <span className="text-white font-medium">{user?.username}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Joined At:</span>
                  <span className="text-white font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 border border-border bg-background/50 rounded-xl space-y-3">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-primary uppercase tracking-wider">
                <Activity className="w-4.5 h-4.5" />
                Connection Telemetry
              </div>
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs items-center">
                  <span className="text-muted">WebSocket Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    connectionStatus === 'CONNECTED' ? 'bg-success/10 text-success' :
                    connectionStatus === 'CONNECTING' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-danger/10 text-danger'
                  }`}>
                    {connectionStatus}
                  </span>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className="text-muted">Active Server Instance:</span>
                  <span className="font-mono text-white text-[10px] bg-border/40 px-2 py-0.5 rounded">
                    {localPresence?.serverId ? localPresence.serverId.substring(0, 8) + '...' : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
