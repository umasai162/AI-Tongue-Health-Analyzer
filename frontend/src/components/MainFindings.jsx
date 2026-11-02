import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export const MainFindings = ({ findings }) => {
  if (!findings || findings.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-900">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <h3 className="text-base font-bold">Findings that need attention</h3>
        </div>
        <p className="mt-3 text-sm text-slate-600">No unusual visual observations were identified from the current model output.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
      <div className="flex items-center gap-2 text-amber-800">
        <AlertTriangle className="h-5 w-5" />
        <h3 className="text-base font-bold">Findings that need attention</h3>
      </div>

      <div className="mt-4 space-y-3">
        {findings.map((finding) => (
          <div key={finding.title} className="rounded-xl border border-amber-200 bg-white p-3.5">
            <div className="flex items-start gap-2">
              <ArrowRight className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-bold text-slate-900">{finding.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{finding.explanation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
