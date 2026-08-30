import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SyncStreamLogo from '../components/ui/SyncStreamLogo';

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [gender, setGender] = useState('male');

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const strength = getPasswordStrength();
  const strengthText = 
    strength === 0 ? '' :
    strength === 1 ? 'Weak' :
    strength === 2 ? 'Medium' :
    strength === 3 ? 'Strong' : 'Very Strong';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('You must agree to the Terms of Service.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      await register(username, password);
      localStorage.setItem('user-gender', gender);
      // Automatically redirect to login or dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 lg:p-8 bg-[#0a0a0f] text-[#f3f4f6] font-sans antialiased">
      
      {/* MAIN CONTAINER */}
      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        
        {/* LEFT COLUMN: Brand Presentation */}
        <section className="flex flex-col gap-8 text-left">
          {/* Logo and Badges */}
          <div>
            <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={() => navigate('/')}>
              <SyncStreamLogo className="w-10 h-10" />
              <img src="/name.png" alt="SyncStream" className="h-9 w-40 object-contain" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#374151] bg-[#12121a]/50 text-sm text-[#9ca3af] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
              <span>Real-time • Secure • Scalable</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Create your account<br />
              and start collaborating<br />
              in <span className="text-[#6366f1]">real-time.</span>
            </h1>
            <p className="text-[#9ca3af] text-lg max-w-md">
              Join thousands of teams and communities using SyncStream for seamless communication.
            </p>
          </div>

          {/* Feature Image Placeholder */}
          <div className="relative z-10 w-full max-w-xl mx-auto lg:mx-0 my-8">
            {/* Mock App UI Container */}
            <div className="glass-panel rounded-2xl p-4 w-full transform -rotate-2 hover:rotate-0 transition-transform duration-500 shadow-2xl shadow-black/50 text-left relative z-10">
              {/* Header / Sidebar Row */}
              <div className="flex gap-4 h-[420px]">
                
                {/* Sidebar */}
                <div className="w-1/3 flex flex-col justify-between border-r border-white/5 pr-4 shrink-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <SyncStreamLogo className="w-6 h-6" iconClassName="w-3.5 h-3.5" />
                      <span className="text-sm font-bold text-white">SyncStream</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-[10px] text-[#94a3b8] font-bold tracking-wider uppercase">Rooms</div>
                      <div className="px-2 py-1.5 rounded-lg bg-[#8b5cf6]/20 text-white text-xs font-semibold flex items-center gap-2">
                        <span className="text-[#a78bfa]">#</span> general
                      </div>
                      {['developers', 'design', 'announcements', 'help-support'].map((name) => (
                        <div key={name} className="px-2 py-1 rounded-lg hover:bg-white/5 text-[#94a3b8] text-xs flex items-center gap-2 transition-colors">
                          <span className="text-slate-600">#</span> {name}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* User footer */}
                  <div className="flex items-center gap-2 min-w-0 border-t border-white/5 pt-3">
                    <img 
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80" 
                      alt="Alex" 
                      className="w-7 h-7 rounded-full object-cover border border-white/10 shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-medium text-white truncate">Alex Johnson</span>
                      <span className="text-[8px] text-green-400 flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-green-500"></span> Online</span>
                    </div>
                  </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  {/* Chat Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
                    <div className="flex flex-col text-left min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-text-muted font-bold">#</span>
                        <span className="text-sm font-semibold text-white truncate">general</span>
                      </div>
                      <span className="text-[10px] text-text-muted truncate">Company-wide updates</span>
                    </div>
                  </div>

                  {/* Messages stream */}
                  <div className="flex-grow overflow-y-auto py-3 space-y-4 pr-1 scrollbar-hide text-left">
                    {/* Message 1 */}
                    <div className="flex gap-2.5 items-start">
                      <img 
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80" 
                        alt="Alex" 
                        className="w-7 h-7 rounded-full object-cover border border-white/5 shrink-0"
                      />
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-xs text-white">Alex Johnson</span>
                          <span className="text-[9px] text-[#94a3b8]">10:30 AM</span>
                        </div>
                        <p className="text-[11px] text-gray-200 mt-0.5">Hey team! Project update is now live.</p>
                      </div>
                    </div>

                    {/* Message 2 */}
                    <div className="flex gap-2.5 items-start">
                      <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80" 
                        alt="Sarah" 
                        className="w-7 h-7 rounded-full object-cover border border-white/5 shrink-0"
                      />
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-xs text-white">Sarah Wilson</span>
                          <span className="text-[9px] text-[#94a3b8]">10:31 AM</span>
                        </div>
                        <p className="text-[11px] text-gray-200 mt-0.5">Looks amazing! Great work everyone 🚀</p>
                      </div>
                    </div>

                    {/* Message 3 */}
                    <div className="flex gap-2.5 items-start">
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80" 
                        alt="David" 
                        className="w-7 h-7 rounded-full object-cover border border-white/5 shrink-0"
                      />
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-xs text-white">David Brown</span>
                          <span className="text-[9px] text-[#94a3b8]">10:32 AM</span>
                        </div>
                        <p className="text-[11px] text-gray-200 mt-0.5">Excited to see this in production!</p>
                      </div>
                    </div>

                    {/* Message 4 */}
                    <div className="flex gap-2.5 items-start">
                      <img 
                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&h=80&q=80" 
                        alt="Emily" 
                        className="w-7 h-7 rounded-full object-cover border border-white/5 shrink-0"
                      />
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-xs text-white">Emily Davis</span>
                          <span className="text-[9px] text-[#94a3b8]">10:33 AM</span>
                        </div>
                        <p className="text-[11px] text-gray-200 mt-0.5">Can't wait to see this in production! 🔥</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom composer input */}
                  <div className="h-9 rounded-xl bg-[#252d41]/60 border border-white/5 w-full flex items-center justify-between px-3 shrink-0">
                    <span className="text-[11px] text-[#94a3b8]">Type a message...</span>
                    <div className="flex items-center gap-1.5 text-[#94a3b8]">
                      <svg className="w-3.5 h-3.5 hover:text-white transition-colors cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
                      <svg className="w-3.5 h-3.5 hover:text-white transition-colors cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
                      <div className="w-6 h-6 rounded-lg bg-[#8b5cf6] text-white flex items-center justify-center cursor-pointer hover:bg-[#7c3aed] transition-colors">
                        <svg fill="none" height="10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" viewBox="0 0 24 24" width="10" xmlns="http://www.w3.org/2000/svg"><line x1="22" x2="11" y1="2" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Glowing Orbit Rings (Connecting floating badges) */}
            <div className="absolute inset-0 pointer-events-none overflow-visible -z-10">
              <svg className="w-full h-full overflow-visible opacity-50 animate-[spin_120s_linear_infinite]" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Outer Orbit connecting the badges */}
                <ellipse 
                  cx="50" 
                  cy="50" 
                  rx="57" 
                  ry="54" 
                  fill="none" 
                  stroke="#8b5cf6" 
                  strokeWidth="0.3" 
                  strokeDasharray="1.5 1.5"
                  className="opacity-75"
                />
                {/* Inner Orbit for depth */}
                <ellipse 
                  cx="50" 
                  cy="50" 
                  rx="48" 
                  ry="45" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="0.2" 
                  strokeDasharray="3 2"
                  className="opacity-50"
                />
              </svg>
            </div>

            {/* Floating Border Badges */}
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(139,92,246,0.3)] animate-bounce select-none z-20">
              💬
            </div>
            <div className="absolute -right-6 top-1/3 w-12 h-12 bg-[#10b981]/20 border border-[#10b981]/30 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse select-none z-20">
              ⚡
            </div>
            <div className="absolute -bottom-6 left-1/3 w-12 h-12 bg-[#3b82f6]/20 border border-[#3b82f6]/30 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.3)] select-none z-20">
              🛡️
            </div>

            {/* Decorative Glows */}
            <div className="absolute top-1/2 left-0 w-32 h-32 bg-[#6366f1]/20 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#10b981]/20 blur-3xl rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>

          {/* Feature List */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#12121a] border border-[#374151] flex items-center justify-center text-[#6366f1] shrink-0 font-bold text-base">💬</div>
              <div>
                <h3 className="font-semibold text-base text-white">Real-time Messaging</h3>
                <p className="text-[#9ca3af] text-sm">Instant message delivery with WebSocket technology.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#12121a] border border-[#374151] flex items-center justify-center text-[#10b981] shrink-0 font-bold text-base">🔒</div>
              <div>
                <h3 className="font-semibold text-base text-white">Secure & Private</h3>
                <p className="text-[#9ca3af] text-sm">Enterprise-grade security with end-to-end protection.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#12121a] border border-[#374151] flex items-center justify-center text-blue-500 shrink-0 font-bold text-base">👥</div>
              <div>
                <h3 className="font-semibold text-base text-white">Built for Teams</h3>
                <p className="text-[#9ca3af] text-sm">Organize conversations in rooms and collaborate effortlessly.</p>
              </div>
            </div>
          </div>
          <div className="text-[#9ca3af] text-xs mt-8">
            © 2026 SyncStream. All rights reserved.
          </div>
        </section>

        {/* RIGHT COLUMN: Registration Form */}
        <section className="w-full max-w-md mx-auto text-left">
          <div className="bg-[#12121a] border border-[#374151] rounded-3xl p-8 lg:p-10 shadow-2xl animate-fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Create your account</h2>
              <p className="text-sm text-[#9ca3af]">Already have an account? <Link className="text-[#6366f1] hover:underline" to="/login">Log in</Link></p>
            </div>

            {/* Social Logins */}
            <div className="space-y-3 mb-6">
              <button 
                onClick={() => alert("Google OAuth: Redirecting to Google secure authentication flow...")}
                type="button"
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#374151] bg-[#0a0a0f] hover:bg-[#374151]/50 transition-colors text-sm font-semibold cursor-pointer"
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
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#374151] bg-[#0a0a0f] hover:bg-[#374151]/50 transition-colors text-sm font-semibold cursor-pointer"
              >
                <svg aria-hidden="true" className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path>
                </svg>
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#374151]"></div>
              </div>
              <div className="relative bg-[#12121a] px-4 text-xs text-[#9ca3af]">or</div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl mb-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Display Name */}
              <div>
                <label className="block text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-1.5" htmlFor="displayName">Display Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9ca3af]">
                    👤
                  </div>
                  <input 
                    className="w-full bg-[#0a0a0f] border border-[#374151] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#6366f1] focus:border-transparent placeholder-[#9ca3af]/40 text-white outline-none" 
                    id="displayName" 
                    placeholder="John Doe" 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-1.5" htmlFor="username">Username <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9ca3af]">
                    @
                  </div>
                  <input 
                    className="w-full bg-[#0a0a0f] border border-[#374151] rounded-xl py-2.5 pl-10 pr-10 text-sm focus:ring-2 focus:ring-[#6366f1] focus:border-transparent text-white outline-none" 
                    id="username" 
                    placeholder="johndoe"
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  {username.length >= 3 && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#10b981]">
                      ✓
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-[#9ca3af] mt-1">3-30 characters, letters, numbers and underscores only.</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-1.5" htmlFor="email">Email Address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9ca3af]">
                    ✉
                  </div>
                  <input 
                    className="w-full bg-[#0a0a0f] border border-[#374151] rounded-xl py-2.5 pl-10 pr-10 text-sm focus:ring-2 focus:ring-[#6366f1] focus:border-transparent text-white outline-none" 
                    id="email" 
                    type="email" 
                    required
                    placeholder="john.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {email.includes('@') && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#10b981]">
                      ✓
                    </div>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-1.5" htmlFor="password">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9ca3af]">
                    🔒
                  </div>
                  <input 
                    className="w-full bg-[#0a0a0f] border border-[#374151] rounded-xl py-2.5 pl-10 pr-10 text-sm focus:ring-2 focus:ring-[#6366f1] focus:border-transparent text-white outline-none" 
                    id="password" 
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9ca3af] hover:text-[#f3f4f6]" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#9ca3af] mt-1">At least 8 characters with letters, numbers and symbols.</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-1.5" htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></label>
                <div className="relative mb-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9ca3af]">
                    🔒
                  </div>
                  <input 
                    className="w-full bg-[#0a0a0f] border border-[#374151] rounded-xl py-2.5 pl-10 pr-16 text-sm focus:ring-2 focus:ring-[#6366f1] focus:border-transparent text-white outline-none" 
                    id="confirmPassword" 
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                    <button 
                      className="text-[#9ca3af] hover:text-[#f3f4f6]" 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                    {password === confirmPassword && password.length > 0 && (
                      <span className="text-[#10b981] font-semibold text-sm">✓</span>
                    )}
                  </div>
                </div>

                {/* Password Strength Meter */}
                {password.length > 0 && (
                  <div className="space-y-1.5 pt-1.5">
                    <div className="flex gap-1.5 h-1">
                      <div className={`flex-1 rounded ${strength >= 1 ? 'bg-green-500' : 'bg-zinc-800'}`}></div>
                      <div className={`flex-1 rounded ${strength >= 2 ? 'bg-green-500' : 'bg-zinc-800'}`}></div>
                      <div className={`flex-1 rounded ${strength >= 3 ? 'bg-green-500' : 'bg-zinc-800'}`}></div>
                      <div className={`flex-1 rounded ${strength >= 4 ? 'bg-green-500' : 'bg-zinc-800'}`}></div>
                      <div className="flex-1 rounded bg-zinc-800"></div>
                    </div>
                    <p className={`text-[10px] font-semibold text-left ${strength >= 3 ? 'text-green-500' : strength >= 2 ? 'text-yellow-500' : 'text-red-400'}`}>
                      {strengthText} password
                    </p>
                  </div>
                )}
              </div>

              {/* Gender selection for funny avatars */}
              <div>
                <label className="block text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-1.5" htmlFor="gender">Gender <span className="text-[#6366f1]">(For Funny Avatar Assignment)</span></label>
                <select 
                  id="gender" 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-[#374151] rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#6366f1] focus:border-transparent text-white outline-none cursor-pointer"
                >
                  <option value="male">Male ♂</option>
                  <option value="female">Female ♀</option>
                  <option value="other">Secret Agent 🕶️ / Other</option>
                </select>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 mt-6">
                <div className="flex items-center h-5">
                  <input 
                    type="checkbox"
                    id="terms" 
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-5 h-5 rounded bg-[#12121a] border-[#374151] text-[#6366f1] focus:ring-[#6366f1] focus:ring-offset-[#12121a]"
                  />
                </div>
                <div className="text-xs text-[#9ca3af] leading-tight text-left">
                  <label htmlFor="terms">I agree to the <a onClick={(e) => { e.preventDefault(); alert("SyncStream Terms of Service: By registering, you agree to respect our code of conduct and service quotas."); }} className="text-[#6366f1] hover:underline cursor-pointer" href="#terms">Terms of Service</a> and <a onClick={(e) => { e.preventDefault(); alert("SyncStream Privacy Policy: We secure your email and profile configurations natively using JWT and encrypted MongoDB clusters."); }} className="text-[#6366f1] hover:underline cursor-pointer" href="#privacy">Privacy Policy</a></label>
                </div>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-[#6366f1] hover:bg-[#4f46e5] transition-all hover:scale-[1.02] active:scale-[0.98] mt-6 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Registering...' : 'Create Account'}
              </button>

              <div className="text-center text-[10px] text-zinc-500 mt-4 leading-normal">
                By creating an account, you agree to our <a onClick={(e) => { e.preventDefault(); alert("SyncStream Terms of Service: By registering, you agree to respect our code of conduct and service quotas."); }} className="text-zinc-400 hover:underline cursor-pointer" href="#terms">Terms of Service</a><br />and <a onClick={(e) => { e.preventDefault(); alert("SyncStream Privacy Policy: We secure your email and profile configurations natively using JWT and encrypted MongoDB clusters."); }} className="text-zinc-400 hover:underline cursor-pointer" href="#privacy">Privacy Policy</a>.
              </div>
            </form>
          </div>
        </section>

      </main>

    </div>
  );
};

export default RegisterPage;
