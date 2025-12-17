import React from 'react';
import { useParams } from 'react-router-dom';
import { Trophy, Award, TrendingUp, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const PlayerProfile: React.FC = () => {
  const { id } = useParams();

  // Mock Data
  const player = {
    name: 'Virat Kohli',
    role: 'Top-order Batsman',
    team: 'Royals',
    matches: 124,
    runs: 4502,
    avg: 52.3,
    sr: 138.5,
    mvpPoints: 2450,
  };

  const chartData = [
    { match: 'M1', runs: 45 },
    { match: 'M2', runs: 82 },
    { match: 'M3', runs: 12 },
    { match: 'M4', runs: 104 },
    { match: 'M5', runs: 33 },
    { match: 'M6', runs: 76 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col md:flex-row gap-6 items-center md:items-start transition-colors">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-600 shadow-lg overflow-hidden">
            <img src={`https://picsum.photos/seed/${id}/200`} alt={player.name} className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-gold text-cricket-green text-xs font-bold px-3 py-1 rounded-full shadow-md border border-white dark:border-gray-800 flex items-center gap-1">
            <Award size={12} /> MVP
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{player.name}</h1>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium">{player.role}</span>
            <span className="px-3 py-1 bg-cricket-green/10 dark:bg-green-900/30 text-cricket-green dark:text-green-400 rounded-full text-sm font-medium flex items-center gap-1">
              <MapPin size={12} /> Bangalore
            </span>
          </div>
          
          <div className="flex gap-6 mt-4 justify-center md:justify-start">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{player.matches}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Matches</div>
            </div>
            <div className="text-center border-l border-gray-200 dark:border-gray-700 pl-6">
              <div className="text-2xl font-bold text-cricket-green dark:text-green-400">{player.runs}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Runs</div>
            </div>
            <div className="text-center border-l border-gray-200 dark:border-gray-700 pl-6">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{player.avg}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Average</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 rounded-xl min-w-[150px] text-center shadow-lg">
            <div className="flex justify-center mb-1 text-gold"><Trophy size={24} /></div>
            <div className="text-2xl font-bold">{player.mvpPoints}</div>
            <div className="text-xs text-white/60">Career MVP Points</div>
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
           <h3 className="font-bold text-gray-900 dark:text-white mb-4">Batting Career</h3>
           <div className="space-y-4">
              {[
                { label: 'Strike Rate', value: '138.5', bar: '80%' },
                { label: 'Highest Score', value: '113*', bar: '95%' },
                { label: 'Centuries', value: '5', bar: '30%' },
                { label: 'Fifties', value: '34', bar: '65%' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">{stat.label}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{stat.value}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-cricket-green dark:bg-green-500 rounded-full" style={{width: stat.bar}}></div>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};