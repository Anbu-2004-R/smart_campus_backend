import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ShieldCheck, Search, Filter, Shield } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useERP();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filtered = auditLogs.filter((log) => {
    if (filterType !== 'ALL' && log.entityType !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.actorName.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">Immutable System Audit Trail</h2>
        </div>
        <p className="text-xs text-slate-500">
          Permanent chronological log of all security-sensitive administrative operations, attendance corrections, and marks publications.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search action, actor, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Entity Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Entities</option>
            <option value="ATTENDANCE">Attendance</option>
            <option value="MARKS">Marks & Results</option>
            <option value="EXAM">Examinations</option>
            <option value="USER_ACCOUNT">User Accounts</option>
            <option value="TIMETABLE">Timetable</option>
            <option value="COMPLAINT">Complaints</option>
            <option value="SETTINGS">Settings</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Timestamp & IP</th>
                <th className="px-4 py-3">Actor / Role</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Entity Domain</th>
                <th className="px-5 py-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                    <div>{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                    <div className="text-[10px] text-slate-400">{log.ipAddress || '192.168.1.10'}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-sans font-semibold text-slate-900">{log.actorName}</div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-indigo-700 whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                      {log.entityType}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-sans text-slate-700 text-xs leading-relaxed max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
