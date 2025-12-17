import React from 'react';
import { Calendar, Trophy, Activity, ArrowRight, PlayCircle, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MatchStatus, MatchFormat } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const mockLiveMatch = {
    id: 'm123',
    teamA: 'Royals',
    teamB: 'Titans',
    scoreA: '142/3 (14.2)',
    scoreB: 'Yet to bat',
    status: 'Live',
    format: 'T20'
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, Rahul</h2>
          <p className="text-gray-500 dark:text-gray-400">Here's what's happening on the field today.</p>
        </div>
        <button className="hidden sm:flex items-center gap-2 text-cricket-green dark:text-green-400 font-medium hover:underline">
          View all notifications
        </button>
      </div>

      {/* Hero Card - Live Match */}
      <div className="bg-gradient-to-br from-cricket-green to-cricket-light rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <span className="bg-red-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full"></span> Live
          </span>
          <span className="text-white/80 text-sm font-mono">{mockLiveMatch.format} Match</span>
        </div>

        <div className="flex justify-between items-center relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-cricket-green font-bold text-xl shadow-lg mx-auto mb-2 border-4 border-white/20">
              ROY
            </div>
            <h3 className="font-bold text-lg">Royals</h3>
          </div>

          <div className="text-center px-4">
            <div className="text-4xl font-mono font-bold mb-1">142/3</div>
            <div className="text-sm text-white/80 mb-4">Overs: 14.2</div>
            <button 
              onClick={() => navigate(`/match/${mockLiveMatch.id}/live`)}
              className="bg-gold text-cricket-green px-6 py-2 rounded-full font-bold shadow-lg hover:bg-yellow-400 transition-transform active:scale-95 flex items-center gap-2 mx-auto"
            >
              <PlayCircle size={18} /> Resume Scoring
            </button>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-cricket-green font-bold text-xl shadow-lg mx-auto mb-2 border-4 border-white/20">
              TIT
            </div>
            <h3 className="font-bold text-lg">Titans</h3>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-sm text-white/70 relative z-10">
          Kohli 45*(32) • Sharma 12*(8) | Bumrah 2/24 (3.2)
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Matches', value: '24', icon: Calendar, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
          { label: 'Wins', value: '18', icon: Trophy, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
          { label: 'Runs Scored', value: '4,230', icon: Activity, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
          { label: 'Avg MVP Pts', value: '125', icon: BarChart3, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon size={20} />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Matches */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 dark:text-white">Recent Results</h3>
          <button className="text-sm text-cricket-green dark:text-green-400 hover:underline">View All</button>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
              <div className="flex justify-between items-center">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <div className="flex items-center gap-3 w-32">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Thunder</span>
                  </div>
                  <div className="flex flex-col items-center justify-center w-24">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">VS</span>
                    <span className="text-xs font-bold text-cricket-green dark:text-green-400">RESULT</span>
                  </div>
                  <div className="flex items-center gap-3 w-32">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Strikers</span>
                  </div>
                </div>
                <ArrowRight size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-cricket-green dark:group-hover:text-green-400 transition-colors" />
              </div>
              <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Thunder won by 24 runs • Man of the Match: R. Sharma
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};