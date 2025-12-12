import { Staff, EventType, EventLog, AppData } from '../types';

const STORAGE_KEY = 'stafftrack_data_v5';

// Fallback ID generator if crypto is not available
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const INITIAL_DATA: AppData = {
  staff: [
    { id: '1', name: 'Alice Johnson' },
    { id: '2', name: 'Bob Smith' },
    { id: '3', name: 'Charlie Davis' },
  ],
  eventTypes: [
    { id: '1', name: 'Sick Leave', description: 'Staff member absent due to illness', defaultValue: 1, color: '#ef4444' }, // Red
    { id: '2', name: 'Class Cover', description: 'Covering a class for a colleague', defaultValue: -1, color: '#3b82f6' }, // Blue
    { id: '3', name: 'Training Day', description: 'Attending mandatory training', defaultValue: 0, color: '#f59e0b' }, // Amber
    { id: '4', name: 'Late Arrival', description: 'Arrived after shift start', defaultValue: 0.5, color: '#ec4899' }, // Pink
  ],
  logs: [
    { id: '101', staffId: '1', eventTypeId: '2', date: new Date().toISOString().split('T')[0], academicYear: '2024-25', value: -1, notes: 'Covered for Dave' },
    { id: '102', staffId: '2', eventTypeId: '1', date: new Date().toISOString().split('T')[0], academicYear: '2024-25', value: 1, notes: 'Flu' },
  ]
};

export const getAppData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    const parsed = JSON.parse(stored);
    
    // Migration helper: ensure logs have academic year if loading from old format
    if (parsed.logs) {
        parsed.logs = parsed.logs.map((log: any) => ({
            ...log,
            academicYear: log.academicYear || '2024-25'
        }));
    }
    
    return parsed;
  } catch (e) {
    console.error("Error loading data", e);
    return INITIAL_DATA;
  }
};

export const saveAppData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving data", e);
  }
};