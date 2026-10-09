import React, { useState, useEffect } from 'react';
import { ChallengeItem } from '../types';
import { CHALLENGES } from '../data/challengesData';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  CheckCircle, 
  Flame, 
  HelpCircle, 
  Play, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  ArrowRight, 
  AlertCircle,
  Lightbulb,
  Award
} from 'lucide-react';

interface ChallengeArenaProps {
  onChallengeSolved: (challengeId: string, xp: number) => void;
  solvedChallengeIds: string[];
}

export const ChallengeArena: React.FC<ChallengeArenaProps> = ({
  onChallengeSolved,
  solvedChallengeIds
}) => {
  const [activeChallengeId, setActiveChallengeId] = useState<string>(CHALLENGES[0].id);
  const [userInput, setUserInput] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [attemptFeedback, setAttemptFeedback] = useState<{
    success: boolean;
    message: string;
    output?: string;
  } | null>(null);

  const activeChallenge = CHALLENGES.find(c => c.id === activeChallengeId) || CHALLENGES[0];
  const isSolved = solvedChallengeIds.includes(activeChallenge.id);

  useEffect(() => {
    setUserInput('');
    setShowHint(false);
    setAttemptFeedback(null);
  }, [activeChallengeId]);

  const handleRunChallenge = async () => {
    if (!userInput.trim()) {
      setAttemptFeedback({
        success: false,
        message: 'Please enter a test payload to evaluate against the challenge target.'
      });
      return;
    }

    setIsEvaluating(true);
    setAttemptFeedback(null);

    let exploited = false;
    let execDetails = '';

    try {
      // If Python backend challenge, execute via /api/execute-python
      if (activeChallenge.language === 'python') {
        let scenarioMap: Record<string, string> = {
          'ch-1': 'path_traversal',
          'ch-2': 'sql_injection',
          'ch-3': 'ssti',
          'ch-4': 'command_injection',
          'ch-5': 'unicode_normalization',
          'ch-8': 'ssrf'
        };

        const mappedScenario = scenarioMap[activeChallenge.id] || 'path_traversal';
        const res = await fetch('/api/execute-python', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenario_id: mappedScenario,
            test_input: userInput
          })
        });

        if (res.ok) {
          const data = await res.json();
          exploited = activeChallenge.validateExploit(userInput, data);
          execDetails = data.vulnerable?.output || data.vulnerable?.error || '';
        } else {
          exploited = activeChallenge.validateExploit(userInput);
        }
      } else {
        // Frontend JS challenge evaluated in client
        exploited = activeChallenge.validateExploit(userInput);
        execDetails = exploited 
          ? `[Client Exploit Detected] The payload bypassed client validations and triggered the dangerous sink!`
          : `Payload parsed normally as safe text. Sink was not compromised.`;
      }

      if (exploited) {
        // Fire celebration confetti!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        setAttemptFeedback({
          success: true,
          message: `🎯 SUCCESS! Vulnerability successfully exploited! You discovered the edge case flaw.`,
          output: execDetails
        });

        if (!isSolved) {
          onChallengeSolved(activeChallenge.id, activeChallenge.xp);
        }
      } else {
        setAttemptFeedback({
          success: false,
          message: `❌ Exploit failed: The target handled your input without triggering the vulnerability. Try inspecting edge cases or use a hint!`,
          output: execDetails
        });
      }
    } catch (err: any) {
      // Fallback validation
      const localExploited = activeChallenge.validateExploit(userInput);
      if (localExploited) {
        confetti({ particleCount: 60, spread: 60 });
        setAttemptFeedback({
          success: true,
          message: '🎯 SUCCESS! Vulnerability exploited via pattern analysis!',
          output: 'Exploit detected successfully.'
        });
        if (!isSolved) {
          onChallengeSolved(activeChallenge.id, activeChallenge.xp);
        }
      } else {
        setAttemptFeedback({
          success: false,
          message: 'Target processed input safely. Keep probing!'
        });
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Challenge Arena Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">Interactive Security QA Challenge Arena</h2>
              <p className="text-xs text-slate-400">
                Put your input testing and edge-case skills to the test. Break vulnerable code and unlock remediated solutions.
              </p>
            </div>
          </div>
        </div>

        {/* Progress summary */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <Award className="w-5 h-5 text-amber-400" />
          <div className="text-xs">
            <div className="font-bold text-white">
              {solvedChallengeIds.length} of {CHALLENGES.length} Solved
            </div>
            <div className="text-slate-400 text-[11px]">
              {Math.round((solvedChallengeIds.length / CHALLENGES.length) * 100)}% Complete
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Challenge Level Selector Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">
            Challenge Mission List
          </h3>
          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {CHALLENGES.map((ch, idx) => {
              const active = ch.id === activeChallengeId;
              const solved = solvedChallengeIds.includes(ch.id);

              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChallengeId(ch.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    active
                      ? 'bg-amber-950/40 border-amber-500/80 ring-1 ring-amber-500/40'
                      : solved
                      ? 'bg-emerald-950/20 border-emerald-900/50 hover:bg-emerald-950/30'
                      : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                      solved 
                        ? 'bg-emerald-500 text-slate-950' 
                        : active 
                        ? 'bg-amber-500 text-slate-950' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {solved ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </div>

                    <div className="min-w-0">
                      <h4 className={`text-xs font-bold truncate ${
                        active ? 'text-amber-300' : solved ? 'text-emerald-300' : 'text-slate-200'
                      }`}>
                        {ch.title.split(':')[1]?.trim() || ch.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="uppercase">{ch.category}</span>
                        <span>•</span>
                        <span className="font-mono text-amber-400/90">{ch.xp} XP</span>
                      </div>
                    </div>
                  </div>

                  {solved ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold shrink-0">
                      SOLVED
                    </span>
                  ) : (
                    <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Challenge Workspace */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {activeChallenge.xp} XP
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {activeChallenge.cwe}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                    activeChallenge.category === 'backend' ? 'bg-sky-500/20 text-sky-300' : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {activeChallenge.category} ({activeChallenge.language})
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  {activeChallenge.title}
                </h3>
              </div>

              {isSolved && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Challenge Solved!</span>
                </div>
              )}
            </div>

            {/* Mission Briefing & Dummies Analogy */}
            <div className="space-y-3">
              <p className="text-sm text-slate-300 leading-relaxed">
                {activeChallenge.summary}
              </p>

              {/* Dummies Analogy Box */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>The "For Dummies" Mental Model:</span>
                </div>
                <p className="leading-relaxed">
                  {activeChallenge.dummiesAnalogy}
                </p>
              </div>
            </div>

            {/* Vulnerable Source Code Box */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Target Source Code (Under Test)</span>
                <span className="font-mono text-slate-500 uppercase">{activeChallenge.language}</span>
              </div>
              <pre className="p-4 font-mono text-xs text-rose-300/90 overflow-x-auto whitespace-pre">
                {activeChallenge.vulnerableCode}
              </pre>
            </div>

            {/* Interactive Payload Testing Area */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  Inject Your Test Payload:
                </label>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
                </button>
              </div>

              {showHint && (
                <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-800/60 text-xs text-sky-200 animate-in fade-in">
                  <strong>💡 Mentor Hint:</strong> {activeChallenge.hint}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Enter exploit payload here..."
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-teal-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={handleRunChallenge}
                  disabled={isEvaluating}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>{isEvaluating ? 'Testing...' : 'Test Payload'}</span>
                </button>
              </div>

              {/* Sample test ideas */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-500">Quick Try Ideas:</span>
                {activeChallenge.sampleExploitPayloads.map((sample, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => setUserInput(sample)}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            {/* Attempt Feedback */}
            {attemptFeedback && (
              <div className={`p-4 rounded-xl border text-xs animate-in fade-in duration-300 ${
                attemptFeedback.success 
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' 
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              }`}>
                <div className="font-bold text-sm mb-1">
                  {attemptFeedback.message}
                </div>
                {attemptFeedback.output && (
                  <pre className="mt-2 p-2.5 rounded bg-slate-950/80 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                    {attemptFeedback.output}
                  </pre>
                )}
              </div>
            )}

            {/* Revealed Secure Remediation when solved */}
            {isSolved && (
              <div className="mt-6 pt-6 border-t border-slate-800 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Remediated Secure Solution Unlocked!</span>
                </div>

                <div className="rounded-xl border border-emerald-900/60 bg-slate-950 overflow-hidden">
                  <div className="px-4 py-2 bg-emerald-950/40 border-b border-emerald-900/40 text-xs font-bold text-emerald-300">
                    Secure Refactored Code
                  </div>
                  <pre className="p-4 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre">
                    {activeChallenge.remediationCode}
                  </pre>
                </div>

                <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <strong>Why This Fix Neutralizes the Attack:</strong> {activeChallenge.remediationExplanation}
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
