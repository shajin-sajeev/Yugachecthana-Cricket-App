
import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, AlertCircle, ShieldCheck, Lock, Edit3 } from 'lucide-react';
import { PointsRule } from '../types';
import { DEFAULT_RULES } from '../lib/pointsEngine';

export const AdminPointsConfig: React.FC = () => {
  const [rules, setRules] = useState<PointsRule[]>(DEFAULT_RULES);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
      const saved = localStorage.getItem('yugachethana_points_rules');
      if (saved) {
          setRules(JSON.parse(saved));
      }
  }, []);

  const handleSave = () => {
      localStorage.setItem('yugachethana_points_rules', JSON.stringify(rules));
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handlePointChange = (id: string, newPoints: number) => {
    setRules(rules.map(r => r.id === id ? { ...r, points: newPoints } : r));
    setIsEditing(null);
  };

  const toggleActive = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const categories = ['BATTING', 'BOWLING', 'FIELDING', 'IMPACT'] as const;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="text-cricket-green dark:text-green-400" />
            MVP Points Configuration
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Define how points are calculated for Man of the Match and MVP awards.
          </p>
        </div>
        <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-cricket-green text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors shadow-sm"
        >
          <Save size={18} /> {showSaveSuccess ? 'Saved!' : 'Save Rules'}
        </button>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl flex gap-3 items-start">
        <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> Changes here will affect future matches. To recalculate past matches, use the "Recalculate All" function in the Advanced Settings.
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {categories.map(cat => (
          <div key={cat} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white">{cat} Points</h3>
              <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                {rules.filter(r => r.category === cat && r.isActive).length} Active
              </span>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {rules.filter(r => r.category === cat).map(rule => (
                <div key={rule.id} className={`px-4 py-3 flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${!rule.isActive ? 'opacity-50 grayscale' : ''}`}>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 dark:text-gray-200">{rule.event}</div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {isEditing === rule.id ? (
                      <div className="flex items-center gap-1">
                        <input 
                          type="number" 
                          className="w-16 p-1 border rounded text-center dark:bg-gray-700 dark:text-white dark:border-gray-600"
                          value={editValue}
                          onChange={(e) => setEditValue(Number(e.target.value))}
                          autoFocus
                          onBlur={() => handlePointChange(rule.id, editValue)}
                          onKeyDown={(e) => e.key === 'Enter' && handlePointChange(rule.id, editValue)}
                        />
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setIsEditing(rule.id); setEditValue(rule.points); }}
                        className={`font-mono font-bold w-12 text-right ${rule.points > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}
                      >
                        {rule.points > 0 ? '+' : ''}{rule.points}
                      </button>
                    )}

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toggleActive(rule.id)}
                        className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500"
                        title={rule.isActive ? "Disable Rule" : "Enable Rule"}
                      >
                        {rule.isActive ? <Lock size={14} /> : <Plus size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
