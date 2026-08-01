import React, { useState } from 'react';
import { Pill, Plus, Search, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const MedicineCatalogManager: React.FC = () => {
  const { medicines, addMedicineToCatalog } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    brandName: '',
    genericName: '',
    manufacturer: '',
    strength: '500mg',
    form: 'tablet' as const,
    rxRequired: true,
    scheduleClass: 'Schedule H' as const,
    category: 'Antibiotic',
    mrp: 150,
    description: ''
  });

  const filtered = medicines.filter((m) =>
    m.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.genericName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMedicineToCatalog({
      ...formData,
      alternatives: []
    });
    setShowAddModal(false);
  };

  return (
    <div className="bg-white dark:bg-slateDark-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            National Master Medicine & Molecule Catalog
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official CDSCO Schedule H/H1/OTC regulatory drug database
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg hover:brightness-105 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Medicine to Catalog</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter catalog by drug name..."
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
        />
      </div>

      {/* Catalog Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Brand & Strength</th>
              <th className="py-3 px-4">Active Generic Molecule</th>
              <th className="py-3 px-4">Manufacturer</th>
              <th className="py-3 px-4">Schedule Class</th>
              <th className="py-3 px-4">MRP (INR)</th>
              <th className="py-3 px-4">Bio-Alternatives</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                  {m.brandName} <span className="text-slate-400 font-normal">({m.strength})</span>
                </td>
                <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                  {m.genericName}
                </td>
                <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                  {m.manufacturer}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.scheduleClass === 'OTC'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-rose-500/10 text-rose-600'
                    }`}
                  >
                    {m.scheduleClass}
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                  ₹{m.mrp.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-slate-400">
                  {m.alternatives.length} Registered
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Add New Medicine to National Catalog</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Brand Name</label>
                <input
                  type="text"
                  required
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  placeholder="e.g. Crocin 650"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Active Generic Ingredient</label>
                <input
                  type="text"
                  required
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  placeholder="e.g. Paracetamol"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Manufacturer</label>
                  <input
                    type="text"
                    required
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">MRP (INR)</label>
                  <input
                    type="number"
                    required
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold">
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
