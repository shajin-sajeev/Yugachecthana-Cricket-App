
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
import { getCurrentUser, isAdmin } from './lib/auth';

// Auth Guard Component
const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const user = getCurrentUser();
  return user ? children : <Navigate to="/login" replace />;
};

// Admin Guard Component
const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  return isAdmin() ? children : <Navigate to="/" replace />;
};

const App: React.FC = () => {
  return (
    <Router>
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
        <Route path="/match/:id/live" element={<PrivateRoute><LiveScoring /></PrivateRoute>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
