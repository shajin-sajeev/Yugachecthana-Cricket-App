
import React, { useState } from 'react';
import { Save, Calendar, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CreateTournament: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [season, setSeason] = useState('');
  const [type, setType] = useState('League');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSave = () => {
      if (!name) {
          alert("Please enter tournament name");
          return;
      }
      
      const newTournament = {
          id: Date.now().toString(),
          name,
          season,
          type,
          startDate,
          endDate,
          status: 'Upcoming',
          teams: []
      };

      const existing = JSON.parse(localStorage.getItem('yugachethana_tournaments') || '[]');
      localStorage.setItem('yugachethana_tournaments', JSON.stringify([newTournament, ...existing]));
      
      navigate('/tournaments');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Tournament</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
          <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tournament Name *</label>
              <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cricket-green"
                  placeholder="e.g. Premier League"
              />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Season</label>
                  <input 
                      type="text" 
                      value={season}
                      onChange={(e) => setSeason(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g. 2025"
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select 
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                      <option>League</option>
                      <option>Knockout</option>
                      <option>Groups & Knockout</option>
                      <option>Series (Bilateral)</option>
                  </select>
              </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                  <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
              </div>
          </div>
      </div>

      <button 
        onClick={handleSave}
        className="w-full bg-cricket-green text-white font-bold py-3 rounded-xl shadow-lg hover:bg-green-800 transition-colors flex justify-center items-center gap-2"
      >
          <Save size={20} /> Create Tournament
      </button>
    </div>
  );
};
