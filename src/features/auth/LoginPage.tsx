import React from 'react';
import { UserRole } from '../../types/erp';
import { useAuth } from '../../context/AuthContext';
import { BrandPanel } from './BrandPanel';
import { LoginForm } from './LoginForm';
import { School, Shield } from 'lucide-react';

export interface LoginPageProps {
  onSuccessLogin?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessLogin }) => {
  const { switchUser } = useAuth();

  const handleLoginSuccess = (role: UserRole, userId: string) => {
    switchUser(userId);

    // Map role to target dashboard route hash
    const targetHash = {
      ADMIN: 'admin-dashboard',
      FACULTY: 'faculty-dashboard',
      STUDENT: 'student-dashboard',
    }[role];

    window.location.hash = `#/${targetHash}`;

    if (onSuccessLogin) {
      onSuccessLogin();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070D18] text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Two-Part Split Container */}
      <div className="flex-1 flex flex-col lg:flex-row w-full relative z-10">
        {/* Left Side: Brand Panel (Desktop only ~52% width) */}
        <aside
          aria-label="Campus academic identity and live telemetry"
          className="hidden lg:block lg:w-[50%] xl:w-[54%] shrink-0 border-r border-[#152238]"
        >
          <BrandPanel />
        </aside>

        {/* Compact Mobile / Tablet Top Header (<1024px) */}
        <header className="lg:hidden bg-gradient-to-b from-[#0B1527] to-[#070D18] border-b border-[#1A2B47] p-5 sm:p-7 text-white">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-950/60 border border-indigo-400/30">
                <School className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[17px] font-bold tracking-tight text-white">
                  Smart Campus ERP
                </div>
                <div className="text-[11px] text-indigo-300 font-medium">
                  Apex Institute of Technology
                </div>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700/60">
              AY 2025–26
            </div>
          </div>
        </header>

        {/* Right Side: Authentication Console */}
        <main
          role="main"
          className="flex-1 flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-10 xl:p-14"
        >
          <div className="w-full max-w-[430px] my-auto">
            {/* Elevated Auth Surface */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0A1222]/95 border border-[#1B2B47] shadow-2xl shadow-[#03060C]/80 backdrop-blur-xl relative">
              {/* Subtle top edge specular highlight */}
              <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />

              {/* Form Header Lockup */}
              <div className="mb-6 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-950/70 border border-indigo-500/30 text-[11px] font-medium text-indigo-300">
                    <Shield className="w-3 h-3 text-indigo-400" />
                    <span>Academic Portal Gateway</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight leading-tight pt-1">
                  Sign in
                </h1>
                <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed">
                  Choose your role, then enter your login ID and password.
                </p>
              </div>

              {/* Authentication Form */}
              <LoginForm onSuccess={handleLoginSuccess} />
            </div>
          </div>
        </main>
      </div>

      <footer className="py-3.5 px-6 text-center text-xs text-slate-500 border-t border-[#142034] bg-[#050912]/80 backdrop-blur-xs relative z-10">
        <span>Smart Campus ERP · Academic &amp; Campus Management</span>
      </footer>
    </div>
  );
};

export default LoginPage;
