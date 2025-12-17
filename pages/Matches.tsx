
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, ChevronRight, Plus, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MatchStatus, MatchFormat } from '../types';
import { useAuth } from '../components/AuthContext';

export const Matches: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [filter, setFilter] = useState<MatchStatus | 'ALL'>('ALL');
  const [matchList, setMatchList] = useState<any[]>([]);

  // Mock Matches Data - IDs must match those handled in MatchCentre
  const mocks = [
    {
      id: 'm123',
      teamA: 'Royals',
      teamB: 'Titans',
      scoreA: '142/3 (14.2)',
      scoreB: 'Yet to bat',
      status: MatchStatus.LIVE,
      format: MatchFormat.T20,
      date: 'Today',
      venue: 'Chinnaswamy Stadium, Bangalore',
      result: 'Match in Progress'
    },
    {
      id: 'm124',
      teamA: 'Super Kings',
      teamB: 'Capitals',
      scoreA: '',
      scoreB: '',
      status: MatchStatus.UPCOMING,
      format: MatchFormat.ODI,
      date: 'Tomorrow, 10:00 AM',
      venue: 'KSCA Ground, Alur',
      result: 'Upcoming'
    },
    {
      id: 'm122',
      teamA: 'Thunder',
      teamB: 'Strikers',
      scoreA: '185/6 (20)',
      scoreB: '161/9 (20)',
      status: MatchStatus.COMPLETED,
      format: MatchFormat.T20,
      date: 'Yesterday',
      venue: 'Central College Ground',
      result: 'Thunder won by 24 runs'
    }
  ];

  useEffect(() => {
    const savedMatches = localStorage.getItem('yugachethana_matches');
    if (savedMatches) {
        setMatchList([...JSON.parse(savedMatches), ...mocks]);
    } else {
        setMatchList(mocks);
    }
  }, []);

  const filteredMatches = filter === 'ALL' 
    ? matchList 
    : matchList.filter(m => m.status === filter);

  const getStatusColor = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.LIVE: return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case MatchStatus.UPCOMING: return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case MatchStatus.COMPLETED: return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleMatchClick = (match: any) => {
      // In a real app, clicking 'Live' might go to the Scorer view if user is admin,
      // or Match Centre if user is viewer. For this prototype:
      // Live matches go to LiveScoring ONLY if explicitly navigating to score, 
      // but usually the list view items go to the Match Centre where "Resume Scoring" is an option.
      // However, per previous requirement, let's route Live matches to the specific ID
      // and MatchCentre handles the display.
      
      // If we want a dedicated scorer view, that's usually /match/:id/live
      // Match Centre is /match/:id
      
      // Let's standardise: Click always goes to Match Centre. 
      // Inside Match Centre, an Admin can click "Resume Scoring".
      navigate(`/match/${match.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Matches</h2>
          <p className="text-gray-500 dark:text-gray-400">Follow live action and upcoming fixtures.</p>
        </div>
        
        <div className="flex gap-2">
            <div className="flex bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {(['ALL', MatchStatus.LIVE, MatchStatus.UPCOMING, MatchStatus.COMPLETED] as const).map((tab) => (
                <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    filter === tab 
                    ? 'bg-cricket-green text-white shadow-md' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                >
                {tab === 'ALL' ? 'All' : tab}
                </button>
            ))}
            </div>
            {isAdmin && (
                <button 
                  onClick={() => navigate('/matches/new')}
                  className="bg-cricket-green text-white p-2 rounded-lg hover:bg-green-800 shadow-sm transition-colors"
                  title="Create New Match"
                >
                    <Plus size={20} />
                </button>
            )}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredMatches.map((match) => (
          <div 
            key={match.id}
            onClick={() => handleMatchClick(match)}
            className={`bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer group ${match.status === MatchStatus.LIVE ? 'ring-1 ring-red-500/20' : ''}`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(match.status)}`}>
                {match.status === MatchStatus.LIVE && <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>}
                {match.status}
              </span>
              <span className="text-xs font-mono text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded">
                {match.format}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 text-xs border border-gray-200 dark:border-gray-600">
                       {match.teamA.substring(0, 3).toUpperCase()}
                     </div>
                     <span className="font-bold text-lg text-gray-900 dark:text-white">{match.teamA}</span>
                  </div>
                  <div className="font-mono text-xl font-bold text-gray-900 dark:text-white">
                    {match.scoreA || '-'}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 text-xs border border-gray-200 dark:border-gray-600">
                       {match.teamB.substring(0, 3).toUpperCase()}
                     </div>
                     <span className="font-bold text-lg text-gray-900 dark:text-white">{match.teamB}</span>
                  </div>
                  <div className="font-mono text-xl font-bold text-gray-900 dark:text-white">
                    {match.scoreB || '-'}
                  </div>
                </div>
              </div>

              <div className="ml-6 pl-6 border-l border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-cricket-green dark:group-hover:text-green-400 transition-colors">
                  <ChevronRight size={24} />
                  <span className="text-[10px] font-bold uppercase mt-1">Details</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{match.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{match.venue}</span>
              </div>
              {match.result && (
                <div className="flex items-center gap-1 text-cricket-green dark:text-green-400 font-medium ml-auto">
                   <Trophy size={14} />
                   <span>{match.result}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
