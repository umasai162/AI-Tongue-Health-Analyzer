import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, FileImage, ShieldAlert, BookOpenText, BarChart3, FlaskConical, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const TechnicalDetails = ({ data, report }) => {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const confidenceData = useMemo(
    () =>
      (data?.predictions || []).map((pred) => ({
        name: pred.feature_name.replace('Tongue ', '').replace('Surface ', ''),
        confidence: Math.round((pred.confidence || 0) * 100),
        label: pred.predicted_label
      })),
    [data]
  );

  const references = report?.evidence_references || [];
  const limitations = report?.limitations || [
    'Visual pattern recognition is not a diagnosis and cannot confirm a specific disease.',
    'Image quality, lighting, and angle can affect the appearance of the tongue surface.',
    'A clinical examination remains necessary to correlate visible features with symptoms.'
  ];

  const sections = [
    {
      key: 'original',
      label: 'Original tongue image',
      icon: FileImage,
      content: data?.original_image_url ? <img src={data.original_image_url} alt="Original tongue" className="h-52 w-full rounded-xl object-cover" /> : <p className="text-sm text-slate-600">Original image not available.</p>
    },
    {
      key: 'processed',
      label: 'Processed tongue image',
      icon: FlaskConical,
      content: data?.processed_image_url ? <img src={data.processed_image_url} alt="Processed tongue" className="h-52 w-full rounded-xl object-cover" /> : <p className="text-sm text-slate-600">Processed image not available.</p>
    },
    {
      key: 'mask',
      label: 'Segmentation mask',
      icon: FileImage,
      content: data?.mask_image_url ? <img src={data.mask_image_url} alt="Tongue mask" className="h-52 w-full rounded-xl object-cover" /> : <p className="text-sm text-slate-600">Mask image not available.</p>
    },
    {
      key: 'gradcam',
      label: 'Grad-CAM heatmap',
      icon: AlertCircle,
      content: data?.gradcam_image_url ? <img src={data.gradcam_image_url} alt="Grad-CAM heatmap" className="h-52 w-full rounded-xl object-cover" /> : <p className="text-sm text-slate-600">Heatmap not available.</p>
    },
    {
      key: 'confidence',
      label: 'Detailed model confidence',
      icon: BarChart3,
      content: (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={confidenceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                formatter={(value) => [`${value}%`, 'Confidence']}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
              />
              <Bar dataKey="confidence" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )
    },
    {
      key: 'rag',
      label: 'RAG references',
      icon: BookOpenText,
      content: references.length ? (
        <ul className="space-y-2 text-xs text-slate-700">
          {references.map((ref, index) => (
            <li key={`${ref}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
              {ref}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-600">No RAG references were returned for this analysis.</p>
      )
    },
    {
      key: 'limitations',
      label: 'Technical limitations',
      icon: ShieldAlert,
      content: (
        <ul className="list-disc space-y-2 pl-5 text-xs leading-relaxed text-slate-700">
          {limitations.map((limit, index) => (
            <li key={`${limit}-${index}`}>{limit}</li>
          ))}
        </ul>
      )
    }
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-900">Technical details</h3>
      <div className="mt-4 space-y-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const isOpen = Boolean(openSections[section.key]);

          return (
            <div key={section.key} className="rounded-xl border border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => toggleSection(section.key)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Icon className="h-4 w-4 text-sky-600" />
                  {section.label}
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
              </button>

              {isOpen && <div className="border-t border-slate-200 p-4">{section.content}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
