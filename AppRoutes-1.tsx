
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import { Teams } from './pages/Teams';
import { CreateTeam } from './pages/CreateTeam';
import { Tournaments } from './pages/Tournaments';
import { CreateTournament } from './pages/CreateTournament';
import { CreateMatch } from './pages/CreateMatch';
import { MatchSetup } from './pages/MatchSetup';
import { useAuth } from './components/AuthContext';

// Auth Guard Component
const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const { session, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900 dark:text-white">Loading...</div>;
  
  return session ? children : <Navigate to="/login" replace />;
};

// Admin Guard Component
const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900 dark:text-white">Loading...</div>;

  return isAdmin ? children : <Navigate to="/" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes wrapped in Layout */}
      <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Layout><UserProfile /></Layout></PrivateRoute>} />
      <Route path="/player/:id" element={<PrivateRoute><Layout><PlayerProfile /></Layout></PrivateRoute>} />
      
      {/* Matches */}
      <Route path="/matches" element={<PrivateRoute><Layout><Matches /></Layout></PrivateRoute>} />
      <Route path="/matches/new" element={<AdminRoute><Layout><CreateMatch /></Layout></AdminRoute>} />
      <Route path="/match/:id" element={<PrivateRoute><Layout><MatchCentre /></Layout></PrivateRoute>} />
      
      {/* Match Setup Flow (New) */}
      <Route path="/match/:id/setup" element={<AdminRoute><Layout><MatchSetup /></Layout></AdminRoute>} />
      
      {/* Tournaments */}
      <Route path="/tournaments" element={<PrivateRoute><Layout><Tournaments /></Layout></PrivateRoute>} />
      <Route path="/tournaments/new" element={<AdminRoute><Layout><CreateTournament /></Layout></AdminRoute>} />
      <Route path="/tournaments/:id" element={<PrivateRoute><Layout><TournamentDetail /></Layout></PrivateRoute>} />
      
      {/* Teams */}
      <Route path="/teams" element={<PrivateRoute><Layout><Teams /></Layout></PrivateRoute>} />
      <Route path="/teams/new" element={<AdminRoute><Layout><CreateTeam /></Layout></AdminRoute>} />
      <Route path="/teams/:id" element={<PrivateRoute><Layout><div className="p-8 text-center text-gray-500">Team Detail Coming Soon</div></Layout></PrivateRoute>} />

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
