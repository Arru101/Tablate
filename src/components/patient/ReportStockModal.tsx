import React, { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { Pharmacy } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  pharmacy: Pharmacy | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportStockModal: React.FC<Props> = ({ pharmacy, isOpen, onClose }) => {
  const [notes, setNotes] = useState('');
  const { reportInaccurateStock, filters } = useAppStore();

  if (!isOpen || !pharmacy) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportInaccurateStock(pharmacy.id, filters.searchQuery || 'Dolo 650', notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Report Inaccurate Medicine Stock
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Did you visit <strong className="text-slate-800 dark:text-slate-200">{pharmacy.name}</strong> and find that <strong className="text-brand-500">{filters.searchQuery || 'the medicine'}</strong> was out of stock? Reporting helps keep data accurate for emergency patients across India.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Pharmacist stated stock was exhausted 30 minutes ago..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-lg hover:bg-amber-500 transition"
          >
            <Send className="w-4 h-4" />
            <span>Submit Inaccuracy Audit Report</span>
          </button>
        </form>

      </div>
    </div>
  );
};
