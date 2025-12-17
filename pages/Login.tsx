
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Shield, User, Wifi, WifiOff } from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../components/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const supabaseActive = isSupabaseConfigured();

  const handleQuickLogin = async (role: UserRole) => {
    if (supabaseActive) {
        setError("Quick login is disabled when connected to Supabase. Please use email/password.");
        return;
    }
    try {
        await signIn(role === UserRole.ADMIN ? 'admin@yugachethana.com' : 'user@example.com', undefined, role);
        navigate('/');
    } catch (err: any) {
        setError(err.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
        await signIn(email, password);
        navigate('/');
    } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to sign in");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-16 h-16 bg-cricket-green rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4">
            YC
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Yugachethana CC
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Comprehensive Cricket Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100 dark:border-gray-700">
          
          <div className="mb-6 flex justify-center">
             <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${supabaseActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                {supabaseActive ? <Wifi size={12} /> : <WifiOff size={12} />}
                {supabaseActive ? 'Connected to Database' : 'Offline / Demo Mode'}
             </div>
          </div>

          {!supabaseActive && (
            <div className="mb-6 grid grid-cols-2 gap-3">
                <button 
                    onClick={() => handleQuickLogin(UserRole.ADMIN)}
                    className="flex items-center justify-center gap-2 py-2 px-4 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                    <Shield size={16} /> Admin Demo
                </button>
                <button 
                    onClick={() => handleQuickLogin(UserRole.USER)}
                    className="flex items-center justify-center gap-2 py-2 px-4 border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                    <User size={16} /> User Demo
                </button>
            </div>
          )}

          <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                    {supabaseActive ? 'Sign in with your account' : 'Or sign in with email'}
                </span>
              </div>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-cricket-green focus:border-cricket-green dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required={supabaseActive}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-cricket-green focus:border-cricket-green dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
                  placeholder={supabaseActive ? "••••••••" : "Optional in Demo Mode"}
                />
              </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
                        </div>
                    </div>
                </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cricket-green hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cricket-green disabled:opacity-50 transition-colors"
              >
                {loading ? 'Processing...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
