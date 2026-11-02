import React from 'react';
import { Droplets, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react';

const icons = [Sparkles, Droplets, ShieldCheck, Stethoscope];

export const HealthRecommendations = ({ recommendations = [] }) => {
  const items = recommendations.length
    ? recommendations
    : [
        'Maintain good oral hygiene with regular brushing and tongue cleaning.',
        'Keep the mouth well hydrated and avoid prolonged dryness.',
        'Monitor visible changes over time and document what is persistent.',
        'If changes persist or are associated with discomfort, consult a dentist or doctor for a professional assessment.'
      ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-slate-900">
        <Sparkles className="h-5 w-5 text-sky-600" />
        <h3 className="text-base font-bold">Recommended next steps</h3>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item, index) => {
          const Icon = icons[index % icons.length];
          return (
            <div key={item} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm leading-relaxed text-slate-700">{item}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
