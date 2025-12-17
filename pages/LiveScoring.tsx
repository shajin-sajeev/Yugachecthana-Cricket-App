
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, X, Search, RotateCcw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Match, Player } from '../types';

// --- Types & Interfaces ---
type OverlayType = 'NONE' | 'WIDE' | 'NO_BALL' | 'BYE' | 'LEG_BYE' | 'WICKET';
type SelectionMode = 'NONE' | 'STRIKER' | 'NON_STRIKER' | 'BOWLER';

// --- Local Hook for Match Data ---
const useMatchData = (id: string) => {
    const [match, setMatch] = useState<Match | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = () => {
            const savedMatches = JSON.parse(localStorage.getItem('yugachethana_matches') || '[]');
            const m = savedMatches.find((x: any) => x.id === id);
            if (m) {
                // Ensure innings structure exists
                if (!m.innings || m.innings.length === 0) {
                     m.innings = [{
                        teamId: m.teamA.id,
                        totalRuns: 0,
                        totalWickets: 0,
                        oversPlayed: '0.0',
                        runRate: 0,
                        extras: 0,
                        batting: [],
                        bowling: []
                     }];
                }
                setMatch(m);
            }
            setLoading(false);
        };
        load();
    }, [id]);

    const saveMatch = (updatedMatch: Match) => {
        setMatch(updatedMatch);
        const savedMatches = JSON.parse(localStorage.getItem('yugachethana_matches') || '[]');
        const newMatches = savedMatches.map((m: any) => m.id === updatedMatch.id ? updatedMatch : m);
        localStorage.setItem('yugachethana_matches', JSON.stringify(newMatches));
    };

    return { match, saveMatch, loading };
};

export const LiveScoring: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { match, saveMatch, loading } = useMatchData(id || '');
  
  // UI State
  const [overlay, setOverlay] = useState<OverlayType>('NONE');
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('NONE');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Derived State Helpers ---
  if (loading || !match) return <div className="p-8 flex justify-center text-gray-500">Loading Match Data...</div>;

  const currentInningIndex = 0; // Assuming 1st inning for demo
  const inning = match.innings![currentInningIndex];
  
  // Get Active Players
  const strikerId = match.currentBatters?.strikerId;
  const nonStrikerId = match.currentBatters?.nonStrikerId;
  const currentBowlerId = match.currentBowlerId;

  const striker = inning.batting.find(p => p.playerId === strikerId);
  const nonStriker = inning.batting.find(p => p.playerId === nonStrikerId);
  const bowler = inning.bowling.find(p => p.playerId === currentBowlerId);

  // --- Logic Handlers ---

  const handleScore = (runs: number, type: 'RUNS' | 'WIDE' | 'NO_BALL' | 'BYE' | 'LEG_BYE' = 'RUNS', extras: number = 0) => {
    if (!inning) return;

    const newInning = { ...inning };
    const isWide = type === 'WIDE';
    const isNoBall = type === 'NO_BALL';
    const isBye = type === 'BYE';
    const isLegBye = type === 'LEG_BYE';
    
    // 1. Update Inning Totals
    const totalRunsToAdd = runs + extras + (isWide || isNoBall ? 1 : 0);
    newInning.totalRuns += totalRunsToAdd;
    newInning.extras += (extras + (isWide || isNoBall ? 1 : 0) + (isBye || isLegBye ? runs : 0));

    // 2. Update Balls & Overs (Valid ball?)
    const isValidBall = !isWide && !isNoBall;
    if (isValidBall) {
        // Parse current overs "14.2" -> 14 overs, 2 balls
        const [ovs, balls] = newInning.oversPlayed.split('.').map(Number);
        let newBalls = balls + 1;
        let newOvers = ovs;
        if (newBalls === 6) {
            newOvers += 1;
            newBalls = 0;
            // End of over logic could go here (swap strike)
        }
        newInning.oversPlayed = `${newOvers}.${newBalls}`;
    }

    // 3. Update Striker Stats
    const strikerIndex = newInning.batting.findIndex(p => p.playerId === strikerId);
    if (strikerIndex > -1) {
        const s = { ...newInning.batting[strikerIndex] };
        if (isValidBall) s.balls += 1;
        
        if (type === 'RUNS' || isNoBall) {
            s.runs += runs;
            if (runs === 4) s.fours += 1;
            if (runs === 6) s.sixes += 1;
        }
        
        // SR Calc
        s.strikeRate = s.balls > 0 ? parseFloat(((s.runs / s.balls) * 100).toFixed(1)) : 0;
        newInning.batting[strikerIndex] = s;
    }

    // 4. Update Bowler Stats
    const bowlerIndex = newInning.bowling.findIndex(p => p.playerId === currentBowlerId);
    if (bowlerIndex > -1) {
        const b = { ...newInning.bowling[bowlerIndex] };
        
        // Overs calc for bowler
        if (isValidBall) {
             const [ovs, balls] = b.overs.split('.').map(Number);
             let newBalls = balls + 1;
             let newOvers = ovs;
             if (newBalls === 6) { newOvers += 1; newBalls = 0; }
             b.overs = `${newOvers}.${newBalls}`;
        }

        b.runs += totalRunsToAdd; // Simplified: bowler gets all runs charged usually except byes/legbyes
        if (isBye || isLegBye) b.runs -= totalRunsToAdd; // Deduct byes from bowler

        // Eco Calc
        const totalBallsBowled = parseFloat(b.overs.split('.')[0]) * 6 + parseFloat(b.overs.split('.')[1]);
        b.economy = totalBallsBowled > 0 ? parseFloat(((b.runs / totalBallsBowled) * 6).toFixed(1)) : 0;

        newInning.bowling[bowlerIndex] = b;
    }

    // 5. Strike Rotation
    // Odd runs = swap. End of over = swap (handled elsewhere usually, but let's do simple run swap)
    if (runs % 2 !== 0) {
        toggleStrike(); // Visually swap
        // In real app, we swap the IDs in match.currentBatters
        const newMatchState = { ...match };
        newMatchState.currentBatters = {
            strikerId: nonStrikerId!,
            nonStrikerId: strikerId!
        };
        newMatchState.innings![currentInningIndex] = newInning;
        saveMatch(newMatchState);
    } else {
        // Just save
        const newMatchState = { ...match };
        newMatchState.innings![currentInningIndex] = newInning;
        saveMatch(newMatchState);
    }

    setOverlay('NONE');
  };

  const toggleStrike = () => {
      const newBatters = {
          strikerId: nonStrikerId!,
          nonStrikerId: strikerId!
      };
      saveMatch({ ...match, currentBatters: newBatters });
  };

  const handlePlayerSelect = (player: Player) => {
      if (!inning) return;
      const newMatch = { ...match };
      
      // Check if player is already in stats, if not add them
      if (selectionMode === 'STRIKER' || selectionMode === 'NON_STRIKER') {
          const existingStats = inning.batting.find(p => p.playerId === player.id);
          if (!existingStats) {
              inning.batting.push({
                  playerId: player.id,
                  playerName: player.name,
                  runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0,
                  isNotOut: true,
                  onStrike: selectionMode === 'STRIKER'
              });
          }
          
          if (selectionMode === 'STRIKER') newMatch.currentBatters!.strikerId = player.id;
          else newMatch.currentBatters!.nonStrikerId = player.id;
      } 
      else if (selectionMode === 'BOWLER') {
          const existingStats = inning.bowling.find(p => p.playerId === player.id);
          if (!existingStats) {
              inning.bowling.push({
                  playerId: player.id,
                  playerName: player.name,
                  overs: '0.0', maidens: 0, runs: 0, wickets: 0, economy: 0
              });
          }
          newMatch.currentBowlerId = player.id;
      }

      saveMatch(newMatch);
      setSelectionMode('NONE');
  };

  // --- Render Components ---

  const renderKeypad = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-orange-500 p-2 z-20 pb-6">
        {overlay !== 'NONE' ? (
             <div className="animate-in slide-in-from-bottom-10 fade-in duration-200">
                 <div className="flex justify-between items-center text-white mb-4 px-2 pt-2">
                     <button onClick={() => setOverlay('NONE')} className="p-2 hover:bg-white/10 rounded-full"><X /></button>
                     <div className="font-bold text-lg capitalize">{overlay.replace('_', ' ')}</div>
                     <div className="w-8"></div>
                 </div>
                 
                 <div className="grid grid-cols-4 gap-3 mb-2 px-2">
                     {overlay === 'WIDE' && (
                         <>
                            <button onClick={() => handleScore(0, 'WIDE')} className="bg-orange-400 text-white font-bold py-3 rounded-lg shadow-sm border border-orange-300/50 active:scale-95 transition-transform">Wd</button>
                            <button onClick={() => handleScore(1, 'WIDE', 1)} className="bg-orange-400 text-white font-bold py-3 rounded-lg shadow-sm border border-orange-300/50 active:scale-95 transition-transform">1 + Wd</button>
                            <button onClick={() => handleScore(2, 'WIDE', 2)} className="bg-orange-400 text-white font-bold py-3 rounded-lg shadow-sm border border-orange-300/50 active:scale-95 transition-transform">2 + Wd</button>
                            <button onClick={() => handleScore(3, 'WIDE', 3)} className="bg-orange-400 text-white font-bold py-3 rounded-lg shadow-sm border border-orange-300/50 active:scale-95 transition-transform">3 + Wd</button>
                            <button onClick={() => handleScore(4, 'WIDE', 4)} className="col-span-2 bg-orange-400 text-white font-bold py-3 rounded-lg shadow-sm border border-orange-300/50 active:scale-95 transition-transform">4 + Wd</button>
                            <button onClick={() => handleScore(5, 'WIDE', 5)} className="col-span-2 bg-orange-400 text-white font-bold py-3 rounded-lg shadow-sm border border-orange-300/50 active:scale-95 transition-transform">5 + Wd</button>
                         </>
                     )}
                     {(overlay === 'BYE' || overlay === 'LEG_BYE') && (
                         [1, 2, 3, 4, 5, 6].map(n => (
                             <button 
                                key={n} 
                                onClick={() => handleScore(n, overlay)} 
                                className={`bg-orange-400 text-white font-bold py-3 rounded-lg shadow-sm border border-orange-300/50 active:scale-95 transition-transform ${n > 4 ? 'col-span-2' : ''}`}
                             >
                                 {n} {overlay === 'BYE' ? 'B' : 'LB'}
                             </button>
                         ))
                     )}
                     {overlay === 'NO_BALL' && (
                         <>
                            <button onClick={() => handleScore(0, 'NO_BALL')} className="bg-orange-400 text-white font-bold py-3 rounded-lg shadow-sm border border-orange-300/50 active:scale-95 transition-transform">NB</button>
                            <button onClick={() => handleScore(1, 'NO_BALL', 1)} className="bg-orange-400 text-white font-bold py-3 rounded-lg shadow-sm border border-orange-300/50 active:scale-95 transition-transform">1 + NB</button>
                            <button onClick={() => handleScore(4, 'NO_BALL', 4)} className="bg-orange-400 text-white font-bold py-3 rounded-lg shadow-sm border border-orange-300/50 active:scale-95 transition-transform">4 + NB</button>
                            <button onClick={() => handleScore(6, 'NO_BALL', 6)} className="bg-orange-400 text-white font-bold py-3 rounded-lg shadow-sm border border-orange-300/50 active:scale-95 transition-transform">6 + NB</button>
                         </>
                     )}
                 </div>
             </div>
        ) : (
            <div className="grid grid-cols-5 gap-2 px-2">
                {[1, 2, 3, 4, 6].map(run => (
                     <button key={run} onClick={() => handleScore(run)} className="bg-orange-400 text-white font-bold py-4 rounded-lg shadow-sm border border-orange-300/50 text-xl active:scale-95 transition-transform">{run}</button>
                ))}

                <button onClick={() => setOverlay('LEG_BYE')} className="bg-orange-400 text-white font-bold py-4 rounded-lg shadow-sm border border-orange-300/50 active:scale-95 transition-transform">LB</button>
                <button onClick={() => setOverlay('BYE')} className="bg-orange-400 text-white font-bold py-4 rounded-lg shadow-sm border border-orange-300/50 active:scale-95 transition-transform">Bye</button>
                <button onClick={() => setOverlay('WIDE')} className="bg-orange-400 text-white font-bold py-4 rounded-lg shadow-sm border border-orange-300/50 active:scale-95 transition-transform">Wide</button>
                <button onClick={() => setOverlay('NO_BALL')} className="bg-orange-400 text-white font-bold py-4 rounded-lg shadow-sm border border-orange-300/50 active:scale-95 transition-transform">NB</button>
                <button onClick={() => handleScore(0)} className="bg-white text-orange-500 font-bold py-4 rounded-full shadow-sm mx-auto w-12 h-12 flex items-center justify-center border border-white mt-1 active:scale-95 transition-transform">●</button>

                <button className="bg-orange-400 text-white font-bold py-3 rounded-lg shadow-sm border border-orange-300/50 text-sm">More</button>
                <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center mx-auto self-center rotate-45 shadow-sm">
                    <div className="w-full h-1 bg-orange-500"></div>
                </div>
                <button className="bg-orange-400 text-white font-bold py-3 rounded-lg shadow-sm border border-orange-300/50 text-sm">5,7</button>
                <button className="bg-orange-400 text-white font-bold py-3 rounded-lg shadow-sm border border-orange-300/50 text-sm flex items-center justify-center"><RotateCcw size={16} /></button>
                <button className="bg-orange-400 text-white font-bold py-3 rounded-lg shadow-sm border border-orange-300/50 text-sm">Out</button>
            </div>
        )}
    </div>
  );

  const renderPlayerSelectionModal = () => {
      if (selectionMode === 'NONE') return null;
      
      const isBatting = selectionMode === 'STRIKER' || selectionMode === 'NON_STRIKER';
      const team = isBatting ? match.teamA : match.teamB; // Assuming Team A batting first for demo
      const players = team.players.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

      return (
          <div className="fixed inset-0 z-50 bg-black/50 flex flex-col justify-end sm:justify-center p-0 sm:p-4">
              <div className="bg-white dark:bg-gray-800 w-full max-w-md mx-auto h-[80vh] sm:h-auto sm:rounded-xl flex flex-col animate-in slide-in-from-bottom-10">
                  <div className="bg-orange-500 p-4 text-white flex justify-between items-center rounded-t-xl">
                      <button onClick={() => setSelectionMode('NONE')}><X /></button>
                      <h3 className="font-bold">Select {isBatting ? 'Batsman' : 'Bowler'}</h3>
                      <div className="w-6"></div>
                  </div>
                  
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                     <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search player..." 
                            className="w-full pl-10 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-none focus:ring-0"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2">
                      {players.map((p, i) => (
                          <div 
                            key={p.id} 
                            onClick={() => handlePlayerSelect(p)}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0"
                          >
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">{i+1}</div>
                              <div>
                                  <div className="font-bold text-gray-900 dark:text-white">{p.name}</div>
                                  <div className="text-xs text-gray-500">{p.role}</div>
                              </div>
                              {(p.id === strikerId || p.id === nonStrikerId) && (
                                  <span className="ml-auto text-xs font-bold text-orange-500 bg-orange-100 px-2 py-1 rounded">Playing</span>
                              )}
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center shadow-sm z-10 shrink-0">
          <button onClick={() => navigate(-1)}><ArrowLeft className="text-gray-700 dark:text-gray-200" /></button>
          <div className="font-bold text-lg text-gray-900 dark:text-white">Match Centre</div>
          <button><Settings className="text-gray-500" /></button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-500 overflow-x-auto no-scrollbar shrink-0">
          {['Scoring', 'Scorecard', 'Stats', 'Super Stars', 'Balls'].map((tab, i) => (
              <div key={tab} className={`px-4 py-3 whitespace-nowrap ${i === 0 ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white' : ''}`}>
                  {tab}
              </div>
          ))}
      </div>

      {/* Scoreboard Content */}
      <div className="flex-1 overflow-y-auto pb-[400px] scroll-smooth">
          <div className="p-4 bg-white dark:bg-gray-800 mb-2">
              <div className="text-xs text-gray-500 mb-2">{match.venue} • {match.date}</div>
              
              <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                      {match.teamA.logoUrl && <img src={match.teamA.logoUrl} className="w-6 h-6 rounded-full" />}
                      <span className="font-bold text-teal-700 dark:text-teal-400">{match.teamA.name}</span>
                  </div>
                  <div className="font-bold text-teal-700 dark:text-teal-400 text-xl">
                      {inning.totalRuns}-{inning.totalWickets}
                  </div>
              </div>
              
              <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 opacity-60">
                      {match.teamB.logoUrl && <img src={match.teamB.logoUrl} className="w-6 h-6 rounded-full" />}
                      <span className="font-bold text-gray-800 dark:text-gray-200">{match.teamB.name}</span>
                  </div>
              </div>

              <div className="flex justify-between mt-4 text-sm font-bold border-t border-gray-100 dark:border-gray-700 pt-3">
                  <div>Extras - {inning.extras}</div>
                  <div>Overs - {inning.oversPlayed}</div>
                  <div>CRR - {parseFloat(inning.oversPlayed) > 0 ? (inning.totalRuns / parseFloat(inning.oversPlayed)).toFixed(2) : '0.0'}</div>
              </div>
          </div>

          {/* Batsmen Card */}
          <div className="bg-white dark:bg-gray-800 mb-2 p-2">
              <div className="grid grid-cols-6 text-xs font-bold text-gray-500 mb-2 px-2">
                  <div className="col-span-2 flex items-center gap-1">Batsman</div>
                  <div className="text-center">R</div>
                  <div className="text-center">B</div>
                  <div className="text-center">4s</div>
                  <div className="text-center">6s</div>
                  <div className="text-center">SR</div>
              </div>
              
              {/* Striker Row */}
              <div className="grid grid-cols-6 items-center bg-orange-500 text-white rounded-lg p-2 mb-1 shadow-sm relative overflow-hidden">
                  <div className="col-span-2 font-bold truncate flex items-center gap-1 cursor-pointer" onClick={() => setSelectionMode('STRIKER')}>
                      {striker?.playerName || 'Select Striker'} *
                      <Settings size={12} className="opacity-50" />
                  </div>
                  <div className="text-center font-bold">{striker?.runs || 0}</div>
                  <div className="text-center">{striker?.balls || 0}</div>
                  <div className="text-center">{striker?.fours || 0}</div>
                  <div className="text-center">{striker?.sixes || 0}</div>
                  <div className="text-center text-xs">{striker?.strikeRate || 0}</div>
                  {/* Tap to rotate strike area */}
                  <div className="absolute right-0 top-0 bottom-0 w-8" onClick={(e) => { e.stopPropagation(); toggleStrike(); }}></div> 
              </div>

              {/* Non-Striker Row */}
              <div className="grid grid-cols-6 items-center text-gray-700 dark:text-gray-300 p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg" onClick={() => setSelectionMode('NON_STRIKER')}>
                  <div className="col-span-2 font-medium truncate flex items-center gap-1">
                      {nonStriker?.playerName || 'Select Non-Striker'}
                      <Settings size={12} className="text-gray-400" />
                  </div>
                  <div className="text-center font-bold">{nonStriker?.runs || 0}</div>
                  <div className="text-center">{nonStriker?.balls || 0}</div>
                  <div className="text-center">{nonStriker?.fours || 0}</div>
                  <div className="text-center">{nonStriker?.sixes || 0}</div>
                  <div className="text-center text-xs">{nonStriker?.strikeRate || 0}</div>
              </div>
          </div>

          {/* Bowler Card */}
          <div className="bg-white dark:bg-gray-800 mb-2 p-2">
               <div className="grid grid-cols-6 text-xs font-bold text-gray-500 mb-2 px-2">
                  <div className="col-span-2 flex items-center gap-1">Bowler</div>
                  <div className="text-center">O</div>
                  <div className="text-center">M</div>
                  <div className="text-center">R</div>
                  <div className="text-center">W</div>
                  <div className="text-center">Eco</div>
              </div>
              <div 
                className="grid grid-cols-6 items-center text-gray-700 dark:text-gray-300 p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                onClick={() => setSelectionMode('BOWLER')}
              >
                  <div className="col-span-2 font-medium truncate flex items-center gap-1">
                      {bowler?.playerName || 'Select Bowler'}
                      <Settings size={12} className="text-gray-400" />
                  </div>
                  <div className="text-center">{bowler?.overs || '0.0'}</div>
                  <div className="text-center">{bowler?.maidens || 0}</div>
                  <div className="text-center">{bowler?.runs || 0}</div>
                  <div className="text-center font-bold">{bowler?.wickets || 0}</div>
                  <div className="text-center text-xs">{bowler?.economy || 0}</div>
              </div>
          </div>
      </div>

      {renderKeypad()}
      {renderPlayerSelectionModal()}
    </div>
  );
};
