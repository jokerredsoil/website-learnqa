import React, { useState } from 'react';
import { 
  GitPullRequest, 
  Play, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Terminal, 
  AlertTriangle,
  RotateCcw,
  Sliders
} from 'lucide-react';

interface PrOption {
  id: string;
  title: string;
  branch: string;
  author: string;
  description: string;
  sastFindings: { rule: string; severity: 'High' | 'Critical' | 'Medium' | 'Low'; file: string; line: number; message: string }[];
  scaFindings: { package: string; version: string; cve: string; severity: 'High' | 'Critical' | 'Medium' | 'Low' }[];
  dastFindings: { alert: string; risk: 'High' | 'Medium' | 'Low'; url: string }[];
}

const SAMPLE_PRS: PrOption[] = [
  {
    id: 'pr-1',
    title: 'PR #108: Add Automated Ping & Host Healthcheck Utility',
    branch: 'feat/network-diagnostics',
    author: 'developer_dan',
    description: 'Implements diagnostic ping endpoint using subprocess with shell=True and raw user host parameter.',
    sastFindings: [
      { rule: 'python.lang.security.audit.subprocess-shell-true', severity: 'Critical', file: 'services/diagnostics.py', line: 42, message: 'Identified subprocess execution with shell=True and un-sanitized string formatting (CWE-78).' }
    ],
    scaFindings: [
      { package: 'urllib3', version: '1.26.4', cve: 'CVE-2021-33503', severity: 'Medium' }
    ],
    dastFindings: [
      { alert: 'OS Command Injection via parameter "host"', risk: 'High', url: '/api/v1/ping?host=127.0.0.1%3B+id' }
    ]
  },
  {
    id: 'pr-2',
    title: 'PR #109: Implement File Uploader with Naive String Replace',
    branch: 'feat/user-avatar-upload',
    author: 'frontend_frank',
    description: 'Upload endpoint cleans filenames by replacing "../" once before saving to disk.',
    sastFindings: [
      { rule: 'python.security.insecure-path-traversal-sanitize', severity: 'High', file: 'controllers/upload.py', line: 28, message: 'Path traversal filter can be bypassed via nested sequences "....//" (CWE-22).' }
    ],
    scaFindings: [],
    dastFindings: [
      { alert: 'Directory Traversal - Arbitrary File Overwrite', risk: 'High', url: '/api/v1/upload' }
    ]
  },
  {
    id: 'pr-3',
    title: 'PR #110: Refactor Authentication to Parameterized Queries & UUIDs',
    branch: 'fix/security-remediation-v2',
    author: 'secqa_sam',
    description: 'Replaces raw SQL f-strings with SQLite parameterized prepared statements and resolves canonical file paths.',
    sastFindings: [],
    scaFindings: [],
    dastFindings: []
  }
];

export const CiCdSimulator: React.FC = () => {
  const [selectedPrId, setSelectedPrId] = useState<string>(SAMPLE_PRS[0].id);
  const [threshold, setThreshold] = useState<'strict' | 'standard' | 'lax'>('strict');
  const [pipelineState, setPipelineState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [stageLogs, setStageLogs] = useState<string[]>([]);

  const selectedPr = SAMPLE_PRS.find(p => p.id === selectedPrId) || SAMPLE_PRS[0];

  const stages = [
    { id: 'commit', name: '1. Git Commit & PR Trigger' },
    { id: 'sast', name: '2. SAST Scan (Semgrep Static Analysis)' },
    { id: 'sca', name: '3. SCA Scan (Snyk / Dependency-Check)' },
    { id: 'dast', name: '4. DAST Scan (OWASP ZAP Dynamic Scan)' },
    { id: 'gate', name: '5. Automated Security Gate Policy Check' },
    { id: 'deploy', name: '6. Deployment Pipeline' }
  ];

  const handleRunPipeline = () => {
    setPipelineState('running');
    setCurrentStage(1);
    setStageLogs([`[INFO] Pull request detected: ${selectedPr.title} on branch ${selectedPr.branch}`]);

    // Step through stages with timers
    setTimeout(() => {
      setCurrentStage(2);
      setStageLogs(prev => [
        ...prev,
        `[SAST] Running Semgrep rulesets (p/owasp-top-ten, p/python)...`,
        ...(selectedPr.sastFindings.length > 0 
          ? selectedPr.sastFindings.map(f => `[SAST WARNING] Found ${f.severity} issue in ${f.file}:${f.line} -> ${f.message}`)
          : ['[SAST PASSED] 0 static vulnerabilities detected.'])
      ]);
    }, 900);

    setTimeout(() => {
      setCurrentStage(3);
      setStageLogs(prev => [
        ...prev,
        `[SCA] Scanning requirements.txt for known CVE vulnerabilities...`,
        ...(selectedPr.scaFindings.length > 0 
          ? selectedPr.scaFindings.map(f => `[SCA WARNING] Vulnerable dependency found: ${f.package}@${f.version} (${f.cve}) - Severity: ${f.severity}`)
          : ['[SCA PASSED] All 38 packages match secure CVE thresholds.'])
      ]);
    }, 1800);

    setTimeout(() => {
      setCurrentStage(4);
      setStageLogs(prev => [
        ...prev,
        `[DAST] Launching OWASP ZAP active attack against ephemeral container...`,
        ...(selectedPr.dastFindings.length > 0
          ? selectedPr.dastFindings.map(f => `[DAST EXPLOIT] Probe succeeded: ${f.alert} on ${f.url}`)
          : ['[DAST PASSED] Active scan finished with 0 high/medium alerts.'])
      ]);
    }, 2700);

    setTimeout(() => {
      setCurrentStage(5);
      
      const totalCritical = selectedPr.sastFindings.filter(f => f.severity === 'Critical').length;
      const totalHigh = selectedPr.sastFindings.filter(f => f.severity === 'High').length + 
                        selectedPr.dastFindings.filter(f => f.risk === 'High').length;
      
      let pass = true;
      if (threshold === 'strict' && (totalCritical > 0 || totalHigh > 0)) pass = false;
      if (threshold === 'standard' && totalCritical > 0) pass = false;

      setStageLogs(prev => [
        ...prev,
        `[POLICY GATE] Evaluating merge policy: Threshold = ${threshold.toUpperCase()}`,
        pass 
          ? `[POLICY PASSED] Merge permitted! Branch conforms to security criteria.`
          : `[POLICY FAILED] ❌ Build failed! PR has ${totalCritical} Critical and ${totalHigh} High security violations.`
      ]);

      setCurrentStage(6);
      setPipelineState('completed');
    }, 3600);
  };

  const handleReset = () => {
    setPipelineState('idle');
    setCurrentStage(0);
    setStageLogs([]);
  };

  const totalViolations = selectedPr.sastFindings.length + selectedPr.scaFindings.length + selectedPr.dastFindings.length;
  const isFailed = totalViolations > 0 && threshold !== 'lax';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/40">
              Phase 4: DevSecOps Simulator
            </span>
            <h2 className="text-2xl font-bold text-white mt-2">
              CI/CD Automated Security Gates &amp; Thresholds
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Shift security left into your automated build pipeline. Watch how static analysis (SAST), software composition analysis (SCA), and dynamic attacks (DAST) automatically intercept vulnerable pull requests before merging into production.
            </p>
          </div>
        </div>

        {/* PR and Configuration Pickers */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* PR Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              Select Pull Request to Test:
            </label>
            <div className="space-y-2">
              {SAMPLE_PRS.map(pr => {
                const isSelected = pr.id === selectedPrId;
                return (
                  <button
                    key={pr.id}
                    onClick={() => {
                      setSelectedPrId(pr.id);
                      handleReset();
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/80 ring-1 ring-purple-500/40 text-purple-200'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{pr.title}</span>
                      <span className="text-[10px] font-mono text-purple-300">{pr.branch}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{pr.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Security Gate Policy Threshold */}
          <div className="flex flex-col justify-between">
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>Security Gate Failure Threshold Policy:</span>
              </label>
              <div className="space-y-2">
                {[
                  { id: 'strict', name: 'Strict Policy (Recommended)', desc: 'Fail build if ANY Critical OR High severity finding exists.' },
                  { id: 'standard', name: 'Standard Policy', desc: 'Fail build only on Critical findings; allow High with warning.' },
                  { id: 'lax', name: 'Permissive (Audit Only)', desc: 'Never fail build; log security findings to dashboard.' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setThreshold(opt.id as any);
                      handleReset();
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                      threshold === opt.id
                        ? 'bg-purple-900/30 border-purple-500/70 text-purple-200 ring-1 ring-purple-500/30'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-white">{opt.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleRunPipeline}
                disabled={pipelineState === 'running'}
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {pipelineState === 'running' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Running Security Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run CI/CD Pipeline Scan</span>
                  </>
                )}
              </button>

              {pipelineState !== 'idle' && (
                <button
                  onClick={handleReset}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 cursor-pointer"
                  title="Reset Pipeline"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Visual Pipeline Stages */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <GitPullRequest className="w-4 h-4 text-purple-400" />
          Pipeline Stage Visualization
        </h3>

        {/* Stage Nodes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {stages.map((stg, sIdx) => {
            const stepNum = sIdx + 1;
            const isCompletedStage = currentStage > stepNum || pipelineState === 'completed';
            const isCurrent = currentStage === stepNum && pipelineState === 'running';
            const isPending = currentStage < stepNum;

            return (
              <div
                key={stg.id}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isCompletedStage
                    ? 'bg-slate-950 border-purple-500/40 text-purple-300'
                    : isCurrent
                    ? 'bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/40 text-white animate-pulse'
                    : 'bg-slate-950/40 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex justify-center mb-1.5">
                  {isCompletedStage ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px]">
                      {stepNum}
                    </div>
                  )}
                </div>
                <h5 className="text-[11px] font-bold leading-tight">
                  {stg.name.split('.')[1]?.trim() || stg.name}
                </h5>
              </div>
            );
          })}
        </div>

        {/* Final Decision Banner if completed */}
        {pipelineState === 'completed' && (
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 animate-in fade-in ${
            isFailed 
              ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
              : 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
          }`}>
            <div className="flex items-center gap-3">
              {isFailed ? (
                <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              )}
              <div>
                <h4 className="font-bold text-sm">
                  {isFailed ? '🚫 BUILD REJECTED: Security Gate Failed' : '🚀 BUILD APPROVED: Security Gate Passed'}
                </h4>
                <p className="text-xs opacity-90 mt-0.5">
                  {isFailed 
                    ? `Found violations exceeding the ${threshold} policy threshold. Merge blocked to prevent production vulnerability!`
                    : `No critical policy violations. Pull request is eligible for automated deployment to production.`}
                </p>
              </div>
            </div>

            <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
              {isFailed ? 'EXIT CODE 1' : 'EXIT CODE 0'}
            </div>
          </div>
        )}

        {/* Live Terminal Console Logs */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 pb-2 border-b border-slate-800/80 mb-3">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              <span>CI/CD Pipeline Execution Logs</span>
            </span>
            <span className="text-[10px]">Runner: ubuntu-latest (docker-container)</span>
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto text-slate-300">
            {stageLogs.length === 0 ? (
              <span className="text-slate-600 italic">Click "Run CI/CD Pipeline Scan" above to simulate security execution...</span>
            ) : (
              stageLogs.map((log, lIdx) => (
                <div key={lIdx} className={`leading-relaxed ${
                  log.includes('FAILED') || log.includes('EXPLOIT') ? 'text-rose-400 font-bold' :
                  log.includes('WARNING') ? 'text-amber-300' :
                  log.includes('PASSED') ? 'text-emerald-400 font-semibold' :
                  'text-slate-300'
                }`}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
