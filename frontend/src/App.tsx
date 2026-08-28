import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layout wrappers
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';

// Page components
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import RoomsPage from './pages/RoomsPage';
import RoomChatPage from './pages/RoomChatPage';
import ProfilePage from './pages/ProfilePage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col justify-center items-center gap-4">
        <div className="w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-[#94A3B8]">Resuming your session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Unauthenticated routes inside PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        
        {/* Authenticated routes inside AppLayout sharing SocketProvider */}
        <Route element={
          <ProtectedRoute>
            <SocketProvider>
              <AppLayout />
            </SocketProvider>
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:roomId" element={<RoomChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') || 'default';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
