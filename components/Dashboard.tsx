import React, { useState, useMemo } from 'react';
import { Staff, EventType, EventLog } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import { Filter, X, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DashboardProps {
  staffList: Staff[];
  eventTypes: EventType[];
  logs: EventLog[];
  onDeleteLog: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ staffList, eventTypes, logs, onDeleteLog }) => {
  const [filterStaffId, setFilterStaffId] = useState<string>('all');

  // Calculate totals per staff, respecting the current filter
  const staffStats = useMemo(() => {
    // Filter the staff list based on the selection
    const visibleStaff = filterStaffId === 'all' 
      ? staffList 
      : staffList.filter(s => s.id === filterStaffId);

    return visibleStaff.map(staff => {
      const staffLogs = logs.filter(l => l.staffId === staff.id);
      const totalScore = staffLogs.reduce((acc, log) => acc + log.value, 0);
      const logCount = staffLogs.length;
      return {
        ...staff,
        totalScore,
        logCount
      };
    });
  }, [staffList, logs, filterStaffId]);

  // Filter logs for table
  const filteredLogs = useMemo(() => {
    if (filterStaffId === 'all') return logs;
    return logs.filter(l => l.staffId === filterStaffId);
  }, [logs, filterStaffId]);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteLog(id);
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toISOString().split('T')[0];
    
    // Determine title and filename based on filter
    let title = "StaffTrack Report: All Data";
    let filename = `StaffTrack_AllData_${dateStr}.pdf`;

    if (filterStaffId !== 'all') {
        const staff = staffList.find(s => s.id === filterStaffId);
        const staffName = staff?.name || 'Unknown Staff';
        title = `StaffTrack Report: ${staffName}`;
        
        // Sanitize name for filename
        const safeName = staffName.replace(/[^a-z0-9]/gi, '_');
        filename = `StaffTrack_Filtered_${safeName}_${dateStr}.pdf`;
    }

    // Header
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 28);
    if (filterStaffId === 'all') {
      doc.text("Scope: All Staff Records (Unfiltered)", 14, 33);
    } else {
      doc.text("Scope: Individual Staff Record", 14, 33);
    }

    // Prepare table data from filtered logs
    const tableData = filteredLogs.map(log => {
        const staff = staffList.find(s => s.id === log.staffId)?.name || 'Unknown Staff';
        const type = eventTypes.find(t => t.id === log.eventTypeId)?.name || 'Unknown Type';
        return [
            log.date,
            log.academicYear || '-',
            staff,
            type,
            log.value.toString(),
            log.notes
        ];
    });

    autoTable(doc, {
        head: [['Date', 'Year', 'Staff Member', 'Event Type', 'Impact', 'Notes']],
        body: tableData,
        startY: 40,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 130, 246] }, // Blue-500
        alternateRowStyles: { fillColor: [248, 250, 252] } // Slate-50
    });

    doc.save(filename);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-500">Overview of staff performance and event allocation.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
          >
            <Download size={16} />
            Export PDF
          </button>

          <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
            <Filter size={18} className="text-slate-400 ml-2" />
            <select 
              className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 min-w-[200px]"
              value={filterStaffId}
              onChange={(e) => setFilterStaffId(e.target.value)}
            >
              <option value="all">All Staff Records</option>
              {staffList.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-6">
            Net Impact Score {filterStaffId !== 'all' ? '(Filtered)' : ''}
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffStats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <ReferenceLine y={0} stroke="#94a3b8" />
                <Bar dataKey="totalScore" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  {staffStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.totalScore > 0 ? '#ef4444' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-xs text-slate-500">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> Positive (Usage/Absence)</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Negative (Contribution/Cover)</div>
          </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
             <h3 className="font-semibold text-slate-700">Detailed Event Logs</h3>
             <span className="text-xs text-slate-500">{filteredLogs.length} records found</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Year</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Staff</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Event Type</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Impact</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Notes</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-5">
              {filteredLogs.length > 0 ? filteredLogs.map(log => {
                const staff = staffList.find(s => s.id === log.staffId);
                const type = eventTypes.find(t => t.id === log.eventTypeId);
                return (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 text-sm text-slate-600 font-mono">{log.date}</td>
                    <td className="px-6 py-3 text-sm text-slate-500">{log.academicYear || '-'}</td>
                    <td className="px-6 py-3 text-sm font-medium text-slate-900">{staff?.name || 'Unknown'}</td>
                    <td className="px-6 py-3">
                        <span 
                            className="text-xs px-2 py-1 rounded-full border"
                            style={{ 
                                backgroundColor: type ? `${type.color}15` : '#f1f5f9',
                                color: type ? type.color : '#64748b',
                                borderColor: type ? `${type.color}30` : '#e2e8f0'
                            }}
                        >
                            {type?.name || 'Unknown Type'}
                        </span>
                    </td>
                    <td className={`px-6 py-3 text-sm font-bold text-right ${log.value > 0 ? 'text-red-600' : log.value < 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                        {log.value > 0 ? '+' : ''}{log.value}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-500 max-w-xs truncate" title={log.notes}>
                        {log.notes || '-'}
                    </td>
                    <td className="px-6 py-3 text-right">
                        <button 
                            type="button"
                            onClick={(e) => handleDeleteClick(e, log.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                            title="Delete Entry"
                        >
                            <X size={18} className="pointer-events-none" />
                        </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                        No logs found matching your criteria.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};