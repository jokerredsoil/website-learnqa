import React, { useState } from 'react';
import { ROADMAP_PHASES } from '../data/roadmapData';
import { 
  Layers, 
  Shield, 
  Wrench, 
  GitPullRequest, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  ExternalLink,
  BookOpen,
  Eye,
  Terminal,
  Crosshair
} from 'lucide-react';

export const RoadmapHub: React.FC = () => {
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>('m1-1');

  const currentPhase = ROADMAP_PHASES[activePhaseIndex];

  const getPhaseIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers': return <Layers className="w-5 h-5" />;
      case 'Shield': return <Shield className="w-5 h-5" />;
      case 'Wrench': return <Wrench className="w-5 h-5" />;
      case 'GitPullRequest': return <GitPullRequest className="w-5 h-5" />;
      case 'Award': return <Award className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Roadmap Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950/60 px-3 py-1 rounded-full border border-teal-800/40">
              SecQA Curriculum Architecture
            </span>
            <h2 className="text-2xl font-bold text-white mt-2">
              The 5-Phase SecQA Learning Roadmap
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              From QA automation fundamentals and HTTP networking to OWASP Top 10, interception proxies, automated CI/CD security gates, and professional certifications.
            </p>
          </div>
        </div>

        {/* Phase Selector Tabs */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {ROADMAP_PHASES.map((phase, idx) => {
            const isActive = idx === activePhaseIndex;
            return (
              <button
                key={phase.id}
                onClick={() => {
                  setActivePhaseIndex(idx);
                  setExpandedModuleId(phase.modules[0]?.id || null);
                }}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-teal-950/50 border-teal-500/80 ring-1 ring-teal-500/40 text-teal-200 shadow-md'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isActive ? 'bg-teal-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                  }`}>
                    Phase {phase.phaseNumber}
                  </span>
                  <div className={isActive ? 'text-teal-400' : 'text-slate-500'}>
                    {getPhaseIcon(phase.icon)}
                  </div>
                </div>
                <h4 className={`text-xs font-bold line-clamp-1 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {phase.title}
                </h4>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Phase Details & Module Accordions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        
        {/* Phase Subtitle & Summary */}
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider">
            {getPhaseIcon(currentPhase.icon)}
            <span>Phase {currentPhase.phaseNumber}: {currentPhase.subtitle}</span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1">
            {currentPhase.title}
          </h3>
          <p className="text-sm text-slate-300 mt-1">
            {currentPhase.description}
          </p>
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          {currentPhase.modules.map((mod) => {
            const isExpanded = expandedModuleId === mod.id;

            return (
              <div
                key={mod.id}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isExpanded 
                    ? 'bg-slate-950/80 border-teal-500/50 shadow-lg' 
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Module Header Bar */}
                <button
                  onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                  className="w-full text-left p-4 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isExpanded ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {mod.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {mod.summary}
                      </p>
                    </div>
                  </div>

                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* Expanded Module Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-200">
                    
                    {/* Key Curriculum Points */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Core Concepts to Master:
                      </h5>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {mod.keyPoints.map((pt, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2">
                            <span className="text-teal-400 font-bold shrink-0 mt-0.5">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* QA vs Security Comparison Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-800/40">
                        <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5 mb-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>The Standard QA Perspective:</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {mod.qaPerspective}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/40">
                        <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5 mb-1">
                          <Crosshair className="w-3.5 h-3.5" />
                          <span>The Application Security Mindset:</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {mod.securityPerspective}
                        </p>
                      </div>
                    </div>

                    {/* Hands-on Testing Tip */}
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                      <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                        <Terminal className="w-3.5 h-3.5 text-amber-400" />
                        <span>Actionable Hands-On SecQA Tip:</span>
                      </div>
                      <p className="leading-relaxed">
                        {mod.handsOnTip}
                      </p>
                    </div>

                    {/* Tools and Links Badges */}
                    {mod.toolsOrLinks.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <span className="text-slate-400 font-semibold">Recommended Tools:</span>
                        {mod.toolsOrLinks.map((tool, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2.5 py-1 rounded-md bg-slate-800 text-teal-300 border border-slate-700 font-mono text-[11px]"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
