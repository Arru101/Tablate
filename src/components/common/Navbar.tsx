import React, { useState } from 'react';
import { 
  Pill, 
  Moon, 
  Sun, 
  ShieldAlert, 
  Store, 
  User, 
  Globe, 
  Download,
  Menu,
  X
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { LanguageCode } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface Props {
  onOpenAdminAuth: () => void;
}

export const Navbar: React.FC<Props> = ({ onOpenAdminAuth }) => {
  const { 
    currentRole, 
    setRole, 
    language, 
    setLanguage, 
    darkMode, 
    toggleDarkMode,
    downloadDataBackup
  } = useAppStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <header className="glass-nav sticky top-0 z-40 border-b border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl">
      <div className="responsive-container py-3">
        <div className="flex items-center justify-between gap-3">
          
          {/* Minimalist Brand Identity */}
          <div 
            onClick={() => setRole('patient')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform duration-300">
              <Pill className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-slate-900 via-brand-600 to-teal-500 dark:from-white dark:via-brand-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  TABLATE
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
            </div>
          </div>

          {/* Premium Icon-First Role & Quick Action Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            
            {/* Minimalist Role Switcher */}
            <div className="flex items-center rounded-2xl bg-slate-100/90 dark:bg-slate-800/60 p-1 border border-slate-200/80 dark:border-slate-700/60 text-xs font-extrabold shadow-inner">
              <button
                onClick={() => setRole('patient')}
                title="Patient Emergency Discovery View"
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  currentRole === 'patient'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="hidden lg:inline">Patient</span>
              </button>

              <button
                onClick={() => setRole('pharmacist')}
                title="Licensed Pharmacist Radar Station"
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  currentRole === 'pharmacist'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                <Store className="w-4 h-4" />
                <span className="hidden lg:inline">Pharmacist</span>
              </button>

              <button
                onClick={() => setRole('admin')}
                title="CDSCO Regulatory Admin Control Desk"
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  currentRole === 'admin'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span className="hidden lg:inline">Admin</span>
              </button>
            </div>

            {/* Language Icon Selector */}
            <div className="relative flex items-center bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl px-2.5 py-1 border border-slate-200 dark:border-slate-700">
              <Globe className="w-3.5 h-3.5 text-slate-400 mr-1" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="en">EN</option>
                <option value="hi">HI</option>
                <option value="mr">MR</option>
                <option value="ta">TA</option>
              </select>
            </div>

            {/* Minimal Dark Mode Icon Toggle */}
            <button
              onClick={toggleDarkMode}
              title="Toggle Dark/Light Mode"
              className="p-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition shadow-sm"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Admin Desk Shield Icon Button */}
            {currentRole !== 'admin' && (
              <button
                onClick={onOpenAdminAuth}
                title="Admin Security Access Desk"
                className="p-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition shadow-sm"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            )}

            {/* Data Export Icon Button */}
            <button
              onClick={downloadDataBackup}
              title="Export Snapshot JSON"
              className="p-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition shadow-sm"
            >
              <Download className="w-4 h-4" />
            </button>

          </div>

          {/* Mobile Drawer Trigger */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-fade-in text-xs">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { setRole('patient'); setMobileMenuOpen(false); }}
                className={`py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1 ${
                  currentRole === 'patient'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Patient</span>
              </button>

              <button
                onClick={() => { setRole('pharmacist'); setMobileMenuOpen(false); }}
                className={`py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1 ${
                  currentRole === 'pharmacist'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Pharmacist</span>
              </button>

              <button
                onClick={() => { setRole('admin'); setMobileMenuOpen(false); }}
                className={`py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1 ${
                  currentRole === 'admin'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
