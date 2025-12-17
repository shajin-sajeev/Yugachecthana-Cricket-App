
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, X, Search, RotateCcw, AlertTriangle, ChevronDown } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Match, Player, DismissalType, BattingStats, BowlingStats } from '../types';

// --- Local Helper Types ---
type OverlayType = 'NONE' | 'WIDE' | 'NO_BALL' | 'BYE' | 'LEG_BYE' | 'WICKET' | 'BOWLER_SELECT' | 'BATSMAN_SELECT';

// --- Local Hook for Match Data Management ---
const useMatchEngine = (id: string) => {
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
                        teamId: m.battingTeamId || m.teamA.id,
                        teamName: m.battingTeamId === m.teamA.id ? m.teamA.name : m.teamB.name,
                        shortName: m.battingTeamId === m.teamA.id ? m.teamA.shortName : m.teamB.shortName,
                        totalRuns: 0,
                        totalWickets: 0,
                        oversPlayed: '0.0',
                        runRate: 0,
                        extras: 0,
                        wide: 0, noBall: 0, byes: 0, legByes: 0,
                        batting: [],
                        bowling: [],
                        recentBalls: [],
                        didNotBat: []
                     }];
                }
                setMatch(m);
            }
            setLoading(false);
        };
        load();
    }, [id]);

    const persistMatch = (updatedMatch: Match) => {
        setMatch(updatedMatch);
        const savedMatches = JSON.parse(localStorage.getItem('yugachethana_matches') || '[]');
        const newMatches = savedMatches.map((m: any) => m.id === updatedMatch.id ? updatedMatch : m);
        localStorage.setItem('yugachethana_matches', JSON.stringify(newMatches));
    };

    return { match, persistMatch, loading };
};

export const LiveScoring: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { match, persistMatch, loading } = useMatchEngine(id || '');
  
  // UI State
  const [overlay, setOverlay] = useState<OverlayType>('NONE');
  const [wicketType, setWicketType] = useState<DismissalType>(DismissalType.CAUGHT);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Undo Stack (Basic implementation)
  // In a real app, you'd store full match state snapshots or event logs
  
  if (loading || !match) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Match Engine...</div>;

  // --- Derived State ---
  const currentInningIndex = match.innings && match.innings.length > 0 ? match.innings.length - 1 : 0;
  const inning = match.innings![currentInningIndex];
  
  const battingTeam = match.teamA.id === inning.teamId ? match.teamA : match.teamB;
  const bowlingTeam = match.teamA.id === inning.teamId ? match.teamB : match.teamA;

  const strikerId = match.currentBatters?.strikerId;
  const nonStrikerId = match.currentBatters?.nonStrikerId;
  const bowlerId = match.currentBowlerId;

  const striker = inning.batting.find(p => p.playerId === strikerId);
  const nonStriker = inning.batting.find(p => p.playerId === nonStrikerId);
  const bowler = inning.bowling.find(p => p.playerId === bowlerId);

  // --- Logic Core ---

  const updateMatchState = (
    runs: number, 
    isWide: boolean, 
    isNoBall: boolean, 
    isBye: boolean, 
    isLegBye: boolean,
    isWicket: boolean,
    dismissalInfo?: { type: DismissalType, playerOutId: string, newBatsman?: Player }
  ) => {
    const newInning = { ...inning };
    const newMatch = { ...match };

    // 1. Calculate Runs & Extras
    const extrasToAdd = (isWide || isNoBall ? 1 : 0) + (isBye || isLegBye ? runs : 0);
    const batsmanRuns = (isWide || isBye || isLegBye) ? 0 : runs;
    const totalRunsToAdd = batsmanRuns + extrasToAdd;

    newInning.totalRuns += totalRunsToAdd;
    if (isWide) newInning.wide += 1 + runs; // usually wide + runs are all wides
    if (isNoBall) newInning.noBall += 1;
    if (isBye) newInning.byes += runs;
    if (isLegBye) newInning.legByes += runs;
    newInning.extras += extrasToAdd;

    // 2. Validate Ball & Overs
    const isValidBall = !isWide && !isNoBall;
    let overFinished = false;

    if (isValidBall) {
        const [ovs, balls] = newInning.oversPlayed.split('.').map(Number);
        let newBalls = balls + 1;
        let newOvers = ovs;
        if (newBalls === 6) {
            newOvers += 1;
            newBalls = 0;
            overFinished = true;
        }
        newInning.oversPlayed = `${newOvers}.${newBalls}`;
    }

    // 3. Update Striker Stats
    if (striker) {
        if (isValidBall) striker.balls += 1;
        striker.runs += batsmanRuns;
        if (batsmanRuns === 4) striker.fours += 1;
        if (batsmanRuns === 6) striker.sixes += 1;
        striker.strikeRate = striker.balls > 0 ? parseFloat(((striker.runs / striker.balls) * 100).toFixed(1)) : 0;
    }

    // 4. Update Bowler Stats
    if (bowler) {
        // Only valid balls count to bowler overs
        if (isValidBall) {
            const [ovs, balls] = bowler.overs.split('.').map(Number);
            let newBalls = balls + 1;
            let newOvers = ovs;
            if (newBalls === 6) { newOvers += 1; newBalls = 0; }
            bowler.overs = `${newOvers}.${newBalls}`;
        }
        
        // Bowler runs logic: Generally wides and no-balls count to bowler, byes/legbyes do NOT
        let runsChargedToBowler = batsmanRuns;
        if (isWide || isNoBall) runsChargedToBowler += 1; // Penalty
        if (isWide && runs > 0) runsChargedToBowler += runs; // Extra runs on wide
        
        // If it's bye/legbye, bowler is NOT charged for the runs ran, but IS charged for No Ball penalty if NB+Bye
        if (isBye || isLegBye) {
             runsChargedToBowler = isNoBall ? 1 : 0;
        }

        bowler.runs += runsChargedToBowler;

        if (isWicket && dismissalInfo?.type !== DismissalType.RUN_OUT) {
            bowler.wickets += 1;
        }

        const totalBalls = parseFloat(bowler.overs.split('.')[0]) * 6 + parseFloat(bowler.overs.split('.')[1]);
        bowler.economy = totalBalls > 0 ? parseFloat(((bowler.runs / totalBalls) * 6).toFixed(1)) : 0;
    }

    // 5. Update Recent Balls (Timeline)
    let ballLabel = `${runs}`;
    if (isWicket) ballLabel = 'W';
    else if (isWide) ballLabel = `${runs > 0 ? runs + 1 : 1}wd`; // 1wd or 5wd
    else if (isNoBall) ballLabel = `${runs > 0 ? runs + 1 : 1}nb`;
    else if (isBye) ballLabel = `${runs}b`;
    else if (isLegBye) ballLabel = `${runs}lb`;
    else if (runs === 4) ballLabel = '4';
    else if (runs === 6) ballLabel = '6';
    else if (runs === 0) ballLabel = '•';
    
    newInning.recentBalls = [...(newInning.recentBalls || []), ballLabel];

    // 6. Handle Wicket
    if (isWicket && dismissalInfo) {
        newInning.totalWickets += 1;
        // Mark player out
        const playerOutIndex = newInning.batting.findIndex(p => p.playerId === dismissalInfo.playerOutId);
        if (playerOutIndex > -1) {
            newInning.batting[playerOutIndex].isNotOut = false;
            newInning.batting[playerOutIndex].dismissalText = `${dismissalInfo.type} b ${bowler?.playerName}`;
        }

        // Add new batsman
        if (dismissalInfo.newBatsman) {
            const newBat: BattingStats = {
                playerId: dismissalInfo.newBatsman.id,
                playerName: dismissalInfo.newBatsman.name,
                runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isNotOut: true,
                onStrike: true // Usually new batsman takes strike unless runout crossed? Simplifying to yes.
            };
            newInning.batting.push(newBat);
            
            // Update current batters
            if (match.currentBatters?.strikerId === dismissalInfo.playerOutId) {
                newMatch.currentBatters.strikerId = newBat.playerId;
            } else if (match.currentBatters?.nonStrikerId === dismissalInfo.playerOutId) {
                newMatch.currentBatters.nonStrikerId = newBat.playerId;
            }
        }
    }

    // 7. Strike Rotation
    // Swap if:
    // a) Runs scored (excluding extras like wide that don't count as ball) is ODD.
    //    BUT for Byes/LegByes, runs ARE run, so swap applies.
    // b) Over ends (Swap strikership).
    // c) Wicket logic (New batsman usually takes strike, or crossed - simplified above).
    
    let shouldSwap = false;
    const runsRan = (isBye || isLegBye || (!isWide && !isNoBall)) ? runs : 0; // Did they physically run?
    // Wides: if 1wd (ball + 0 run), no swap. If 1wd + 1 run, they ran 1, so swap.
    // Correct logic: if total physical runs are odd, swap.
    if (runs % 2 !== 0) shouldSwap = true;
    
    if (overFinished) {
        shouldSwap = !shouldSwap; // Invert swap at end of over
    }

    if (shouldSwap && !isWicket) { // Don't double swap on wicket as we handled new batsman placement
        const temp = newMatch.currentBatters!.strikerId;
        newMatch.currentBatters!.strikerId = newMatch.currentBatters!.nonStrikerId;
        newMatch.currentBatters!.nonStrikerId = temp;
    }

    // 8. Over Finished Handling
    if (overFinished) {
        setOverlay('BOWLER_SELECT'); // Force bowler selection
        newMatch.currentBowlerId = ''; // Clear current
    }

    // Save
    newMatch.innings![currentInningIndex] = newInning;
    persistMatch(newMatch);
    if (!overFinished) setOverlay('NONE'); // Close keypad if not over end
  };

  // --- Handlers ---
  
  const handleBallScore = (runs: number) => {
      // Standard run scoring
      updateMatchState(runs, false, false, false, false, false);
  };

  const handleExtra = (type: 'WIDE' | 'NO_BALL' | 'BYE' | 'LEG_BYE', runs: number) => {
      updateMatchState(runs, type === 'WIDE', type === 'NO_BALL', type === 'BYE', type === 'LEG_BYE', false);
  };

  const handleWicketConfirm = (newBatsman: Player) => {
      // Assuming striker is out for simplicity in this UI, can be extended
      updateMatchState(0, false, false, false, false, true, {
          type: wicketType,
          playerOutId: strikerId!, // Default to striker
          newBatsman: newBatsman
      });
      setOverlay('NONE');
  };

  const handleBowlerSelect = (player: Player) => {
      const newMatch = { ...match };
      const inning = newMatch.innings![currentInningIndex];
      
      // Check if bowler exists in stats
      let bowlerStats = inning.bowling.find(b => b.playerId === player.id);
      if (!bowlerStats) {
          bowlerStats = {
              playerId: player.id,
              playerName: player.name,
              overs: '0.0', maidens: 0, runs: 0, wickets: 0, economy: 0
          };
          inning.bowling.push(bowlerStats);
      }
      
      newMatch.currentBowlerId = player.id;
      persistMatch(newMatch);
      setOverlay('NONE');
  };

  // --- Renderers ---

  const renderKeypad = () => {
    if (overlay === 'BOWLER_SELECT' || overlay === 'WICKET') return null; // handled by modals

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 z-20 pb-safe">
            {overlay === 'NONE' ? (
                <div className="grid grid-cols-5 gap-2 px-2 pb-4">
                    {/* Row 1: Runs */}
                    {[0, 1, 2, 3, 4, 6].map(run => (
                        <button 
                            key={run} 
                            onClick={() => handleBallScore(run)}
                            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 font-bold text-xl py-4 rounded-xl shadow-sm active:scale-95 transition-transform"
                        >
                            {run === 0 ? '•' : run}
                        </button>
                    ))}
                    
                    {/* Extras */}
                    <button onClick={() => setOverlay('WIDE')} className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-bold py-4 rounded-xl border border-orange-200 dark:border-orange-800">WD</button>
                    <button onClick={() => setOverlay('NO_BALL')} className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-bold py-4 rounded-xl border border-orange-200 dark:border-orange-800">NB</button>
                    <button onClick={() => setOverlay('BYE')} className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold py-4 rounded-xl border border-blue-200 dark:border-blue-800">B</button>
                    <button onClick={() => setOverlay('LEG_BYE')} className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold py-4 rounded-xl border border-blue-200 dark:border-blue-800">LB</button>
                    
                    {/* Wicket */}
                    <button onClick={() => setOverlay('WICKET')} className="col-span-2 bg-red-600 text-white font-bold py-4 rounded-xl shadow-md active:scale-95 transition-transform uppercase tracking-wider">
                        OUT
                    </button>
                    <button className="col-span-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold py-4 rounded-xl flex items-center justify-center">
                        <RotateCcw size={20} />
                    </button>
                </div>
            ) : (
                /* Extras Sub-Menu */
                <div className="animate-in slide-in-from-bottom-10 fade-in duration-200 pb-4">
                    <div className="flex justify-between items-center mb-4 px-2">
                         <span className="font-bold text-gray-900 dark:text-white capitalize text-lg">{overlay.replace('_', ' ')} Runs</span>
                         <button onClick={() => setOverlay('NONE')}><X className="text-gray-500" /></button>
                    </div>
                    <div className="grid grid-cols-4 gap-3 px-2">
                        {[0, 1, 2, 3, 4, 6].map(run => (
                             <button
                                key={run}
                                onClick={() => handleExtra(overlay as any, run)}
                                className="bg-orange-500 text-white font-bold py-4 rounded-xl shadow-sm active:scale-95 transition-transform"
                             >
                                 {run} + {overlay === 'WIDE' ? 'WD' : overlay === 'NO_BALL' ? 'NB' : overlay === 'BYE' ? 'B' : 'LB'}
                             </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
  };

  const renderWicketModal = () => {
      if (overlay !== 'WICKET') return null;
      
      const nextBatsmen = battingTeam.players.filter(p => 
        !inning.batting.find(b => b.playerId === p.id) // Not already batted
      );

      return (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl overflow-hidden animate-in slide-in-from-bottom-10">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-red-600 text-white">
                      <h3 className="font-bold">Fall of Wicket</h3>
                      <button onClick={() => setOverlay('NONE')}><X /></button>
                  </div>
                  
                  <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                      {/* Step 1: Who got out? (Simplified to Striker usually) */}
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-200 dark:bg-red-800 flex items-center justify-center font-bold text-red-700 dark:text-red-200">
                             {striker?.playerName.substring(0,1)}
                          </div>
                          <div>
                              <div className="font-bold text-gray-900 dark:text-white">{striker?.playerName}</div>
                              <div className="text-xs text-red-600 dark:text-red-400">is Out</div>
                          </div>
                      </div>

                      {/* Step 2: How? */}
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Dismissal Type</label>
                          <div className="grid grid-cols-3 gap-2">
                              {Object.values(DismissalType).filter(t => t !== 'Retired').map(t => (
                                  <button
                                    key={t}
                                    onClick={() => setWicketType(t)}
                                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-colors ${
                                        wicketType === t 
                                        ? 'bg-red-600 text-white border-red-600' 
                                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                                    }`}
                                  >
                                      {t}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Step 3: New Batsman */}
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Select New Batsman</label>
                          <div className="space-y-2">
                              {nextBatsmen.map(p => (
                                  <button
                                    key={p.id}
                                    onClick={() => handleWicketConfirm(p)}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                  >
                                      <img src={p.avatarUrl} className="w-8 h-8 rounded-full bg-gray-200" />
                                      <div className="text-left">
                                          <div className="font-bold text-sm text-gray-900 dark:text-white">{p.name}</div>
                                          <div className="text-xs text-gray-500">{p.role}</div>
                                      </div>
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const renderBowlerSelectModal = () => {
      if (overlay !== 'BOWLER_SELECT') return null;

      const bowlers = bowlingTeam.players; // In real app, filter out current bowler if continuous overs not allowed

      return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl overflow-hidden animate-in zoom-in-95">
                <div className="p-6 text-center border-b border-gray-100 dark:border-gray-700">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
                        <RotateCcw size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Over Completed</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Select bowler for the next over</p>
                </div>
                
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-2">
                        {bowlers.map(p => (
                            <button
                                key={p.id}
                                disabled={p.id === bowlerId} // Basic rule: can't bowl 2 in a row
                                onClick={() => handleBowlerSelect(p)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg border ${
                                    p.id === bowlerId 
                                    ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 border-gray-200' 
                                    : 'hover:bg-green-50 dark:hover:bg-green-900/10 border-gray-200 dark:border-gray-700 cursor-pointer'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="font-bold text-gray-900 dark:text-white">{p.name}</div>
                                    <div className="text-xs text-gray-500">{p.bowlingStyle}</div>
                                </div>
                                {p.id === bowlerId && <span className="text-xs font-bold text-red-500">Just Bowled</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 font-sans overflow-hidden">
      {/* 1. Header Scoreboard */}
      <div className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700">
              <button onClick={() => navigate(-1)}><ArrowLeft className="text-gray-600 dark:text-gray-300" /></button>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Live Match</div>
              <button><Settings className="text-gray-600 dark:text-gray-300" size={20} /></button>
          </div>
          
          <div className="px-4 py-4">
              <div className="flex justify-between items-start">
                  <div>
                      <div className="flex items-center gap-2 mb-1">
                          <img src={match.teamA.logoUrl || "https://ui-avatars.com/api/?name=Team"} className="w-8 h-8 rounded-full bg-gray-200" />
                          <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-none">{inning.teamName}</h1>
                      </div>
                      <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-gray-900 dark:text-white">{inning.totalRuns}/{inning.totalWickets}</span>
                          <span className="text-lg text-gray-500 font-medium">({inning.oversPlayed})</span>
                      </div>
                  </div>
                  <div className="text-right">
                       <div className="text-xs font-bold text-gray-400 uppercase mb-1">CRR</div>
                       <div className="text-xl font-bold text-gray-900 dark:text-white">
                           {parseFloat(inning.oversPlayed) > 0 ? (inning.totalRuns / parseFloat(inning.oversPlayed)).toFixed(2) : '0.0'}
                       </div>
                       <div className="text-xs text-green-600 font-bold mt-1">Projected: {Math.round((inning.totalRuns / (parseFloat(inning.oversPlayed) || 1)) * 20)}</div>
                  </div>
              </div>

              {/* Target Indicator if 2nd innings */}
              {currentInningIndex > 0 && (
                   <div className="mt-3 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full inline-block">
                       Need 45 runs in 32 balls
                   </div>
              )}
          </div>
      </div>

      {/* 2. Batsman Cards */}
      <div className="p-2 space-y-2 overflow-y-auto pb-48">
          {/* Striker */}
          <div className={`bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border-l-4 border-cricket-green flex justify-between items-center relative overflow-hidden`}>
              <div className="flex items-center gap-3 z-10">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500 text-sm">
                      {striker?.playerName.substring(0,2)}
                  </div>
                  <div>
                      <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {striker?.playerName || 'Select Striker'} <span className="text-cricket-green">★</span>
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                          SR: {striker?.strikeRate || 0}
                      </div>
                  </div>
              </div>
              <div className="text-right z-10">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{striker?.runs || 0}<span className="text-sm font-normal text-gray-400">({striker?.balls || 0})</span></div>
                  <div className="text-xs text-gray-400 flex gap-2 justify-end">
                      <span>4s: <b>{striker?.fours}</b></span>
                      <span>6s: <b>{striker?.sixes}</b></span>
                  </div>
              </div>
          </div>

          {/* Non-Striker */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm flex justify-between items-center opacity-80">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500 text-sm">
                      {nonStriker?.playerName.substring(0,2)}
                  </div>
                  <div>
                      <div className="font-bold text-gray-900 dark:text-white">
                          {nonStriker?.playerName || 'Select Non-Striker'}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                          SR: {nonStriker?.strikeRate || 0}
                      </div>
                  </div>
              </div>
              <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{nonStriker?.runs || 0}<span className="text-sm font-normal text-gray-400">({nonStriker?.balls || 0})</span></div>
                  <div className="text-xs text-gray-400 flex gap-2 justify-end">
                      <span>4s: <b>{nonStriker?.fours}</b></span>
                      <span>6s: <b>{nonStriker?.sixes}</b></span>
                  </div>
              </div>
          </div>

          {/* Bowler Card */}
          <div className="bg-cricket-green text-white rounded-xl p-3 shadow-lg mt-2">
              <div className="flex justify-between items-center mb-2">
                  <div className="font-bold">{bowler?.playerName || 'Select Bowler'}</div>
                  <div className="text-xs opacity-80">{bowler?.overs || '0.0'} Overs</div>
              </div>
              <div className="flex justify-between text-center divide-x divide-white/20">
                  <div className="flex-1">
                      <div className="text-xl font-bold">{bowler?.wickets || 0}</div>
                      <div className="text-[10px] uppercase opacity-70">Wickets</div>
                  </div>
                  <div className="flex-1">
                      <div className="text-xl font-bold">{bowler?.runs || 0}</div>
                      <div className="text-[10px] uppercase opacity-70">Runs</div>
                  </div>
                  <div className="flex-1">
                      <div className="text-xl font-bold">{bowler?.economy || 0}</div>
                      <div className="text-[10px] uppercase opacity-70">Economy</div>
                  </div>
                   <div className="flex-1">
                      <div className="text-xl font-bold">{bowler?.maidens || 0}</div>
                      <div className="text-[10px] uppercase opacity-70">Maidens</div>
                  </div>
              </div>
          </div>

          {/* Recent Balls Timeline */}
          <div className="flex gap-2 py-2 overflow-x-auto no-scrollbar">
              {(inning.recentBalls || []).slice(-8).reverse().map((ball, i) => (
                  <div key={i} className={`
                    w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs
                    ${ball === 'W' ? 'bg-red-500 text-white' : 
                      ball === '4' || ball === '6' ? 'bg-green-500 text-white' :
                      ball.includes('wd') || ball.includes('nb') ? 'bg-orange-200 text-orange-800' : 
                      'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-white'}
                  `}>
                      {ball}
                  </div>
              ))}
              <div className="text-xs text-gray-400 flex items-center px-2">This Over</div>
          </div>
      </div>

      {/* Modals & Keypad */}
      {renderKeypad()}
      {renderWicketModal()}
      {renderBowlerSelectModal()}
    </div>
  );
};
