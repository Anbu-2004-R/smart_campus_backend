import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ERPProvider } from './context/ERPContext';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './components/auth/LoginPage';
import { ActivationPage } from './components/auth/ActivationPage';
import { AccessDenied } from './components/common/AccessDenied';

// Admin views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EnrollmentManagement } from './components/admin/EnrollmentManagement';
import { AccountManagement } from './components/admin/AccountManagement';
import { AnnouncementManagement } from './components/admin/AnnouncementManagement';
import { AttendanceApprovals } from './components/admin/AttendanceApprovals';
import { ExamPublication } from './components/admin/ExamPublication';
import { TimetableManager } from './components/admin/TimetableManager';
import { ComplaintDesk } from './components/admin/ComplaintDesk';
import { AcademicSettings } from './components/admin/AcademicSettings';
import { AuditLogsView } from './components/admin/AuditLogsView';

// Faculty views
import { FacultyDashboard } from './components/faculty/FacultyDashboard';
import { AttendanceRegister } from './components/faculty/AttendanceRegister';
import { FacultyCorrectionReview } from './components/faculty/FacultyCorrectionReview';
import { MarksEntrySheet } from './components/faculty/MarksEntrySheet';
import { FacultyTimetable } from './components/faculty/FacultyTimetable';
import { FacultyComplaints } from './components/faculty/FacultyComplaints';

// Student views
import { StudentDashboard } from './components/student/StudentDashboard';
import { AttendanceTracker } from './components/student/AttendanceTracker';
import { StudentResults } from './components/student/StudentResults';
import { StudentTimetable } from './components/student/StudentTimetable';
import { PerformanceAnalytics } from './components/student/PerformanceAnalytics';
import { StudentComplaints } from './components/student/StudentComplaints';
import { StudentProfile } from './components/student/StudentProfile';

const AppContent: React.FC = () => {
  const { currentRole, currentUser, isValidatingSession } = useAuth();

  // Dynamic default view based on role
  const getDefaultView = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'admin-dashboard';
      case 'FACULTY':
        return 'faculty-dashboard';
      case 'STUDENT':
        return 'student-dashboard';
      default:
        return 'student-dashboard';
    }
  };

  const [currentView, setCurrentView] = useState<string>(() => getDefaultView(currentRole));
  const [showLoginScreen, setShowLoginScreen] = useState(false);

  // Sync default view when role switches
  useEffect(() => {
    setCurrentView(getDefaultView(currentRole));
  }, [currentRole]);

  // URL Hash synchronization with route guard
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash) {
        // Map common path formats (e.g. 'admin/dashboard' -> 'admin-dashboard')
        const normalized = hash.replace('/', '-');
        setCurrentView(normalized);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Redirect unauthenticated access to /login
  useEffect(() => {
    if (!currentUser) {
      const isActivationRoute = window.location.hash.replace('#/', '').startsWith('activate');
      if (!isActivationRoute && window.location.hash !== '#/login' && window.location.hash !== '#login') {
        window.location.hash = '#/login';
      }
    }
  }, [currentUser]);

  if (window.location.hash.replace('#/', '').startsWith('activate')) {
    return <ActivationPage />;
  }

  if (isValidatingSession) {
    return (
      <div className="min-h-screen bg-[#070D18] text-slate-300 flex items-center justify-center text-xs font-medium">
        Restoring your academic session...
      </div>
    );
  }

  if (!currentUser || showLoginScreen || currentView === 'login') {
    return <LoginPage onSuccessLogin={() => setShowLoginScreen(false)} />;
  }

  // Strict route guard enforcement (Section 1.1)
  const isUnauthorized = () => {
    if (currentRole === 'STUDENT' && (currentView.startsWith('admin-') || currentView.startsWith('faculty-'))) {
      return true;
    }
    if (currentRole === 'FACULTY' && currentView.startsWith('admin-')) {
      return true;
    }
    return false;
  };

  const renderCurrentView = () => {
    if (isUnauthorized()) {
      return (
        <AccessDenied
          attemptedView={currentView}
          onRedirect={(safeView) => setCurrentView(safeView)}
        />
      );
    }

    switch (currentView) {
      // Admin
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={setCurrentView} />;
      case 'admin-enrollment':
        return <EnrollmentManagement />;
      case 'admin-accounts':
        return <AccountManagement />;
      case 'admin-announcements':
        return <AnnouncementManagement />;
      case 'admin-attendance':
        return <AttendanceApprovals />;
      case 'admin-exams':
        return <ExamPublication />;
      case 'admin-timetable':
        return <TimetableManager />;
      case 'admin-complaints':
        return <ComplaintDesk />;
      case 'admin-settings':
        return <AcademicSettings />;
      case 'admin-audit':
        return <AuditLogsView />;

      // Faculty
      case 'faculty-dashboard':
        return <FacultyDashboard onNavigate={setCurrentView} />;
      case 'faculty-attendance':
        return <AttendanceRegister />;
      case 'faculty-corrections':
        return <FacultyCorrectionReview />;
      case 'faculty-marks':
        return <MarksEntrySheet />;
      case 'faculty-timetable':
        return <FacultyTimetable />;
      case 'faculty-complaints':
        return <FacultyComplaints />;

      // Student
      case 'student-dashboard':
        return <StudentDashboard onNavigate={setCurrentView} />;
      case 'student-attendance':
        return <AttendanceTracker />;
      case 'student-results':
        return <StudentResults />;
      case 'student-timetable':
        return <StudentTimetable />;
      case 'student-analytics':
        return <PerformanceAnalytics />;
      case 'student-complaints':
        return <StudentComplaints />;
      case 'student-profile':
        return <StudentProfile />;

      default:
        return <StudentDashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <MainLayout currentView={currentView} onSelectView={setCurrentView}>
      {renderCurrentView()}
    </MainLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ERPProvider>
        <AppContent />
      </ERPProvider>
    </AuthProvider>
  );
}
