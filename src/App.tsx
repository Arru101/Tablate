import React, { useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { PatientView } from './views/PatientView';
import { PharmacistView } from './views/PharmacistView';
import { AdminView } from './views/AdminView';
import { useAppStore } from './store/useAppStore';
import { realtimeSyncEngine } from './services/realtimeSyncEngine';

export function App() {
  const { currentRole, setRole, activeToast, clearToast, darkMode, detectLiveLocation } = useAppStore();

  // Initialize Real-Time Sync, Auto-Detect Location on Visit, & Dark Mode Class
  useEffect(() => {
    realtimeSyncEngine.startSyncBus();
    detectLiveLocation();

    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode, detectLiveLocation]);

  const handleOpenAdminAuth = () => {
    setRole('admin');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 antialiased overflow-x-hidden selection:bg-brand-500 selection:text-white">
      
      {/* Toast Notification Container */}
      {activeToast && (
        <div className="fixed top-20 right-4 z-50 animate-bounce max-w-md w-full p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 flex items-center justify-between text-xs space-x-3">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              activeToast.type === 'success' ? 'bg-emerald-400' :
              activeToast.type === 'error' ? 'bg-rose-400' :
              activeToast.type === 'warning' ? 'bg-amber-400' : 'bg-cyan-400'
            }`}></span>
            <span className="font-bold">{activeToast.message}</span>
          </div>
          <button onClick={clearToast} className="text-slate-400 hover:text-white font-mono text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Main Navigation Header */}
      <Navbar onOpenAdminAuth={handleOpenAdminAuth} />

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {currentRole === 'patient' && <PatientView />}
        {currentRole === 'pharmacist' && <PharmacistView />}
        {currentRole === 'admin' && <AdminView />}
      </main>

      {/* Professional Enterprise Footer */}
      <Footer onOpenAdminAuth={handleOpenAdminAuth} />

    </div>
  );
}

export default App;
