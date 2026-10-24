import React, { useState } from 'react';
import { ChevronDown, ChevronUp, KeyRound, Sparkles } from 'lucide-react';
import { authService, DemoAccount } from '../../services';
import { AuthNotice } from './AuthNotice';

export interface DemoAccountsPanelProps {
  onSelectAccount: (account: DemoAccount) => void;
  className?: string;
}

export const DemoAccountsPanel: React.FC<DemoAccountsPanelProps> = ({
  onSelectAccount,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const accounts = authService.getDemoAccounts();

  return (
    <div
      className={`border border-[#1E2E48] rounded-xl bg-[#090F1C]/80 backdrop-blur-xs overflow-hidden transition-all duration-200 motion-reduce:transition-none ${className}`}
    >
      {/* Toggle Header */}
      <button
        type="button"
        id="demo-accounts-toggle"
        aria-expanded={isOpen}
        aria-controls="demo-accounts-content"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-3 px-3.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 focus-visible:ring-offset-[#090F1C] cursor-pointer"
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
          <span>Demo accounts</span>
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>{isOpen ? 'Collapse' : 'Instant autofill'}</span>
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          )}
        </span>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div
          id="demo-accounts-content"
          role="region"
          aria-labelledby="demo-accounts-toggle"
          className="p-3.5 pt-1 space-y-3 border-t border-[#1E2E48]"
        >
          {/* Always visible notice when expanded */}
          <AuthNotice isDark={true} />

          {/* Account rows */}
          <div className="space-y-2">
            {accounts.map((account) => (
              <div
                key={account.loginId}
                className="p-2.5 rounded-lg border border-[#1A2A42] bg-[#0C1527]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-colors hover:border-[#273B5B]"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span>{account.roleTitle}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    ID:{' '}
                    <span className="font-mono text-indigo-300 font-medium">
                      {account.loginId}
                    </span>
                    <span className="mx-2 text-slate-600">|</span>
                    PW:{' '}
                    <span className="font-mono text-indigo-300 font-medium">
                      {account.passwordHint}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectAccount(account)}
                  className="self-start sm:self-auto px-2.5 py-1 text-[11px] font-medium text-white bg-indigo-600/30 border border-indigo-500/40 rounded-md hover:bg-indigo-600 hover:border-indigo-500 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 shrink-0 cursor-pointer"
                >
                  Fill credentials
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
