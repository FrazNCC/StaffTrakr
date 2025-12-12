import React, { useState, useEffect } from 'react';
import { AppData, ViewState, Staff, EventType, EventLog } from './types';
import { getAppData, saveAppData } from './services/storageService';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { LogEvent } from './components/LogEvent';
import { StaffManager } from './components/StaffManager';
import { EventTypeManager } from './components/EventTypeManager';
import { StorageManager } from './components/StorageManager';

const App: React.FC = () => {
  // Use lazy initialization for performance
  const [data, setData] = useState<AppData>(() => getAppData());
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Initial load confirmation
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveAppData(data);
    }
  }, [data, isLoaded]);

  // Reliable State Handlers with Cascade Logic
  
  const handleAddStaff = (staff: Staff) => {
    setData(prev => ({ ...prev, staff: [...prev.staff, staff] }));
  };

  const handleDeleteStaff = (id: string) => {
    // Cascade delete: Remove all logs associated with this staff member
    setData(prev => ({ 
      ...prev, 
      staff: prev.staff.filter(s => s.id !== id),
      logs: prev.logs.filter(l => l.staffId !== id)
    }));
  };

  const handleAddEventType = (type: EventType) => {
    setData(prev => ({ ...prev, eventTypes: [...prev.eventTypes, type] }));
  };

  const handleDeleteEventType = (id: string) => {
    // We keep logs but they will show as "Unknown Type" in dashboard
    setData(prev => ({ ...prev, eventTypes: prev.eventTypes.filter(t => t.id !== id) }));
  };

  const handleAddLog = (log: EventLog) => {
    setData(prev => ({ ...prev, logs: [log, ...prev.logs] }));
  };

  const handleDeleteLog = (id: string) => {
    setData(prev => ({ ...prev, logs: prev.logs.filter(l => l.id !== id) }));
  };

  const handleDeleteLogsByYear = (year: string) => {
    setData(prev => ({
        ...prev,
        logs: prev.logs.filter(l => l.academicYear !== year)
    }));
  };

  const handleClearAllLogs = () => {
      setData(prev => ({ ...prev, logs: [] }));
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Navigation currentView={currentView} setView={setCurrentView} />
      
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {currentView === ViewState.DASHBOARD && (
            <Dashboard 
              staffList={data.staff} 
              eventTypes={data.eventTypes} 
              logs={data.logs} 
              onDeleteLog={handleDeleteLog}
            />
          )}

          {currentView === ViewState.LOG_EVENT && (
            <LogEvent 
              staffList={data.staff} 
              eventTypes={data.eventTypes} 
              onAddLog={handleAddLog}
              onLogComplete={() => setCurrentView(ViewState.DASHBOARD)}
            />
          )}

          {currentView === ViewState.MANAGE_STAFF && (
            <StaffManager 
              staffList={data.staff} 
              onAddStaff={handleAddStaff}
              onDeleteStaff={handleDeleteStaff}
            />
          )}

          {currentView === ViewState.MANAGE_TYPES && (
            <EventTypeManager 
              types={data.eventTypes} 
              onAddType={handleAddEventType}
              onDeleteType={handleDeleteEventType}
            />
          )}

          {currentView === ViewState.STORAGE && (
            <StorageManager
                logs={data.logs}
                staffList={data.staff}
                eventTypes={data.eventTypes}
                onDeleteLogsByYear={handleDeleteLogsByYear}
                onClearAllLogs={handleClearAllLogs}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;