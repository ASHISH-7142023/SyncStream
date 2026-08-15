import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Server, Radio, Globe, Layers, ArrowRight, Play, Phone, Video, MoreHorizontal, Smile, Paperclip } from 'lucide-react';
import gsap from 'gsap';

interface MockMessage {
  id: string;
  sender: string;
  avatar: string;
  content: string;
  time: string;
  isSelf: boolean;
  color: string;
}

const Landing: React.FC = () => {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chatPlaygroundRef = useRef<HTMLDivElement | null>(null);
  
  // Interactive Chat Simulator State matching reference conversational styles
  const [messages, setMessages] = useState<MockMessage[]>([
    {
      id: '1',
      sender: 'Wealth',
      avatar: 'W',
      content: 'What\'s up?',
      time: '2:45pm',
      isSelf: false,
      color: 'bg-gradient-to-tr from-pink-500 to-rose-500'
    },
    {
      id: '2',
      sender: 'You',
      avatar: 'Y',
      content: 'Good you?',
      time: '2:45pm',
      isSelf: true,
      color: 'bg-emerald-600'
    }
  ]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);

  const simulationScript = [
    {
      sender: 'Wealth',
      avatar: 'W',
      content: 'I\'m fine',
      time: '2:46pm',
      isSelf: false,
      color: 'bg-gradient-to-tr from-pink-500 to-rose-500'
    },
    {
      sender: 'Wealth',
      avatar: 'W',
      content: 'What you up to?',
      time: '2:46pm',
      isSelf: false,
      color: 'bg-gradient-to-tr from-pink-500 to-rose-500'
    },
    {
      sender: 'You',
      avatar: 'Y',
      content: 'I\'m in class',
      time: '2:47pm',
      isSelf: true,
      color: 'bg-emerald-600'
    },
    {
      sender: 'You',
      avatar: 'Y',
      content: 'Because I\'m sitting at the back',
      time: '2:47pm',
      isSelf: true,
      color: 'bg-emerald-600'
    }
  ];

  // GSAP Entrance Animations
  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      gsap.from('.swiss-header-el', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      });

      gsap.from('.swiss-glass-panel', {
        opacity: 0,
        scale: 0.96,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power2.out'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Trigger GSAP stagger when new mock messages appear
  useEffect(() => {
    if (messages.length > 2) {
      gsap.fromTo(
        '.mock-msg-el:last-child',
        { opacity: 0, y: 15, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.4)' }
      );
      
      if (chatPlaygroundRef.current) {
        chatPlaygroundRef.current.scrollTop = chatPlaygroundRef.current.scrollHeight;
      }
    }
  }, [messages]);

  const startSimulation = () => {
    if (isSimulating || simStep >= simulationScript.length) return;
    setIsSimulating(true);

    const nextMsg = simulationScript[simStep];
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `sim-${simStep}`,
        ...nextMsg
      }]);
      setSimStep(prev => prev + 1);
      setIsSimulating(false);
    }, 1100);
  };



  return (
    <div ref={containerRef} className="min-h-screen text-[#F8FAFC] flex flex-col font-sans relative z-10">
      
      {/* Floating Glassmorphic Header */}
      <header className="border-b border-white/5 bg-slate-950/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md">
              <Radio className="w-5 h-5 text-[#10B981] stroke-[2]" />
            </div>
            <span className="text-sm font-bold tracking-widest uppercase text-white">
              SyncStream
            </span>
          </div>
          <nav className="flex items-center space-x-6">
            {user ? (
              <Link
                to="/dashboard"
                className="px-5 py-2 text-xs uppercase tracking-wider font-semibold rounded-full border border-white/10 bg-white/10 hover:bg-white/20 transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs uppercase tracking-wider font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-xs uppercase tracking-wider font-semibold rounded-full border border-white/10 bg-white/10 hover:bg-white/20 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Container */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left text column */}
        <div className="lg:col-span-6 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[#10B981] text-[10px] tracking-widest font-mono uppercase">
            <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-status-pulse" />
            STOMP WEBSOCKETS CLUSTER ACTIVE
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-white swiss-header-el">
            Real-time chat. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
              Frosted glass elegance.
            </span>
          </h1>

          <p className="text-sm text-zinc-300 max-w-lg leading-relaxed swiss-header-el">
            SyncStream delivers dynamic conversation streams over a secure distributed WebSocket broker. Packaged in a stunning design inspired by luxury glassmorphic aesthetics.
          </p>

          <div className="flex flex-wrap gap-4 swiss-header-el">
            {user ? (
              <Link
                to="/dashboard"
                className="px-8 py-4 text-xs font-bold uppercase tracking-widest rounded-full bg-[#10B981] text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10 flex items-center gap-2"
              >
                Go to Workspace <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-4 text-xs font-bold uppercase tracking-widest rounded-full bg-[#10B981] text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10 flex items-center gap-2"
                >
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 text-xs font-bold uppercase tracking-widest rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Right Preview Column (The Chat App Preview matching reference) */}
        <div className="lg:col-span-6 flex justify-center items-center relative swiss-glass-panel">
          
          <div className="w-full max-w-lg rounded-3xl bg-glass border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden flex flex-col h-[460px]">
            
            {/* Header bar matching contact info style */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/5">
              <div className="flex items-center space-x-3.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center font-bold text-xs text-white">
                    W
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-900 bg-[#10B981] animate-status-pulse" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wide">Wealth</div>
                  <div className="text-[9px] text-zinc-400 font-medium">Online - Last seen 2:45pm</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-zinc-300">
                <button className="p-1.5 hover:text-white transition-colors hover:bg-white/5 rounded-lg">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:text-white transition-colors hover:bg-white/5 rounded-lg">
                  <Video className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:text-white transition-colors hover:bg-white/5 rounded-lg">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Flow Area */}
            <div 
              ref={chatPlaygroundRef} 
              className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin"
            >
              {/* Date Separation Tag */}
              <div className="flex justify-center my-2">
                <span className="px-3 py-1 bg-white/5 backdrop-blur-md rounded-full text-[9px] font-semibold text-zinc-400 uppercase tracking-widest border border-white/5">
                  Today
                </span>
              </div>

              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.isSelf ? 'justify-end' : 'justify-start'} mock-msg-el`}
                >
                  <div 
                    className={`max-w-[70%] px-4 py-3 rounded-2xl text-xs leading-relaxed border ${
                      msg.isSelf 
                        ? 'bg-[#0d4734]/55 border-[#0d4734]/35 text-white rounded-tr-none shadow-md shadow-[#0d4734]/10' 
                        : 'bg-white/10 border-white/5 text-white rounded-tl-none shadow-md'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <div className={`text-[8px] font-mono mt-1 text-right ${msg.isSelf ? 'text-emerald-300' : 'text-zinc-400'}`}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}

              {isSimulating && (
                <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 pl-4">
                  <span className="w-1 h-1 bg-[#10B981] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 bg-[#10B981] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 bg-[#10B981] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  Transmitting packets...
                </div>
              )}
            </div>

            {/* Input Composer Panel */}
            <div className="p-4 border-t border-white/5 bg-white/5 flex gap-2.5 items-center shrink-0">
              <button className="p-2 text-zinc-400 hover:text-white transition-colors border border-white/5 rounded-full bg-white/5">
                <Smile className="w-4 h-4" />
              </button>
              <button className="p-2 text-zinc-400 hover:text-white transition-colors border border-white/5 rounded-full bg-white/5">
                <Paperclip className="w-4 h-4" />
              </button>
              
              <input
                type="text"
                disabled
                placeholder="TYPE YOUR MESSAGE HERE..."
                className="flex-1 bg-white/5 border border-white/5 rounded-full px-4 py-2.5 text-[10px] text-white focus:outline-none placeholder-zinc-500 font-mono tracking-wider"
              />

              <button
                onClick={startSimulation}
                disabled={isSimulating || simStep >= simulationScript.length}
                className="p-2.5 bg-white/10 hover:bg-[#10B981] text-zinc-300 hover:text-slate-950 rounded-full border border-white/5 hover:border-transparent transition-all disabled:opacity-30 disabled:pointer-events-none"
                title={simStep === 0 ? "Simulate Websocket Stream" : "Simulate Next Frame"}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Swiss / Glass Feature Cards */}
      <section className="py-20 border-t border-white/5 bg-black/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-xl mx-auto">
            <span className="text-[10px] font-mono text-[#10B981] uppercase tracking-widest">ARCHITECTURE STATUS / 02</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white uppercase tracking-tight mt-2">
              Grid Performance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-glass hover:bg-glass-heavy transition-all border border-white/5 hover:border-[#10B981]/30 group">
              <div className="w-11 h-11 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-[#10B981] mb-6">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-md font-bold text-white uppercase tracking-wide">STOMP Socket Broker</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                Connect over stable full-duplex TCP connections. Frame-based message protocol ensures clean client-server contract structures.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-glass hover:bg-glass-heavy transition-all border border-white/5 hover:border-[#10B981]/30 group">
              <div className="w-11 h-11 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-teal-400 mb-6">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-md font-bold text-white uppercase tracking-wide">Redis Pub/Sub</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                Run multiple backend API nodes simultaneously. Redis synchronizes message, typing, and presence streams dynamically across servers.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-glass hover:bg-glass-heavy transition-all border border-white/5 hover:border-[#10B981]/30 group">
              <div className="w-11 h-11 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-sky-400 mb-6">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-md font-bold text-white uppercase tracking-wide">MongoDB State</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                No state is lost. All user profiles, metadata, room settings, and chat history are indexed and persisted securely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black/25">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center bg-white/5">
              <Radio className="w-3.5 h-3.5 text-[#10B981]" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-white">SyncStream</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            &copy; 2026 SyncStream. Botanical glassmorphism index online.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
