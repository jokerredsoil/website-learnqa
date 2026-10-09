import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Loader2, 
  Code, 
  HelpCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Bot
} from 'lucide-react';
import { ScenarioDefinition } from '../types';

interface AiMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialScenario?: ScenarioDefinition | null;
}

export const AiMentorModal: React.FC<AiMentorModalProps> = ({
  isOpen,
  onClose,
  initialScenario
}) => {
  const [codeSnippet, setCodeSnippet] = useState<string>(
    initialScenario ? initialScenario.vulnerableCode : ''
  );
  const [question, setQuestion] = useState<string>(
    initialScenario 
      ? `Explain how an attacker can bypass input validation in ${initialScenario.title} and generate 3 security abuse cases.`
      : 'What are common input validation edge cases developers overlook when handling file uploads or SQL queries?'
  );
  const [analysisType, setAnalysisType] = useState<string>('edge_cases');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mentorResponse, setMentorResponse] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAskMentor = async () => {
    setIsLoading(true);
    setMentorResponse(null);

    try {
      const res = await fetch('/api/ai-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeSnippet,
          question,
          type: analysisType,
          challengeTitle: initialScenario?.title || 'Custom Code Review'
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setMentorResponse(data.analysis || data.error || 'No analysis available.');
    } catch (err: any) {
      setMentorResponse(`Error connecting to AI Mentor: ${err.message}. Please verify server connection.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>SecQA AI Mentor</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Gemini 2.5
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Input testing edge-case analysis &amp; secure refactoring guidance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Quick analysis mode selector */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'edge_cases', label: '🎯 Edge Cases & Fuzzing' },
              { id: 'abuse_cases', label: '🧪 QA vs Abuse Cases Matrix' },
              { id: 'dummies_explain', label: '💡 Explain "For Dummies"' },
              { id: 'remediation', label: '🛡️ Secure Code Refactoring' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setAnalysisType(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  analysisType === tab.id
                    ? 'bg-teal-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Code input box */}
          <div>
            <label className="font-semibold text-slate-300 mb-1.5 block">
              Source Code to Audit (Python / JS / HTML):
            </label>
            <textarea
              rows={4}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="Paste Python or JavaScript code here to inspect for validation flaws..."
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl font-mono text-emerald-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Question / Inquiry prompt */}
          <div>
            <label className="font-semibold text-slate-300 mb-1.5 block">
              Specific Question or Test Scenario Request:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask how to test this, edge cases to try, or how to remediate..."
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={handleAskMentor}
                disabled={isLoading}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{isLoading ? 'Analyzing...' : 'Ask Mentor'}</span>
              </button>
            </div>
          </div>

          {/* Mentor Response Output Box */}
          {mentorResponse && (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-teal-300 font-bold">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>SecQA Mentor Findings &amp; Advice:</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed whitespace-pre-wrap font-sans text-xs max-h-80 overflow-y-auto">
                {mentorResponse}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>SecQA Learn for Dummies • Automated AppSec Guidance</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
