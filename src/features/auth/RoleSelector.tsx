import React, { useRef } from 'react';
import { UserRole } from '../../types/erp';
import { GraduationCap, BookOpen, ShieldCheck } from 'lucide-react';

export interface RoleOption {
  role: UserRole;
  title: string;
  shortLabel: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'STUDENT',
    title: 'Student',
    shortLabel: 'Student',
    description: 'Access timetables, attendance standing, results, and student grievances.',
    Icon: GraduationCap,
  },
  {
    role: 'FACULTY',
    title: 'Faculty',
    shortLabel: 'Faculty',
    description: 'Mark class attendance, enter internal marks, and review section requests.',
    Icon: BookOpen,
  },
  {
    role: 'ADMIN',
    title: 'Administrator',
    shortLabel: 'Admin',
    description: 'Academic governance, timetable conflict manager, exam publication, and audit trail.',
    Icon: ShieldCheck,
  },
];

export interface RoleSelectorProps {
  selectedRole: UserRole | null;
  onSelectRole: (role: UserRole) => void;
  error?: string;
  id?: string;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onSelectRole,
  error,
  id = 'role-selector',
}) => {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (index + 1) % ROLE_OPTIONS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (index - 1 + ROLE_OPTIONS.length) % ROLE_OPTIONS.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = ROLE_OPTIONS.length - 1;
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onSelectRole(ROLE_OPTIONS[index].role);
      return;
    }

    if (nextIndex !== null) {
      onSelectRole(ROLE_OPTIONS[nextIndex].role);
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  const selectedOption = ROLE_OPTIONS.find((opt) => opt.role === selectedRole);

  return (
    <div className="space-y-2">
      {/* Segmented Control Bar */}
      <div
        id={id}
        role="radiogroup"
        aria-label="Account role selector"
        aria-describedby={error ? `${id}-error` : undefined}
        className="p-1 bg-[#090F1C]/90 border border-[#1E2E48] rounded-xl grid grid-cols-3 gap-1 shadow-inner relative"
      >
        {ROLE_OPTIONS.map((option, index) => {
          const isSelected = selectedRole === option.role;
          const { Icon } = option;

          const tabIndex =
            selectedRole === null
              ? index === 0
                ? 0
                : -1
              : isSelected
              ? 0
              : -1;

          return (
            <button
              key={option.role}
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={tabIndex}
              onClick={() => onSelectRole(option.role)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`min-h-[42px] py-2 px-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 focus-visible:ring-offset-[#090F1C] cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 text-white font-semibold shadow-md shadow-indigo-950/60 border border-indigo-400/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent font-medium'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isSelected ? 'text-white' : 'text-slate-400'
                }`}
                aria-hidden="true"
              />
              <span className="truncate">{option.title}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic 1-line Role Scope helper */}
      <div className="flex items-center gap-2 px-1 text-[12px] text-slate-400 min-h-[20px] transition-colors">
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            selectedOption ? 'bg-indigo-400' : 'bg-slate-600'
          }`}
          aria-hidden="true"
        />
        <span className="truncate">
          {selectedOption
            ? selectedOption.description
            : 'Select an academic role to sign into your portal.'}
        </span>
      </div>

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-[12px] text-rose-400 pt-0.5 px-1 font-normal"
        >
          {error}
        </p>
      )}
    </div>
  );
};
