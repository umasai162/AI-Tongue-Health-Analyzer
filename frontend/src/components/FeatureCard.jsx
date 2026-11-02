import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

const getFeatureStatus = (featureName, predictedLabel) => {
  const text = `${featureName} ${predictedLabel}`.toLowerCase();

  if (/(pink|normal|absent|none|uniform|thin|smooth|mild|superficial|regular|healthy|balanced)/.test(text)) {
    return 'normal';
  }

  if (/(yellow|rough|granular|swollen|enlarged|scalloped|thick|coated|fissure|irregular|patch|visible)/.test(text)) {
    return 'unusual';
  }

  if (/(ulcer|bleeding|crusted|angry|severe|painful|red patch|black|erosion)/.test(text)) {
    return 'urgent';
  }

  return 'normal';
};

const buildExplanation = (featureName, predictedLabel, details) => {
  const text = `${featureName} ${predictedLabel}`.toLowerCase();

  if (/(pink|normal)/.test(text)) {
    return 'This appearance is generally in line with a typical pink tongue surface and does not by itself suggest a specific condition.';
  }

  if (/(yellow)/.test(text)) {
    return 'A yellowish coating can be linked to food, oral debris, dehydration, or temporary surface changes rather than a confirmed diagnosis.';
  }

  if (/(rough|granular)/.test(text)) {
    return 'A rougher or granular-looking texture may reflect mild irritation, dehydration, or surface changes that are often reversible.';
  }

  if (/(swollen|enlarged)/.test(text)) {
    return 'An enlarged or swollen appearance can be related to temporary inflammation, pressure, or postural factors, and should be monitored.';
  }

  if (/(scalloped|teeth)/.test(text)) {
    return 'Scalloped borders often reflect pressure from the teeth or a broader enlarged tongue pattern, rather than a confirmed disease.';
  }

  if (/(fissure|mild)/.test(text)) {
    return 'Mild fissures are a common anatomical variation and often remain harmless, especially when they are superficial.';
  }

  if (/(patch|none|uniform)/.test(text)) {
    return 'The tissue appears relatively uniform without obvious irregular patching or suspicious lesions on visual review.';
  }

  if (details) {
    return details;
  }

  return 'This observation may reflect a visual pattern that is worth monitoring, but it is not a diagnosis by itself.';
};

export const FeatureCard = ({ featureName, predictedLabel, confidence, details }) => {
  const status = getFeatureStatus(featureName, predictedLabel);
  const confidencePercent = Math.round((confidence || 0) * 100);

  const statusMeta = {
    normal: {
      label: 'Normal-looking',
      classes: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      dot: 'bg-emerald-500',
      Icon: CheckCircle2
    },
    unusual: {
      label: 'Needs attention',
      classes: 'border-amber-200 bg-amber-50 text-amber-700',
      dot: 'bg-amber-500',
      Icon: AlertTriangle
    },
    urgent: {
      label: 'Urgent review',
      classes: 'border-rose-200 bg-rose-50 text-rose-700',
      dot: 'bg-rose-500',
      Icon: ShieldAlert
    }
  };

  const meta = statusMeta[status] || statusMeta.normal;
  const Icon = meta.Icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{featureName}</p>
          <h3 className="mt-1 text-base font-bold text-slate-900">{predictedLabel}</h3>
        </div>

        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold ${meta.classes}`}>
          <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
          <span>Model confidence</span>
          <span className="font-bold text-slate-900">{confidencePercent}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full ${
              status === 'normal' ? 'bg-emerald-500' : status === 'urgent' ? 'bg-rose-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.max(10, confidencePercent)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
          <Icon className="h-3.5 w-3.5" />
          <span>Short explanation</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          {buildExplanation(featureName, predictedLabel, details)}
        </p>
      </div>
    </div>
  );
};
