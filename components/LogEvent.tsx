import React, { useState, useEffect } from 'react';
import { Staff, EventType, EventLog } from '../types';
import { generateId } from '../services/storageService';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface LogEventProps {
  staffList: Staff[];
  eventTypes: EventType[];
  onAddLog: (log: EventLog) => void;
  onLogComplete?: () => void;
}

export const LogEvent: React.FC<LogEventProps> = ({ 
  staffList, 
  eventTypes, 
  onAddLog,
  onLogComplete 
}) => {
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Calculate default academic year
  const getInitialAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-11
    // If Sept (8) or later, it's start of new acad year
    if (month >= 8) return `${year}-${(year + 1).toString().slice(-2)}`;
    return `${year - 1}-${year.toString().slice(-2)}`;
  };

  const [academicYear, setAcademicYear] = useState(getInitialAcademicYear());
  const [value, setValue] = useState(0);
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Update default value when type changes
  useEffect(() => {
    const type = eventTypes.find(t => t.id === selectedType);
    if (type) {
      setValue(type.defaultValue);
    }
  }, [selectedType, eventTypes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff || !selectedType || !academicYear) return;

    const newLog: EventLog = {
      id: generateId(),
      staffId: selectedStaff,
      eventTypeId: selectedType,
      date,
      academicYear,
      value: Number(value),
      notes
    };

    onAddLog(newLog);
    setSuccessMsg('Event logged successfully!');
    
    // Reset partial state
    setNotes('');
    
    // Clear success message after 2 seconds
    setTimeout(() => {
      setSuccessMsg('');
      if (onLogComplete) onLogComplete();
    }, 2000);
  };

  // Generate options for academic years (Current - 1 to Current + 2)
  const getAcademicYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -1; i < 3; i++) {
        const start = currentYear + i;
        years.push(`${start}-${(start + 1).toString().slice(-2)}`);
    }
    return years;
  };

  if (staffList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
        <AlertCircle size={48} className="mb-4 text-slate-300" />
        <h3 className="text-xl font-semibold mb-2">No Staff Available</h3>
        <p>Please add staff members before logging events.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Log Staff Event</h2>
        <p className="text-slate-500">Record a new event, absence, or cover duty for a staff member.</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6">
          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 animate-pulse">
              <CheckCircle size={20} />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Academic Year */}
              <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-slate-700 mb-2">Academic Year</label>
                 <select
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                 >
                    {getAcademicYearOptions().map(yr => (
                        <option key={yr} value={yr}>{yr}</option>
                    ))}
                 </select>
              </div>

              {/* Staff Selector */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Staff Member</label>
                <select
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                >
                  <option value="">Select Staff...</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Event Type Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Event Type</label>
                <select
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">Select Type...</option>
                  {eventTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {/* Impact Value Override */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Impact Value
                  <span className="text-xs text-slate-400 font-normal ml-2">(Auto-filled from Type)</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  className={`w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono ${value > 0 ? 'text-red-600' : value < 0 ? 'text-blue-600' : 'text-slate-600'}`}
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Positive (+) = Usage. Negative (-) = Contribution.
                </p>
              </div>

              {/* Notes */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                  placeholder="Additional details about this event..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={!selectedStaff || !selectedType}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Log Entry
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};