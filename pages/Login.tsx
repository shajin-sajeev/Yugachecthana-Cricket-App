
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Phone, User, ArrowRight, Shield } from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../components/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

type AuthMode = 'LOGIN' | 'REGISTER';
type LoginMethod = 'EMAIL' | 'PHONE';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, signInWithPhone, verifyPhoneOtp } = useAuth();
  const supabaseActive = isSupabaseConfigured();

  // State
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [method, setMethod] = useState<LoginMethod>('EMAIL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleGoogleLogin = async () => {
      setLoading(true);
      setError(null);
      try {
          await signInWithGoogle();
          if (!supabaseActive) navigate('/'); // Mock needs manual redirect
      } catch (err: any) {
          setError(err.message);
          setLoading(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
        if (mode === 'REGISTER') {
            await signUp(email, password, fullName, phoneNumber);
            // If supabase, it might require email confirmation
            if (supabaseActive) {
                setInfoMessage("Registration successful! Please check your email for confirmation link.");
            } else {
                navigate('/');
            }
        } else {
            // LOGIN MODE
            if (method === 'EMAIL') {
                await signIn(email, password);
                navigate('/');
            } else {
                // PHONE MODE
                if (!otpSent) {
                    await signInWithPhone(phoneNumber);
                    setOtpSent(true);
                    setInfoMessage("OTP sent to your mobile number. (Mock: 123456)");
                } else {
                    await verifyPhoneOtp(phoneNumber, otp);
                    navigate('/');
                }
            }
        }
    } catch (err: any) {
        setError(err.message || "Authentication failed");
    } finally {
        if (mode === 'LOGIN' && method === 'PHONE' && !otpSent) {
            // Keep loading false only if we just sent OTP, otherwise let verify finish
            setLoading(false);
        } else if (!(mode === 'REGISTER' && supabaseActive)) {
            setLoading(false);
        }
    }
  };

  const handleAdminDemo = async () => {
     try {
         await signIn('admin@yugachethana.com', undefined, UserRole.ADMIN);
         navigate('/');
     } catch(e) { setError("Demo failed"); }
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
          Join the ultimate cricket community
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100 dark:border-gray-700">
          
          {/* Mode Toggle (Login / Register) */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <button 
                className={`flex-1 pb-4 text-center font-medium text-sm border-b-2 transition-colors ${mode === 'LOGIN' ? 'border-cricket-green text-cricket-green dark:text-green-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                onClick={() => { setMode('LOGIN'); setError(null); setInfoMessage(null); }}
              >
                  Sign In
              </button>
              <button 
                className={`flex-1 pb-4 text-center font-medium text-sm border-b-2 transition-colors ${mode === 'REGISTER' ? 'border-cricket-green text-cricket-green dark:text-green-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                onClick={() => { setMode('REGISTER'); setError(null); setInfoMessage(null); }}
              >
                  Create Account
              </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* REGISTER FIELDS */}
            {mode === 'REGISTER' && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="block w-full pl-10 p-2 sm:text-sm border-gray-300 rounded-md border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-cricket-green focus:border-cricket-green"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="tel"
                                required
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="block w-full pl-10 p-2 sm:text-sm border-gray-300 rounded-md border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-cricket-green focus:border-cricket-green"
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>
                </>
            )}

            {/* LOGIN METHOD TOGGLE */}
            {mode === 'LOGIN' && (
                 <div className="flex gap-4 mb-4">
                    <button 
                        type="button"
                        onClick={() => { setMethod('EMAIL'); setError(null); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border ${method === 'EMAIL' ? 'bg-green-50 border-cricket-green text-cricket-green dark:bg-green-900/20 dark:text-green-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                    >
                        Email
                    </button>
                    <button 
                        type="button"
                        onClick={() => { setMethod('PHONE'); setError(null); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border ${method === 'PHONE' ? 'bg-green-50 border-cricket-green text-cricket-green dark:bg-green-900/20 dark:text-green-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                    >
                        Mobile OTP
                    </button>
                 </div>
            )}

            {/* EMAIL / PASSWORD INPUTS */}
            {(mode === 'REGISTER' || (mode === 'LOGIN' && method === 'EMAIL')) && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 p-2 sm:text-sm border-gray-300 rounded-md border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-cricket-green focus:border-cricket-green"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 p-2 sm:text-sm border-gray-300 rounded-md border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-cricket-green focus:border-cricket-green"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                </>
            )}

            {/* PHONE INPUT (LOGIN ONLY) */}
            {mode === 'LOGIN' && method === 'PHONE' && (
                <>
                    {!otpSent ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    required
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="block w-full pl-10 p-2 sm:text-sm border-gray-300 rounded-md border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-cricket-green focus:border-cricket-green"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>
                    ) : (
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">One Time Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="block w-full pl-10 p-2 sm:text-sm border-gray-300 rounded-md border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-cricket-green focus:border-cricket-green tracking-widest"
                                    placeholder="123456"
                                    maxLength={6}
                                />
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setOtpSent(false)} 
                                className="text-xs text-cricket-green mt-2 hover:underline"
                            >
                                Change number
                            </button>
                        </div>
                    )}
                </>
            )}

            {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 animate-in fade-in">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
                        </div>
                    </div>
                </div>
            )}
            
            {infoMessage && (
                <div className="rounded-md bg-blue-50 dark:bg-blue-900/30 p-4 animate-in fade-in">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-blue-400" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">{infoMessage}</h3>
                        </div>
                    </div>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cricket-green hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cricket-green disabled:opacity-50 transition-colors"
            >
                {loading ? 'Processing...' : (
                    mode === 'REGISTER' ? 'Create Account' : 
                    (method === 'PHONE' && !otpSent ? 'Send OTP' : 'Sign In')
                )}
                {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* SOCIAL LOGIN */}
          {mode === 'LOGIN' && (
              <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                        Or continue with
                    </span>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Sign in with Google
                    </button>
                </div>
              </div>
          )}
          
          {/* Demo Admin Link */}
          {!supabaseActive && mode === 'LOGIN' && (
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                  <button onClick={handleAdminDemo} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center justify-center gap-1 mx-auto">
                     <Shield size={12} /> Admin Demo Access
                  </button>
              </div>
          )}

        </div>
      </div>
    </div>
  );
};
