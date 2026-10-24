import React from 'react';
import {
  AttendanceStatus,
  AttendanceRiskLevel,
  MarksStatus,
  ComplaintPriority,
  ComplaintStatus,
  AccountStatus,
} from '../../types/erp';

interface StatusBadgeProps {
  status:
    | AttendanceStatus
    | AttendanceRiskLevel
    | MarksStatus
    | ComplaintPriority
    | ComplaintStatus
    | AccountStatus
    | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getStyle = () => {
    switch (status) {
      // Attendance & Risk
      case 'PRESENT':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'ABSENT':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'LATE':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'ON_DUTY':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';

      case 'LOW':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'MEDIUM':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'HIGH':
        return 'text-rose-700 bg-rose-50 border-rose-200 font-semibold';

      // Marks & Exams
      case 'MARKS_ENTERED':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'MEDICAL_ABSENCE':
        return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'MARKS_PENDING':
        return 'text-amber-700 bg-amber-50 border-amber-200 font-medium';
      case 'MALPRACTICE':
        return 'text-rose-800 bg-rose-100 border-rose-300 font-semibold';
      case 'PUBLISHED':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'READY_TO_PUBLISH':
        return 'text-violet-700 bg-violet-50 border-violet-200';
      case 'DRAFT':
        return 'text-slate-600 bg-slate-100 border-slate-200';

      // Priorities
      case 'CRITICAL':
        return 'text-rose-800 bg-rose-100 border-rose-300 font-semibold';
      case 'HIGH':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'MEDIUM':
        return 'text-amber-700 bg-amber-50 border-amber-200';

      // Complaints & Workflows
      case 'SUBMITTED':
        return 'text-slate-700 bg-slate-100 border-slate-200';
      case 'UNDER_REVIEW':
        return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'IN_PROGRESS':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'RESOLVED':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'REJECTED':
        return 'text-rose-700 bg-rose-50 border-rose-200';

      // Accounts
      case 'ACTIVE':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'INACTIVE':
        return 'text-slate-500 bg-slate-100 border-slate-200';
      case 'PENDING_SETUP':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'SUSPENDED':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'WITHDRAWN':
        return 'text-slate-600 bg-slate-100 border-slate-300';
      case 'COMPLETED':
        return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'PROMOTED':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'GRADUATED':
        return 'text-emerald-800 bg-emerald-50 border-emerald-300 font-semibold';

      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium border rounded px-2 py-0.5 whitespace-nowrap tracking-tight ${
        size === 'sm' ? 'text-xs' : 'text-sm px-2.5 py-1'
      } ${getStyle()}`}
    >
      {formatText(status)}
    </span>
  );
};
