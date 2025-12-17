
import React, { useState } from 'react';
import { Camera, Mail, Phone, MapPin, Award, Edit2, Save, Share2, TrendingUp, Trophy, Calendar, Shield, Settings, ChevronRight, X } from 'lucide-react';
import { PlayerRole } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';

type TabType = 'OVERVIEW' | 'BATTING' | 'BOWLING' | 'FIELDING' | 'MATCHES';

export const UserProfile: React.FC = () => {
  const { userProfile, club, isAdmin, isSuperAdmin, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');

  // Form State
  const [formData, setFormData] = useState({
      name: '',
      phone: '',
      location: '',
      primaryRole: PlayerRole.ALL_ROUNDER,
      battingStyle: '',
      bowlingStyle: '',
      bio: ''
  });

  React.useEffect(() => {
      if (userProfile) {
          setFormData({
              name: userProfile.name,
              phone: userProfile.phone || '',
              location: userProfile.location || '',
              primaryRole: userProfile.primaryRole || PlayerRole.ALL_ROUNDER,
              battingStyle: userProfile.battingStyle || 'Right-hand bat',
              bowlingStyle: userProfile.bowlingStyle || 'Right-arm medium',
              bio: userProfile.bio || ''
          });
      }
  }, [userProfile]);

  const handleSave = async () => {
      await updateProfile(formData);
      setIsEditing(false);
  };

  // Mock User Data Extension (Merge with context later)
  const userStats = {
    matches: 24,
    runs: 856,
    avg: 42.8,
    wickets: 12,
    mvpPoints: 1250,
    highestScore: '113*',
    strikeRate: 145.2,
    centuries: 2,
    fifties: 6
  };

  const battingData = [
    { match: 'M1', runs: 45 },
    { match: 'M2', runs: 82 },
    { match: 'M3', runs: 12 },
    { match: 'M4', runs: 104 },
    { match: 'M5', runs: 33 },
    { match: 'M6', runs: 0 },
    { match: 'M7', runs: 56 },
  ];

  const dismissalData = [
    { name: 'Caught', value: 14 },
    { name: 'Bowled', value: 5 },
    { name: 'LBW', value: 3 },
    { name: 'Run Out', value: 2 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'OVERVIEW':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
             {/* Bio Section if exists */}
             {(userProfile?.bio || isEditing) && (
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                     <h3 className="font-bold text-gray-900 dark:text-white mb-2">About</h3>
                     {isEditing ? (
                         <textarea 
                            value={formData.bio}
                            onChange={e => setFormData({...formData, bio: e.target.value})}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm"
                            rows={3}
                            placeholder="Tell us about your cricket journey..."
                         />
                     ) : (
                         <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{userProfile?.bio || "No bio added yet."}</p>
                     )}
                 </div>
             )}

             {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                { label: 'Matches', value: userStats.matches, icon: Calendar, color: 'text-blue-500' },
                { label: 'Runs', value: userStats.runs, icon: TrendingUp, color: 'text-orange-500' },
                { label: 'Batting Avg', value: userStats.avg, icon: Award, color: 'text-purple-500' },
                { label: 'MVP Points', value: userStats.mvpPoints, icon: Trophy, color: 'text-gold' },
                ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center transition-colors">
                    <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
                </div>
                ))}
            </div>

            {/* Recent Form Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <TrendingUp size={20} className="text-cricket-green dark:text-green-400" /> 
                    Run Scoring Trend
                </h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={battingData}>
                        <XAxis dataKey="match" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{
                                borderRadius: '8px', 
                                border: 'none', 
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                backgroundColor: '#fff',
                                color: '#000'
                            }} 
                        />
                        <Bar dataKey="runs" radius={[4, 4, 0, 0]}>
                        {battingData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.runs >= 50 ? '#FFD700' : '#2D5016'} />
                        ))}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
          </div>
        );
      
      case 'BATTING':
        return (
          <div className="grid md:grid-cols-2 gap-6 animate-in fade-in duration-300">
             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                 <h3 className="font-bold text-gray-900 dark:text-white mb-4">Batting Career Stats</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">Total Runs</span>
                        <span className="font-bold text-gray-900 dark:text-white">{userStats.runs}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">Highest Score</span>
                        <span className="font-bold text-gray-900 dark:text-white">{userStats.highestScore}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">Average</span>
                        <span className="font-bold text-gray-900 dark:text-white">{userStats.avg}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">Strike Rate</span>
                        <span className="font-bold text-gray-900 dark:text-white">{userStats.strikeRate}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">100s / 50s</span>
                        <span className="font-bold text-gray-900 dark:text-white">{userStats.centuries} / {userStats.fifties}</span>
                    </div>
                 </div>
             </div>
             
             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                 <h3 className="font-bold text-gray-900 dark:text-white mb-4">Dismissal Analysis</h3>
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={dismissalData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {dismissalData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                 </div>
             </div>
          </div>
        );

      case 'MATCHES':
          return (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in duration-300">
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {[1, 2, 3, 4, 5].map((_, i) => (
                          <div key={i} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex justify-between items-center">
                              <div>
                                  <div className="font-bold text-gray-900 dark:text-white mb-1">vs Titans <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">24 Oct, 2024</span></div>
                                  <div className="text-sm text-gray-600 dark:text-gray-300">Scored <span className="font-bold text-cricket-green dark:text-green-400">45 (32)</span> and took <span className="font-bold">1/24</span></div>
                              </div>
                              <div className="text-right">
                                  <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded font-bold">WON</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          );

      default:
        return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Coming Soon</div>;
    }
  };

  if (!userProfile) return <div>Loading Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Edit Profile' : 'My Profile'}</h2>
        <div className="flex gap-2">
            {!isEditing && (
                <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Share2 size={18} />
                    <span className="hidden sm:inline">Share</span>
                </button>
            )}
            <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cricket-green text-white rounded-lg hover:bg-green-900 transition-colors"
            >
                {isEditing ? <Save size={18} /> : <Edit2 size={18} />}
                <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
            </button>
            {isEditing && (
                <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    <X size={18} />
                </button>
            )}
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="h-32 bg-gradient-to-r from-cricket-green to-sky-blue relative">
          <div className="absolute -bottom-12 left-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <img src={userProfile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <button className="absolute bottom-0 right-0 bg-gray-900 text-white p-1.5 rounded-full border-2 border-white dark:border-gray-800 hover:bg-gray-700">
                <Camera size={14} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-16 px-6 sm:px-8 pb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                {isEditing ? (
                  <div className="space-y-3">
                      <div>
                          <label className="text-xs text-gray-500 uppercase font-bold">Full Name</label>
                          <input 
                            type="text" 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          <div>
                              <label className="text-xs text-gray-500 uppercase font-bold">Role</label>
                              <select 
                                value={formData.primaryRole}
                                onChange={e => setFormData({...formData, primaryRole: e.target.value as PlayerRole})}
                                className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              >
                                  {Object.values(PlayerRole).map(role => (
                                      <option key={role} value={role}>{role}</option>
                                  ))}
                              </select>
                          </div>
                          <div>
                              <label className="text-xs text-gray-500 uppercase font-bold">Location</label>
                              <input 
                                type="text" 
                                value={formData.location} 
                                onChange={e => setFormData({...formData, location: e.target.value})}
                                className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                placeholder="City"
                              />
                          </div>
                      </div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{userProfile.name}</div>
                    <div className="mt-1 flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                            {userProfile.primaryRole || userProfile.role}
                        </span>
                        {userProfile.location && (
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium flex items-center gap-1">
                                <MapPin size={12} /> {userProfile.location}
                            </span>
                        )}
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex flex-col gap-2 text-sm">
                 <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                   <Mail size={16} className="text-gray-400" />
                   <span>{userProfile.email}</span>
                 </div>
                 {isEditing ? (
                     <div className="flex items-center gap-2">
                         <Phone size={16} className="text-gray-400" />
                         <input 
                            type="text" 
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                            className="p-1 border rounded dark:bg-gray-700 dark:text-white"
                            placeholder="Phone Number"
                         />
                     </div>
                 ) : (
                     userProfile.phone && (
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                            <Phone size={16} className="text-gray-400" />
                            <span>{userProfile.phone}</span>
                        </div>
                     )
                 )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Club Widget */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  {club ? (
                      <div className="flex justify-between items-center">
                          <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Current Club</div>
                              <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                  <Shield size={16} className="text-cricket-green" />
                                  {club.name}
                              </div>
                          </div>
                          {(isAdmin || isSuperAdmin) && (
                              <button onClick={() => navigate('/club')} className="p-2 bg-white dark:bg-gray-600 rounded-full hover:shadow transition-shadow">
                                  <Settings size={16} className="text-gray-600 dark:text-gray-300" />
                              </button>
                          )}
                      </div>
                  ) : (
                      <div className="flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 p-2 -m-2 rounded-lg transition-colors" onClick={() => navigate('/club')}>
                          <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">No Club</div>
                              <div className="font-bold text-cricket-green dark:text-green-400">Create or Join a Club</div>
                          </div>
                          <ChevronRight size={16} className="text-gray-400" />
                      </div>
                  )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Batting Style</div>
                  {isEditing ? (
                      <select 
                        value={formData.battingStyle}
                        onChange={e => setFormData({...formData, battingStyle: e.target.value})}
                        className="w-full text-xs p-1 rounded dark:bg-gray-600 dark:text-white"
                      >
                          <option>Right-hand bat</option>
                          <option>Left-hand bat</option>
                      </select>
                  ) : (
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">{userProfile.battingStyle || 'Right-hand bat'}</div>
                  )}
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bowling Style</div>
                  {isEditing ? (
                      <select 
                        value={formData.bowlingStyle}
                        onChange={e => setFormData({...formData, bowlingStyle: e.target.value})}
                        className="w-full text-xs p-1 rounded dark:bg-gray-600 dark:text-white"
                      >
                          <option>Right-arm medium</option>
                          <option>Right-arm fast</option>
                          <option>Right-arm offbreak</option>
                          <option>Right-arm legbreak</option>
                          <option>Left-arm fast</option>
                          <option>Left-arm orthodox</option>
                      </select>
                  ) : (
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">{userProfile.bowlingStyle || 'Right-arm medium'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 sm:px-8 border-t border-gray-100 dark:border-gray-700">
            <div className="flex overflow-x-auto no-scrollbar gap-6">
                {(['OVERVIEW', 'BATTING', 'BOWLING', 'FIELDING', 'MATCHES'] as TabType[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === tab 
                            ? 'border-cricket-green text-cricket-green dark:border-green-400 dark:text-green-400' 
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                    >
                        {tab.charAt(0) + tab.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Tab Content Area */}
      {renderTabContent()}

    </div>
  );
};
