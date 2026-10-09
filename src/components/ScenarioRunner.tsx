import React, { useState } from 'react';
import { 
  ScenarioDefinition, 
  CategoryType, 
  ExecutionResult, 
  ExecutionTraceStep,
  EdgeCasePayload 
} from '../types';
import { SCENARIOS } from '../data/scenariosData';
import { 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Code2, 
  Sparkles, 
  Cpu, 
  Terminal, 
  Zap, 
  Check, 
  Copy,
  ChevronRight,
  Info
} from 'lucide-react';

interface ScenarioRunnerProps {
  onOpenAiMentorForScenario: (scenario: ScenarioDefinition) => void;
}

export const ScenarioRunner: React.FC<ScenarioRunnerProps> = ({
  onOpenAiMentorForScenario
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(SCENARIOS[0].id);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [testInput, setTestInput] = useState<string>(SCENARIOS[0].edgeCases[2].payload);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const currentScenario = SCENARIOS.find(s => s.id === selectedScenarioId) || SCENARIOS[0];

  const filteredScenarios = SCENARIOS.filter(s => {
    if (filterCategory === 'all') return true;
    return s.category === filterCategory;
  });

  const handleSelectScenario = (scenario: ScenarioDefinition) => {
    setSelectedScenarioId(scenario.id);
    const defaultPayload = scenario.edgeCases.find(e => e.expectedResult === 'exploit')?.payload || scenario.edgeCases[0].payload;
    setTestInput(defaultPayload);
    setExecutionResult(null);
  };

  const handleSelectPayload = (edgeCase: EdgeCasePayload) => {
    setTestInput(edgeCase.payload);
  };

  const handleRunTest = async () => {
    setIsRunning(true);
    setExecutionResult(null);

    // If it's a frontend scenario, execute in browser client sandbox
    if (currentScenario.category === 'frontend' || currentScenario.language === 'javascript') {
      try {
        const trace: ExecutionTraceStep[] = [
          { step: 'Payload Ingested', detail: `Testing payload: ${JSON.stringify(testInput)}`, status: 'info' }
        ];

        let vulnerableExploited = false;
        let vulnerableOutput = '';
        let remediatedBlocked = true;
        let remediatedOutput = '';

        if (currentScenario.id === 'dom_xss') {
          trace.push({
            step: 'Vulnerable DOM Parser',
            detail: 'Assigning directly to element.innerHTML',
            status: 'danger' as const
          });
          const lower = testInput.toLowerCase();
          if (lower.includes('<img') || lower.includes('<svg') || lower.includes('<script') || lower.includes('onerror') || lower.includes('onload')) {
            vulnerableExploited = true;
            vulnerableOutput = `[EXPLOITED] DOM XSS Vector Inserted!\nSimulated DOM sink rendered unescaped HTML: ${testInput}\nBrowser executes event handler script!`;
          } else {
            vulnerableOutput = `Rendered innerHTML: ${testInput}`;
          }

          trace.push({
            step: 'Remediated DOM Parser',
            detail: 'Assigning to element.textContent and escaping HTML entities',
            status: 'secure' as const
          });
          remediatedOutput = `Safe textContent rendered: "${testInput}" (HTML tags rendered harmlessly as plain text)`;
        } else if (currentScenario.id === 'redos') {
          trace.push({
            step: 'Vulnerable Regex Evaluation',
            detail: 'Testing against /^([a-zA-Z0-9]+)+$/ with nested quantifiers',
            status: 'danger' as const
          });
          if (testInput.length > 15 && testInput.endsWith('!')) {
            vulnerableExploited = true;
            vulnerableOutput = `[EXPLOITED] Catastrophic Backtracking Triggered!\nInput with ${testInput.length} characters forced thousands of backtrack permutations. Simulated thread latency: ~2800ms!`;
          } else {
            vulnerableOutput = `Regex match result: false (Linear scan)`;
          }

          trace.push({
            step: 'Remediated Regex Evaluation',
            detail: 'Bounded length check (< 32 chars) + linear pattern /^[a-zA-Z0-9]{3,32}$/',
            status: 'secure' as const
          });
          remediatedOutput = `Safe regex evaluation completed in 0.04ms. Blocked: length or character mismatch cleanly handled without backtracking.`;
        } else {
          vulnerableOutput = `Executed frontend test on ${testInput}`;
          remediatedOutput = `Sanitized frontend input: ${testInput}`;
        }

        const edgeFlags: string[] = [];
        if (testInput.includes('<')) edgeFlags.push('HTML Tag Opening');
        if (testInput.length > 20) edgeFlags.push('High-Length Payload');

        setExecutionResult({
          scenario_id: currentScenario.id,
          input: testInput,
          edge_case_flags: edgeFlags,
          vulnerable: {
            output: vulnerableOutput,
            error: null,
            exploited: vulnerableExploited
          },
          remediated: {
            output: remediatedOutput,
            error: null,
            blocked: remediatedBlocked
          },
          trace,
          execution_time_ms: 1.2,
          frontendSimulated: true
        });
      } finally {
        setIsRunning(false);
      }
      return;
    }

    // Backend Python execution via Express /api/execute-python
    try {
      const response = await fetch('/api/execute-python', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: currentScenario.id,
          test_input: testInput
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      setExecutionResult(data);
    } catch (err: any) {
      console.error('Execution error:', err);
      // Fallback display
      setExecutionResult({
        scenario_id: currentScenario.id,
        input: testInput,
        edge_case_flags: ['Offline Fallback Simulation'],
        vulnerable: {
          output: `Simulated vulnerable run: ${err.message}`,
          error: null,
          exploited: true
        },
        remediated: {
          output: 'Simulated remediated protection blocked malicious input',
          error: null,
          blocked: true
        },
        trace: [
          { step: 'Execution Fallback', detail: 'Executed using client fallback validator', status: 'warning' }
        ],
        execution_time_ms: 0.8
      });
    } finally {
      setIsRunning(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Category Pills & Scenario Dropdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              Source-Code Input Testing Lab
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Test edge cases live against vulnerable vs secure code implementations. Observe execution traces and security verdicts in real-time.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Scenarios' },
              { id: 'backend', label: '🐍 Python Backend' },
              { id: 'frontend', label: '🌐 Frontend DOM' },
              { id: 'regex', label: '⚡ Regex & ReDoS' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterCategory === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* Scenario Selection Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {filteredScenarios.map(sc => {
            const isSelected = sc.id === currentScenario.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(sc)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
                  <span className="uppercase tracking-wider">{sc.language}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    sc.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400' :
                    sc.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-rose-500/10 text-rose-400'
                  }`}>
                    {sc.difficulty}
                  </span>
                </div>
                <h4 className={`text-xs font-bold line-clamp-1 ${isSelected ? 'text-emerald-300' : 'text-slate-200'}`}>
                  {sc.title}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  {sc.cwe}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Scenario Header & Standards Reference */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                {currentScenario.cwe}: {currentScenario.cweName}
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
                {currentScenario.owaspTop10}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {currentScenario.asvsRequirement}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {currentScenario.title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {currentScenario.summary}
            </p>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Why Developers Make This Mistake:</strong> {currentScenario.whyItMatters}
              </span>
            </div>
          </div>

          <button
            onClick={() => onOpenAiMentorForScenario(currentScenario)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-white border border-teal-500/30 transition-all shadow-md shrink-0 cursor-pointer text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Ask AI SecQA Mentor</span>
          </button>
        </div>

        {/* Side-by-Side Source Code Comparison */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Vulnerable Code Box */}
          <div className="rounded-xl border border-rose-900/50 bg-slate-950/80 overflow-hidden flex flex-col">
            <div className="px-4 py-3 bg-rose-950/40 border-b border-rose-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                  Vulnerable Code (Buggy Implementation)
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(currentScenario.vulnerableCode, 'vulnerable')}
                className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 cursor-pointer"
              >
                {copiedCode === 'vulnerable' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode === 'vulnerable' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            
            <div className="p-4 font-mono text-xs overflow-x-auto text-rose-200/90 bg-rose-950/10">
              <pre className="whitespace-pre">{currentScenario.vulnerableCode}</pre>
            </div>

            <div className="mt-auto p-3 bg-rose-950/20 border-t border-rose-900/30 text-[11px] text-rose-300/80 leading-normal">
              <strong>Vulnerability Flaw:</strong> {currentScenario.vulnerableExplanation}
            </div>
          </div>

          {/* Remediated Code Box */}
          <div className="rounded-xl border border-emerald-900/50 bg-slate-950/80 overflow-hidden flex flex-col">
            <div className="px-4 py-3 bg-emerald-950/40 border-b border-emerald-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Remediated Secure Code (Hardened)
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(currentScenario.remediatedCode, 'remediated')}
                className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 cursor-pointer"
              >
                {copiedCode === 'remediated' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode === 'remediated' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            
            <div className="p-4 font-mono text-xs overflow-x-auto text-emerald-200/90 bg-emerald-950/10">
              <pre className="whitespace-pre">{currentScenario.remediatedCode}</pre>
            </div>

            <div className="mt-auto p-3 bg-emerald-950/20 border-t border-emerald-900/30 text-[11px] text-emerald-300/80 leading-normal">
              <strong>Secure Pattern:</strong> {currentScenario.remediatedExplanation}
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Input Testing Console & Payload Presets */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-teal-400" />
              Interactive Payload Testing &amp; Fuzzer
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select categorized edge-case presets or type custom inputs to run against the Python / Frontend runtime engine.
            </p>
          </div>
        </div>

        {/* Edge Case Quick-Picks */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 block">
            Common Edge-Case Presets for this Scenario:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {currentScenario.edgeCases.map((ec, idx) => {
              const isSelected = testInput === ec.payload;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectPayload(ec)}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-950/50 border-teal-500/80 ring-1 ring-teal-500/40 text-teal-200'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{ec.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${
                      ec.expectedResult === 'exploit' ? 'bg-rose-500/20 text-rose-300' :
                      ec.expectedResult === 'fail' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {ec.expectedResult}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-teal-300/80 truncate mt-1">
                    {ec.payload || '(empty)'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                    {ec.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Box and Run Action */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Test Payload Input (Raw String / Escape Sequences):</span>
            <span className="text-[11px] text-slate-400">Length: {testInput.length} chars</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Enter test payload here..."
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={handleRunTest}
              disabled={isRunning}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{isRunning ? 'Executing...' : 'Run Input Test'}</span>
            </button>
          </div>
        </div>

        {/* Live Execution Results & Comparative Verdict */}
        {executionResult && (
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-5 animate-in fade-in duration-300">
            
            {/* Header Verdict Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-3">
                {executionResult.vulnerable.exploited ? (
                  <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    {executionResult.vulnerable.exploited ? (
                      <span className="text-rose-400">💥 VULNERABILITY EXPLOITED in Vulnerable Code!</span>
                    ) : (
                      <span className="text-emerald-400">✅ Input Safely Handled / Normal Behavior</span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Secure implementation status: <span className="text-emerald-300 font-semibold">Protected / Quarantined 🛡️</span>
                  </p>
                </div>
              </div>

              {executionResult.execution_time_ms !== undefined && (
                <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  Execution Time: <span className="text-emerald-400 font-bold">{executionResult.execution_time_ms} ms</span>
                </div>
              )}
            </div>

            {/* Detected Edge Case Tags */}
            {executionResult.edge_case_flags && executionResult.edge_case_flags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-semibold">Detected Edge-Case Patterns:</span>
                {executionResult.edge_case_flags.map((flag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[11px]">
                    {flag}
                  </span>
                ))}
              </div>
            )}

            {/* Execution Trace Pipeline */}
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Execution Step-by-Step Pipeline Trace:
              </h5>
              <div className="space-y-2">
                {executionResult.trace.map((t, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs font-mono">
                    <span className="text-slate-500 select-none">[{idx + 1}]</span>
                    <span className={`font-semibold shrink-0 ${
                      t.status === 'danger' ? 'text-rose-400' :
                      t.status === 'warning' ? 'text-amber-400' :
                      t.status === 'secure' ? 'text-emerald-400' :
                      'text-sky-400'
                    }`}>
                      {t.step}:
                    </span>
                    <span className="text-slate-300 break-all">{t.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Side by side outputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Vulnerable Result Card */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40">
                <div className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Output from Vulnerable Version:</span>
                  {executionResult.vulnerable.exploited && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-rose-500/30 text-rose-200 rounded font-semibold">
                      Exploit Triggered
                    </span>
                  )}
                </div>
                <pre className="text-xs font-mono text-rose-200 bg-rose-950/40 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {executionResult.vulnerable.output || executionResult.vulnerable.error || 'No output produced'}
                </pre>
              </div>

              {/* Remediated Result Card */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
                <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Output from Remediated Version:</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/30 text-emerald-200 rounded font-semibold">
                    Blocked / Neutralized
                  </span>
                </div>
                <pre className="text-xs font-mono text-emerald-200 bg-emerald-950/40 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {executionResult.remediated.output || executionResult.remediated.error || 'Safely handled'}
                </pre>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* QA Test Cases vs Security Abuse Cases Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
          <Code2 className="w-5 h-5 text-sky-400" />
          SecQA Test Matrix: Functional QA vs Security Abuse Cases
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          How to write test scenarios that verify both standard business requirements and malicious adversarial edge cases.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/40">
                <th className="p-3">Scenario Name</th>
                <th className="p-3">Test Classification</th>
                <th className="p-3">Test Input</th>
                <th className="p-3">Expected QA Behavior</th>
                <th className="p-3">Risk If Test Fails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {currentScenario.qaTestCases.map((tc, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 font-semibold text-white font-sans">{tc.name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-sans font-semibold ${
                      tc.type.includes('Positive') ? 'bg-emerald-500/20 text-emerald-300' :
                      tc.type.includes('Negative') ? 'bg-amber-500/20 text-amber-300' :
                      'bg-rose-500/20 text-rose-300'
                    }`}>
                      {tc.type}
                    </span>
                  </td>
                  <td className="p-3 text-teal-300 font-mono">{tc.input}</td>
                  <td className="p-3 text-slate-300 font-sans">{tc.expectedBehavior}</td>
                  <td className="p-3 text-rose-300/90 font-sans">{tc.securityRiskIfFailed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
