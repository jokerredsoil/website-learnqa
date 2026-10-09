import React, { useState, useEffect } from 'react';
import { AppTab, ScenarioDefinition } from './types';
import { CHALLENGES } from './data/challengesData';
import { Navbar } from './components/Navbar';
import { ScenarioRunner } from './components/ScenarioRunner';
import { ChallengeArena } from './components/ChallengeArena';
import { RoadmapHub } from './components/RoadmapHub';
import { CiCdSimulator } from './components/CiCdSimulator';
import { StrideBuilder } from './components/StrideBuilder';
import { CheatsheetHub } from './components/CheatsheetHub';
import { AiMentorModal } from './components/AiMentorModal';
import { 
  ShieldCheck, 
  Terminal, 
  Trophy, 
  Map, 
  GitPullRequest, 
  Compass, 
  BookOpen, 
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('scenarios');
  const [solvedChallengeIds, setSolvedChallengeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('secqa_solved_challenges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isAiMentorOpen, setIsAiMentorOpen] = useState<boolean>(false);
  const [mentorScenario, setMentorScenario] = useState<ScenarioDefinition | null>(null);

  // Calculate total XP
  const totalXp = solvedChallengeIds.reduce((sum, id) => {
    const ch = CHALLENGES.find(c => c.id === id);
    return sum + (ch ? ch.xp : 0);
  }, 0);

  const handleChallengeSolved = (challengeId: string, xp: number) => {
    if (!solvedChallengeIds.includes(challengeId)) {
      const updated = [...solvedChallengeIds, challengeId];
      setSolvedChallengeIds(updated);
      try {
        localStorage.setItem('secqa_solved_challenges', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save progress to localStorage', e);
      }
    }
  };

  const handleOpenAiMentorForScenario = (scenario: ScenarioDefinition) => {
    setMentorScenario(scenario);
    setIsAiMentorOpen(true);
  };

  const handleOpenGenericAiMentor = () => {
    setMentorScenario(null);
    setIsAiMentorOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        totalXp={totalXp}
        solvedCount={solvedChallengeIds.length}
        totalChallenges={CHALLENGES.length}
        onOpenAiMentor={handleOpenGenericAiMentor}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Hero Orientation Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/20 p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Interactive SecQA Learning Platform</span>
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Python Backend &amp; Frontend Testing Suite
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Master Input Validation, Edge Cases &amp; Secure Coding
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Bridge standard QA testing with real-world application security. Run live test payloads against vulnerable Python and Frontend source code, observe step-by-step execution traces, solve interactive challenges, and explore the complete 5-phase SecQA curriculum.
            </p>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setCurrentTab('scenarios')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  currentTab === 'scenarios'
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>Input Testing Labs</span>
              </button>

              <button
                onClick={() => setCurrentTab('challenges')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  currentTab === 'challenges'
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Interactive Challenges ({solvedChallengeIds.length}/{CHALLENGES.length})</span>
              </button>

              <button
                onClick={() => setCurrentTab('roadmap')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  currentTab === 'roadmap'
                    ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/25'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                <Map className="w-4 h-4" />
                <span>5-Phase Roadmap</span>
              </button>
            </div>
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Dynamic Tab Views */}
        {currentTab === 'scenarios' && (
          <ScenarioRunner onOpenAiMentorForScenario={handleOpenAiMentorForScenario} />
        )}

        {currentTab === 'challenges' && (
          <ChallengeArena
            onChallengeSolved={handleChallengeSolved}
            solvedChallengeIds={solvedChallengeIds}
          />
        )}

        {currentTab === 'roadmap' && (
          <RoadmapHub />
        )}

        {currentTab === 'cicd' && (
          <CiCdSimulator />
        )}

        {currentTab === 'stride' && (
          <StrideBuilder />
        )}

        {currentTab === 'cheatsheet' && (
          <CheatsheetHub />
        )}

      </main>

      {/* AI SecQA Mentor Dialog */}
      <AiMentorModal
        isOpen={isAiMentorOpen}
        onClose={() => setIsAiMentorOpen(false)}
        initialScenario={mentorScenario}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">SecQA Learn for Dummies</span>
            <span>•</span>
            <span>Input Testing &amp; Application Security Quality Assurance</span>
          </div>
          <div className="text-[11px] text-slate-600">
            Compliant with OWASP Top 10, ASVS v4.0, CWE, and STRIDE methodologies.
          </div>
        </div>
      </footer>

    </div>
  );
}
