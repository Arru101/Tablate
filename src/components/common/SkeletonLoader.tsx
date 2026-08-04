import React from 'react';

interface SkeletonProps {
  type?: 'card' | 'table' | 'map' | 'list';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({ type = 'card', count = 3 }) => {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((_, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-pulse space-y-4"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/5"></div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
        <div className="h-12 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800"></div>
        {items.map((_, idx) => (
          <div
            key={idx}
            className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between space-x-4"
          >
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/5"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-pulse">
      {items.map((_, idx) => (
        <div
          key={idx}
          className="h-16 rounded-xl bg-slate-200 dark:bg-slate-800 w-full"
        ></div>
      ))}
    </div>
  );
};
