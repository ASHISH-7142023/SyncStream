import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Server, Users, ArrowRight, Github, Lock, Database, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import SyncStreamLogo from '../components/ui/SyncStreamLogo';

const features = [
  {
    icon: <Lock className="w-6 h-6 text-emerald-400" />,
    title: "End-to-End Encryption (E2EE)",
    description: "Every message is encrypted on your device using AES-256-GCM. The server routes encrypted ciphertexts and never holds your private keys."
  },
  {
    icon: <Users className="w-6 h-6 text-purple-400" />,
    title: "P2P WebRTC Calling",
    description: "Voice and video data flows directly between peers, drastically reducing latency and completely removing server bandwidth bottlenecks."
  },
  {
    icon: <Server className="w-6 h-6 text-red-400" />,
    title: "Redis Pub/Sub Engine",
    description: "WebSocket events are instantly broadcasted across multiple backend nodes via Redis, allowing infinite horizontal scale without state collision."
  },
  {
    icon: <Database className="w-6 h-6 text-blue-400" />,
    title: "GridFS Media Pipeline",
    description: "Large media files and attachments are streamed directly into MongoDB using GridFS, bypassing memory limits and ensuring lightning-fast uploads."
  }
];

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#09090B] text-white selection:bg-[#7C3AED]/30 relative overflow-hidden flex flex-col">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#7C3AED]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <SyncStreamLogo size="md" />
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="text-[#94A3B8] hover:text-white transition-colors">Home</Link>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[#94A3B8] hover:text-white transition-colors flex items-center gap-2">
            <Github className="w-4 h-4" />
            GitHub
          </a>
          <Link to="/register" className="px-5 py-2 bg-[#F8FAFC] text-[#0F172A] rounded-full hover:bg-white transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Join the Beta
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#A78BFA] text-xs font-semibold uppercase tracking-widest mb-8"
        >
          <SparklesIcon className="w-3.5 h-3.5" />
          The Future of Communication
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500"
        >
          Built for teams who <br/>demand absolute privacy.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="max-w-2xl text-lg md:text-xl text-[#94A3B8] mb-12 leading-relaxed"
        >
          SyncStream was born out of a desire for a truly secure, blazing-fast collaboration platform. 
          We eliminated the middlemen, integrated military-grade E2EE, and built a dynamic WebRTC layer for flawless peer-to-peer comms.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex items-center gap-4"
        >
          <Link to="/register" className="px-8 py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-bold transition-all shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] flex items-center gap-2 hover:gap-3">
            Start Chatting <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </main>

      {/* Grid Features */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-8 rounded-2xl bg-[#111318]/80 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-[#94A3B8] leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 text-center text-[#64748B] text-sm">
        <p>© {new Date().getFullYear()} SyncStream. Created with passion and a lot of caffeine.</p>
      </footer>
    </div>
  );
};

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

export default AboutPage;
