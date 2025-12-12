import React, { useState } from 'react';
import { Staff } from '../types';
import { generateId } from '../services/storageService';
import { X, UserPlus, User } from 'lucide-react';

interface StaffManagerProps {
  staffList: Staff[];
  onAddStaff: (staff: Staff) => void;
  onDeleteStaff: (id: string) => void;
}

export const StaffManager: React.FC<StaffManagerProps> = ({ staffList, onAddStaff, onDeleteStaff }) => {
  const [name, setName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const staff: Staff = {
      id: generateId(),
      name: name.trim(),
    };

    onAddStaff(staff);
    setName('');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    onDeleteStaff(id);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Staff Management</h2>
        <p className="text-slate-500">Manage your staff list.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <UserPlus size={20} className="text-blue-500" />
          Add New Staff Member
        </h3>
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium h-[42px]"
          >
            Add Staff
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User size={16} />
                        </div>
                        <div className="font-medium text-slate-900">{staff.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, staff.id)}
                      className="text-slate-400 hover:text-red-500 p-2 hover:bg-slate-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                      title="Delete Staff"
                    >
                      <X size={18} className="pointer-events-none" />
                    </button>
                  </td>
                </tr>
              ))}
              {staffList.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-slate-500">
                    No staff members found. Add one above.
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