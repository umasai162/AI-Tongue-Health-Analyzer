import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const NormalObservations = ({ observations }) => {
  if (!observations || observations.length === 0) return null;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
      <div className="flex items-center gap-2 text-emerald-800">
        <CheckCircle2 className="h-5 w-5" />
        <h3 className="text-base font-bold">Normal observations</h3>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {observations.map((observation) => (
          <span
            key={observation}
            className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800"
          >
            {observation}
          </span>
        ))}
      </div>
    </div>
  );
};
