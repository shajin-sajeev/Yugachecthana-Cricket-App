
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search, X, Plus, Save } from 'lucide-react';
import { Team, Player, Match, PlayerRole } from '../types';

type Step = 'SQUAD_A' | 'SQUAD_B' | 'TOSS' | 'OPENERS' | 'BOWLER';

export const MatchSetup: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [match, setMatch] = useState<Match | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('SQUAD_A');
  
  // States for Toss
  const [tossWinner, setTossWinner] = useState<string>('');
  const [tossDecision, setTossDecision] = useState<'BAT' | 'BOWL'>('BAT');

  // States for Openers
  const [striker, setStriker] = useState<Player | null>(null);
  const [nonStriker, setNonStriker] = useState<Player | null>(null);
  const [bowler, setBowler] = useState<Player | null>(null);

  // Search & Add Player
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');

  useEffect(() => {
    const savedMatches = JSON.parse(localStorage.getItem('yugachethana_matches') || '[]');
    const currentMatch = savedMatches.find((m: any) => m.id === id);
    if (currentMatch) {
        // We do NOT auto-generate mocks anymore to allow user to add real players
        // If empty, they will see empty list and "Add Player" button
        setMatch(currentMatch);
    }
  }, [id]);

  const saveMatchUpdate = (updatedMatch: Match) => {
      const savedMatches = JSON.parse(localStorage.getItem('yugachethana_matches') || '[]');
      const newMatches = savedMatches.map((m: any) => m.id === updatedMatch.id ? updatedMatch : m);
      localStorage.setItem('yugachethana_matches', JSON.stringify(newMatches));
      setMatch(updatedMatch);
  };

  const togglePlayerPlaying = (teamKey: 'teamA' | 'teamB', playerId: string) => {
      if (!match) return;
      const updatedTeam = { ...match[teamKey] };
      updatedTeam.players = updatedTeam.players.map(p => 
          p.id === playerId ? { ...p, isPlaying: !p.isPlaying } : p
      );
      saveMatchUpdate({ ...match, [teamKey]: updatedTeam });
  };

  const handleAddPlayer = (teamKey: 'teamA' | 'teamB') => {
      if (!newPlayerName.trim() || !match) return;

      const newPlayer: Player = {
          id: Date.now().toString(),
          name: newPlayerName,
          role: PlayerRole.ALL_ROUNDER,
          battingStyle: 'Right-hand bat',
          bowlingStyle: 'Right-arm medium',
          matches: 0,
          runs: 0,
          wickets: 0,
          avatarUrl: `https://ui-avatars.com/api/?name=${newPlayerName}`,
          mvpPoints: 0,
          isPlaying: true // Auto select new players
      };

      const updatedTeam = { 
          ...match[teamKey],
          players: [...match[teamKey].players, newPlayer]
      };

      saveMatchUpdate({ ...match, [teamKey]: updatedTeam });
      setNewPlayerName('');
      setIsAddingPlayer(false);
  };

  const handleTossComplete = () => {
      if (!match || !tossWinner) return;
      
      let battingTeamId, bowlingTeamId;
      if (tossDecision === 'BAT') {
          battingTeamId = tossWinner;
          bowlingTeamId = tossWinner === match.teamA.id ? match.teamB.id : match.teamA.id;
      } else {
          bowlingTeamId = tossWinner;
          battingTeamId = tossWinner === match.teamA.id ? match.teamB.id : match.teamA.id;
      }

      saveMatchUpdate({
          ...match,
          tossResult: `${tossWinner === match.teamA.id ? match.teamA.name : match.teamB.name} won the toss and elected to ${tossDecision}`,
          battingTeamId,
          bowlingTeamId
      });
      setCurrentStep('OPENERS');
  };

  const handleStartMatch = () => {
      if (!match || !striker || !nonStriker || !bowler) return;
      
      // Initialize Innings and Live State
      const updatedMatch = {
          ...match,
          status: 'Live',
          currentBatters: { strikerId: striker.id, nonStrikerId: nonStriker.id },
          currentBowlerId: bowler.id,
          innings: [{
              teamId: match.battingTeamId,
              teamName: match.battingTeamId === match.teamA.id ? match.teamA.name : match.teamB.name,
              shortName: match.battingTeamId === match.teamA.id ? match.teamA.shortName : match.teamB.shortName,
              batting: [
                  { playerId: striker.id, playerName: striker.name, runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isNotOut: true, onStrike: true },
                  { playerId: nonStriker.id, playerName: nonStriker.name, runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isNotOut: true, onStrike: false }
              ],
              bowling: [
                  { playerId: bowler.id, playerName: bowler.name, overs: '0.0', maidens: 0, runs: 0, wickets: 0, economy: 0 }
              ],
              extras: 0, wide: 0, noBall: 0, byes: 0, legByes: 0, totalRuns: 0, totalWickets: 0, oversPlayed: '0.0', runRate: 0, didNotBat: []
          }]
      };

      saveMatchUpdate(updatedMatch as Match);
      navigate(`/match/${match.id}/live`);
  };

  if (!match) return <div>Loading...</div>;

  // --- RENDERERS ---

  const renderSquadSelection = (teamKey: 'teamA' | 'teamB') => {
      const team = match[teamKey];
      const players = team.players.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

      return (
          <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
              <div className="p-4 border-b dark:border-gray-800 flex items-center gap-3">
                  <button onClick={() => {
                      if (teamKey === 'teamB') setCurrentStep('SQUAD_A');
                      else navigate('/matches');
                  }}>
                      <ArrowLeft />
                  </button>
                  <h1 className="font-bold text-lg">{team.name} Squad</h1>
              </div>
              
              <div className="p-4 bg-gray-100 dark:bg-gray-800 space-y-3">
                  <div className="relative">
                      <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search Player" 
                        className="w-full pl-10 p-2 rounded-lg border-none focus:ring-0"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Playing Status Header */}
                  {players.length > 0 && (
                      <div className="flex justify-between text-xs font-bold text-gray-500 uppercase px-1">
                          <span>Player</span>
                          <span>Status ({team.players.filter(p => p.isPlaying).length} Playing)</span>
                      </div>
                  )}

                  {players.map((p, i) => (
                      <div key={p.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-xs flex items-center justify-center text-gray-600 dark:text-gray-400">{i+1}</span>
                              <img src={p.avatarUrl} className="w-10 h-10 rounded-full bg-gray-200" />
                              <div>
                                  <div className="font-bold text-gray-900 dark:text-white">{p.name}</div>
                                  <div className="text-xs text-gray-500">{p.role}</div>
                              </div>
                          </div>
                          <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1 text-xs font-medium">
                              <button 
                                onClick={() => !p.isPlaying && togglePlayerPlaying(teamKey, p.id)}
                                className={`px-3 py-1.5 rounded transition-all ${p.isPlaying ? 'bg-orange-500 text-white shadow' : 'text-gray-500'}`}
                              >
                                  Playing
                              </button>
                              <button 
                                onClick={() => p.isPlaying && togglePlayerPlaying(teamKey, p.id)}
                                className={`px-3 py-1.5 rounded transition-all ${!p.isPlaying ? 'bg-gray-500 text-white shadow' : 'text-gray-500'}`}
                              >
                                  Bench
                              </button>
                          </div>
                      </div>
                  ))}
                  
                  {isAddingPlayer ? (
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800 animate-in fade-in">
                          <h4 className="text-sm font-bold text-orange-800 dark:text-orange-200 mb-2">New Player</h4>
                          <div className="flex gap-2">
                              <input 
                                autoFocus
                                type="text"
                                value={newPlayerName}
                                onChange={(e) => setNewPlayerName(e.target.value)}
                                className="flex-1 p-2 rounded-lg border border-orange-300 dark:border-orange-700 dark:bg-gray-800 dark:text-white"
                                placeholder="Player Name"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer(teamKey)}
                              />
                              <button 
                                onClick={() => handleAddPlayer(teamKey)}
                                className="bg-orange-600 text-white p-2 rounded-lg"
                              >
                                  <Save size={20} />
                              </button>
                              <button 
                                onClick={() => setIsAddingPlayer(false)}
                                className="bg-gray-200 text-gray-600 p-2 rounded-lg"
                              >
                                  <X size={20} />
                              </button>
                          </div>
                      </div>
                  ) : (
                      <button 
                        onClick={() => setIsAddingPlayer(true)}
                        className="w-full py-3 text-teal-600 dark:text-teal-400 font-bold text-sm uppercase tracking-wide border-2 border-dashed border-teal-200 dark:border-teal-800 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors flex items-center justify-center gap-2"
                      >
                          <Plus size={18} /> Add Player to Squad
                      </button>
                  )}
              </div>

              <div className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800">
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                      <span>Total Selected</span>
                      <span className="font-bold text-gray-900 dark:text-white">{team.players.filter(p => p.isPlaying).length} Players</span>
                  </div>
                  <button 
                    onClick={() => {
                        if (teamKey === 'teamA') setCurrentStep('SQUAD_B');
                        else setCurrentStep('TOSS');
                    }}
                    className="w-full bg-teal-700 text-white font-bold py-3 rounded-lg"
                  >
                      Next: {teamKey === 'teamA' ? 'Select Team B Squad' : 'Toss'}
                  </button>
              </div>
          </div>
      );
  };

  const renderToss = () => (
      <div className="p-6 h-screen flex flex-col justify-center items-center gap-8 bg-gray-50 dark:bg-gray-900">
          <button onClick={() => setCurrentStep('SQUAD_B')} className="absolute top-4 left-4"><ArrowLeft /></button>
          
          <div className="text-center">
             <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Toss Time</h2>
             <p className="text-gray-500">Who won the toss?</p>
          </div>
          
          <div className="flex gap-4 w-full">
              <button 
                onClick={() => setTossWinner(match.teamA.id)}
                className={`flex-1 p-6 rounded-2xl border-4 font-bold text-lg transition-all ${tossWinner === match.teamA.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20 scale-105 shadow-xl' : 'border-gray-200 dark:border-gray-700 dark:bg-gray-800'}`}
              >
                  {match.teamA.name}
              </button>
              <button 
                onClick={() => setTossWinner(match.teamB.id)}
                className={`flex-1 p-6 rounded-2xl border-4 font-bold text-lg transition-all ${tossWinner === match.teamB.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20 scale-105 shadow-xl' : 'border-gray-200 dark:border-gray-700 dark:bg-gray-800'}`}
              >
                  {match.teamB.name}
              </button>
          </div>

          {tossWinner && (
              <div className="w-full animate-in slide-in-from-bottom-5 fade-in">
                <p className="text-center text-gray-500 mb-4 font-medium">Winner elected to?</p>
                <div className="flex gap-4 w-full">
                    <button 
                        onClick={() => setTossDecision('BAT')}
                        className={`flex-1 p-4 rounded-xl border-2 font-bold flex flex-col items-center gap-2 ${tossDecision === 'BAT' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' : 'border-gray-200 dark:border-gray-700 dark:bg-gray-800'}`}
                    >
                        <span>🏏</span> Bat
                    </button>
                    <button 
                        onClick={() => setTossDecision('BOWL')}
                        className={`flex-1 p-4 rounded-xl border-2 font-bold flex flex-col items-center gap-2 ${tossDecision === 'BOWL' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' : 'border-gray-200 dark:border-gray-700 dark:bg-gray-800'}`}
                    >
                        <span>🥎</span> Bowl
                    </button>
                </div>
                <button 
                    onClick={handleTossComplete}
                    className="w-full bg-teal-700 text-white font-bold py-4 rounded-xl mt-8 shadow-lg hover:bg-teal-800 transition-colors text-lg"
                >
                    Start Match
                </button>
              </div>
          )}
      </div>
  );

  const renderPlayerSelect = (mode: 'BATSMAN' | 'BOWLER') => {
      // Determine which team list to show
      const isBattingSelection = mode === 'BATSMAN';
      const teamId = isBattingSelection ? match.battingTeamId : match.bowlingTeamId;
      const team = teamId === match.teamA.id ? match.teamA : match.teamB;
      const players = team.players.filter(p => p.isPlaying);

      return (
          <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
             <div className="bg-orange-500 p-4 text-white flex justify-between items-center shadow-md z-10">
                 <button onClick={() => {
                     if (mode === 'BATSMAN') setCurrentStep('TOSS');
                     else setCurrentStep('OPENERS');
                 }}><ArrowLeft /></button>
                 <h1 className="font-bold text-lg">Select {isBattingSelection ? 'Openers' : 'Opening Bowler'}</h1>
                 <div className="w-6"></div>
             </div>
             
             <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                  <div className="text-xs font-bold text-gray-500 uppercase mb-2">Select from {team.name}</div>
                  <div className="relative">
                      <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input type="text" placeholder="Search Player" className="w-full pl-10 p-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {players.map((p, i) => {
                      const isSelected = p.id === striker?.id || p.id === nonStriker?.id || p.id === bowler?.id;
                      return (
                          <div 
                            key={p.id} 
                            onClick={() => {
                                if (isSelected) return;
                                if (mode === 'BOWLER') {
                                    setBowler(p);
                                    // Normally we wait for user to click "Start Match" button, 
                                    // but let's auto-select and show the confirmation button below
                                } else {
                                    if (!striker) setStriker(p);
                                    else if (!nonStriker && p.id !== striker?.id) setNonStriker(p);
                                }
                            }}
                            className={`flex justify-between items-center p-3 rounded-lg border transition-colors cursor-pointer ${isSelected ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-orange-300'}`}
                          >
                              <div className="flex items-center gap-3">
                                  <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-xs flex items-center justify-center text-gray-500">{i+1}</span>
                                  <img src={p.avatarUrl} className="w-10 h-10 rounded-full bg-gray-200" />
                                  <div>
                                      <div className="font-bold text-gray-900 dark:text-white">{p.name}</div>
                                      <div className="text-xs text-gray-500">{p.role}</div>
                                  </div>
                              </div>
                              {isSelected && <div className="text-orange-600 dark:text-orange-400 font-bold text-xs bg-orange-100 dark:bg-orange-900/50 px-2 py-1 rounded">Selected</div>}
                          </div>
                      );
                  })}
              </div>

              {/* Visual footer for Batting selection context */}
              <div className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900">
                  {mode === 'BATSMAN' ? (
                      <div className="flex gap-4">
                          <div className={`flex-1 p-3 rounded-lg border-2 ${striker ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-dashed border-gray-300'}`}>
                              <div className="text-xs text-gray-500">Striker</div>
                              <div className="font-bold text-gray-900 dark:text-white truncate">{striker ? striker.name : 'Select'}</div>
                          </div>
                          <div className={`flex-1 p-3 rounded-lg border-2 ${nonStriker ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-dashed border-gray-300'}`}>
                              <div className="text-xs text-gray-500">Non-Striker</div>
                              <div className="font-bold text-gray-900 dark:text-white truncate">{nonStriker ? nonStriker.name : 'Select'}</div>
                          </div>
                      </div>
                  ) : (
                      <div className={`w-full p-3 rounded-lg border-2 ${bowler ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-dashed border-gray-300'}`}>
                          <div className="text-xs text-gray-500">Opening Bowler</div>
                          <div className="font-bold text-gray-900 dark:text-white truncate">{bowler ? bowler.name : 'Select'}</div>
                      </div>
                  )}

                  <button 
                    disabled={mode === 'BATSMAN' ? (!striker || !nonStriker) : !bowler}
                    onClick={() => mode === 'BATSMAN' ? setCurrentStep('BOWLER') : handleStartMatch()}
                    className="w-full bg-teal-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-bold py-3.5 rounded-xl mt-4 shadow-lg hover:bg-teal-800 transition-colors"
                  >
                      {mode === 'BATSMAN' ? 'Next: Select Bowler' : 'Start Match'}
                  </button>
              </div>
          </div>
      );
  };

  switch (currentStep) {
      case 'SQUAD_A': return renderSquadSelection('teamA');
      case 'SQUAD_B': return renderSquadSelection('teamB');
      case 'TOSS': return renderToss();
      case 'OPENERS': return renderPlayerSelect('BATSMAN');
      case 'BOWLER': return renderPlayerSelect('BOWLER');
      default: return <div>Unknown Step</div>;
  }
};
