
import React, { useState } from 'react';
import { Plus, Search, Calendar, Trophy, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isAdmin } from '../lib/auth';

export const Tournaments: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock Data
  const tournaments = [
      { id: 't1', name: 'Yugachethana Premier League', season: 'Season 4', dates: '10 Dec - 25 Dec 2025', teams: 8, status: 'Ongoing' },
      { id: 't2', name: 'Monsoon Cup', season: '2025', dates: 'Aug 2025', teams: 16, status: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tournaments</h2>
          <p className="text-gray-500 dark:text-gray-400">Leagues, Cups and Series</p>
        </div>
        {isAdmin() && (
          <button 
            onClick={() => navigate('/tournaments/new')}
            className="flex items-center gap-2 bg-cricket-green text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors shadow-sm"
          >
            <Plus size={20} /> <span className="hidden sm:inline">Create Tournament</span>
          </button>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search tournaments..."
          className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cricket-green focus:border-transparent sm:text-sm shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
          {tournaments.map((tour) => (
              <div 
                key={tour.id} 
                onClick={() => navigate(`/tournaments/${tour.id}`)}
                className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer flex justify-between items-center"
              >
                  <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg flex items-center justify-center">
                          <Trophy size={24} />
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{tour.name}</h3>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1"><Calendar size={12} /> {tour.dates}</span>
                              <span className="bg-gray-100 dark:bg-gray-700 px-2 rounded text-xs">{tour.season}</span>
                          </div>
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full 
                          ${tour.status === 'Ongoing' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}
                      `}>
                          {tour.status}
                      </span>
                      <ChevronRight size={20} className="text-gray-300" />
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};
