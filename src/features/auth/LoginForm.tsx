import React, { useState, useRef } from 'react';
import { UserRole } from '../../types/erp';
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button, Input, Field, Alert } from '../../components/ui';
import { RoleSelector } from './RoleSelector';
import { DemoAccountsPanel } from './DemoAccountsPanel';
import { authService, DemoAccount } from '../../services';

export interface LoginFormProps {
  onSuccess: (role: UserRole, userId: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Field blur tracking for inline validation
  const [loginIdTouched, setLoginIdTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Error states
  const [roleError, setRoleError] = useState('');
  const [loginIdError, setLoginIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formAlertError, setFormAlertError] = useState('');

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Help panel inline toggle
  const [showHelpPanel, setShowHelpPanel] = useState(false);

  // Focus refs
  const loginIdInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Validate fields
  const validateLoginId = (val: string): string => {
    if (!val.trim()) {
      return 'Enter your login ID or email.';
    }
    return '';
  };

  const validatePassword = (val: string): string => {
    if (!val) {
      return 'Enter your password.';
    }
    return '';
  };

  const handleLoginIdBlur = () => {
    setLoginIdTouched(true);
    setLoginIdError(validateLoginId(loginId));
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    setPasswordError(validatePassword(password));
  };

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setRoleError('');
    setFormAlertError('');
  };

  const handleUseDemoAccount = (account: DemoAccount) => {
    setSelectedRole(account.role);
    setLoginId(account.loginId);
    setPassword(account.passwordHint);
    setLoginIdTouched(true);
    setPasswordTouched(true);
    setRoleError('');
    setLoginIdError('');
    setPasswordError('');
    setFormAlertError('');
  };

  const isFormComplete = Boolean(
    selectedRole !== null && loginId.trim() !== '' && password.trim() !== ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormAlertError('');

    // Check all fields
    const rErr = !selectedRole ? 'Select your role to continue.' : '';
    const idErr = validateLoginId(loginId);
    const pwErr = validatePassword(password);

    setRoleError(rErr);
    setLoginIdError(idErr);
    setPasswordError(pwErr);

    // Focus first invalid field
    if (rErr) {
      const roleElem = document.getElementById('role-selector');
      roleElem?.focus();
      return;
    }
    if (idErr) {
      loginIdInputRef.current?.focus();
      return;
    }
    if (pwErr) {
      passwordInputRef.current?.focus();
      return;
    }

    if (!selectedRole) return;

    setIsLoading(true);

    try {
      const response = await authService.login({
        role: selectedRole,
        loginId,
        password,
      });

      setIsLoading(false);

      if (response.success && response.user) {
        onSuccess(selectedRole, response.user.id);
      } else {
        setFormAlertError(response.error || 'The login ID or password is incorrect.');
        loginIdInputRef.current?.focus();
      }
    } catch {
      setIsLoading(false);
      setFormAlertError('The login ID or password is incorrect.');
      loginIdInputRef.current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Top Form Alert on submission failure */}
      {formAlertError && (
        <Alert variant="error" isDark={true} className="animate-shake">
          {formAlertError}
        </Alert>
      )}

      {/* Role Selection */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-[13px] font-medium text-slate-200">
            Account Role
          </label>
          <span className="text-[11px] text-slate-400 font-mono">
            Step 1 of 2
          </span>
        </div>
        <RoleSelector
          selectedRole={selectedRole}
          onSelectRole={handleSelectRole}
          error={roleError}
        />
      </div>

      {/* Login ID or Email Field */}
      <Field
        label="Login ID or institutional email"
        htmlFor="login-id-input"
        isDark={true}
        error={loginIdTouched || loginIdError ? loginIdError : undefined}
      >
        <Input
          ref={loginIdInputRef}
          id="login-id-input"
          type="text"
          variant="dark"
          value={loginId}
          disabled={isLoading}
          onChange={(e) => {
            setLoginId(e.target.value);
            if (loginIdError) setLoginIdError('');
            if (formAlertError) setFormAlertError('');
          }}
          onBlur={handleLoginIdBlur}
          placeholder="e.g. 21CS101, prof.rajesh, or admin"
          hasError={Boolean(loginIdTouched && loginIdError)}
          leftIcon={<User className="w-4 h-4" />}
          autoComplete="username"
          aria-required="true"
          aria-invalid={Boolean(loginIdError)}
          aria-describedby={loginIdError ? 'login-id-input-error' : undefined}
        />
      </Field>

      {/* Password Field */}
      <Field
        label="Password"
        htmlFor="password-input"
        isDark={true}
        error={passwordTouched || passwordError ? passwordError : undefined}
      >
        <Input
          ref={passwordInputRef}
          id="password-input"
          type={showPassword ? 'text' : 'password'}
          variant="dark"
          value={password}
          disabled={isLoading}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) setPasswordError('');
            if (formAlertError) setFormAlertError('');
          }}
          onBlur={handlePasswordBlur}
          placeholder="Enter account password"
          hasError={Boolean(passwordTouched && passwordError)}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="current-password"
          aria-required="true"
          aria-invalid={Boolean(passwordError)}
          aria-describedby={passwordError ? 'password-input-error' : undefined}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="p-1.5 text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-lg transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          }
        />
      </Field>

      {/* Primary Submit Action */}
      <div className="space-y-2 pt-1">
        <Button
          type="submit"
          variant="gradient"
          size="lg"
          fullWidth
          disabled={!isFormComplete || isLoading}
          isLoading={isLoading}
          className="shadow-lg shadow-indigo-950/60 cursor-pointer"
        >
          <span className="flex items-center justify-center gap-2">
            <span>Sign in to Portal</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </span>
        </Button>

        {/* Missing requirement hint */}
        {!isFormComplete && (
          <p className="text-[11px] text-slate-400 text-center" aria-live="polite">
            {!selectedRole
              ? 'Select your role above to proceed.'
              : !loginId.trim()
              ? 'Enter your login ID or email.'
              : 'Enter your password.'}
          </p>
        )}
      </div>

      {/* Secondary Help Link & Inline Panel */}
      <div className="pt-1 text-center">
        <button
          type="button"
          onClick={() => setShowHelpPanel(!showHelpPanel)}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded px-1.5 py-0.5 cursor-pointer"
        >
          Need help signing in?
        </button>

        {showHelpPanel && (
          <div
            className="mt-2.5 p-3 bg-[#0B1526] border border-[#1E2E48] rounded-xl text-xs text-slate-300 text-left leading-relaxed shadow-md"
            role="region"
            aria-label="Sign-in assistance"
          >
            This is a demo. Use one of the demo accounts below, or contact the administrator for a login ID.
          </div>
        )}
      </div>

      {/* Demo Accounts Panel */}
      <div className="pt-1">
        <DemoAccountsPanel onSelectAccount={handleUseDemoAccount} />
      </div>
    </form>
  );
};
