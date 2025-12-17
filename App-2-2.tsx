
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { LiveScoring } from './pages/LiveScoring';
import { PlayerProfile } from './pages/PlayerProfile';
import { TournamentDetail } from './pages/TournamentDetail';
import { UserProfile } from './pages/UserProfile';
import { Matches } from './pages/Matches';
import { Login } from './pages/Login';
import { MatchCentre } from './pages/MatchCentre';
import { AdminPointsConfig } from './pages/AdminPointsConfig';
import { AuthProvider, useAuth } from './components/AuthContext';

// Auth Guard Component
const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const { session, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  return session ? children : <Navigate to="/login" replace />;
};

// Admin Guard Component
const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return isAdmin ? children : <Navigate to="/" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes wrapped in Layout */}
      <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Layout><UserProfile /></Layout></PrivateRoute>} />
      <Route path="/matches" element={<PrivateRoute><Layout><Matches /></Layout></PrivateRoute>} />
      <Route path="/player/:id" element={<PrivateRoute><Layout><PlayerProfile /></Layout></PrivateRoute>} />
      <Route path="/tournaments" element={<PrivateRoute><Layout><TournamentDetail /></Layout></PrivateRoute>} />
      <Route path="/match/:id" element={<PrivateRoute><Layout><MatchCentre /></Layout></PrivateRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin/points" element={
          <AdminRoute>
              <Layout><AdminPointsConfig /></Layout>
          </AdminRoute>
      } />
      
      {/* Full screen routes (No Layout) */}
      <Route path="/match/:id/live" element={
        <AdminRoute>
           <LiveScoring />
        </AdminRoute>
      } />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
