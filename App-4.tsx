
import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { AppRoutes } from './AppRoutes';

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
