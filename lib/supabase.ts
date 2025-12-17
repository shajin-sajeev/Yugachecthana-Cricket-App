import { createClient } from '@supabase/supabase-js';

// Access environment variables securely
// In a real Vite environment, these would be import.meta.env.VITE_SUPABASE_URL
// For this demo, we provide a placeholder. If these are missing, the app will fall back to mock mode.
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isSupabaseConfigured = () => !!supabase;
