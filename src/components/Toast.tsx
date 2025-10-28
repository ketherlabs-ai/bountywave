import { useEffect, useState } from 'react';
import { X, UserPlus, Trophy, Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'user-joined' | 'success' | 'error' | 'info' | 'achievement';
  message: string;
  username?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, type, message, username, duration = 5000, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 50);

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [duration, id, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'user-joined':
        return <UserPlus className="w-5 h-5 text-primary-400" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      default:
        return <Info className="w-5 h-5 text-primary-400" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'user-joined':
        return 'border-primary-500/40 bg-gradient-to-br from-primary-950/95 to-primary-900/95';
      case 'success':
        return 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/95 to-emerald-900/95';
      case 'error':
        return 'border-red-500/40 bg-gradient-to-br from-red-950/95 to-red-900/95';
      case 'achievement':
        return 'border-yellow-500/40 bg-gradient-to-br from-yellow-950/95 to-yellow-900/95';
      default:
        return 'border-primary-500/40 bg-gradient-to-br from-neutral-900/95 to-neutral-950/95';
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case 'user-joined':
        return 'bg-primary-500';
      case 'success':
        return 'bg-emerald-500';
      case 'error':
        return 'bg-red-500';
      case 'achievement':
        return 'bg-yellow-500';
      default:
        return 'bg-primary-500';
    }
  };

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 pr-10 rounded-xl border backdrop-blur-xl shadow-2xl
        ${getStyles()}
        ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}
        w-full sm:min-w-[320px] sm:max-w-[400px]
      `}
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        {username && (
          <div className="text-white font-bold text-sm mb-0.5">
            {username}
          </div>
        )}
        <div className="text-neutral-300 text-sm leading-relaxed">
          {message}
        </div>
      </div>

      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onClose(id), 300);
        }}
        className="absolute top-3 right-3 text-neutral-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-800/50 rounded-b-xl overflow-hidden">
        <div
          className={`h-full transition-all duration-100 ${getProgressColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastProps[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-full sm:max-w-[400px] ml-auto">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}
