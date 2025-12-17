
import React from 'react';
import { LayoutDashboard, Gamepad2, Users, Trophy, User, LogOut, Menu, X, Moon, Sun, Settings, ShieldCheck, Shield } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, signOut, isAdmin, club } = useAuth();

  // Dark Mode Logic - Default to Dark
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme === 'dark';
    }
    // Default to dark mode if no preference is found
    return true;
  });

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Matches', icon: Gamepad2, path: '/matches' },
    { label: 'Tournaments', icon: Trophy, path: '/tournaments' },
    // Show 'My Club' if part of one, or 'Create Club' if not (but handled by same page)
    { label: club ? 'My Club' : 'Create Club', icon: Shield, path: '/club' },
    { label: 'Match Teams', icon: Users, path: '/teams' },
    { label: 'My Profile', icon: User, path: '/profile' },
  ];

  // Admin Only Items
  if (isAdmin) {
    navItems.push({ label: 'Points Config', icon: ShieldCheck, path: '/admin/points' });
  }

  const handleNav = (path: string) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-200 text-gray-900 dark:text-gray-100">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-cricket-green dark:bg-gray-800 text-white transition-transform duration-300 ease-in-out border-r border-white/10 dark:border-gray-700
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-white/10 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Yugachethana</h1>
              <p className="text-xs text-white/60 uppercase tracking-widest mt-1">Cricket Club</p>
            </div>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <div className="px-6 py-4">
             <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                <img src={userProfile?.avatarUrl || "https://ui-avatars.com/api/?name=User"} alt="Profile" className="w-10 h-10 rounded-full border border-white/20" />
                <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">{userProfile?.name || 'Guest'}</p>
                    <p className="text-[10px] uppercase tracking-wider opacity-70 border border-white/20 px-1.5 rounded inline-block">
                        {userProfile?.role || 'Viewer'}
                    </p>
                </div>
             </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive(item.path) 
                    ? 'bg-white text-cricket-green dark:bg-gray-700 dark:text-white shadow-lg font-semibold' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white dark:hover:bg-gray-700'}
                `}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10 dark:border-gray-700 space-y-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 lg:hidden px-4 py-3 flex items-center justify-between transition-colors duration-200">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 dark:text-gray-300">
            <Menu size={24} />
          </button>
          <span className="font-bold text-cricket-green dark:text-white">Yugachethana CC</span>
          <div className="flex items-center gap-3">
             <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-gray-600 dark:text-gray-300">
               {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600">
               <img src={userProfile?.avatarUrl || "https://ui-avatars.com/api/?name=User"} alt="Profile" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-2 flex justify-between items-center z-30 pb-safe transition-colors duration-200">
          {navItems.slice(0, 4).map((item) => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive(item.path) ? 'text-cricket-green dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
              <item.icon size={24} strokeWidth={isActive(item.path) ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};
