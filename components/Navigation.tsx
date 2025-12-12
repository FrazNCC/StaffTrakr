import React from 'react';
import { ViewState } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  Settings2, 
  FileText,
  Database
} from 'lucide-react';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { view: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { view: ViewState.LOG_EVENT, label: 'Log Event', icon: FileText },
    { view: ViewState.MANAGE_STAFF, label: 'Manage Staff', icon: Users },
    { view: ViewState.MANAGE_TYPES, label: 'Event Types', icon: Settings2 },
    { view: ViewState.STORAGE, label: 'Storage & Data', icon: Database },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex-shrink-0 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-2">
          {/* Calendar icon removed or kept? Keeping generic icon */}
          <LayoutDashboard className="w-8 h-8 text-blue-400" />
          <h1 className="text-xl font-bold">StaffTrack</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">Event Logging System</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700 text-xs text-slate-500 text-center">
        v1.1.0
      </div>
    </div>
  );
};