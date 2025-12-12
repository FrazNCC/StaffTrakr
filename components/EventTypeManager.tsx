import React, { useState } from 'react';
import { EventType } from '../types';
import { generateId } from '../services/storageService';
import { PlusCircle, X, Check } from 'lucide-react';

interface EventTypeManagerProps {
  types: EventType[];
  onAddType: (type: EventType) => void;
  onDeleteType: (id: string) => void;
}

const PRESET_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#64748b', // Slate
];

export const EventTypeManager: React.FC<EventTypeManagerProps> = ({ types, onAddType, onDeleteType }) => {
  const [newType, setNewType] = useState<Partial<EventType>>({
    name: '',
    description: '',
    defaultValue: 0,
    color: PRESET_COLORS[5] // Default Blue
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newType.name) return;

    const type: EventType = {
      id: generateId(),
      name: newType.name,
      description: newType.description || '',
      defaultValue: Number(newType.defaultValue),
      color: newType.color || '#3b82f6'
    };

    onAddType(type);
    setNewType({ name: '', description: '', defaultValue: 0, color: PRESET_COLORS[5] });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    onDeleteType(id);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Event Types Configuration</h2>
        <p className="text-slate-500">Define the types of events that can be logged and their impact on staff scoring.</p>
        <div className="mt-2 bg-blue-50 text-blue-800 p-3 rounded-md text-sm border border-blue-100">
          <strong>Tip:</strong> Use positive values (e.g., +1) for absence/cost events. Use negative values (e.g., -1) for contribution/cover events.
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <PlusCircle size={20} className="text-green-500" />
          Create Event Type
        </h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Event Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Sick Leave"
              value={newType.name}
              onChange={(e) => setNewType({ ...newType, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Impact Value (Days/Points)</label>
            <input
              type="number"
              step="0.5"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0"
              value={newType.defaultValue}
              onChange={(e) => setNewType({ ...newType, defaultValue: Number(e.target.value) })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Brief description of the event..."
              value={newType.description}
              onChange={(e) => setNewType({ ...newType, description: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Color Code</label>
            <div className="flex flex-wrap gap-3">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewType({...newType, color: c})}
                  className={`w-8 h-8 rounded-md transition-transform flex items-center justify-center ${newType.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                  title={c}
                >
                  {newType.color === c && <Check size={16} className="text-white drop-shadow-md" />}
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 mt-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Save Event Type
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {types.map((type) => (
          <div key={type.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative group">
            <div className="flex justify-between items-start mb-2">
              <div 
                className="w-6 h-6 rounded-md shadow-sm"
                style={{ backgroundColor: type.color }}
              ></div>
              <button 
                type="button"
                onClick={(e) => handleDelete(e, type.id)}
                className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-slate-100"
                title="Delete Type"
              >
                <X size={16} className="pointer-events-none" />
              </button>
            </div>
            <h4 className="text-lg font-bold text-slate-800">{type.name}</h4>
            <p className="text-sm text-slate-500 mb-3 min-h-[40px]">{type.description}</p>
            <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium ${
              type.defaultValue > 0 
                ? 'bg-red-50 text-red-700 border border-red-100'
                : type.defaultValue < 0 
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'bg-slate-100 text-slate-700'
            }`}>
              Impact: {type.defaultValue > 0 ? '+' : ''}{type.defaultValue}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};