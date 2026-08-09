import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Shield, Users, Server, Radio, Globe, Layers } from 'lucide-react';

const Landing: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-text selection:bg-primary/30 selection:text-primary">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center shadow-lg shadow-primary/20">
              <Radio className="w-6 h-6 text-background stroke-[2.5]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-text-h bg-clip-text text-transparent bg-gradient-to-r from-text to-muted">
              SyncStream
            </span>
          </div>
          <nav className="flex items-center space-x-4">
            {user ? (
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-primary text-background font-medium hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/25 transition-all text-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-muted hover:text-text text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl bg-primary text-background font-medium hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/25 transition-all text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface/80 text-primary text-xs font-semibold mb-6 tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            STOMP WebSockets + Redis Pub/Sub Enabled
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] max-w-4xl mx-auto">
            Real-time collaboration. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-indigo-500">
              Without the waiting.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            SyncStream connects people through instant, room-based communication powered by high-performance WebSockets and a multi-server distributed message broker.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary text-background font-semibold hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 transition-all text-center"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary text-background font-semibold hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 transition-all text-center"
                >
                  Create Free Account
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-surface border border-border text-text font-semibold hover:bg-border/30 hover:text-white transition-all text-center"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Product Preview / UI Mockup */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto rounded-2xl border border-border bg-surface/30 p-2 shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60 rounded-2xl pointer-events-none" />
          <div className="border border-border/50 rounded-xl bg-background overflow-hidden flex flex-col h-[400px]">
            {/* Fake Titlebar */}
            <div className="bg-surface/80 border-b border-border px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-danger/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-success/70" />
                <span className="text-xs text-muted font-medium ml-4"># Developers — SyncStream Workspace</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-success animate-ping" />
                <span className="text-xs text-muted">Connected to server-1</span>
              </div>
            </div>
            
            {/* Fake Workspace Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Fake Sidebar */}
              <div className="w-48 bg-surface/50 border-r border-border p-4 space-y-4 hidden md:block">
                <div>
                  <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Rooms</div>
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer">
                      <span className="opacity-70">#</span> developers
                    </div>
                    <div className="text-xs font-medium text-muted hover:text-text px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer">
                      <span className="opacity-70">#</span> general
                    </div>
                    <div className="text-xs font-medium text-muted hover:text-text px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer">
                      <span className="opacity-70">#</span> gaming
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Fake Messages Feed */}
              <div className="flex-1 p-6 flex flex-col justify-end space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center font-bold text-xs text-primary">A</div>
                  <div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-xs font-semibold text-white">Ashish</span>
                      <span className="text-[9px] text-muted">19:42</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Welcome to the distributed room chat!</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center font-bold text-xs text-purple-400">R</div>
                  <div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-xs font-semibold text-white">Rahul</span>
                      <span className="text-[9px] text-muted">19:43</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Whoa, WebSocket updates are instant. Let's fire up multiple servers.</p>
                  </div>
                </div>
                <div className="text-xs italic text-muted flex items-center gap-2 pt-2 border-t border-border/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Ashish is typing...
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-24 border-y border-border/50 bg-surface/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Enterprise Messaging Features</h2>
            <p className="text-muted max-w-xl mx-auto">SyncStream incorporates advanced architectural elements to support highly-scalable and reliable room chat deployments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-border bg-surface/50 hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-background transition-all">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">STOMP WebSockets</h3>
              <p className="text-sm text-muted leading-relaxed">
                Connect over stable full-duplex TCP connections. Frame-based message protocol ensures clean client-server contract structures.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-border bg-surface/50 hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-500 group-hover:text-background transition-all">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Redis Pub/Sub Synchronicity</h3>
              <p className="text-sm text-muted leading-relaxed">
                Run multiple backend API nodes simultaneously. Redis synchronizes message, typing, and presence streams dynamically across servers.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-border bg-surface/50 hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-500 group-hover:text-background transition-all">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">JWT & Room Authorization</h3>
              <p className="text-sm text-muted leading-relaxed">
                Secured REST and WebSocket endpoints. Connections carry signed web tokens verified at the handshake and channel subscription layer.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-border bg-surface/50 hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-500 group-hover:text-background transition-all">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Presence Tracker</h3>
              <p className="text-sm text-muted leading-relaxed">
                Monitor live user connections (ONLINE, AWAY, OFFLINE) with Redis session keys that expire automatically upon unexpected drops.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-border bg-surface/50 hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 mb-6 group-hover:bg-orange-500 group-hover:text-background transition-all">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Auto-Reconnect & Sync</h3>
              <p className="text-sm text-muted leading-relaxed">
                Recover cleanly from drops. The client automatically reconnects, re-subscribes, and requests missing sequence numbers from the history API.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-border bg-surface/50 hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:bg-purple-500 group-hover:text-background transition-all">
                <Server className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">MongoDB Persistence</h3>
              <p className="text-sm text-muted leading-relaxed">
                No state is lost. All user profiles, metadata, room settings, and chat history are indexed and persisted securely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-24 max-w-5xl mx-auto px-6">
        <div className="border border-border rounded-3xl bg-surface/40 p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[80px]" />
          <h2 className="text-3xl font-bold text-white mb-6">Production Architecture</h2>
          <p className="text-muted mb-10 leading-relaxed max-w-2xl">
            The frontend is fully optimized for Vite and served via Vercel Edge. The Java 21 Spring Boot engine runs on a persistent JVM server container supporting long-lived WebSocket connections, connected to MongoDB Atlas and Redis.
          </p>

          {/* Architecture Visual Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 text-center">
            <div className="p-6 rounded-xl border border-border bg-background flex flex-col items-center">
              <Globe className="w-8 h-8 text-primary mb-3" />
              <span className="text-sm font-bold text-white">Vercel Edge</span>
              <span className="text-xs text-muted mt-1">React + TypeScript SPA</span>
            </div>
            <div className="p-6 rounded-xl border border-border bg-background flex flex-col items-center relative">
              <div className="hidden md:block absolute -left-4 top-1/2 -translate-y-1/2 text-primary font-bold text-lg">→</div>
              <Server className="w-8 h-8 text-blue-400 mb-3" />
              <span className="text-sm font-bold text-white">Spring Boot Node</span>
              <span className="text-xs text-muted mt-1">REST API + STOMP Broker</span>
              <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-primary font-bold text-lg">→</div>
            </div>
            <div className="p-6 rounded-xl border border-border bg-background flex flex-col items-center">
              <Layers className="w-8 h-8 text-indigo-400 mb-3" />
              <span className="text-sm font-bold text-white">Data Layer</span>
              <span className="text-xs text-muted mt-1">MongoDB Atlas & Redis Pub/Sub</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Radio className="w-3.5 h-3.5 text-background" />
            </div>
            <span className="text-sm font-bold text-white">SyncStream</span>
          </div>
          <span className="text-xs text-muted">
            &copy; 2026 SyncStream. Built with premium clean code guidelines.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
