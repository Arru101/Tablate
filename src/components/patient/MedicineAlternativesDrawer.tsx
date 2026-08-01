import React from 'react';
import { X, Pill, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Medicine } from '../../types';

interface Props {
  medicine: Medicine | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MedicineAlternativesDrawer: React.FC<Props> = ({ medicine, isOpen, onClose }) => {
  if (!isOpen || !medicine) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Pharmacist Recommended Alternatives
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Identical active generic molecule substitutes
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Medicine Context */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-400 font-semibold uppercase">Searched Medicine</div>
          <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            {medicine.brandName} <span className="text-xs text-slate-400">({medicine.strength})</span>
          </div>
          <div className="text-xs text-brand-600 dark:text-brand-400 font-medium">
            Generic Molecule: {medicine.genericName}
          </div>
        </div>

        {/* Alternatives List */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Bio-Equivalent Brands & Generics
          </div>

          {medicine.alternatives.map((alt, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  {alt.brandName}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Mfr: {alt.manufacturer}
                </div>
                <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Same active ingredient ({alt.genericName})
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  ₹{alt.price.toFixed(2)}
                </div>
                <span className="text-[10px] text-slate-400">Est. MRP</span>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance Note */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Always consult a registered pharmacist or physician before substituting prescription medicines (Schedule H/H1).
          </span>
        </div>

      </div>
    </div>
  );
};
