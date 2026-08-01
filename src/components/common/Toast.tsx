import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const Toast: React.FC = () => {
  const { activeToast, clearToast } = useAppStore();

  if (!activeToast) return null;

  const icons = {
    info: <Info className="w-5 h-5 text-cyan-400" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
  };

  const borders = {
    info: 'border-cyan-500/30 bg-slate-900/90 text-cyan-200',
    success: 'border-emerald-500/30 bg-slate-900/90 text-emerald-200',
    warning: 'border-amber-500/30 bg-slate-900/90 text-amber-200',
    error: 'border-rose-500/30 bg-slate-900/90 text-rose-200',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl ${
          borders[activeToast.type]
        }`}
      >
        <div className="shrink-0">{icons[activeToast.type]}</div>
        <p className="text-xs font-semibold pr-2">{activeToast.message}</p>
        <button
          onClick={clearToast}
          className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
