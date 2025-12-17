
import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, MapPin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Team } from '../types';
import { isAdmin } from '../lib/auth';

export const Teams: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);

  // Simulate fetching teams
  useEffect(() => {
    const savedTeams = localStorage.getItem('yugachethana_teams');
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    } else {
      // Mock data if empty
      setTeams([
        {
          id: 't1',
          name: 'Chendamelam',
          shortName: 'CHE',
          location: 'Bangalore',
          logoUrl: '',
          players: []
        },
        {
          id: 't2',
          name: 'Vallam Kali',
          shortName: 'VK',
          location: 'Kerala',
          logoUrl: '',
          players: []
        }
      ]);
    }
  }, []);

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.shortName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Teams</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage clubs and squads</p>
        </div>
        {isAdmin() && (
          <button 
            onClick={() => navigate('/teams/new')}
            className="flex items-center gap-2 bg-cricket-green text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors shadow-sm"
          >
            <Plus size={20} /> <span className="hidden sm:inline">Create Team</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search teams..."
          className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cricket-green focus:border-transparent sm:text-sm shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeams.map((team) => (
          <div 
            key={team.id}
            onClick={() => navigate(`/teams/${team.id}`)}
            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-xl font-bold text-gray-500 dark:text-gray-300 border-2 border-white dark:border-gray-600 shadow-sm">
                      {team.logoUrl ? <img src={team.logoUrl} className="w-full h-full rounded-full object-cover" /> : team.shortName.substring(0,2)}
                  </div>
                  <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-cricket-green dark:group-hover:text-green-400 transition-colors">{team.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <MapPin size={12} /> {team.location || 'Unknown'}
                      </div>
                  </div>
               </div>
               <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg text-gray-400 group-hover:bg-green-50 dark:group-hover:bg-green-900/30 group-hover:text-cricket-green transition-colors">
                  <ChevronRight size={20} />
               </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Users size={16} />
                    <span>{team.players.length} Players</span>
                </div>
                <div className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                    ID: {team.shortName}
                </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredTeams.length === 0 && (
          <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No teams found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new team.</p>
              <div className="mt-6">
                <button
                    onClick={() => navigate('/teams/new')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cricket-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Create Team
                </button>
              </div>
          </div>
      )}
    </div>
  );
};
