
import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { UserRole, UserProfile } from '../types';
import { Shield, MapPin, Users, Save, CheckCircle, ShieldAlert } from 'lucide-react';

export const ClubManagement: React.FC = () => {
  const { userProfile, club, createClub, isSuperAdmin, updateUserRole } = useAuth();
  
  // Creation State
  const [clubName, setClubName] = useState('');
  const [location, setLocation] = useState('');

  // Management State (Mock Users for Demo)
  const [members, setMembers] = useState<UserProfile[]>([
      { id: '1', name: 'Arun Kumar', email: 'arun@example.com', role: UserRole.USER, avatarUrl: 'https://ui-avatars.com/api/?name=Arun+Kumar' },
      { id: '2', name: 'Deepak S', email: 'deepak@example.com', role: UserRole.ADMIN, avatarUrl: 'https://ui-avatars.com/api/?name=Deepak+S' },
      { id: '3', name: 'Karthik R', email: 'karthik@example.com', role: UserRole.USER, avatarUrl: 'https://ui-avatars.com/api/?name=Karthik+R' },
  ]);

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (clubName && location) {
          await createClub(clubName, location);
      }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
      // Update local state for demo
      setMembers(members.map(m => m.id === userId ? { ...m, role: newRole } : m));
      // Call context to persist
      await updateUserRole(userId, newRole);
  };

  if (!userProfile) return null;

  // --- VIEW 1: CREATE CLUB ---
  if (!club) {
      return (
          <div className="max-w-2xl mx-auto py-10 px-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-cricket-green p-6 text-center text-white">
                      <Shield size={48} className="mx-auto mb-4 opacity-80" />
                      <h2 className="text-2xl font-bold">Create Your Cricket Club</h2>
                      <p className="opacity-80 mt-2">Start your journey as a Super Admin.</p>
                  </div>
                  
                  <form onSubmit={handleCreate} className="p-8 space-y-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Club Name</label>
                          <input 
                              type="text" 
                              required
                              value={clubName}
                              onChange={(e) => setClubName(e.target.value)}
                              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cricket-green outline-none"
                              placeholder="e.g. Bangalore Strikers CC"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location / Base</label>
                          <div className="relative">
                              <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                              <input 
                                  type="text" 
                                  required
                                  value={location}
                                  onChange={(e) => setLocation(e.target.value)}
                                  className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cricket-green outline-none"
                                  placeholder="e.g. Bangalore, Karnataka"
                              />
                          </div>
                      </div>

                      <button 
                          type="submit"
                          className="w-full bg-cricket-green text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-800 transition-colors flex justify-center items-center gap-2"
                      >
                          <Save size={20} /> Create Club
                      </button>
                  </form>
              </div>
          </div>
      );
  }

  // --- VIEW 2: MANAGE CLUB ---
  return (
      <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Shield className="text-cricket-green dark:text-green-400" />
                      {club.name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><MapPin size={14} /> {club.location}</span>
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-mono">Code: {club.code}</span>
                  </div>
              </div>
              {isSuperAdmin && (
                  <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                      <ShieldAlert size={16} /> Super Admin View
                  </div>
              )}
          </div>

          {/* Members List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Users size={18} /> Club Members
                  </h3>
                  <button className="text-sm text-cricket-green font-bold hover:underline">+ Invite Member</button>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {/* Current User Row */}
                  <div className="p-4 flex items-center justify-between bg-green-50 dark:bg-green-900/10">
                      <div className="flex items-center gap-3">
                          <img src={userProfile.avatarUrl} alt="Me" className="w-10 h-10 rounded-full" />
                          <div>
                              <div className="font-bold text-gray-900 dark:text-white">{userProfile.name} (You)</div>
                              <div className="text-xs text-gray-500">{userProfile.email}</div>
                          </div>
                      </div>
                      <span className="px-3 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-100 text-xs font-bold rounded-full uppercase">
                          {userProfile.role}
                      </span>
                  </div>

                  {/* Other Members */}
                  {members.map((member) => (
                      <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="flex items-center gap-3">
                              <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full" />
                              <div>
                                  <div className="font-bold text-gray-900 dark:text-white">{member.name}</div>
                                  <div className="text-xs text-gray-500">{member.email}</div>
                              </div>
                          </div>
                          
                          {isSuperAdmin ? (
                              <div className="flex items-center gap-2">
                                  <select 
                                      value={member.role}
                                      onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                                      className="text-xs border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-1.5 focus:ring-cricket-green"
                                  >
                                      <option value={UserRole.USER}>User</option>
                                      <option value={UserRole.SCORER}>Scorer</option>
                                      <option value={UserRole.ADMIN}>Admin</option>
                                  </select>
                              </div>
                          ) : (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded">
                                  {member.role}
                              </span>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );
};
