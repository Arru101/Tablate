import React from 'react';
import { ShieldCheck, Lock, Activity, Server, AlertTriangle, Terminal, Cpu } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const SecurityLogs: React.FC = () => {
  const { auditLogs } = useAppStore();

  return (
    <div className="bg-white dark:bg-slateDark-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-500">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              Enterprise Security Center & System Audit Logs
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              OWASP Top 10 Protections, Rate Limiting & Fraud Detection Metrics
            </p>
          </div>
        </div>

        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full font-bold text-xs border border-emerald-500/20">
          Cloudflare WAF Active
        </span>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Rate Limiter (Redis)</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-extrabold text-emerald-500 mt-1">100 req / min</div>
          <div className="text-[10px] text-slate-400">0 Throttles in last hour</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>JWT Rotation</span>
            <Lock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-extrabold text-cyan-500 mt-1">RS256 Algorithm</div>
          <div className="text-[10px] text-slate-400">Tokens expire in 15 mins</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>SQL / NoSQL Shield</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-extrabold text-purple-500 mt-1">Prisma ORM</div>
          <div className="text-[10px] text-slate-400">100% Prepared Statements</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Bot & Spam Engine</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-extrabold text-amber-500 mt-1">Device Fingerprint</div>
          <div className="text-[10px] text-slate-400">3 Suspicious Pings Flagged</div>
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-cyan-500" /> Immutable System Audit History
        </div>

        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      log.severity === 'critical'
                        ? 'bg-rose-500 text-white'
                        : log.severity === 'warning'
                        ? 'bg-amber-500 text-black'
                        : 'bg-emerald-500 text-black'
                    }`}
                  >
                    {log.severity}
                  </span>
                  <span className="font-bold text-cyan-400">[{log.action}]</span>
                  <span className="text-slate-400">{log.actor}</span>
                </div>
                <div className="text-slate-300 font-sans">{log.details}</div>
              </div>

              <div className="text-[10px] text-slate-500 sm:text-right shrink-0">
                <div>IP: {log.ipAddress}</div>
                <div>{log.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
