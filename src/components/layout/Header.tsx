import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { getAcademicSessionLabel } from '../../lib/academicCalendar';
import {
  Menu,
  Bell,
  Calendar,
  LogOut,
  X,
  CheckCheck,
  AlertTriangle,
  CheckCircle,
  GraduationCap,
  LifeBuoy,
} from 'lucide-react';
import { InAppNotification } from '../../types/erp';

interface HeaderProps {
  currentView: string;
  onOpenMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onOpenMobileSidebar }) => {
  const { currentUser, currentRole, currentStudentProfile, currentFacultyProfile, logout } = useAuth();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useERP();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userNotifications = notifications.filter(
    (n) => n.recipientUserId === currentUser?.id || n.recipientUserId === 'usr-all'
  );
  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  // Single canonical page title mapping
  const getViewTitle = (view: string) => {
    const titles: Record<string, string> = {
      // Admin
      'admin-dashboard': 'Dashboard',
      'admin-enrollment': 'Enrollment Management',
      'admin-accounts': 'Accounts',
      'admin-attendance': 'Attendance',
      'admin-exams': 'Examinations',
      'admin-timetable': 'Timetable',
      'admin-complaints': 'Complaints',
      'admin-settings': 'Settings',
      'admin-audit': 'Audit Logs',

      // Faculty
      'faculty-dashboard': 'Dashboard',
      'faculty-attendance': 'Attendance',
      'faculty-corrections': 'Corrections',
      'faculty-marks': 'Marks Entry',
      'faculty-timetable': 'Timetable',
      'faculty-complaints': 'Complaints',

      // Student (Strict 7 terms: Dashboard, Attendance, Results, Timetable, Analytics, Complaints, Profile)
      'student-dashboard': 'Dashboard',
      'student-attendance': 'Attendance',
      'student-results': 'Results',
      'student-timetable': 'Timetable',
      'student-analytics': 'Analytics',
      'student-complaints': 'Complaints',
      'student-profile': 'Profile',
    };
    return titles[view] || 'Dashboard';
  };

  const getDisplayName = () => {
    if (currentRole === 'ADMIN') return 'Registrar Admin';
    if (currentRole === 'FACULTY') return currentFacultyProfile?.fullName || 'Faculty Member';
    return currentStudentProfile?.fullName || 'Student';
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getCategoryIcon = (category: InAppNotification['category']) => {
    switch (category) {
      case 'ATTENDANCE_WARNING':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'CORRECTION_STATUS':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'EXAM_UPDATE':
      case 'RESULT_PUBLISHED':
        return <GraduationCap className="w-4 h-4 text-indigo-600" />;
      case 'COMPLAINT_UPDATE':
        return <LifeBuoy className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left Zone: Mobile toggle + Canonical Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>Smart Campus ERP</span>
              <span>/</span>
              <span className="text-slate-700 font-medium truncate">{getViewTitle(currentView)}</span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
              {getViewTitle(currentView)}
            </h1>
          </div>
        </div>

        {/* Right Zone: Academic Session Marker + Central Notification Bell + User Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Academic Session Marker: AY 2026-27 · Odd Semester (From single config module) */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg border border-slate-200 text-xs text-slate-700 font-medium whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="tabular-nums">{getAcademicSessionLabel()}</span>
          </div>

          {/* Central Notification Bell with Indicator */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="View notifications"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden flex flex-col">
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {unreadCount > 0 && currentUser && (
                      <button
                        onClick={() => markAllNotificationsAsRead(currentUser.id)}
                        className="text-[11px] text-slate-600 hover:text-indigo-600 font-medium px-2 py-1 rounded hover:bg-slate-200/50 flex items-center gap-1 transition-colors"
                        title="Mark all as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notifications list */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {userNotifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No notifications for this account.
                    </div>
                  ) : (
                    userNotifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-3 text-xs transition-colors cursor-pointer flex items-start gap-2.5 ${
                          n.isRead ? 'bg-white hover:bg-slate-50' : 'bg-indigo-50/40 hover:bg-indigo-50/60'
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-white border border-slate-200 shrink-0 mt-0.5">
                          {getCategoryIcon(n.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-semibold text-slate-900 text-xs truncate">{n.title}</span>
                            {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />}
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                          <div className="mt-1 text-[10px] text-slate-400">
                            {new Date(n.createdAt).toLocaleDateString()} · {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar with Initials (Section 7.4: Initials in neutral circle for students, no duplicate name) */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-semibold transition-colors cursor-pointer"
              title={`${getDisplayName()} (${currentUser?.email})`}
              aria-label="User account menu"
            >
              {getInitials(getDisplayName())}
            </button>

            {/* Profile Menu Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900 truncate">{getDisplayName()}</div>
                  {/* Full email shown or wrapped without truncated ellipsis */}
                  <div className="text-[11px] text-slate-500 break-all mt-0.5" title={currentUser?.email}>
                    {currentUser?.email}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-1">
                    {currentRole} SESSION
                  </div>
                </div>

                <div className="p-1.5">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium cursor-pointer"
                  >
                    <span>Sign Out</span>
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
