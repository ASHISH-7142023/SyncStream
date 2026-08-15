import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Radio, Lock, User, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';
import gsap from 'gsap';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const { user, register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    clearError();
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // GSAP animation on mount
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
    setLocalError(null);
    clearError();

    if (!username.trim() || !password || !confirmPassword) return;

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Cipher passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register(username.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const activeError = localError || error;

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col justify-center items-center px-4 relative font-sans z-10">
      
      {/* Frosted Glass capsule card */}
      <div className="max-w-md w-full rounded-[2.5rem] bg-glass border border-white/10 p-8 shadow-2xl relative z-10 overflow-hidden">
        
        {/* Top visual accent stripe */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-[#38BDF8]" />

        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8 swiss-anim-item">
          <div className="w-10 h-10 rounded-full border border-white/20 bg-white/5 flex items-center justify-center mb-4">
            <Radio className="w-5 h-5 text-[#38BDF8] stroke-[2]" />
          </div>
          <span className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase">AUTH PORTAL / 02</span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase mt-1">
            Register Client
          </h2>
        </div>

        {/* Error Alert */}
        {activeError && (
          <div className="mb-6 p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 flex items-start gap-3 swiss-anim-item">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs font-semibold leading-normal">{activeError}</div>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username */}
          <div className="space-y-1.5 swiss-anim-item">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block pl-2">
              Desired Username
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
                className="w-full bg-white/5 border border-white/5 rounded-full pl-11 pr-4 py-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] transition-all font-mono"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5 swiss-anim-item">
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
                placeholder="Choose key (min 6 chars)"
                className="w-full bg-white/5 border border-white/5 rounded-full pl-11 pr-10 py-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] transition-all font-mono"
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

          {/* Confirm Password */}
          <div className="space-y-1.5 swiss-anim-item">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block pl-2">
              Verify Cipher Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full bg-white/5 border border-white/5 rounded-full pl-11 pr-10 py-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 py-4 bg-white/10 hover:bg-[#38BDF8] text-white hover:text-slate-950 font-extrabold text-xs uppercase tracking-widest rounded-full border border-white/10 hover:border-transparent transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none swiss-anim-item"
          >
            {submitting ? (
              <Loader className="w-4.5 h-4.5 animate-spin" />
            ) : (
              'Create Profile Key'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-xs text-zinc-400 swiss-anim-item">
          Already registered client credentials?{' '}
          <Link to="/login" className="text-[#38BDF8] hover:underline font-semibold ml-1">
            Sign in terminal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
