import React from 'react';
import { 
  Pill, 
  ShieldCheck, 
  Heart, 
  MapPin, 
  PhoneCall, 
  Building2, 
  FileText, 
  ExternalLink,
  Radio,
  Lock,
  Globe
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  onOpenAdminAuth: () => void;
}

export const Footer: React.FC<Props> = ({ onOpenAdminAuth }) => {
  const { setRole } = useAppStore();

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 border-t border-slate-800 pt-12 pb-8 mt-16 text-xs">
      <div className="responsive-container space-y-10">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Column 1: Brand & Platform Mission (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-glow shrink-0">
                <Pill className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black text-white tracking-tight">TABLATE</span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                  INDIA REGULATORY COMPLIANT
                </span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed max-w-md">
              India's first real-time Emergency Medicine Stock Verification platform. Designed to prevent patient panic and eliminate unverified store visits by connecting patients directly with nearby CDSCO-licensed physical pharmacies.
            </p>

            <div className="flex items-center space-x-2 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 max-w-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
              <span>All India Emergency Discovery Radar Operational (24x7 Active)</span>
            </div>
          </div>

          {/* Column 2: Patient Services */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">Patient Portal</h4>
            <ul className="space-y-2 font-medium">
              <li>
                <button onClick={() => setRole('patient')} className="hover:text-teal-400 transition flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-teal-400" /> Stock Verification
                </button>
              </li>
              <li>
                <button onClick={() => setRole('patient')} className="hover:text-teal-400 transition flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-teal-400" /> Broadcast Emergency Request
                </button>
              </li>
              <li>
                <button onClick={() => setRole('patient')} className="hover:text-teal-400 transition flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" /> Live Traffic Turn-by-Turn
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Licensed Pharmacists */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">Licensed Pharmacist</h4>
            <ul className="space-y-2 font-medium">
              <li>
                <button onClick={() => setRole('pharmacist')} className="hover:text-teal-400 transition flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-teal-400" /> Store Sign In & Portal
                </button>
              </li>
              <li>
                <button onClick={() => setRole('pharmacist')} className="hover:text-teal-400 transition flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Form 20B/21B KYC Desk
                </button>
              </li>
              <li>
                <button onClick={() => setRole('pharmacist')} className="hover:text-teal-400 transition flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-400" /> Real-time Live Radar Stream
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Regulatory & Compliance */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">Regulatory Compliance</h4>
            <ul className="space-y-2 font-medium">
              <li>
                <button onClick={onOpenAdminAuth} className="hover:text-rose-400 transition flex items-center gap-1.5 text-rose-400 font-bold">
                  <Lock className="w-3.5 h-3.5" /> CDSCO Regulatory Admin
                </button>
              </li>
              <li className="text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Drugs & Cosmetics Act 1940
              </li>
              <li className="text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" /> PCI Registered Chemists Only
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Compliance Disclaimer */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
          <div>
            © {new Date().getFullYear()} Tablate MediPulse Platform. Built for India Emergency Medical Needs. All rights reserved.
          </div>

          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-400 cursor-pointer">Physical Store Visit Verification Only</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">No Online Medicine Delivery</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">CDSCO Compliant</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
