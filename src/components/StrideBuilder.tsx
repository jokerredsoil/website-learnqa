import React, { useState } from 'react';
import { STRIDE_TEMPLATES, StrideFeatureTemplate } from '../data/strideData';
import { 
  Compass, 
  Shield, 
  AlertCircle, 
  FileCheck, 
  Copy, 
  Check, 
  Zap, 
  Layers
} from 'lucide-react';

export const StrideBuilder: React.FC = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(STRIDE_TEMPLATES[0].id);
  const [copied, setCopied] = useState<boolean>(false);

  const currentTemplate = STRIDE_TEMPLATES.find(t => t.id === selectedTemplateId) || STRIDE_TEMPLATES[0];

  const getStrideBadgeColor = (category: string) => {
    switch (category) {
      case 'S': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'T': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'R': return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'I': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'D': return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'E': return 'bg-red-500/20 text-red-300 border-red-500/40';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  const handleCopyMatrix = () => {
    const text = JSON.stringify(currentTemplate, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 bg-sky-950/60 px-3 py-1 rounded-full border border-sky-800/40">
              Phase 4: Architecture &amp; Shift-Left
            </span>
            <h2 className="text-2xl font-bold text-white mt-2">
              STRIDE Threat Modeling &amp; Abuse Cases Generator
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Model potential threats during the software design phase. Generate real-world security abuse cases and QA verification methods across all 6 STRIDE pillars.
            </p>
          </div>

          <button
            onClick={handleCopyMatrix}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-semibold cursor-pointer shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Matrix' : 'Copy JSON'}</span>
          </button>
        </div>

        {/* Feature Selector */}
        <div className="mt-6 flex flex-wrap gap-2">
          {STRIDE_TEMPLATES.map(tmpl => {
            const isSelected = tmpl.id === selectedTemplateId;
            return (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplateId(tmpl.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {tmpl.featureName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature Threat Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        
        <div>
          <h3 className="text-lg font-bold text-white">
            {currentTemplate.featureName}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentTemplate.description}
          </p>
        </div>

        {/* Threat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentTemplate.threats.map((threat, idx) => (
            <div
              key={idx}
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-4.5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center border ${getStrideBadgeColor(threat.category)}`}>
                      {threat.category}
                    </span>
                    <span className="font-bold text-sm text-white">
                      {threat.categoryName} Threat
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {threat.threatSummary}
                </p>
              </div>

              {/* QA perspective vs Abuse Case */}
              <div className="space-y-2 text-xs pt-2 border-t border-slate-800/80">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-sky-300 font-bold block mb-0.5">🧪 QA Verification Method:</span>
                  <span className="text-slate-300 text-[11px] leading-normal">{threat.qaTestPerspective}</span>
                </div>

                <div className="bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/30">
                  <span className="text-rose-300 font-bold block mb-0.5">💥 Security Abuse Case:</span>
                  <span className="text-rose-200/90 text-[11px] font-mono leading-normal">{threat.abuseCasePayload}</span>
                </div>

                <div className="bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/30">
                  <span className="text-emerald-300 font-bold block mb-0.5">🛡️ Architectural Remediation:</span>
                  <span className="text-emerald-200/90 text-[11px] leading-normal">{threat.remediationAction}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
