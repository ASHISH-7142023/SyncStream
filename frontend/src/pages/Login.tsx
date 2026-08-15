import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Radio, Lock, User, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';
import gsap from 'gsap';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user, login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    clearError();
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // GSAP animations for form mount
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.swiss-anim-item', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col justify-center items-center px-4 relative font-sans z-10">
      
      {/* Frosted Glass capsule card matching reference */}
      <div className="max-w-md w-full rounded-[2.5rem] bg-glass border border-white/10 p-8 shadow-2xl relative z-10 overflow-hidden">
        
        {/* Top visual accent stripe */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-[#10B981]" />

        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8 swiss-anim-item">
          <div className="w-10 h-10 rounded-full border border-white/20 bg-white/5 flex items-center justify-center mb-4">
            <Radio className="w-5 h-5 text-[#10B981] stroke-[2]" />
          </div>
          <span className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase">AUTH PORTAL / 01</span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase mt-1">
            Access Terminal
          </h2>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 flex items-start gap-3 swiss-anim-item">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs font-semibold leading-normal">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Username */}
          <div className="space-y-2 swiss-anim-item">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block pl-2">
              Username ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="client_name"
                className="w-full bg-white/5 border border-white/5 rounded-full pl-11 pr-4 py-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all font-mono"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2 swiss-anim-item">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block pl-2">
              Cipher Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/5 rounded-full pl-11 pr-10 py-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-white/10 hover:bg-[#10B981] text-white hover:text-slate-950 font-extrabold text-xs uppercase tracking-widest rounded-full border border-white/10 hover:border-transparent transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none swiss-anim-item"
          >
            {submitting ? (
              <Loader className="w-4.5 h-4.5 animate-spin" />
            ) : (
              'Connect Session'
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-zinc-400 swiss-anim-item">
          No registered session?{' '}
          <Link to="/register" className="text-[#10B981] hover:underline font-semibold ml-1">
            Register Credentials
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
