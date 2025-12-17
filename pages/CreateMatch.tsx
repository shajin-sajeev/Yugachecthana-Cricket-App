
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Users, Calendar, Trophy, ChevronRight, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MatchFormat, Team, MatchStatus, MatchSettings, BallType, PitchType } from '../types';

export const CreateMatch: React.FC = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [selectingTeamFor, setSelectingTeamFor] = useState<'A' | 'B' | null>(null);

  // Core Match Data
  const [teamA, setTeamA] = useState<Team | null>(null);
  const [teamB, setTeamB] = useState<Team | null>(null);
  const [venue, setVenue] = useState('Yasc Ground');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().split(' ')[0].slice(0, 5));
  const [season, setSeason] = useState('2025');
  
  // Format & Rules
  const [format, setFormat] = useState<MatchFormat>(MatchFormat.T20);
  const [overs, setOvers] = useState(20);
  const [ballType, setBallType] = useState<BallType>(BallType.TENNIS);
  const [pitchType, setPitchType] = useState<PitchType>(PitchType.ROUGH);

  // Match Settings
  const [settings, setSettings] = useState<MatchSettings>({
      wagonWheel: true,
      addExtrasToWide: true,
      addExtrasToNoBall: true,
      ballsPerOver: 6,
      maxBallsPerOver: 8,
      addWideBallsToBatsman: false,
      addWideRunsToBatsman: false,
      addNoBallExtrasToBatsman: false,
      wickets: 10,
      playersPerTeam: 11,
      oversPerBowler: 4
  });

  useEffect(() => {
    // Load mock teams or from LS
    const saved = localStorage.getItem('yugachethana_teams');
    if (saved) {
        setTeams(JSON.parse(saved));
    } else {
        const mocks: Team[] = [
            { id: 't1', name: 'CHENDAMELAM', shortName: 'CHE', logoUrl: 'https://ui-avatars.com/api/?name=Chendamelam&background=e6f7ff&color=1890ff', players: [] },
            { id: 't2', name: 'VALLAM KALI', shortName: 'VK', logoUrl: 'https://ui-avatars.com/api/?name=Vallam+Kali&background=fff1f0&color=f5222d', players: [] },
            { id: 't3', name: 'ROYALS', shortName: 'ROY', logoUrl: 'https://ui-avatars.com/api/?name=Royals&background=f6ffed&color=52c41a', players: [] },
        ];
        setTeams(mocks);
        localStorage.setItem('yugachethana_teams', JSON.stringify(mocks));
    }
  }, []);

  // Update defaults when format changes
  useEffect(() => {
      if (format === MatchFormat.T20) {
          setOvers(20);
          setSettings(s => ({ ...s, wickets: 10, playersPerTeam: 11, oversPerBowler: 4 }));
      } else if (format === MatchFormat.ODI) {
          setOvers(50);
          setSettings(s => ({ ...s, wickets: 10, playersPerTeam: 11, oversPerBowler: 10 }));
      } else if (format === MatchFormat.BOX) {
          setOvers(8);
          setSettings(s => ({ ...s, wickets: 6, playersPerTeam: 6, oversPerBowler: 2 }));
      } else if (format === MatchFormat.THE_HUNDRED) {
          setOvers(20); // 100 balls roughly 20 overs of 5 balls
          setSettings(s => ({ ...s, ballsPerOver: 5, wickets: 10, playersPerTeam: 11, oversPerBowler: 4 }));
      }
  }, [format]);

  // Update overs per bowler when overs change (simple heuristic)
  const handleOversChange = (val: number) => {
      setOvers(val);
      setSettings(s => ({ ...s, oversPerBowler: Math.ceil(val / 5) }));
  };

  const handleSelectTeam = (team: Team) => {
      if (selectingTeamFor === 'A') setTeamA(team);
      if (selectingTeamFor === 'B') setTeamB(team);
      setSelectingTeamFor(null);
  };

  const createMatch = (action: 'SAVE' | 'START') => {
      if (!teamA || !teamB) {
          alert("Please select both teams");
          return;
      }

      const newMatch = {
          id: Date.now().toString(),
          teamA: teamA,
          teamB: teamB,
          scoreA: 'Yet to bat',
          scoreB: 'Yet to bat',
          status: MatchStatus.UPCOMING,
          format: format,
          date: date,
          time: time,
          venue: venue,
          season: season,
          settings: settings,
          ballType: ballType,
          pitchType: pitchType,
          currentBatters: { strikerId: '', nonStrikerId: '' },
          result: ''
      };

      const existingMatches = JSON.parse(localStorage.getItem('yugachethana_matches') || '[]');
      localStorage.setItem('yugachethana_matches', JSON.stringify([newMatch, ...existingMatches]));

      if (action === 'SAVE') {
          navigate('/matches');
      } else {
          navigate(`/match/${newMatch.id}/setup`);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 relative">
       {/* Header */}
       <div className="bg-white dark:bg-gray-800 p-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
           <div className="flex items-center gap-3">
               <button onClick={() => navigate(-1)}><ArrowLeft className="text-gray-700 dark:text-gray-200" /></button>
               <h1 className="text-xl font-bold text-gray-900 dark:text-white">Start a Match</h1>
           </div>
           <button onClick={() => setShowSettings(true)}>
               <Settings className="text-gray-500 dark:text-gray-400" />
           </button>
       </div>

       <div className="max-w-xl mx-auto space-y-6 p-4">
           {/* Section 1: Teams */}
           <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
               {/* Team A */}
               <div className="flex flex-col items-center gap-2 text-center w-1/3 group cursor-pointer" onClick={() => setSelectingTeamFor('A')}>
                   <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-500 flex items-center justify-center overflow-hidden group-hover:border-cricket-green transition-colors">
                       {teamA ? (
                           <img src={teamA.logoUrl} alt={teamA.name} className="w-full h-full object-cover" />
                       ) : (
                           <Users className="text-gray-300 dark:text-gray-500" size={28} />
                       )}
                   </div>
                   <div className="font-bold text-sm text-gray-900 dark:text-white truncate w-full">{teamA ? teamA.name : 'Select Team A'}</div>
               </div>

               <div className="text-xl font-black text-gray-300 dark:text-gray-600">VS</div>

               {/* Team B */}
               <div className="flex flex-col items-center gap-2 text-center w-1/3 group cursor-pointer" onClick={() => setSelectingTeamFor('B')}>
                   <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-500 flex items-center justify-center overflow-hidden group-hover:border-cricket-green transition-colors">
                       {teamB ? (
                           <img src={teamB.logoUrl} alt={teamB.name} className="w-full h-full object-cover" />
                       ) : (
                           <Users className="text-gray-300 dark:text-gray-500" size={28} />
                       )}
                   </div>
                   <div className="font-bold text-sm text-gray-900 dark:text-white truncate w-full">{teamB ? teamB.name : 'Select Team B'}</div>
               </div>
           </div>

           {/* Section 2: Match Format */}
           <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
               <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                   <Trophy size={18} className="text-cricket-green dark:text-green-400" /> Match Format
               </h3>
               
               <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                   {Object.values(MatchFormat).map(f => (
                       <button
                           key={f}
                           onClick={() => setFormat(f)}
                           className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap border transition-colors ${
                               format === f 
                               ? 'bg-cricket-green text-white border-cricket-green' 
                               : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                           }`}
                       >
                           {f}
                       </button>
                   ))}
               </div>

               <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Overs</label>
                       <input 
                           type="number" 
                           value={overs}
                           onChange={(e) => handleOversChange(Number(e.target.value))}
                           className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-cricket-green"
                       />
                   </div>
                   <div>
                       <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Overs / Bowler</label>
                       <input 
                           type="number" 
                           value={settings.oversPerBowler}
                           onChange={(e) => setSettings({...settings, oversPerBowler: Number(e.target.value)})}
                           className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-cricket-green"
                       />
                   </div>
               </div>
           </div>

           {/* Section 3: Squad Rules */}
           <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
               <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                   <Users size={18} className="text-cricket-green dark:text-green-400" /> Squad Settings
               </h3>
               <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Team Size</label>
                       <input 
                           type="number" 
                           value={settings.playersPerTeam}
                           onChange={(e) => setSettings({...settings, playersPerTeam: Number(e.target.value)})}
                           className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-cricket-green"
                       />
                   </div>
                   <div>
                       <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Wickets</label>
                       <input 
                           type="number" 
                           value={settings.wickets}
                           onChange={(e) => setSettings({...settings, wickets: Number(e.target.value)})}
                           className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-cricket-green"
                       />
                   </div>
               </div>
           </div>

           {/* Section 4: Venue & Time */}
           <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                   <Calendar size={18} className="text-cricket-green dark:text-green-400" /> Venue & Time
               </h3>
               <div>
                   <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Venue / Ground</label>
                   <input 
                       type="text" 
                       value={venue}
                       onChange={(e) => setVenue(e.target.value)}
                       className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-cricket-green"
                       placeholder="e.g. Lords Cricket Ground"
                   />
               </div>
               <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Date</label>
                       <input 
                           type="date" 
                           value={date}
                           onChange={(e) => setDate(e.target.value)}
                           className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-cricket-green"
                       />
                   </div>
                   <div>
                       <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Time</label>
                       <input 
                           type="time" 
                           value={time}
                           onChange={(e) => setTime(e.target.value)}
                           className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-cricket-green"
                       />
                   </div>
               </div>
           </div>

           {/* Section 5: Ball & Pitch */}
           <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
               <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                   <Info size={18} className="text-cricket-green dark:text-green-400" /> Equipment & Conditions
               </h3>
               
               <div>
                   <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase mb-2 block">Ball Type</label>
                   <div className="flex flex-wrap gap-2">
                        {Object.values(BallType).map(t => (
                            <button
                                key={t}
                                onClick={() => setBallType(t)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                    ballType === t 
                                    ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' 
                                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                   </div>
               </div>

               <div>
                   <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase mb-2 block">Pitch Type</label>
                   <div className="flex flex-wrap gap-2">
                        {Object.values(PitchType).map(t => (
                            <button
                                key={t}
                                onClick={() => setPitchType(t)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                    pitchType === t 
                                    ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800' 
                                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                   </div>
               </div>
           </div>
       </div>

       {/* Footer Buttons */}
       <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-4 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
           <button 
             onClick={() => createMatch('SAVE')}
             className="flex-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 font-bold py-3.5 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors uppercase text-sm"
           >
               Save Fixture
           </button>
           <button 
             onClick={() => createMatch('START')}
             className="flex-1 bg-cricket-green text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-green-800 transition-colors uppercase text-sm flex items-center justify-center gap-2"
           >
               Start Match <ChevronRight size={16} />
           </button>
       </div>

       {/* Team Selection Modal */}
       {selectingTeamFor && (
           <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
               <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl overflow-hidden animate-in slide-in-from-bottom-5">
                   <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                       <h3 className="font-bold text-gray-900 dark:text-white">Select Team {selectingTeamFor}</h3>
                       <button onClick={() => setSelectingTeamFor(null)} className="text-gray-500">Close</button>
                   </div>
                   <div className="max-h-96 overflow-y-auto p-2">
                       {teams.map(t => (
                           <div key={t.id} onClick={() => handleSelectTeam(t)} className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                               <img src={t.logoUrl} className="w-10 h-10 rounded-full" />
                               <span className="font-medium text-gray-900 dark:text-white">{t.name}</span>
                           </div>
                       ))}
                   </div>
               </div>
           </div>
       )}

       {/* Advanced Settings Modal */}
       {showSettings && (
           <div className="fixed inset-0 z-50 bg-gray-900/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
               <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl overflow-hidden">
                   <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                       <h2 className="text-xl font-bold text-gray-900 dark:text-white">Scoring Rules</h2>
                       <button onClick={() => setShowSettings(false)} className="text-gray-500"><ArrowLeft size={24} /></button>
                   </div>

                   <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
                       {/* Toggles */}
                       {[
                           { label: 'Wagon Wheel', key: 'wagonWheel' },
                           { label: 'Add Extras to Wide', key: 'addExtrasToWide' },
                           { label: 'Add Extras to No Ball', key: 'addExtrasToNoBall' },
                           { label: 'Wide Balls to Batsman', key: 'addWideBallsToBatsman' },
                           { label: 'Wide Runs to Batsman', key: 'addWideRunsToBatsman' },
                           { label: 'No Ball Extras to Batsman', key: 'addNoBallExtrasToBatsman' },
                       ].map((item: any) => (
                           <div key={item.key} className="flex justify-between items-center">
                               <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                               <div 
                                 onClick={() => setSettings({...settings, [item.key]: !settings[item.key as keyof MatchSettings]})}
                                 className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings[item.key as keyof MatchSettings] ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                               >
                                   <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${settings[item.key as keyof MatchSettings] ? 'translate-x-6' : ''}`}></div>
                               </div>
                           </div>
                       ))}

                       <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                           <div className="font-medium mb-2 text-gray-900 dark:text-white">Balls per Over</div>
                           <div className="flex gap-2">
                               {[4, 5, 6, 8, 10].map(n => (
                                   <button 
                                     key={n} 
                                     onClick={() => setSettings({...settings, ballsPerOver: n})}
                                     className={`flex-1 py-2 rounded-lg font-bold border transition-colors ${
                                         settings.ballsPerOver === n 
                                         ? 'bg-cricket-green text-white border-cricket-green' 
                                         : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                                     }`}
                                   >
                                       {n}
                                   </button>
                               ))}
                           </div>
                       </div>
                   </div>
                   
                   <button 
                     onClick={() => setShowSettings(false)}
                     className="mt-6 w-full bg-cricket-green text-white font-bold py-3 rounded-xl shadow-lg hover:bg-green-800 transition-colors"
                   >
                       Confirm Rules
                   </button>
               </div>
           </div>
       )}
    </div>
  );
};
