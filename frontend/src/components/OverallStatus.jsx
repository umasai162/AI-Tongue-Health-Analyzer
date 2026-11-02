import React from 'react';
import { Activity, CalendarDays, CheckCircle2, AlertTriangle, ImageIcon, ShieldCheck } from 'lucide-react';

export const OverallStatus = ({
  assessment = 'Normal-looking',
  totalFeatures = 0,
  normalCount = 0,
  unusualCount = 0,
  analysisDate,
  imageQualityStatus = 'Pending'
}) => {
  const needsAttention = assessment === 'Needs attention';

  const formattedDate = analysisDate
    ? new Date(analysisDate).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    : 'Not available';

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
              needsAttention ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {needsAttention ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Overall visual assessment
            </p>
            <h2
              className={`mt-1 text-xl font-extrabold tracking-tight ${
                needsAttention ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              {assessment}
            </h2>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700">
          <ShieldCheck className="h-3.5 w-3.5 text-sky-600" />
          Educational visual analysis only
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricBox label="Features analyzed" value={totalFeatures} icon={<Activity className="h-4 w-4" />} />
        <MetricBox label="Normal-looking" value={normalCount} icon={<CheckCircle2 className="h-4 w-4" />} accent="emerald" />
        <MetricBox label="Unusual findings" value={unusualCount} icon={<AlertTriangle className="h-4 w-4" />} accent="amber" />
        <MetricBox label="Analysis date" value={formattedDate} icon={<CalendarDays className="h-4 w-4" />} compact />
        <MetricBox label="Image quality" value={imageQualityStatus} icon={<ImageIcon className="h-4 w-4" />} accent={imageQualityStatus === 'Good' ? 'emerald' : 'amber'} compact />
      </div>
    </div>
  );
};

const MetricBox = ({ label, value, icon, accent = 'sky', compact = false }) => {
  const colorMap = {
    sky: 'bg-sky-50 text-sky-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700'
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${colorMap[accent]}`}>{icon}</div>
      </div>
      <div className={`mt-3 ${compact ? 'text-xs' : 'text-xl'} font-extrabold tracking-tight text-slate-900`}>
        {value}
      </div>
    </div>
  );
};
