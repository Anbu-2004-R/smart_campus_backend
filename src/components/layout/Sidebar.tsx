import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarCheck,
  GraduationCap,
  CalendarDays,
  LifeBuoy,
  Settings,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  Clock,
  TrendingUp,
  UserCircle,
  LogOut,
  School,
  Megaphone,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onSelectView: (viewId: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { currentUser, currentRole, currentStudentProfile, currentFacultyProfile, logout } = useAuth();
  const { correctionRequests, complaints, exams, admissionApplications } = useERP();

  // Badges
  const pendingFacultyCorrections = correctionRequests.filter((r) => r.status === 'PENDING_FACULTY').length;
  const pendingAdminCorrections = correctionRequests.filter((r) => r.status === 'PENDING_ADMIN').length;
  const openComplaints = complaints.filter((c) => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length;
  const unPublishedExams = exams.filter((e) => e.status === 'READY_TO_PUBLISH' || e.status === 'MARKS_PENDING').length;
  const pendingApplications = admissionApplications.filter(
    (a) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW'
  ).length;

  const adminNav: NavItem[] = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'admin-enrollment',
      label: 'Enrollment',
      icon: UserCheck,
      badge: pendingApplications > 0 ? pendingApplications : undefined,
    },
    { id: 'admin-accounts', label: 'Accounts', icon: Users },
    { id: 'admin-announcements', label: 'Announcements', icon: Megaphone },
    {
      id: 'admin-attendance',
      label: 'Attendance',
      icon: CalendarCheck,
      badge: pendingAdminCorrections > 0 ? pendingAdminCorrections : undefined,
    },
    {
      id: 'admin-exams',
      label: 'Examinations',
      icon: GraduationCap,
      badge: unPublishedExams > 0 ? unPublishedExams : undefined,
    },
    { id: 'admin-timetable', label: 'Timetable', icon: CalendarDays },
    {
      id: 'admin-complaints',
      label: 'Complaints',
      icon: LifeBuoy,
      badge: openComplaints > 0 ? openComplaints : undefined,
    },
    { id: 'admin-settings', label: 'Settings', icon: Settings },
    { id: 'admin-audit', label: 'Audit Logs', icon: ShieldCheck },
  ];

  const facultyNav: NavItem[] = [
    { id: 'faculty-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'faculty-attendance', label: 'Attendance', icon: CalendarCheck },
    {
      id: 'faculty-corrections',
      label: 'Corrections',
      icon: CheckCircle2,
      badge: pendingFacultyCorrections > 0 ? pendingFacultyCorrections : undefined,
    },
    { id: 'faculty-marks', label: 'Marks Entry', icon: FileSpreadsheet },
    { id: 'faculty-timetable', label: 'Timetable', icon: Clock },
    {
      id: 'faculty-complaints',
      label: 'Complaints',
      icon: LifeBuoy,
      badge: complaints.filter((c) => c.assignedToFacultyId === currentFacultyProfile?.id && (c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW' || c.status === 'IN_PROGRESS')).length || undefined,
    },
  ];

  // Strictly canonical student navigation terms (Section 2.7)
  const studentNav: NavItem[] = [
    { id: 'student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'student-attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'student-results', label: 'Results', icon: GraduationCap },
    { id: 'student-timetable', label: 'Timetable', icon: CalendarDays },
    { id: 'student-analytics', label: 'Analytics', icon: TrendingUp },
    {
      id: 'student-complaints',
      label: 'Complaints',
      icon: LifeBuoy,
      badge: complaints.filter((c) => c.submittedByUserId === currentUser?.id && (c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW' || c.status === 'IN_PROGRESS')).length || undefined,
    },
    { id: 'student-profile', label: 'Profile', icon: UserCircle },
  ];

  const navItems =
    currentRole === 'ADMIN' ? adminNav : currentRole === 'FACULTY' ? facultyNav : studentNav;

  const getDisplayName = () => {
    if (currentRole === 'ADMIN') return 'Office of the Registrar';
    if (currentRole === 'FACULTY') return currentFacultyProfile?.fullName || 'Faculty Member';
    return currentStudentProfile?.fullName || 'Student';
  };

  const getIdentifier = () => {
    if (currentRole === 'ADMIN') return 'Institutional Root';
    if (currentRole === 'FACULTY') return currentFacultyProfile?.employeeId || 'EMP-CSE-001';
    return currentStudentProfile?.registerNumber || '21CS101';
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Zone */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <School className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white whitespace-nowrap">
              Smart Campus ERP
            </div>
            <div className="text-[11px] text-slate-400 font-medium tracking-tight">Academic Portal</div>
          </div>
        </div>

        {/* Current User Identity Panel (Section 7.4: Show name and role once in sidebar, neutral circle initials for students) */}
        <div className="px-4 py-3 mx-4 my-3 rounded-lg bg-slate-800/70 border border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 text-slate-200 border border-slate-600 flex items-center justify-center text-xs font-semibold shrink-0">
              {getInitials(getDisplayName())}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">{getDisplayName()}</div>
              <div className="text-[11px] text-slate-400 font-mono truncate">{getIdentifier()}</div>
            </div>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold tracking-wide shrink-0 ${
                currentRole === 'ADMIN'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : currentRole === 'FACULTY'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {currentRole}
            </span>
          </div>
        </div>

        {/* Navigation Items (Single fixed width per breakpoint, clean buttons) */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Footer: Role isolation enforced - No role switcher in sidebar! Role switching only on login page */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="min-w-0 pr-2">
            <div className="text-[11px] text-slate-300 break-all leading-tight" title={currentUser?.email}>
              {currentUser?.email}
            </div>
          </div>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-rose-400 transition-colors p-1.5 rounded-md hover:bg-slate-800 cursor-pointer shrink-0"
            title="Sign Out to Login"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
