import React, { useMemo } from 'react';
import { Staff, EventLog, EventType } from '../types';
import { Download, Trash2, Database, AlertTriangle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StorageManagerProps {
  logs: EventLog[];
  staffList: Staff[];
  eventTypes: EventType[];
  onDeleteLogsByYear: (year: string) => void;
  onClearAllLogs: () => void;
}

export const StorageManager: React.FC<StorageManagerProps> = ({ 
  logs, 
  staffList, 
  eventTypes,
  onDeleteLogsByYear,
  onClearAllLogs
}) => {
  
  // Group logs by academic year
  const groupedLogs = useMemo(() => {
    const groups: Record<string, EventLog[]> = {};
    logs.forEach(log => {
      const year = log.academicYear || 'Unknown';
      if (!groups[year]) groups[year] = [];
      groups[year].push(log);
    });
    return groups;
  }, [logs]);

  const sortedYears = Object.keys(groupedLogs).sort().reverse();

  const handleDownloadPDF = (year: string) => {
    const doc = new jsPDF();
    const yearLogs = groupedLogs[year] || [];
    
    // Title
    doc.setFontSize(18);
    doc.text(`StaffTrack Report: Academic Year ${year}`, 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 28);

    // Prepare table data
    const tableData = yearLogs.map(log => {
        const staff = staffList.find(s => s.id === log.staffId)?.name || 'Unknown Staff';
        const type = eventTypes.find(t => t.id === log.eventTypeId)?.name || 'Unknown Type';
        return [
            log.date,
            staff,
            type,
            log.value.toString(),
            log.notes
        ];
    });

    autoTable(doc, {
        head: [['Date', 'Staff Member', 'Event Type', 'Value', 'Notes']],
        body: tableData,
        startY: 35,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185] },
        alternateRowStyles: { fillColor: [240, 240, 240] }
    });

    doc.save(`StaffTrack_${year}.pdf`);
  };

  const handleDeleteYear = (year: string) => {
    // Removed window.confirm for robustness, using a double check UI or just direct action?
    // Given the prompt history, assuming direct action is preferred, but let's be slightly safer here 
    // since deleting bulk data is dangerous. 
    // I'll stick to direct execution per recent fixes, but ideally a modal would be best.
    onDeleteLogsByYear(year);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Storage & Data Management</h2>
        <p className="text-slate-500">Download reports and manage historical data by academic year.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sortedYears.map(year => (
            <div key={year} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Database size={20} className="text-blue-500" />
                        Academic Year {year}
                    </h3>
                    <p className="text-slate-500 mt-1">
                        {groupedLogs[year].length} records found
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleDownloadPDF(year)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
                    >
                        <Download size={18} />
                        Download PDF
                    </button>
                    <button
                        onClick={() => handleDeleteYear(year)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium border border-red-100"
                        title="Delete all records for this year"
                    >
                        <Trash2 size={18} />
                        Delete Year
                    </button>
                </div>
            </div>
        ))}

        {sortedYears.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                <Database size={48} className="mx-auto text-slate-300 mb-3" />
                <h3 className="text-lg font-medium text-slate-600">No Data Stored</h3>
                <p className="text-slate-400">Log events to see them appear here grouped by academic year.</p>
            </div>
        )}
      </div>

      <div className="mt-12 pt-8 border-t border-slate-200">
        <div className="bg-red-50 border border-red-100 rounded-xl p-6">
            <h3 className="text-lg font-bold text-red-800 flex items-center gap-2 mb-2">
                <AlertTriangle size={20} />
                Danger Zone
            </h3>
            <p className="text-red-600 text-sm mb-4">
                Clearing all data will permanently remove all event logs from the system. Staff profiles and event types will remain.
            </p>
            <button
                onClick={onClearAllLogs}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-bold"
            >
                Clear All Event Logs
            </button>
        </div>
      </div>
    </div>
  );
};