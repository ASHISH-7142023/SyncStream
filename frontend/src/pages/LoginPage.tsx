import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SyncStreamLogo from '../components/ui/SyncStreamLogo';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex text-[#e2e8f0] overflow-hidden bg-[#060e20] font-sans">
      
      {/* LEFT COLUMN: Brand presentation */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0b1326] relative flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        {/* Grid and Glows */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
        <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-[#6d28d9]/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 -left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        {/* Header / Logo */}
        <div className="relative z-10 text-left">
          <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
            <SyncStreamLogo className="w-10 h-10" />
            <img src="/name.png" alt="SyncStream" className="h-8 w-auto object-contain" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1b2336]/80 border border-white/10 text-sm text-[#94a3b8] mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>Real-time • Secure • Scalable</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6 text-white">
            Welcome back!<br />
            Let's pick up the<br />
            <span className="text-gradient">conversation.</span>
          </h1>
          <p className="text-lg text-[#94a3b8] max-w-md">
            SyncStream brings teams together with instant messaging, room-based channels, and real-time collaboration tools.
          </p>
        </div>

        {/* Mockup / App Preview */}
        <div className="relative z-10 mt-12 flex-grow flex items-center justify-center">
          <div className="glass-panel rounded-2xl p-4 w-full max-w-md transform -rotate-2 hover:rotate-0 transition-transform duration-500 shadow-2xl shadow-black/50 text-left">
            {/* Mockup Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <SyncStreamLogo className="w-6 h-6" iconClassName="w-3.5 h-3.5" />
                <span className="text-sm font-semibold">SyncStream</span>
              </div>
              <div className="flex gap-3">
                <div className="w-3 h-3 rounded-full bg-[#252d41]"></div>
                <div className="w-3 h-3 rounded-full bg-[#252d41]"></div>
              </div>
            </div>
            {/* Mockup Content Area */}
            <div className="flex gap-4 h-56">
              {/* Sidebar */}
              <div className="w-1/3 flex flex-col gap-2">
                <div className="text-[10px] text-[#94a3b8] font-bold tracking-wider mb-1">ROOMS</div>
                <div className="px-2 py-1.5 rounded-lg bg-[#6d28d9]/20 text-[#ddd6fe] text-xs font-semibold flex items-center gap-2">
                  <span className="text-[#c4b5fd]">#</span> general
                </div>
                <div className="px-2 py-1.5 rounded-lg hover:bg-[#252d41] text-[#94a3b8] text-xs flex items-center gap-2 transition-colors cursor-pointer">
                  <span>#</span> developers
                </div>
                <div className="px-2 py-1.5 rounded-lg hover:bg-[#252d41] text-[#94a3b8] text-xs flex items-center gap-2 transition-colors cursor-pointer">
                  <span>#</span> design
                </div>
              </div>
              {/* Main Chat Area */}
              <div className="w-2/3 border-l border-white/5 pl-4 flex flex-col justify-end pb-1">
                {/* Messages placeholder */}
                <div className="space-y-3 mb-3">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#252d41] shrink-0"></div>
                    <div>
                      <div className="h-2 w-16 bg-[#252d41] rounded mb-1"></div>
                      <div className="h-2.5 w-28 bg-[#30384d] rounded"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#252d41] shrink-0"></div>
                    <div>
                      <div className="h-2 w-12 bg-[#252d41] rounded mb-1"></div>
                      <div className="h-2.5 w-24 bg-[#30384d] rounded"></div>
                    </div>
                  </div>
                </div>
                {/* Input */}
                <div className="h-8 rounded-lg bg-[#252d41] border border-white/5 w-full flex items-center px-3">
                  <span className="text-[10px] text-[#94a3b8]">Type a message...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Icons */}
          <div className="absolute -left-6 top-1/2 w-12 h-12 bg-[#6d28d9]/20 border border-[#6d28d9]/30 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(109,40,217,0.5)] animate-bounce">
            <svg className="w-5 h-5 text-[#c4b5fd]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
          </div>
          <div className="absolute -right-4 bottom-1/4 w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
          </div>
          <div className="absolute bottom-[-24px] left-1/3 w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-bounce" style={{ animationDelay: '0.5s' }}>
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
          </div>
        </div>

        {/* Features List */}
        <div className="relative z-10 flex flex-col gap-4 mt-4 text-left">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#252d41] flex items-center justify-center shrink-0 border border-white/5">
              <svg className="w-4.5 h-4.5 text-[#a78bfa]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            </div>
            <div>
              <h3 className="text-white text-sm font-semibold mb-0.5">Instant Messaging</h3>
              <p className="text-xs text-[#94a3b8]">Send and receive messages in real-time.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#252d41] flex items-center justify-center shrink-0 border border-white/5">
              <svg className="w-4.5 h-4.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            </div>
            <div>
              <h3 className="text-white text-sm font-semibold mb-0.5">Online Presence</h3>
              <p className="text-xs text-[#94a3b8]">See who's online and active in your rooms.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-6 text-xs text-[#94a3b8] text-left">
          © 2026 SyncStream. All rights reserved.
        </div>
      </div>

      {/* RIGHT COLUMN: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#060e20] relative">
        {/* Grid and Glows */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none lg:hidden"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6d28d9]/10 rounded-full blur-[100px] pointer-events-none lg:hidden"></div>
        
        <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-2xl relative z-10 shadow-2xl text-left animate-fade-in-up">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8 cursor-pointer animate-fade-in-up animation-delay-100" onClick={() => navigate('/')}>
            <SyncStreamLogo className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight text-white">SyncStream</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Log in to your account</h2>
            <p className="text-sm text-[#94a3b8]">Welcome back! Please enter your details.</p>
          </div>

          {/* Social Logins */}
          <div className="space-y-3 mb-6">
            <button 
              onClick={() => alert("Google OAuth: Redirecting to Google secure authentication flow...")}
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#1b2336] hover:bg-[#252d41] border border-white/5 transition-colors text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6d28d9]/50 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Continue with Google
            </button>
            <button 
              onClick={() => alert("GitHub OAuth: Redirecting to GitHub developer portal...")}
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#1b2336] hover:bg-[#252d41] border border-white/5 transition-colors text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6d28d9]/50 cursor-pointer"
            >
              <svg aria-hidden="true" className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path>
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 px-4 text-[#94a3b8] text-sm bg-transparent relative z-10">or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl mb-4">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#e2e8f0] mb-2" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
                <input 
                  type="email"
                  id="email" 
                  name="email" 
                  placeholder="john.doe@example.com" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-[#1b2336] border border-white/10 rounded-xl text-white placeholder-[#94a3b8] focus:ring-2 focus:ring-[#6d28d9] focus:border-transparent transition-all outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#e2e8f0] mb-2" htmlFor="password">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  id="password" 
                  name="password" 
                  placeholder="••••••••••••" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3 bg-[#1b2336] border border-white/10 rounded-xl text-white placeholder-[#94a3b8] focus:ring-2 focus:ring-[#6d28d9] focus:border-transparent transition-all outline-none text-sm"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#94a3b8] hover:text-white focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input 
                  type="checkbox"
                  id="remember-me" 
                  name="remember-me" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded bg-[#1b2336] border-white/20 text-[#6d28d9] focus:ring-[#6d28d9]/50 focus:ring-offset-[#060e20] transition-colors"
                />
                <label className="ml-2 block text-sm text-[#e2e8f0] cursor-pointer" htmlFor="remember-me">Remember me</label>
              </div>
              <div className="text-sm">
                <a onClick={(e) => { e.preventDefault(); alert("Forgot Password: Password recovery instructions have been simulated to your email inbox."); }} className="font-medium text-[#818cf8] hover:text-[#a78bfa] transition-colors cursor-pointer" href="#forgot">Forgot password?</a>
              </div>
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white btn-gradient focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6d28d9] focus:ring-offset-[#060e20] transition-all hover:scale-[1.02] active:scale-[0.98] mt-6 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Authenticating...' : 'Log In →'}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 rounded-xl bg-[#1b2336] border border-white/5 flex items-start gap-3">
            <div className="shrink-0 pt-0.5">
              <svg className="w-5 h-5 text-[#818cf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            </div>
            <p className="text-sm text-[#94a3b8]">
              We never share your data with third parties. Read our <a onClick={(e) => { e.preventDefault(); alert("SyncStream Privacy Policy: We secure your email and profile configurations natively using JWT and encrypted MongoDB clusters."); }} className="text-[#818cf8] hover:underline cursor-pointer" href="#privacy">Privacy Policy</a> to learn more.
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#94a3b8]">
              Don't have an account? <Link to="/register" className="font-medium text-[#818cf8] hover:text-[#a78bfa] transition-colors">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default LoginPage;
