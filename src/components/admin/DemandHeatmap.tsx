import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Flame, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

const CITY_DEMAND_DATA = [
  { city: 'Mumbai', searches: 4820, stockAvailable: 4210, shortage: 610 },
  { city: 'Delhi-NCR', searches: 5120, stockAvailable: 4300, shortage: 820 },
  { city: 'Bengaluru', searches: 3940, stockAvailable: 3750, shortage: 190 },
  { city: 'Hyderabad', searches: 2890, stockAvailable: 2710, shortage: 180 },
  { city: 'Chennai', searches: 3100, stockAvailable: 2950, shortage: 150 },
  { city: 'Kolkata', searches: 2450, stockAvailable: 2100, shortage: 350 },
];

const SEARCH_TRENDS_DATA = [
  { time: '00:00', Dolo650: 120, Augmentin: 45, Insulin: 80 },
  { time: '04:00', Dolo650: 80, Augmentin: 30, Insulin: 95 },
  { time: '08:00', Dolo650: 450, Augmentin: 210, Insulin: 340 },
  { time: '12:00', Dolo650: 890, Augmentin: 430, Insulin: 620 },
  { time: '16:00', Dolo650: 1100, Augmentin: 580, Insulin: 780 },
  { time: '20:00', Dolo650: 1450, Augmentin: 720, Insulin: 910 },
];

export const DemandHeatmap: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slateDark-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              National Geospatial Medicine Demand & Shortage Analytics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time regional search spikes, shortages, and supply-chain radar across India
            </p>
          </div>
        </div>

        <span className="px-3 py-1 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-full font-bold text-xs border border-brand-500/20">
          Live Heatmap Engine Active
        </span>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-400 font-bold uppercase">Most Searched Emergency Medicine</div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">Dolo 650 & Human Actrapid</div>
          <div className="text-xs text-emerald-500 font-bold mt-1">↑ 24% surge during evening hours</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-400 font-bold uppercase">Fulfillment Discovery Rate</div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">94.8%</div>
          <div className="text-xs text-slate-500 mt-1">Patients located medicine within 3.2 km average</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-400 font-bold uppercase">Highest Shortage Region</div>
          <div className="text-xl font-extrabold text-rose-500 mt-1">Delhi-NCR (North Zone)</div>
          <div className="text-xs text-rose-400 font-semibold mt-1">820 unfulfilled searches flagged</div>
        </div>
      </div>

      {/* Recharts Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* City Demand vs Stock chart */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            City-wise Search Demand vs Store Stock Availability
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CITY_DEMAND_DATA}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="city" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }} />
                <Bar dataKey="searches" fill="#0d9488" name="Patient Searches" radius={[4, 4, 0, 0]} />
                <Bar dataKey="stockAvailable" fill="#10b981" name="Pharmacy Stock Found" radius={[4, 4, 0, 0]} />
                <Bar dataKey="shortage" fill="#ef4444" name="Shortage Flagged" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 24-hour Search Trend chart */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            24-Hour Hourly Search Velocity Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SEARCH_TRENDS_DATA}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="Dolo650" stroke="#0d9488" fill="#14b8a6" fillOpacity={0.2} name="Dolo 650" />
                <Area type="monotone" dataKey="Insulin" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} name="Human Actrapid Insulin" />
                <Area type="monotone" dataKey="Augmentin" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} name="Augmentin 625 Duo" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
