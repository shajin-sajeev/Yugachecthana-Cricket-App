
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Share2, Info, Users, CircleDot, BarChart3, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { MatchStatus } from '../types';

export const MatchCentre: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'INFO' | 'SQUAD' | 'SCORECARD' | 'BALLS' | 'STATS'>('SCORECARD');
  const [activeInning, setActiveInning] = useState<number>(0);
  const [matchData, setMatchData] = useState<any>(null);

  // --- MOCK DATA FACTORY ---
  const getMockData = (matchId: string) => {
      const base = {
          id: matchId,
          tournament: 'Yugachethana Premier League Season 4',
          season: '2025',
          venue: 'Yasc Ground, Bangalore',
          teamA: { name: 'CHENDAMELAM', short: 'CHE', color: 'bg-teal-600', score: '25/3', overs: '12.0' },
          teamB: { name: 'VALLAM KALI', short: 'VK', color: 'bg-blue-600', score: '10/6', overs: '12.0' },
      };

      if (matchId === 'm123') { // LIVE
          return {
              ...base,
              title: 'GROUP A Match',
              format: 'T20 Match',
              date: '16 Dec 2025 20:24',
              toss: 'CHENDAMELAM won the toss and decided to Bat',
              result: 'Match in Progress',
              status: 'Live',
              innings: [
                {
                  id: 1,
                  teamName: 'CHENDAMELAM',
                  shortName: 'CHE',
                  total: '25/3',
                  overs: '12.0',
                  rr: '2.1',
                  extras: 6,
                  extrasDetail: 'WD 6, NB 0, LB 0, B 0',
                  batting: [
                    { name: 'Thejas Jayaram', runs: 18, balls: 39, fours: 2, sixes: 0, sr: 46.2, out: 'not out', isStriker: true },
                    { name: 'Nithin S', runs: 0, balls: 3, fours: 0, sixes: 0, sr: 0.0, out: 'b Sarath' },
                    { name: 'Karnan', runs: 0, balls: 8, fours: 0, sixes: 0, sr: 0.0, out: 'c & b Seetharam' },
                    { name: 'Shajin S', runs: 1, balls: 22, fours: 0, sixes: 0, sr: 4.5, out: 'b Sajan' },
                  ],
                  didNotBat: ['Abhilash', 'Nandhu', 'Unni Kannan'],
                  bowling: [
                    { name: 'Kuttu', o: '1.0', m: 0, r: 6, w: 0, eco: 6.0 },
                    { name: 'Sarath', o: '3.0', m: 1, r: 3, w: 1, eco: 1.0 },
                  ]
                }
              ]
          };
      } else if (matchId === 'm124') { // UPCOMING
          return {
              ...base,
              title: 'GROUP B Match',
              format: 'ODI Match',
              date: 'Tomorrow, 10:00 AM',
              toss: 'Toss yet to happen',
              result: 'Upcoming',
              status: 'Upcoming',
              teamA: { ...base.teamA, name: 'Super Kings', short: 'CSK', score: '', overs: '' },
              teamB: { ...base.teamB, name: 'Capitals', short: 'DC', score: '', overs: '' },
              innings: []
          };
      } else if (matchId === 'm122') { // COMPLETED
          return {
              ...base,
              title: 'Final',
              format: 'T20 Match',
              date: 'Yesterday',
              toss: 'Thunder won toss',
              result: 'Thunder won by 24 runs',
              status: 'Completed',
              teamA: { name: 'Thunder', short: 'THU', color: 'bg-yellow-600', score: '185/6', overs: '20.0' },
              teamB: { name: 'Strikers', short: 'STR', color: 'bg-purple-600', score: '161/9', overs: '20.0' },
              innings: [
                  {
                      id: 1,
                      teamName: 'Thunder',
                      shortName: 'THU',
                      total: '185/6',
                      overs: '20.0',
                      rr: '9.25',
                      batting: [{ name: 'R. Sharma', runs: 85, balls: 45, fours: 8, sixes: 4, out: 'c & b Rashid' }],
                      bowling: []
                  },
                  {
                      id: 2,
                      teamName: 'Strikers',
                      shortName: 'STR',
                      total: '161/9',
                      overs: '20.0',
                      rr: '8.05',
                      batting: [{ name: 'T. Head', runs: 45, balls: 22, fours: 4, sixes: 3, out: 'b Bumrah' }],
                      bowling: []
                  }
              ]
          };
      }
      return null;
  };

  useEffect(() => {
    // 1. Check for specific Mock Match
    const mock = getMockData(id || '');
    if (mock) {
        setMatchData(mock);
        if (mock.status === 'Upcoming') setActiveTab('INFO');
        return;
    }

    // 2. Check Local Storage for user-created matches
    const savedMatches = JSON.parse(localStorage.getItem('yugachethana_matches') || '[]');
    const localMatch = savedMatches.find((m: any) => m.id === id);

    if (localMatch) {
        setMatchData({
            id: localMatch.id,
            tournament: localMatch.tournamentId || 'Exhibition Match',
            title: localMatch.matchTitle || 'League Match',
            season: localMatch.season || '2025',
            format: localMatch.format,
            venue: localMatch.venue,
            date: `${localMatch.date} ${localMatch.time || ''}`,
            toss: localMatch.tossResult || 'Toss yet to happen',
            result: localMatch.result || 'Upcoming',
            mom: '',
            status: localMatch.status,
            teamA: { 
                name: localMatch.teamA, 
                short: localMatch.teamA.substring(0, 3).toUpperCase(), 
                color: 'bg-teal-600', 
                score: localMatch.scoreA || 'Yet to bat', 
                overs: '' 
            },
            teamB: { 
                name: localMatch.teamB, 
                short: localMatch.teamB.substring(0, 3).toUpperCase(), 
                color: 'bg-blue-600', 
                score: localMatch.scoreB || 'Yet to bat', 
                overs: '' 
            },
            innings: localMatch.innings || [],
            recentOvers: [],
            wagonWheel: []
        });
        if (localMatch.status === MatchStatus.UPCOMING) {
            setActiveTab('INFO');
        }
    } else {
        // Fallback: Default Mock to show UI structure
        setMatchData(getMockData('m123'));
    }
  }, [id]);

  if (!matchData) {
      return <div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-gray-400">Loading match details...</div>;
  }

  // --- RENDER FUNCTIONS ---

  const renderInfo = () => (
    <div className="space-y-4 p-4 animate-in fade-in slide-in-from-bottom-2">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
        <div className="flex justify-center items-center gap-8 mb-4">
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full ${matchData.teamA.color} text-white flex items-center justify-center font-bold text-xl mb-2 mx-auto`}>
              {matchData.teamA.short}
            </div>
            <span className="font-bold text-sm text-gray-700 dark:text-gray-300">{matchData.teamA.name}</span>
          </div>
          <div className="text-xs font-bold text-gray-400">VS</div>
          <div className="text-center">
             <div className={`w-16 h-16 rounded-full ${matchData.teamB.color} text-white flex items-center justify-center font-bold text-xl mb-2 mx-auto`}>
              {matchData.teamB.short}
            </div>
            <span className="font-bold text-sm text-gray-700 dark:text-gray-300">{matchData.teamB.name}</span>
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{matchData.result}</div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
        {[
          { label: 'Tournament', value: matchData.tournament },
          { label: 'Match Title', value: matchData.title },
          { label: 'Format', value: matchData.format },
          { label: 'Venue', value: matchData.venue },
          { label: 'Date & Time', value: matchData.date },
          { label: 'Toss', value: matchData.toss },
        ].map((item, i) => (
          <div key={i} className="flex justify-between p-4 text-sm">
            <span className="text-gray-500 dark:text-gray-400 font-medium">{item.label}</span>
            <span className="text-gray-900 dark:text-white font-semibold text-right max-w-[60%]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSquad = () => (
    <div className="p-4 flex flex-col items-center justify-center animate-in fade-in">
      <div className="relative w-full max-w-sm h-[500px] bg-gradient-to-b from-green-600 to-green-700 rounded-2xl border-4 border-white/20 shadow-inner overflow-hidden mb-4">
        {/* Pitch */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-48 bg-[#e4d5b7] border border-stone-300/50 rounded-sm"></div>
        
        {/* Inner Circle (30 yards) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-white/30"></div>

        {/* Players (Mock Positions) */}
        {[
          { name: 'Sarath', role: 'WK', top: '5%', left: '50%', bg: 'bg-blue-600' },
          { name: 'Nandhu', role: '3w', top: '30%', left: '20%', bg: 'bg-red-700' },
          { name: 'Thejas', role: 'C', top: '30%', left: '80%', bg: 'bg-red-700' },
          { name: 'Seetharam', role: '', top: '60%', left: '15%', bg: 'bg-blue-600' },
          { name: 'Shajin', role: '3', top: '60%', left: '50%', bg: 'bg-red-700' },
          { name: 'Abhilash', role: '', top: '60%', left: '85%', bg: 'bg-red-700' },
        ].map((p, i) => (
          <div key={i} className="absolute transform -translate-x-1/2" style={{ top: p.top, left: p.left }}>
            <div className="flex flex-col items-center">
               <div className={`${p.bg} w-8 h-8 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-[10px] border border-white/20`}>
                 {p.role || 'P'}
               </div>
               <div className="bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-full mt-1 backdrop-blur-sm whitespace-nowrap">
                 {p.name}
               </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Visual Playing XI for {matchData.teamA.name}
      </div>
    </div>
  );

  const renderScorecard = () => {
    if (!matchData.innings || matchData.innings.length === 0) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <FileText size={48} className="mb-4 opacity-30" />
                <p>Match has not started yet.</p>
                <p className="text-xs mt-2">Scorecard will be available once the match begins.</p>
            </div>
        );
    }

    const inning = matchData.innings[activeInning];
    if (!inning) return <div className="p-4 text-center">No inning data available</div>;

    return (
      <div className="space-y-4 pb-20 animate-in fade-in">
        {/* Innings Toggle */}
        <div className="flex bg-white dark:bg-gray-800 p-1 mx-4 mt-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto">
          {matchData.innings.map((inn: any, idx: number) => (
            <button
              key={inn.id}
              onClick={() => setActiveInning(idx)}
              className={`flex-1 py-2 px-3 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeInning === idx
                  ? 'bg-cricket-green text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {inn.shortName} {inn.total} ({inn.overs})
            </button>
          ))}
        </div>

        {/* Batting Table */}
        <div className="bg-white dark:bg-gray-800 mx-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <span className="font-bold text-gray-900 dark:text-white text-sm">Batting</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">R (B) 4s 6s SR</span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {inning.batting.map((bat: any, i: number) => (
              <div key={i} className="px-4 py-3 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-white text-sm">
                    {bat.name}
                    {bat.out === 'not out' && <span className="text-cricket-green dark:text-green-400">*</span>}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{bat.out}</div>
                </div>
                <div className="font-mono text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-right">
                  <span className="font-bold text-gray-900 dark:text-white mr-2">{bat.runs}</span>
                  <span className="text-gray-400 mr-2">({bat.balls})</span>
                  <span className="w-4 inline-block text-center mr-1 hidden sm:inline-block">{bat.fours}</span>
                  <span className="w-4 inline-block text-center mr-2 hidden sm:inline-block">{bat.sixes}</span>
                  <span className="hidden sm:inline-block w-10 text-right">{bat.sr}</span>
                </div>
              </div>
            ))}
          </div>
          {inning.extrasDetail && (
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 text-xs flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Extras</span>
                <span className="font-bold text-gray-900 dark:text-white">{inning.extras} ({inning.extrasDetail})</span>
            </div>
          )}
          <div className="px-4 py-3 bg-gray-100 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-between font-bold text-sm">
              <span>Total</span>
              <span>{inning.total} ({inning.overs} Ov, RR: {inning.rr})</span>
          </div>
        </div>

        {/* Bowling Table */}
        {inning.bowling && inning.bowling.length > 0 && (
          <div className="bg-white dark:bg-gray-800 mx-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <span className="font-bold text-gray-900 dark:text-white text-sm">Bowling</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">O M R W Eco</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {inning.bowling.map((bowl: any, i: number) => (
                <div key={i} className="px-4 py-3 flex justify-between items-center text-sm">
                  <div className="font-medium text-gray-900 dark:text-white">{bowl.name}</div>
                  <div className="font-mono text-gray-600 dark:text-gray-300 grid grid-cols-5 gap-2 text-right w-40">
                    <span>{bowl.o}</span>
                    <span>{bowl.m}</span>
                    <span>{bowl.r}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{bowl.w}</span>
                    <span>{bowl.eco}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => navigate('/matches')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-700 dark:text-gray-300">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <h1 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{matchData.teamA.short} vs {matchData.teamB.short}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{matchData.format}</p>
          </div>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-700 dark:text-gray-300">
            <Share2 size={20} />
          </button>
        </div>

        {/* Match Header Info */}
        <div className="px-6 pb-6 pt-2">
            <div className="flex justify-between items-center mb-2">
                <div className="text-center">
                    <span className={`text-2xl font-bold ${matchData.teamA.score ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{matchData.teamA.score || '-'}</span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{matchData.teamA.overs ? `${matchData.teamA.overs} ov` : ''}</div>
                </div>
                <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full uppercase tracking-wider">
                    {matchData.status}
                </div>
                <div className="text-center">
                    <span className={`text-2xl font-bold ${matchData.teamB.score ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{matchData.teamB.score || '-'}</span>
                     <div className="text-xs text-gray-500 dark:text-gray-400">{matchData.teamB.overs ? `${matchData.teamB.overs} ov` : ''}</div>
                </div>
            </div>
            <div className="text-center text-xs font-medium text-cricket-green dark:text-green-400">
                {matchData.result}
            </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-6 overflow-x-auto no-scrollbar border-t border-gray-100 dark:border-gray-700">
          {[
            { id: 'INFO', label: 'Info', icon: Info },
            { id: 'SQUAD', label: 'Squad', icon: Users },
            { id: 'SCORECARD', label: 'Scorecard', icon: FileText },
            { id: 'BALLS', label: 'Ball by Ball', icon: CircleDot },
            { id: 'STATS', label: 'Stats', icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-cricket-green text-cricket-green dark:border-green-400 dark:text-green-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'INFO' && renderInfo()}
        {activeTab === 'SQUAD' && renderSquad()}
        {activeTab === 'SCORECARD' && renderScorecard()}
        {activeTab === 'BALLS' && <div className="p-8 text-center text-gray-500 dark:text-gray-400">Ball by Ball Commentary Coming Soon</div>}
        {activeTab === 'STATS' && <div className="p-8 text-center text-gray-500 dark:text-gray-400">Advanced Stats Coming Soon</div>}
      </div>
    </div>
  );
};
