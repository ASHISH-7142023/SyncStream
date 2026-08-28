import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SyncStreamLogo from '../components/ui/SyncStreamLogo';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Real-time Messaging',
      desc: 'Instant message delivery with WebSocket technology',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
      )
    },
    {
      title: 'Room-based Chat',
      desc: 'Organize conversations in dedicated rooms and channels',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
      )
    },
    {
      title: 'Online Presence',
      desc: "See who's online and active in real-time",
      icon: (
        <div className="relative w-5 h-5">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
          <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-[#09090B]"></span>
        </div>
      )
    },
    {
      title: 'Typing Indicators',
      desc: 'Know when someone is typing a message',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
      )
    },
    {
      title: 'Secure & Private',
      desc: 'End-to-end security with JWT authentication',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
      )
    },
    {
      title: 'Scalable Architecture',
      desc: 'Built to handle millions of concurrent users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#050614] text-[#F3F4F6] flex flex-col font-sans antialiased relative">
      
      {/* Background grid lines and colored blur circles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#7C3AED]/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]"></div>
      </div>

      {/* Header bar */}
      <header className="relative z-50 w-full border-b border-white/5 bg-[#050614]/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <SyncStreamLogo className="w-8 h-8" />
              <img src="/name.png" alt="SyncStream" className="h-6 w-auto object-contain" />
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a className="text-sm font-medium text-gray-300 hover:text-white transition-colors" href="#features">Features</a>
              <a className="text-sm font-medium text-gray-300 hover:text-white transition-colors" href="#how">How It Works</a>
              <a className="text-sm font-medium text-gray-300 hover:text-white transition-colors" href="#pricing">Pricing</a>
              <a className="text-sm font-medium text-gray-300 hover:text-white transition-colors" href="#about">About Us</a>
              <a className="text-sm font-medium text-gray-300 hover:text-white transition-colors" href="#docs">Docs</a>
            </nav>

            {/* Header action buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-all">Login</Link>
              <Link to="/register" className="text-sm font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] px-5 py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(124,58,237,0.5)]">Get Started Free</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main hero space */}
      <main className="flex-grow relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            
            {/* Hero Left content block */}
            <div className="flex flex-col gap-8 max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10 w-fit">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-xs font-medium text-[#c4b5fd]">Real-time • Secure • Scalable</span>
              </div>

              {/* Headline */}
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                  Real-time<br />
                  <span className="text-gradient">collaboration.</span><br />
                  Without the waiting.
                </h1>
                <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-lg">
                  SyncStream connects teams and communities through room-based messaging with blazing fast performance and enterprise-grade reliability.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <button onClick={() => navigate('/register')} className="flex items-center gap-2 text-white bg-[#7C3AED] hover:bg-[#6D28D9] px-6 py-3.5 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                  Get Started Free
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                </button>
                <button 
                  onClick={() => alert("Watch Demo: Connecting rooms, active presence, typing sync, and low-latency audio/video calling are fully interactive inside.")}
                  className="flex items-center gap-2 text-white bg-transparent border border-white/10 hover:bg-white/5 px-6 py-3.5 rounded-xl font-medium transition-all cursor-pointer"
                >
                  <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                  Watch Demo
                </button>
              </div>

              {/* Social Proof metrics */}
              <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-[#050614] bg-[#7C3AED] flex items-center justify-center font-bold text-white text-xs">AJ</div>
                  <div className="w-10 h-10 rounded-full border-2 border-[#050614] bg-[#10B981] flex items-center justify-center font-bold text-white text-xs">SW</div>
                  <div className="w-10 h-10 rounded-full border-2 border-[#050614] bg-orange-500 flex items-center justify-center font-bold text-white text-xs">DB</div>
                  <div className="w-10 h-10 rounded-full border-2 border-[#050614] bg-blue-500 flex items-center justify-center font-bold text-white text-xs">ED</div>
                  <div className="w-10 h-10 rounded-full border-2 border-[#050614] bg-[#252d41] flex items-center justify-center text-xs font-semibold text-white z-10">10K+</div>
                </div>
                <div className="text-sm text-gray-400">
                  Join 10,000+ teams already<br />collaborating on SyncStream
                </div>
              </div>
            </div>

            {/* Hero Right: Product chat preview mockup */}
            {/* Floating Badges */}
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/30 flex items-center justify-center text-white shadow-lg shadow-[#7C3AED]/20 animate-bounce hidden sm:flex z-20">
              💬
            </div>
            <div className="absolute -right-6 top-1/3 w-12 h-12 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 shadow-lg shadow-green-500/20 animate-pulse hidden sm:flex z-20">
              ⚡
            </div>
            <div className="absolute bottom-[-24px] left-1/3 w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/20 animate-bounce hidden sm:flex z-20" style={{ animationDelay: '0.5s' }}>
              🛡️
            </div>

            <div className="relative lg:ml-auto w-full max-w-[800px] xl:max-w-[900px] rounded-2xl glass-panel shadow-2xl overflow-hidden flex flex-col md:flex-row transform lg:translate-x-12 xl:translate-x-24">
              
              {/* Mockup Sidebar */}
              <div className="w-full md:w-64 bg-[#0b1326]/80 border-r border-white/5 flex flex-col h-[500px]">
                {/* Sidebar Header */}
                <div className="p-4 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <SyncStreamLogo className="w-6 h-6" iconClassName="w-3.5 h-3.5" />
                    <span className="font-semibold text-white text-sm">SyncStream</span>
                  </div>
                  <button 
                    onClick={() => alert("Notification center is active in your authenticated dashboard.")}
                    className="text-gray-400 hover:text-white cursor-pointer"
                  >
                    🔔
                  </button>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
                  {/* Main navigation */}
                  <nav className="space-y-1">
                    <a className="flex items-center gap-3 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 rounded-md" href="#home">
                      🏠 Home
                    </a>
                    <a className="flex items-center gap-3 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 rounded-md" href="#threads">
                      💬 Threads
                    </a>
                    <a className="flex items-center gap-3 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 rounded-md" href="#dms">
                      ✉ Direct Messages
                    </a>
                  </nav>

                  {/* Rooms list */}
                  <div>
                    <div className="flex items-center justify-between px-3 mb-2">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Rooms</span>
                      <button 
                        onClick={() => navigate('/register')}
                        className="text-gray-400 hover:text-white cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <div className="space-y-1 text-left">
                      <a className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:bg-white/5 rounded-md" href="#general">
                        <span>#</span> general
                      </a>
                      <a className="flex items-center gap-2 px-3 py-1.5 text-xs text-white bg-[#7C3AED]/80 rounded-md font-semibold" href="#dev">
                        <span>#</span> developers
                      </a>
                      <a className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:bg-white/5 rounded-md" href="#design">
                        <span>#</span> design
                      </a>
                      <a className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:bg-white/5 rounded-md" href="#random">
                        <span>#</span> random
                      </a>
                    </div>
                  </div>
                </div>

                {/* User avatar segment */}
                <div className="p-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center font-bold text-white text-xs">AJ</div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0b1326] rounded-full"></span>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-white">Alex Johnson</span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mockup Chat Area */}
              <div className="flex-grow flex flex-col bg-[#0f1423]/80">
                {/* Chat header */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <div className="text-left">
                    <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span className="text-gray-400 font-normal">#</span> developers
                    </h2>
                    <p className="text-[10px] text-gray-400">Development discussions</p>
                  </div>
                </div>

                {/* Messages feed */}
                <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-4 text-left">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-[10px] font-bold shrink-0">AJ</div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-xs text-white">Alex Johnson</span>
                        <span className="text-[9px] text-gray-500">10:30 AM</span>
                      </div>
                      <p className="text-xs text-gray-300 mt-0.5">Hey team! Just pushed the new real-time messaging implementation 🚀</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center text-white text-[10px] font-bold shrink-0">SW</div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-xs text-white">Sarah Wilson</span>
                        <span className="text-[9px] text-gray-500">10:31 AM</span>
                      </div>
                      <p className="text-xs text-gray-300 mt-0.5">Looks amazing! The performance is incredibly fast now.</p>
                    </div>
                  </div>
                </div>

                {/* Input block */}
                <div className="p-4 bg-[#0f1423] border-t border-white/5">
                  <div className="text-[10px] text-[#7C3AED] mb-1.5 text-left animate-pulse">Sarah Wilson is typing...</div>
                  <div className="relative flex items-center bg-[#09090B] rounded-lg border border-white/10 focus-within:border-[#7C3AED]/50 focus-within:ring-1 focus-within:ring-[#7C3AED]/50 transition-all">
                    <input className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 py-2.5 pl-4 pr-16 rounded-lg text-xs" placeholder="Type a message..." type="text" readOnly />
                    <button 
                      onClick={() => alert("Sign up or log in to start typing and sending real-time messages!")}
                      className="absolute right-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white p-1 rounded transition-colors cursor-pointer"
                    >
                      🚀
                    </button>
                  </div>
                </div>
              </div>

              {/* Mockup Members Sidebar */}
              <div className="w-60 bg-[#0b1326]/80 border-l border-white/5 flex flex-col h-[500px] hidden xl:flex text-left">
                <div className="p-4 border-b border-white/5">
                  <span className="text-xs font-semibold text-white">MEMBERS — 8</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {[
                    { name: 'Alex Johnson', status: 'Online', color: 'bg-green-500' },
                    { name: 'Sarah Wilson', status: 'Online', color: 'bg-green-500' },
                    { name: 'David Brown', status: 'Online', color: 'bg-green-500' },
                    { name: 'Emily Davis', status: 'Away', color: 'bg-yellow-500' },
                    { name: 'Michael Chen', status: 'Online', color: 'bg-green-500' },
                    { name: 'Lisa Anderson', status: 'Offline', color: 'bg-gray-500' },
                    { name: 'James Taylor', status: 'Offline', color: 'bg-gray-500' },
                    { name: 'Rachel Kim', status: 'Offline', color: 'bg-gray-500' },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-xs group">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#1b2336] flex items-center justify-center font-bold text-[9px] text-white">
                          {m.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{m.name}</span>
                          <span className="text-[9px] text-gray-500 flex items-center gap-1">
                            <span className={`w-1 h-1 rounded-full ${m.color}`}></span> {m.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Feature Grid */}
        <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            {features.map((f, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center hover:bg-white/5 transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-[#0b1326] border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-[#7C3AED]">
                  {f.icon}
                </div>
                <h3 className="text-white text-sm font-semibold mb-2">{f.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#050614]/80 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <SyncStreamLogo className="w-6 h-6" iconClassName="w-3.5 h-3.5" />
            <span className="text-sm font-semibold text-gray-300">SyncStream</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
            <a 
              onClick={(e) => { e.preventDefault(); alert("SyncStream Terms of Service: By using our platform, you agree to respect our code of conduct and service quotas."); }}
              className="hover:text-white transition-colors cursor-pointer" 
              href="#terms"
            >
              Terms of Service
            </a>
            <a 
              onClick={(e) => { e.preventDefault(); alert("SyncStream Privacy Policy: We secure your email and profile configurations natively using JWT and encrypted MongoDB clusters."); }}
              className="hover:text-white transition-colors cursor-pointer" 
              href="#privacy"
            >
              Privacy Policy
            </a>
            <a 
              onClick={(e) => { e.preventDefault(); alert("SyncStream Support: For inquiries or support requests, please contact help@syncstream.dev."); }}
              className="hover:text-white transition-colors cursor-pointer" 
              href="#help"
            >
              Help Center
            </a>
          </div>
          <p className="text-xs text-gray-500">© 2026 SyncStream. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
