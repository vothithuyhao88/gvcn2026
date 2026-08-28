import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  X, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  LogIn,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClassLogo } from './common/ClassLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useApp();

  const [identifierInput, setIdentifierInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedIdentifier = identifierInput.trim();
    if (!trimmedIdentifier) {
      setErrorMessage('Vui lòng nhập Tên đăng nhập hoặc Email!');
      return;
    }

    if (!passwordInput) {
      setErrorMessage('Vui lòng nhập Mật khẩu!');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(trimmedIdentifier, passwordInput);
      if (result.success) {
        setSuccessMessage(result.message);
        setTimeout(() => {
          setIsLoading(false);
          onClose();
          // Reset form fields upon successful login
          setIdentifierInput('');
          setPasswordInput('');
          setSuccessMessage(null);
        }, 800);
      } else {
        setIsLoading(false);
        setErrorMessage(result.message);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage('Đã xảy ra lỗi không xác định. Vui lòng thử lại sau!');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      id="login-modal-overlay"
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto"
        id="login-modal-card"
      >
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative">
          <button 
            onClick={onClose}
            id="btn-close-login-modal"
            disabled={isLoading}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer disabled:opacity-50"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <ClassLogo size="md" withBorder={true} withGlow={true} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-[11px] font-bold uppercase tracking-wider">Hệ Thống Quản Lý Lớp Học</span>
              </div>
              <h2 className="text-lg font-black text-white mt-0.5">LỚP 11A3 • ĐĂNG NHẬP</h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7">
          
          {/* Security & Credentials Guidance */}
          <div className="mb-5 space-y-2">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-blue-800 dark:text-blue-200 text-xs">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Hệ thống bảo mật xác thực quản trị lớp 11A3 & cơ sở dữ liệu thời gian thực.</span>
            </div>

            {/* Quick Fill Hints */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                  <span>Tài khoản GVCN:</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifierInput('thuyhao');
                    setPasswordInput('thuyhao 88');
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Điền nhanh (thuyhao)
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tên đăng nhập: <code className="font-mono font-bold text-orange-600">thuyhao</code> | Mật khẩu: <code className="font-mono font-bold text-orange-600">thuyhao 88</code>
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Input: Username or Email */}
            <div>
              <label 
                htmlFor="login-identifier" 
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Tên đăng nhập hoặc Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="login-identifier"
                  type="text"
                  value={identifierInput}
                  onChange={(e) => {
                    setIdentifierInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  disabled={isLoading}
                  placeholder="Nhập username hoặc email của bạn"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-60"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* Input: Password */}
            <div>
              <label 
                htmlFor="login-password" 
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  disabled={isLoading}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-60"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  id="btn-toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div 
                id="login-error-alert"
                className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-start gap-2 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div 
                id="login-success-alert"
                className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-start gap-2 animate-in fade-in"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-submit-login"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực tài khoản...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Đăng Nhập</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Instruction (Strictly required: "Nếu chưa có tài khoản, vui lòng liên hệ Quản trị viên") */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Nếu chưa có tài khoản, vui lòng liên hệ Quản trị viên
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
