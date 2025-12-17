
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Award, TrendingUp, MapPin, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Player, Team } from '../types';

export const PlayerProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const loadPlayer = () => {
          // 1. Check Mock Data or Local Storage for Teams
          const savedTeams = JSON.parse(localStorage.getItem('yugachethana_teams') || '[]');
          
          let foundPlayer: Player | undefined;
          let foundTeam: Team | undefined;

          // Search in all teams
          for (const t of savedTeams) {
              const p = t.players.find((pl: Player) => pl.id === id);
              if (p) {
                  foundPlayer = p;
                  foundTeam = t;
                  break;
              }
          }

          if (foundPlayer) {
              setPlayer(foundPlayer);
              setTeam(foundTeam || null);
          } else {
              // Fallback Mock for testing direct route /player/123
              if (id === '123' || id === 'mock') {
                  setPlayer({
                      id: '123',
                      name: 'Virat Kohli (Mock)',
                      role: 'Batsman' as any,
                      battingStyle: 'Right-hand bat',
                      bowlingStyle: 'Right-arm medium',
                      matches: 254,
                      runs: 12040,
                      wickets: 4,
                      avatarUrl: 'https://ui-avatars.com/api/?name=Virat+Kohli&background=random',
                      mvpPoints: 5400
                  });
              }
          }
          setLoading(false);
      };

      loadPlayer();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!player) return <div className="p-8 text-center text-red-500">Player not found</div>;

  // Mock Stats Data for visualization (since we don't have full match history for every player in LS yet)
  const chartData = [
    { match: 'M1', runs: Math.floor(Math.random() * 100) },
    { match: 'M2', runs: Math.floor(Math.random() * 100) },
    { match: 'M3', runs: Math.floor(Math.random() * 100) },
    { match: 'M4', runs: Math.floor(Math.random() * 100) },
    { match: 'M5', runs: Math.floor(Math.random() * 100) },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft size={20} /> Back
      </button>

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col md:flex-row gap-6 items-center md:items-start transition-colors relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cricket-green/5 rounded-bl-full -mr-10 -mt-10"></div>

        <div className="relative z-10">
          <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-600 shadow-lg overflow-hidden">
            <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
          </div>
          {player.mvpPoints > 1000 && (
            <div className="absolute -bottom-2 -right-2 bg-gold text-cricket-green text-xs font-bold px-3 py-1 rounded-full shadow-md border border-white dark:border-gray-800 flex items-center gap-1">
                <Award size={12} /> MVP
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-2 z-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{player.name}</h1>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium">{player.role}</span>
            {team && (
                <span className="px-3 py-1 bg-cricket-green/10 dark:bg-green-900/30 text-cricket-green dark:text-green-400 rounded-full text-sm font-medium flex items-center gap-1">
                <MapPin size={12} /> {team.name}
                </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <div>
                  <span className="block text-xs uppercase text-gray-400 font-bold">Batting Style</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{player.battingStyle || 'Right-hand bat'}</span>
              </div>
              <div>
                  <span className="block text-xs uppercase text-gray-400 font-bold">Bowling Style</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{player.bowlingStyle || 'Right-arm medium'}</span>
              </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 rounded-xl min-w-[150px] text-center shadow-lg z-10">
            <div className="flex justify-center mb-1 text-gold"><Trophy size={24} /></div>
            <div className="text-2xl font-bold">{player.mvpPoints || 0}</div>
            <div className="text-xs text-white/60">Career Points</div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-cricket-green dark:text-green-400" /> Recent Form
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="match" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      backgroundColor: '#fff',
                      color: '#000'
                  }} 
                />
                <Bar dataKey="runs" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.runs >= 50 ? '#FFD700' : '#2D5016'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
           <h3 className="font-bold text-gray-900 dark:text-white mb-4">Career Summary</h3>
           <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Matches Played</span>
                  <span className="font-bold text-gray-900 dark:text-white text-lg">{player.matches || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Total Runs</span>
                  <span className="font-bold text-gray-900 dark:text-white text-lg">{player.runs || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Total Wickets</span>
                  <span className="font-bold text-gray-900 dark:text-white text-lg">{player.wickets || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Batting Average</span>
                  <span className="font-bold text-gray-900 dark:text-white text-lg">{(player.runs / (player.matches || 1)).toFixed(2)}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
