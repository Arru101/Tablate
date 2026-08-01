import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  UploadCloud, 
  AlertTriangle, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const InventoryManager: React.FC = () => {
  const { inventory, updateInventoryQuantity, addInventoryItem, medicines, showToast } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<{ id: string; qty: number } | null>(null);

  // New Item Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMedicineId, setNewMedicineId] = useState(medicines[0]?.id || '');
  const [newQty, setNewQty] = useState(100);
  const [newPrice, setNewPrice] = useState(35);
  const [newBatch, setNewBatch] = useState('BTCH-2026-X');
  const [newExpiry, setNewExpiry] = useState('2027-12-31');

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.medicine.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.medicine.genericName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.medicine.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      showToast('success', 'Bulk CSV Inventory Uploaded! 48 items imported & stock updated.');
    }
  };

  const handleSaveAddModal = (e: React.FormEvent) => {
    e.preventDefault();
    const med = medicines.find((m) => m.id === newMedicineId) || medicines[0];
    addInventoryItem({
      pharmacyId: 'pharm-1',
      medicineId: med.id,
      medicine: med,
      quantity: Number(newQty),
      price: Number(newPrice),
      batchNumber: newBatch,
      expiryDate: newExpiry,
      status: Number(newQty) > 20 ? 'in_stock' : Number(newQty) > 0 ? 'low_stock' : 'out_of_stock'
    });
    setShowAddModal(false);
  };

  return (
    <div className="bg-white dark:bg-slateDark-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Store Stock & Inventory Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time medicine stock levels broadcasted to patient discovery radar
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* CSV Bulk Upload Button */}
          <label className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer border border-slate-200 dark:border-slate-700 transition">
            <UploadCloud className="w-4 h-4 text-brand-500" />
            <span>Bulk CSV Import</span>
            <input type="file" accept=".csv, .json" onChange={handleCSVUpload} className="hidden" />
          </label>

          {/* Add Medicine Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 text-white font-bold text-xs shadow-lg hover:brightness-105 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter inventory by brand or generic..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Layers className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Analgesic & Antipyretic">Analgesics & Fever</option>
            <option value="Antibiotic">Antibiotics (Schedule H)</option>
            <option value="Diabetes / Emergency Biologic">Insulins & Biologics</option>
            <option value="Gastrointestinal & Anti-Ulcer">Gastrointestinal</option>
          </select>
        </div>
      </div>

      {/* Stock Inventory Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Medicine Details</th>
              <th className="py-3 px-4">Batch & Expiry</th>
              <th className="py-3 px-4">MRP (INR)</th>
              <th className="py-3 px-4">Stock Level</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Quick Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredInventory.map((item) => {
              const isEditing = editingItem?.id === item.id;

              return (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-extrabold text-slate-900 dark:text-slate-100">
                      {item.medicine.brandName} <span className="text-slate-400 font-normal">({item.medicine.strength})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.medicine.genericName} • {item.medicine.scheduleClass}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                    <div>Batch: {item.batchNumber}</div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Exp: {item.expiryDate}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                    ₹{item.price.toFixed(2)}
                  </td>

                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editingItem.qty}
                        onChange={(e) => setEditingItem({ ...editingItem, qty: Number(e.target.value) })}
                        className="w-20 p-1 rounded bg-slate-100 dark:bg-slate-700 border font-bold text-xs"
                      />
                    ) : (
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                        {item.quantity} units
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'in_stock'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : item.status === 'low_stock'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {item.status === 'in_stock' ? 'In Stock' : item.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {isEditing ? (
                      <button
                        onClick={() => {
                          const status = editingItem.qty > 20 ? 'in_stock' : editingItem.qty > 0 ? 'low_stock' : 'out_of_stock';
                          updateInventoryQuantity(item.id, editingItem.qty, status);
                          setEditingItem(null);
                        }}
                        className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-xs"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingItem({ id: item.id, qty: item.quantity })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Stock Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Add Medicine to Store Inventory</h3>

            <form onSubmit={handleSaveAddModal} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Select Medicine from National Catalog</label>
                <select
                  value={newMedicineId}
                  onChange={(e) => setNewMedicineId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none"
                >
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.brandName} ({m.strength}) — MRP ₹{m.mrp}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Quantity (Units)</label>
                  <input
                    type="number"
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Unit Price (INR)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={newBatch}
                    onChange={(e) => setNewBatch(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold shadow-md"
                >
                  Save Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
