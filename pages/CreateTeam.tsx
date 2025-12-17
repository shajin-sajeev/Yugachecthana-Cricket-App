
import React, { useState } from 'react';
import { Save, UserPlus, X, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Team, PlayerRole, Player } from '../types';

export const CreateTeam: React.FC = () => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [shortName, setShortName] = useState('');
  const [location, setLocation] = useState('');
  
  const [players, setPlayers] = useState<Partial<Player>[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState<PlayerRole>(PlayerRole.BATSMAN);

  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    const newPlayer: Partial<Player> = {
        id: Date.now().toString(),
        name: newPlayerName,
        role: newPlayerRole,
        battingStyle: 'Right-hand bat',
        bowlingStyle: 'Right-arm medium'
    };
    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const handleSave = () => {
    if (!teamName || !shortName) {
        alert("Please enter Team Name and Short Name");
        return;
    }

    const newTeam: Team = {
        id: Date.now().toString(),
        name: teamName,
        shortName: shortName,
        location: location,
        logoUrl: '',
        players: players as Player[]
    };

    // Save to local storage for demo
    const existingTeams = JSON.parse(localStorage.getItem('yugachethana_teams') || '[]');
    localStorage.setItem('yugachethana_teams', JSON.stringify([...existingTeams, newTeam]));
    
    navigate('/teams');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Team</h2>
      </div>

      {/* Basic Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
         <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Team Details</h3>
         
         <div className="flex flex-col md:flex-row gap-6 mb-6">
             <div className="flex-shrink-0">
                 <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                     <Upload size={24} />
                     <span className="text-xs mt-1">Logo</span>
                 </div>
             </div>
             
             <div className="flex-1 grid gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team Name *</label>
                    <input 
                        type="text" 
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cricket-green"
                        placeholder="e.g. Royal Challengers Bangalore"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Name *</label>
                        <input 
                            type="text" 
                            value={shortName}
                            onChange={(e) => setShortName(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cricket-green uppercase"
                            placeholder="e.g. RCB"
                            maxLength={4}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City/Location</label>
                        <input 
                            type="text" 
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cricket-green"
                            placeholder="e.g. Bangalore"
                        />
                    </div>
                 </div>
             </div>
         </div>
      </div>

      {/* Squad Management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Squad Members</h3>
          
          <div className="flex gap-2 mb-6">
              <input 
                 type="text"
                 value={newPlayerName}
                 onChange={(e) => setNewPlayerName(e.target.value)}
                 className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                 placeholder="Player Name"
                 onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
              />
              <select 
                 value={newPlayerRole}
                 onChange={(e) => setNewPlayerRole(e.target.value as PlayerRole)}
                 className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                  {Object.values(PlayerRole).map(role => (
                      <option key={role} value={role}>{role}</option>
                  ))}
              </select>
              <button 
                onClick={addPlayer}
                className="bg-gray-900 dark:bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                  <UserPlus size={24} />
              </button>
          </div>

          <div className="space-y-2">
              {players.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      No players added yet. Add squad members above.
                  </div>
              ) : (
                  players.map((player) => (
                      <div key={player.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                                  {player.name?.substring(0,1)}
                              </div>
                              <div>
                                  <div className="font-bold text-gray-900 dark:text-white text-sm">{player.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{player.role}</div>
                              </div>
                          </div>
                          <button 
                            onClick={() => removePlayer(player.id!)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                              <X size={18} />
                          </button>
                      </div>
                  ))
              )}
          </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 lg:static lg:bg-transparent lg:border-0 lg:p-0">
          <button 
            onClick={handleSave}
            className="w-full bg-cricket-green text-white font-bold py-3 rounded-xl shadow-lg hover:bg-green-800 transition-colors flex justify-center items-center gap-2"
          >
              <Save size={20} /> Create Team
          </button>
      </div>
    </div>
  );
};
