import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { TRANSLATIONS } from '../../data/translations';

export const ComplianceBadge: React.FC = () => {
  const language = useAppStore((state) => state.language);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <div className="bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-cyan-900/90 text-white text-xs py-2 px-4 shadow-sm border-b border-emerald-500/20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
          <span className="font-semibold text-emerald-100 tracking-wide uppercase text-[11px]">
            Regulatory Notice (Drugs & Cosmetics Act 1940)
          </span>
          <span className="hidden md:inline text-emerald-400/60">•</span>
          <span className="text-emerald-200/90">{t.complianceNotice}</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] text-emerald-300">
          <span className="inline-flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
            <Info className="w-3 h-3 text-cyan-400" />
            Physical Visit Required
          </span>
          <span className="hidden lg:inline text-emerald-200/70 font-medium">CDSCO Compliant</span>
        </div>
      </div>
    </div>
  );
};
