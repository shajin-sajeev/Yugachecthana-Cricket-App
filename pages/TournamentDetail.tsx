import React from 'react';
import { Trophy, Calendar, MapPin } from 'lucide-react';

export const TournamentDetail: React.FC = () => {
  const standings = [
    { team: 'Royals', p: 8, w: 6, l: 2, pts: 12, nrr: '+1.245' },
    { team: 'Titans', p: 8, w: 5, l: 3, pts: 10, nrr: '+0.854' },
    { team: 'Super Kings', p: 8, w: 4, l: 4, pts: 8, nrr: '-0.112' },
    { team: 'Capitals', p: 8, w: 1, l: 7, pts: 2, nrr: '-1.450' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-cricket-green rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Super League T20</h1>
          <div className="flex flex-wrap gap-4 text-white/80 text-sm">
            <span className="flex items-center gap-1"><Calendar size={16} /> Season 2024</span>
            <span className="flex items-center gap-1"><MapPin size={16} /> Bangalore, India</span>
            <span className="flex items-center gap-1"><Trophy size={16} /> Prize: ₹50,000</span>
          </div>
        </div>
        <Trophy className="absolute right-0 bottom-0 text-white/10 -mr-6 -mb-6 w-48 h-48" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white">Points Table</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3">Team</th>
                <th className="px-6 py-3 text-center">P</th>
                <th className="px-6 py-3 text-center">W</th>
                <th className="px-6 py-3 text-center">L</th>
                <th className="px-6 py-3 text-center font-bold text-gray-900 dark:text-white">Pts</th>
                <th className="px-6 py-3 text-right">NRR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {standings.map((row, i) => (
                <tr key={i} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                    <span className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-[10px] text-gray-500 dark:text-gray-300 font-bold">{i + 1}</span>
                    {row.team}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-300">{row.p}</td>
                  <td className="px-6 py-4 text-center text-green-600 dark:text-green-400 font-medium">{row.w}</td>
                  <td className="px-6 py-4 text-center text-red-600 dark:text-red-400">{row.l}</td>
                  <td className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/30">{row.pts}</td>
                  <td className="px-6 py-4 text-right font-mono text-gray-500 dark:text-gray-400">{row.nrr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};