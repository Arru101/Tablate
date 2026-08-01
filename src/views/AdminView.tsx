import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Flame, 
  Pill, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  LogOut,
  Download,
  AlertCircle,
  Users
} from 'lucide-react';
import { AdminKYCInspector } from '../components/admin/AdminKYCInspector';
import { DemandHeatmap } from '../components/admin/DemandHeatmap';
import { MedicineCatalogManager } from '../components/admin/MedicineCatalogManager';
import { SecurityLogs } from '../components/admin/SecurityLogs';
import { PharmacistAccountManager } from '../components/admin/PharmacistAccountManager';
import { useAppStore } from '../store/useAppStore';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kyc' | 'passwords' | 'heatmap' | 'catalog' | 'security'>('kyc');
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { 
    isAdminAuthenticated, 
    authenticateAdmin, 
    logoutAdmin, 
    downloadDataBackup,
    kycQueue, 
    pharmacies, 
    medicines 
  } = useAppStore();

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = authenticateAdmin(inputPassword);
    if (!success) {
      setErrorMsg('Incorrect Admin Access Key. Please try again.');
    }
  };

  // If Admin is locked, show Password Screen
  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-slateDark-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-center">
        
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 mx-auto flex items-center justify-center border border-purple-500/20 shadow-glow">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            Admin Command Desk Authentication
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            State Licensing Authority & Enterprise Regulatory Portal. Enter security key to unlock.
          </p>
        </div>

        <form onSubmit={handleAdminAuth} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Admin Master Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                placeholder="Enter admin password..."
                className="w-full p-3 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg hover:brightness-110 transition flex items-center justify-center space-x-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Unlock Admin Desk</span>
          </button>
        </form>

        <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          Protected by CDSCO Security Audit Engine • 256-bit Encryption
        </div>

      </div>
    );
  }

  // Admin Authenticated View
  return (
    <div className="space-y-8 pb-16">
      
      {/* Admin Header Banner */}
      <section className="bg-gradient-to-r from-purple-950 via-slate-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-purple-900/40 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-glow shrink-0">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-extrabold tracking-tight">Enterprise Admin Desk</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Authenticated
                </span>
              </div>
              <p className="text-xs text-purple-200 mt-0.5">
                Central Drug Standard Control Organisation (CDSCO) Regulatory Portal
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <button
              onClick={downloadDataBackup}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Essential Data JSON</span>
            </button>

            <button
              onClick={logoutAdmin}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-purple-900/80 hover:bg-rose-600 text-purple-200 hover:text-white font-bold transition border border-purple-500/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Admin Desk</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-purple-900/40">
          <button
            onClick={() => setActiveTab('kyc')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'kyc'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>KYC Audit Queue ({kycQueue.filter((k) => k.status === 'pending').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('passwords')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'passwords'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Pharmacist Passwords Control</span>
          </button>

          <button
            onClick={() => setActiveTab('heatmap')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'heatmap'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Geospatial Shortage Heatmap</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'catalog'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Master Medicine Database</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'security'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security & Audit Center</span>
          </button>
        </div>
      </section>

      {/* Main Render Tab */}
      {activeTab === 'kyc' && <AdminKYCInspector />}
      {activeTab === 'passwords' && <PharmacistAccountManager />}
      {activeTab === 'heatmap' && <DemandHeatmap />}
      {activeTab === 'catalog' && <MedicineCatalogManager />}
      {activeTab === 'security' && <SecurityLogs />}

    </div>
  );
};
