export type AppTab = 
  | 'scenarios' 
  | 'challenges' 
  | 'roadmap' 
  | 'cicd' 
  | 'stride' 
  | 'cheatsheet';

export type CategoryType = 'backend' | 'frontend' | 'regex' | 'fullstack';

export interface EdgeCasePayload {
  name: string;
  category: 'normal' | 'boundary' | 'injection' | 'unicode' | 'nullbyte' | 'format';
  payload: string;
  description: string;
  expectedResult: 'pass' | 'fail' | 'exploit';
}

export interface ScenarioDefinition {
  id: string;
  title: string;
  category: CategoryType;
  language: 'python' | 'javascript' | 'html';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  cwe: string;
  cweName: string;
  owaspTop10: string;
  asvsRequirement: string;
  summary: string;
  whyItMatters: string;
  vulnerableCode: string;
  vulnerableExplanation: string;
  remediatedCode: string;
  remediatedExplanation: string;
  edgeCases: EdgeCasePayload[];
  qaTestCases: {
    name: string;
    type: 'Positive (QA)' | 'Negative (QA)' | 'Boundary (QA)' | 'Abuse Case (Security)';
    input: string;
    expectedBehavior: string;
    securityRiskIfFailed: string;
  }[];
}

export interface ExecutionTraceStep {
  step: string;
  detail: string;
  status: 'info' | 'warning' | 'danger' | 'secure';
}

export interface ExecutionResult {
  scenario_id: string;
  input: string;
  edge_case_flags: string[];
  vulnerable: {
    output: string | null;
    error: string | null;
    exploited: boolean;
  };
  remediated: {
    output: string | null;
    error: string | null;
    blocked: boolean;
  };
  trace: ExecutionTraceStep[];
  execution_time_ms?: number;
  frontendSimulated?: boolean;
}

export interface ChallengeItem {
  id: string;
  title: string;
  category: CategoryType;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  xp: number;
  cwe: string;
  summary: string;
  dummiesAnalogy: string;
  vulnerableCode: string;
  language: 'python' | 'javascript';
  hint: string;
  sampleExploitPayloads: string[];
  remediationCode: string;
  remediationExplanation: string;
  validateExploit: (input: string, execResult?: ExecutionResult) => boolean;
}

export interface RoadmapPhase {
  id: string;
  phaseNumber: number;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  modules: {
    id: string;
    name: string;
    summary: string;
    keyPoints: string[];
    qaPerspective: string;
    securityPerspective: string;
    handsOnTip: string;
    toolsOrLinks: string[];
  }[];
}

export interface StrideThreat {
  category: 'S' | 'T' | 'R' | 'I' | 'D' | 'E';
  name: string;
  definition: string;
  realWorldScenario: string;
  qaVerificationMethod: string;
  abuseCasePayload: string;
  remediationGuideline: string;
}
