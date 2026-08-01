import React, { useState } from 'react';
import { 
  Search, 
  Camera, 
  Mic, 
  ScanLine, 
  SlidersHorizontal,
  X,
  Send,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { TRANSLATIONS } from '../../data/translations';

interface Props {
  onOpenOCR: () => void;
  onOpenVoice: () => void;
  onOpenBarcode: () => void;
}

export const SmartSearchInput: React.FC<Props> = ({ onOpenOCR, onOpenVoice, onOpenBarcode }) => {
  const { 
    filters, 
    setSearchQuery, 
    setRadius, 
    toggleNightOnly, 
    toggleRxOnly, 
    addRecentSearch,
    language,
    createLiveStockRequest,
    showToast
  } = useAppStore();

  // Search bar starts COMPLETELY BLANK!
  const [inputVal, setInputVal] = useState('');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // EXPLICIT BROADCAST: Triggered ONLY when user clicks Search Icon / Button or hits Enter!
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = inputVal.trim();
    if (!cleanQuery) {
      showToast('warning', 'Please type a medicine name to send a request to area pharmacists.');
      return;
    }

    setSearchQuery(cleanQuery);
    addRecentSearch(cleanQuery);
    
    // DISPATCH REQUEST ONLY NOW!
    createLiveStockRequest(cleanQuery);
  };

  const handleClear = () => {
    setInputVal('');
    setSearchQuery('');
  };

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      
      {/* Sleek Minimalistic & Professional Emergency Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-full border border-slate-200/80 dark:border-slate-800/80 shadow-2xl focus-within:ring-2 focus-within:ring-brand-500/40 focus-within:border-brand-500 transition-all duration-300 overflow-hidden p-1.5 pl-4">
          
          {/* Search Icon */}
          <Search className="w-5 h-5 text-brand-500 shrink-0" />

          {/* Search Input */}
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type medicine name (e.g. Dolo 650, Insulin, Augmentin)..."
            className="w-full px-3 py-2.5 bg-transparent text-slate-900 dark:text-slate-100 font-semibold text-sm focus:outline-none placeholder:font-normal placeholder:text-slate-400"
          />

          {inputVal && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 mr-2 shrink-0 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Icon Action Strip */}
          <div className="flex items-center space-x-1 shrink-0">
            
            {/* Upload Prescription / Strip Image */}
            <button
              type="button"
              onClick={onOpenOCR}
              title="Upload Prescription / Strip Photo"
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-brand-500 transition"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Voice Search */}
            <button
              type="button"
              onClick={onOpenVoice}
              title="Voice Search Medicine"
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-teal-500 transition"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Barcode Scan */}
            <button
              type="button"
              onClick={onOpenBarcode}
              title="Scan Barcode"
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition"
            >
              <ScanLine className="w-4 h-4" />
            </button>

            {/* Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
              title="Filter Controls"
              className={`p-2 rounded-full transition ${
                showFiltersDrawer
                  ? 'bg-brand-500/10 text-brand-500'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Send Request Button */}
            <button
              type="submit"
              title="Send Emergency Ping to Pharmacists"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-brand-600 via-teal-600 to-emerald-600 text-white font-extrabold text-xs shadow-md hover:brightness-110 transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Request</span>
            </button>

          </div>
        </div>
      </form>

      {/* Expanded Filters Drawer */}
      {showFiltersDrawer && (
        <div className="p-4 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl space-y-3 text-xs animate-fade-in">
          
          <div className="font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-500" />
            Discovery Radius Controls
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[3, 5, 10, 15].map((r) => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                className={`px-3.5 py-1.5 rounded-full font-bold transition text-xs ${
                  filters.radiusKm === r
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {r} km Radius
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center space-x-2 cursor-pointer font-bold text-xs">
              <input
                type="checkbox"
                checked={filters.nightOnly}
                onChange={toggleNightOnly}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              <span>{t.night24x7}</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer font-bold text-xs">
              <input
                type="checkbox"
                checked={filters.rxOnly}
                onChange={toggleRxOnly}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              <span>{t.rxRequired}</span>
            </label>
          </div>
        </div>
      )}

    </div>
  );
};
