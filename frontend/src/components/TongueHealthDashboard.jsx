import React, { useMemo } from 'react';
import { Activity, BookOpen, Download, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { OverallStatus } from './OverallStatus';
import { FeatureCard } from './FeatureCard';
import { MainFindings } from './MainFindings';
import { NormalObservations } from './NormalObservations';
import { HealthRecommendations } from './HealthRecommendations';
import { TechnicalDetails } from './TechnicalDetails';

const normalizeFeatureName = (featureName = '') => {
  const trimmed = featureName.replace(/_/g, ' ').trim();
  return trimmed
    .replace(/tongue /i, '')
    .replace(/surface /i, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const findMainFindings = (predictions = []) => {
  const findings = [];

  for (const prediction of predictions) {
    const featureName = normalizeFeatureName(prediction.feature_name);
    const label = (prediction.predicted_label || '').toLowerCase();

    if (/yellow/.test(label) || /thick white/.test(label)) {
      findings.push({
        title: 'Yellow tongue coating',
        explanation: `The ${featureName.toLowerCase()} appears ${prediction.predicted_label.toLowerCase()}, which can reflect coating, dehydration, or oral surface changes rather than a confirmed diagnosis.`
      });
    }

    if (/rough|granular/.test(label)) {
      findings.push({
        title: 'Rough or granular texture',
        explanation: `The ${featureName.toLowerCase()} looks rougher than a smooth normal surface. This may be linked to temporary irritation, dehydration, or surface change patterns.`
      });
    }

    if (/swollen|enlarged/.test(label)) {
      findings.push({
        title: 'Swollen or enlarged-looking tongue',
        explanation: `The ${featureName.toLowerCase()} appears broadened or enlarged relative to a typical appearance. This can happen with temporary inflammation, pressure, or irritation and should be monitored.`
      });
    }

    if (/scalloped|teeth/.test(label)) {
      findings.push({
        title: 'Scalloped teeth marks',
        explanation: `The dorsal edges show a scalloped or indented pattern consistent with pressure from the teeth. This is often a visual pattern rather than a confirmed disease.`
      });
    }
  }

  const unique = [];
  const seen = new Set();
  for (const item of findings) {
    const key = item.title;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }

  return unique.slice(0, 4);
};

const findNormalObservations = (predictions = []) => {
  const normalItems = [];

  for (const prediction of predictions) {
    const label = prediction.predicted_label || '';
    const featureName = normalizeFeatureName(prediction.feature_name);

    const lowercase = `${featureName} ${label}`.toLowerCase();

    if (/(normal pink|pink)/.test(lowercase)) {
      normalItems.push('Normal pink color.');
    }

    if (/(mild|superficial).*(fissure|fissures)/.test(lowercase) || /fissures.*(absent|mild|superficial)/.test(lowercase)) {
      normalItems.push('Mild or superficial fissures.');
    }

    if (/(none|uniform|no visible irregular patches|no visible patches)/.test(lowercase)) {
      normalItems.push('No visible irregular patches.');
    }

    if (/(thin white|normal|smooth)/.test(lowercase) && !/yellow|rough|granular/.test(lowercase)) {
      normalItems.push(`${featureName} appears relatively steady and typical.`);
    }
  }

  const unique = [...new Set(normalItems)];
  return unique.slice(0, 4);
};

const buildFeatureCards = (predictions = []) => {
  return predictions.map((prediction) => ({
    featureName: normalizeFeatureName(prediction.feature_name),
    predictedLabel: prediction.predicted_label,
    confidence: prediction.confidence || 0,
    details: prediction.details || ''
  }));
};

const sanitizeAdviceText = (text) => {
  if (!text) return '';

  return text
    .replace(/\b\d+(?:\s*[-–]\s*\d+)?(?:\s*(?:glasses|cups|times|hours|minutes|days|weeks|months))?\b/gi, '')
    .replace(/\b\d+%\b/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .trim();
};

export const TongueHealthDashboard = ({ data, activeLanguage, onLanguageSwitch, regeneratingLang }) => {
  const predictions = data?.predictions || [];
  const report = data?.report || {};
  const reportRecommendations = (report.recommended_next_steps || []).map((item) => sanitizeAdviceText(item)).filter(Boolean);
  const reportExplanations = (report.general_explanations || []).map((item) => sanitizeAdviceText(item)).filter(Boolean);

  const featureCards = useMemo(() => buildFeatureCards(predictions), [predictions]);
  const mainFindings = useMemo(() => findMainFindings(predictions), [predictions]);
  const normalObservations = useMemo(() => findNormalObservations(predictions), [predictions]);

  const overallAssessment = mainFindings.length > 0 ? 'Needs attention' : 'Normal-looking';
  const totalFeatures = featureCards.length;
  const normalCount = featureCards.filter((feature) => {
    const statusText = `${feature.featureName} ${feature.predictedLabel}`.toLowerCase();
    return /(normal|pink|absent|none|uniform|thin|smooth|mild|superficial)/.test(statusText);
  }).length;
  const unusualCount = Math.max(featureCards.length - normalCount, 0);
  const imageQualityStatus = data?.image_quality || 'Pending';
  const analysisDate = data?.created_at || new Date().toISOString();

  const recommendations = reportRecommendations.length
    ? reportRecommendations
    : [
        'Maintain good oral hygiene and clean the tongue gently as part of daily care.',
        'Stay well hydrated to support normal oral moisture and reduce dryness.',
        'Monitor visible changes over time and note any persistent differences or discomfort.',
        'If the tongue remains altered, becomes painful, or is accompanied by concerning symptoms, consult a dentist or doctor.'
      ];

  const possibleExplanations = reportExplanations.length
    ? reportExplanations.slice(0, 4)
    : [
        'Temporary surface change can occur from food, hydration, oral hygiene habits, or irritant exposure.',
        'Texture differences may reflect mild irritation or a normal anatomical variation rather than a disease.',
        'Changes in coating or papillary appearance can be influenced by hydration, diet, and oral environment.',
        'Visual findings should be correlated with symptoms and professional examination before drawing conclusions.'
      ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-700">
              <Activity className="h-3.5 w-3.5" />
              Analysis #{data?.id || '—'}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Tongue visual health dashboard</h1>
            <p className="text-xs text-slate-500">Educational assessment based on the uploaded tongue image and model output.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => onLanguageSwitch('en')}
                disabled={regeneratingLang}
                className={`rounded-lg px-3 py-1.5 transition ${activeLanguage === 'en' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600'}`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => onLanguageSwitch('te')}
                disabled={regeneratingLang}
                className={`rounded-lg px-3 py-1.5 transition ${activeLanguage === 'te' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600'}`}
              >
                తెలుగు
              </button>
            </div>

            {data?.pdf_download_url && (
              <a
                href={data.pdf_download_url}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <Download className="h-4 w-4 text-sky-400" />
                Download PDF
              </a>
            )}

            <a
              href={`/chat?analysisId=${data?.id || ''}`}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              <MessageSquare className="h-4 w-4" />
              Ask AI assistant
            </a>
          </div>
        </div>
      </div>

      <OverallStatus
        assessment={overallAssessment}
        totalFeatures={totalFeatures}
        normalCount={normalCount}
        unusualCount={unusualCount}
        analysisDate={analysisDate}
        imageQualityStatus={imageQualityStatus}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <Sparkles className="h-5 w-5 text-sky-600" />
              <h2 className="text-lg font-bold">Seven anatomical feature review</h2>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {featureCards.map((feature) => (
                <FeatureCard key={`${feature.featureName}-${feature.predictedLabel}`} {...feature} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <MainFindings findings={mainFindings} />
          <NormalObservations observations={normalObservations} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <BookOpen className="h-5 w-5 text-sky-600" />
            <h3 className="text-lg font-bold">Possible explanations</h3>
          </div>

          <div className="mt-4 space-y-3">
            {possibleExplanations.map((explanation, index) => (
              <div key={`${explanation}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <p className="text-sm leading-relaxed text-slate-700">{explanation}</p>
              </div>
            ))}
          </div>

          {report?.evidence_references?.length > 0 && (
            <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50 p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-700">Reference context</p>
              <ul className="mt-3 space-y-2 text-xs text-slate-700">
                {report.evidence_references.slice(0, 3).map((ref, index) => (
                  <li key={`${ref}-${index}`} className="rounded-lg border border-sky-100 bg-white p-2">
                    {ref}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <HealthRecommendations recommendations={recommendations} />
      </div>

      <div className="mt-6">
        <TechnicalDetails data={data} report={report} />
      </div>

      <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <div className="flex items-start gap-2 text-rose-800">
          <ShieldCheck className="mt-0.5 h-5 w-5" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em]">Safety note</p>
            <p className="mt-1 text-sm leading-relaxed">
              This is an educational visual analysis, not a diagnosis. It does not confirm health status or disease risk based on a tongue image alone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
