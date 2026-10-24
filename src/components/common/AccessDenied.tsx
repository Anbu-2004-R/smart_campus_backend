import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AccessDeniedProps {
  attemptedView: string;
  onRedirect: (view: string) => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ attemptedView, onRedirect }) => {
  const { currentRole } = useAuth();
  const safeView = currentRole === 'STUDENT' ? 'student-dashboard' : 'faculty-dashboard';

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Access Denied</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your current session role (<strong>{currentRole}</strong>) does not have authorization to view the requested route (<code>{attemptedView}</code>).
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left font-mono text-[11px] text-slate-600 space-y-1">
          <div>· Role Enforcement: Spring Security RBAC Rule</div>
          <div>· Attempted Resource: {attemptedView}</div>
          <div>· Policy: Role Isolation Strict Mode</div>
        </div>

        <button
          onClick={() => onRedirect(safeView)}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Authorized Dashboard</span>
        </button>
      </div>
    </div>
  );
};
