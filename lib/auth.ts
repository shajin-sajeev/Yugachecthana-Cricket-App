
import { UserRole, UserProfile } from '../types';

// Simple mock auth for demonstration until Supabase Auth is fully wired
export const getCurrentUser = (): UserProfile | null => {
  const userStr = localStorage.getItem('currentUser');
  if (!userStr) return null;
  return JSON.parse(userStr);
};

export const loginMock = (email: string, role: UserRole = UserRole.USER): UserProfile => {
  const user: UserProfile = {
    id: 'u123',
    email,
    name: email.split('@')[0],
    role: role,
    avatarUrl: `https://ui-avatars.com/api/?name=${email}&background=random`
  };
  localStorage.setItem('currentUser', JSON.stringify(user));
  return user;
};

export const logoutMock = () => {
  localStorage.removeItem('currentUser');
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === UserRole.ADMIN;
};
