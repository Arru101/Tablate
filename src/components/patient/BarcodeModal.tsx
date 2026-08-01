import React, { useState } from 'react';
import { X, ScanLine, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodeModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const { setSearchQuery, addRecentSearch, showToast } = useAppStore();

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      const matched = 'Augmentin 625 Duo';
      setSearchQuery(matched);
      addRecentSearch(matched);
      showToast('success', `Barcode Decoded: EAN-13 ${matched}`);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800">
        
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Medicine Barcode Scanner</span>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative h-44 rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-slate-700">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent animate-pulse"></div>
          <div className="absolute left-4 right-4 h-0.5 bg-emerald-400 shadow-[0_0_15px_#10b981] animate-bounce"></div>
          
          <ScanLine className="w-16 h-16 text-emerald-400 opacity-60" />
        </div>

        <button
          onClick={handleSimulateScan}
          disabled={scanning}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg hover:brightness-110 transition disabled:opacity-50"
        >
          {scanning ? 'Decoding Barcode...' : 'Scan Medicine Package Barcode'}
        </button>

      </div>
    </div>
  );
};
