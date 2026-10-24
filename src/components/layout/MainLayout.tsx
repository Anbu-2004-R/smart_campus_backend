import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import {
  LayoutDashboard,
  CalendarCheck,
  GraduationCap,
  CalendarDays,
  LifeBuoy,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from 'lucide-react';

interface MainLayoutProps {
  currentView: string;
  onSelectView: (view: string) => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  currentView,
  onSelectView,
  children,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { currentRole } = useAuth();
  const { dataStatus, dataError, retryDataLoad } = useERP();

  if (dataStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#070D18] text-slate-300 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
        <div className="text-sm font-medium">Loading institutional data...</div>
        <div className="text-[11px] text-slate-500">
          Verifying records and restoring your academic workspace.
        </div>
      </div>
    );
  }

  if (dataStatus === 'error') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-rose-200 rounded-xl shadow-sm p-6">
          <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <h1 className="mt-4 text-base font-bold text-slate-900">
            Institutional data could not be loaded
          </h1>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            The campus server responded with an error. No demo or cached records have been shown in
            place of live institutional data.
          </p>
          {dataError && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-100 rounded-lg text-[11px] text-rose-800 break-words">
              {dataError}
            </div>
          )}
          <button
            onClick={retryDataLoad}
            className="mt-4 w-full px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Data Load
          </button>
        </div>
      </div>
    );
  }

  const studentMobileBottomNav = [
    { id: 'student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'student-attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'student-results', label: 'Results', icon: GraduationCap },
    { id: 'student-timetable', label: 'Timetable', icon: CalendarDays },
    { id: 'student-complaints', label: 'Complaints', icon: LifeBuoy },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={onSelectView}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          currentView={currentView}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className={`flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto ${currentRole === 'STUDENT' ? 'pb-24 sm:pb-8' : ''}`}>
          {dataError && (
            <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Some data may be out of date</div>
                  <div className="text-[11px] text-amber-800 mt-0.5 break-words">{dataError}</div>
                </div>
              </div>
              <button
                onClick={retryDataLoad}
                className="self-start sm:self-auto shrink-0 px-3 py-1.5 font-semibold text-amber-900 bg-white border border-amber-300 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation for Students (Section 8.4: Below 640px) */}
      {currentRole === 'STUDENT' && (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
          {studentMobileBottomNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer ${
                  isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};
