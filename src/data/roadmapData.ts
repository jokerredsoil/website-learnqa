import { RoadmapPhase } from '../types';

export const ROADMAP_PHASES: RoadmapPhase[] = [
  {
    id: 'phase-1',
    phaseNumber: 1,
    title: 'Software Development & QA Foundations',
    subtitle: 'The Core Building Blocks of Testing and Web Architecture',
    icon: 'Layers',
    description: 'Before breaking systems, you must know how they are built and tested. Master black/white/grey box methodologies, automation frameworks, API protocols, and web networking.',
    modules: [
      {
        id: 'm1-1',
        name: 'Testing Methodologies: Black, White & Grey Box',
        summary: 'Understand the three fundamental testing perspectives and how they translate to security assessment.',
        keyPoints: [
          'Black-Box Testing: Zero prior knowledge of internal code or architecture. Simulates external attacker / end-user perspective.',
          'White-Box Testing: Full access to source code, architecture diagrams, and database schemas. Equivalent to code audits & SAST.',
          'Grey-Box Testing: Partial knowledge (e.g. user credentials, API specs, role privileges). Simulates insider threats or authenticated users.'
        ],
        qaPerspective: 'QA uses Black-Box for acceptance testing, White-Box for unit test coverage, and Grey-Box for system integration.',
        securityPerspective: 'AppSec uses Black-box for penetration tests, White-box for secure code review, and Grey-box for authenticated logic testing.',
        handsOnTip: 'When testing an API endpoint, start black-box (fuzzing inputs blindly), then inspect the Python backend code (white-box) to find the exact regex flaw.',
        toolsOrLinks: ['Postman', 'Cypress', 'Playwright', 'Jest', 'PyTest']
      },
      {
        id: 'm1-2',
        name: 'SDLC, Agile & Test Automation Frameworks',
        summary: 'How software moves from requirement to deployment, and how automated tests prevent regressions.',
        keyPoints: [
          'Agile/Scrum cycles: 2-week sprints require continuous, automated validation rather than end-of-quarter manual testing.',
          'CI/CD Pipelines: Automated build triggers (GitHub Actions, GitLab CI, Jenkins) executing test suites on every pull request.',
          'Automation Tools: Playwright and Selenium simulate browser user interactions; pytest and Jest run unit test suites.'
        ],
        qaPerspective: 'Writing automated functional tests to verify buttons work and forms submit valid data.',
        securityPerspective: 'Embedding security abuse cases directly into regression test suites so fixed vulnerabilities never return.',
        handsOnTip: 'Add an automated test in pytest that feeds "\' OR 1=1--" into your search endpoint to guarantee it returns a 400 or empty list, never a 500 error.',
        toolsOrLinks: ['GitHub Actions', 'Playwright', 'PyTest', 'Selenium']
      },
      {
        id: 'm1-3',
        name: 'API Testing: REST, GraphQL & SOAP Endpoints',
        summary: 'Modern web applications communicate through APIs. Master endpoint schema validation, parameter fuzzing, and status codes.',
        keyPoints: [
          'REST: HTTP verbs (GET, POST, PUT, DELETE, PATCH), URI parameters, JSON payloads, and HTTP status codes (200, 400, 401, 403, 500).',
          'GraphQL: Single POST endpoint handling queries and mutations; vulnerability vectors include query depth DOS and introspection leaks.',
          'SOAP: XML-based messaging protocol prone to XML External Entity (XXE) attacks if parsers evaluate external entities.'
        ],
        qaPerspective: 'Verifying API status codes match contract schemas and response bodies conform to Swagger/OpenAPI specifications.',
        securityPerspective: 'Testing Broken Object Level Authorization (BOLA), mass assignment, and data filtering in JSON responses.',
        handsOnTip: 'Always check if GET endpoints also accept POST, or if changing Content-Type from application/json to text/xml bypasses input sanitization.',
        toolsOrLinks: ['Postman', 'SoapUI', 'GraphQL Voyager', 'Bruno']
      },
      {
        id: 'm1-4',
        name: 'Scripting Fundamentals & Git Workflows',
        summary: 'Essential automation scripting in Python, JavaScript, Bash, and version control hygiene.',
        keyPoints: [
          'Python: The standard language for quick security scripts, automated fuzzers, and backend development (Flask/FastAPI).',
          'JavaScript / Node.js: Essential for understanding browser execution, DOM manipulation, and asynchronous workflows.',
          'Bash Scripting: Automating CLI tools, piping outputs, and running scheduled security checks in Linux containers.',
          'Git Workflows: Feature branching, pull requests, commit signing, and protecting sensitive secrets from accidental repository commit.'
        ],
        qaPerspective: 'Scripting automated test runs, parsing test result logs, and generating HTML coverage reports.',
        securityPerspective: 'Writing custom fuzzing scripts and using git hooks (pre-commit) to block committed API keys (.env, private keys).',
        handsOnTip: 'Use Python requests library to write 5-line scripts that iterate through a list of 50 edge-case payloads against an endpoint.',
        toolsOrLinks: ['Python requests', 'Git pre-commit', 'TruffleHog', 'Gitleaks']
      },
      {
        id: 'm1-5',
        name: 'Networking & Web Architecture (HTTP/HTTPS, CORS, SOP)',
        summary: 'The transport and application layers powering the web. Headers, cookies, sessions, and security policies.',
        keyPoints: [
          'HTTP Protocol: Stateless request-response cycle, methods, status codes, and request/response headers.',
          'Cookies & Sessions: HttpOnly flag (prevents XSS theft), Secure flag (HTTPS only), SameSite=Lax/Strict (mitigates CSRF).',
          'Same-Origin Policy (SOP): Browser security boundary isolating scripts from different origins (protocol + domain + port).',
          'CORS (Cross-Origin Resource Sharing): Server headers (Access-Control-Allow-Origin) granting specific external origins access.'
        ],
        qaPerspective: 'Validating response headers, cookies persistence across pages, and session expiration upon logout.',
        securityPerspective: 'Auditing CORS misconfigurations (Access-Control-Allow-Origin: * with credentials) and missing security headers.',
        handsOnTip: 'Check response headers for Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), and X-Content-Type-Options: nosniff.',
        toolsOrLinks: ['curl', 'Wireshark', 'Browser DevTools Network Tab']
      }
    ]
  },
  {
    id: 'phase-2',
    phaseNumber: 2,
    title: 'Core Security Principles',
    subtitle: 'The Security Mindset & Vulnerability Frameworks',
    icon: 'Shield',
    description: 'Transition from "Does it work when used properly?" to "What happens when it is abused maliciously?". Understand the CIA triad, AAA, OWASP Top 10, ASVS, and CWE/CVE.',
    modules: [
      {
        id: 'm2-1',
        name: 'Security Mindset: CIA Triad & AAA Framework',
        summary: 'The universal foundations of security engineering and threat reasoning.',
        keyPoints: [
          'CIA Triad: Confidentiality (data kept secret from unauthorized eyes), Integrity (data cannot be tampered with undetected), Availability (systems remain operational and responsive).',
          'AAA Framework: Authentication (Who are you?), Authorization (What are you allowed to do?), Accounting/Auditing (What did you do, and is there an immutable log?).',
          'Threat vs Bug: A bug is an unintentional flaw where software deviates from requirements. A security vulnerability is an exploitable flaw that violates security boundaries.'
        ],
        qaPerspective: 'QA checks if the user gets an error message when entering an incorrect password.',
        securityPerspective: 'SecQA checks if the login endpoint reveals whether the username exists (enumeration), or if it allows unlimited brute-force attempts without rate limiting.',
        handsOnTip: 'Ask the "So What?" question: If this field accepts 10,000 characters, does it just display ugly text (UI Bug) or does it freeze the server (DoS Threat)?',
        toolsOrLinks: ['NIST SP 800-53', 'STRIDE Matrix']
      },
      {
        id: 'm2-2',
        name: 'OWASP Top 10 Web Application Security Risks',
        summary: 'The industry-standard consensus on the most critical web application security risks.',
        keyPoints: [
          'A01: Broken Access Control - Unauthorized users accessing other users\' records or admin functions.',
          'A02: Cryptographic Failures - Weak ciphers, plaintext passwords, transmission of data over HTTP.',
          'A03: Injection - SQLi, Command Injection, XSS, SSTI, LDAP injection from untrusted input.',
          'A04: Insecure Design - Flaws in business logic and architectural threat modeling.',
          'A05: Security Misconfiguration - Default credentials, verbose error stack traces, open cloud storage buckets.'
        ],
        qaPerspective: 'Mapping test suites against common failure categories to ensure comprehensive regression coverage.',
        securityPerspective: 'Using OWASP Top 10 as the baseline security audit checklist for web applications.',
        handsOnTip: 'Check error messages when input triggers a crash: if it dumps Python traceback or database query syntax, it violates A05 (Misconfiguration) and helps attackers.',
        toolsOrLinks: ['OWASP Top 10 2021', 'OWASP Cheat Sheet Series']
      },
      {
        id: 'm2-3',
        name: 'OWASP ASVS (Application Security Verification Standard)',
        summary: 'A rigorous blueprint for designing, developing, and testing secure web applications.',
        keyPoints: [
          'Level 1: Automated or opportunistic testing (Baseline for all web applications).',
          'Level 2: Standard for applications containing sensitive data (Healthcare, banking, enterprise B2B).',
          'Level 3: Critical infrastructure, military, and high-value transactional systems.',
          'Chapters: Architecture, Authentication, Session Management, Access Control, Malicious Input Handling, Cryptography.'
        ],
        qaPerspective: 'Translating ASVS verification requirements into structured acceptance criteria in Jira user stories.',
        securityPerspective: 'Using ASVS as the definitive audit standard for enterprise procurement and penetration test scoping.',
        handsOnTip: 'Review ASVS Chapter 5 (Validation, Sanitization and Encoding) whenever implementing forms or API endpoints.',
        toolsOrLinks: ['OWASP ASVS v4.0.3', 'ASVS Checklist Generator']
      },
      {
        id: 'm2-4',
        name: 'CWE & CVE Mappings',
        summary: 'Understanding Common Weakness Enumeration (CWE) and Common Vulnerabilities and Exposures (CVE).',
        keyPoints: [
          'CWE (Common Weakness Enumeration): A dictionary of software weakness types in code (e.g., CWE-89 for SQL Injection, CWE-79 for XSS).',
          'CVE (Common Vulnerabilities and Exposures): A dictionary of publicly disclosed specific security flaws in published products (e.g., CVE-2021-44228 for Log4Shell).',
          'CVSS (Common Vulnerability Scoring System): A 0.0 to 10.0 severity rating determining vulnerability triage priority.'
        ],
        qaPerspective: 'Classifying defect reports with standard CWE tags so developers know the exact engineering root cause.',
        securityPerspective: 'Monitoring CVE databases for third-party libraries used in your application dependencies.',
        handsOnTip: 'Search cve.mitre.org or nvd.nist.gov whenever updating Python packages in requirements.txt.',
        toolsOrLinks: ['NVD NIST', 'MITRE CWE List', 'CVSS v3.1 Calculator']
      }
    ]
  },
  {
    id: 'phase-3',
    phaseNumber: 3,
    title: 'SecQA Technical Toolbelt',
    subtitle: 'Hands-on Instrumentation: Proxies, Scanners & DevTools',
    icon: 'Wrench',
    description: 'Arm yourself with interception proxies (Burp Suite, OWASP ZAP), code analyzers (SAST/DAST/SCA), and browser DevTools to inspect, intercept, and manipulate live traffic.',
    modules: [
      {
        id: 'm3-1',
        name: 'Interception Proxies: Burp Suite & OWASP ZAP',
        summary: 'The core weapon of web security testing. Capturing and modifying HTTP requests before they reach the server.',
        keyPoints: [
          'Proxy Interception: Sitting between the browser and backend server to view, edit, or drop raw HTTP traffic.',
          'Repeater: Manually editing request headers, cookies, and parameters to observe how the server reacts.',
          'Intruder / Fuzzer: Automating payload lists against specific request fields (e.g. testing 100 SQLi payloads).',
          'Target Site Map: Passive scanning and spidering to discover hidden endpoints, comments, and parameters.'
        ],
        qaPerspective: 'Testing backend validation by bypassing client-side HTML5 form restrictions with a proxy.',
        securityPerspective: 'Testing parameter tampering, authorization bypasses, and injection vulnerabilities.',
        handsOnTip: 'Disable JavaScript in your browser or tamper with the price parameter in Burp Suite to see if the backend re-validates the product price.',
        toolsOrLinks: ['Burp Suite Community', 'OWASP ZAP', 'Caido']
      },
      {
        id: 'm3-2',
        name: 'SAST, DAST & SCA Code Analyzers',
        summary: 'Automating security detection across source code, running applications, and third-party dependencies.',
        keyPoints: [
          'SAST (Static Application Security Testing): Scans source code without executing it (White-box). Finds flaws like hardcoded secrets, unsafe string formats.',
          'DAST (Dynamic Application Security Testing): Tests running web applications from the outside (Black-box). Finds runtime flaws like misconfigured headers, SQLi.',
          'SCA (Software Composition Analysis): Scans package.json, requirements.txt, or pom.xml for known vulnerable open-source dependencies (CVEs).'
        ],
        qaPerspective: 'Running SonarQube quality gates for code smell, test coverage, and basic security warnings.',
        securityPerspective: 'Configuring Semgrep rules and Snyk dependency monitors with build-breaking failure thresholds.',
        handsOnTip: 'Run Semgrep with the "p/python" and "p/owasp-top-ten" rulesets on your repository to instantly spot un-parameterized queries.',
        toolsOrLinks: ['Semgrep', 'Snyk', 'SonarQube', 'OWASP Dependency-Check', 'Bandit (Python)']
      },
      {
        id: 'm3-3',
        name: 'Browser DevTools for Security QA',
        summary: 'Using built-in browser developer tools for DOM inspection, storage analysis, and network forensics.',
        keyPoints: [
          'Elements / DOM: Inspecting client-side form constraints (e.g., removing disabled or maxlength="10" attributes).',
          'Application / Storage: Inspecting Cookies, LocalStorage, and SessionStorage for sensitive unencrypted tokens or credentials.',
          'Console: Executing JavaScript snippets to test DOM sinks, prototype tampering, and CSP violations.',
          'Network: Inspecting request/response payloads, timing, caching directives, and preflight OPTIONS requests.'
        ],
        qaPerspective: 'Debugging UI element rendering, CSS layout issues, and AJAX response status codes.',
        securityPerspective: 'Verifying that session JWTs are NOT stored in LocalStorage (vulnerable to XSS) and that sensitive data is absent from URL query strings.',
        handsOnTip: 'Open Chrome DevTools -> Application -> Storage -> Cookies. Check if the session cookie has HttpOnly and Secure checkmarks enabled!',
        toolsOrLinks: ['Chrome DevTools', 'Firefox Developer Tools']
      }
    ]
  },
  {
    id: 'phase-4',
    phaseNumber: 4,
    title: 'Shift-Left & DevSecOps',
    subtitle: 'Automated CI/CD Gates & Threat Modeling',
    icon: 'GitPullRequest',
    description: 'Security is not an afterthought at the end of the release cycle. Integrate security gates into CI/CD pipelines and model threats during the design phase using STRIDE.',
    modules: [
      {
        id: 'm4-1',
        name: 'CI/CD Security Gates & Automated Policies',
        summary: 'Enforcing security quality standards automatically on every Git commit and Pull Request.',
        keyPoints: [
          'Shift-Left Philosophy: Identifying and fixing security flaws early in development costs 10x less than fixing them in production.',
          'Pipeline Security Gates: Automated build steps running SAST, SCA, and container image scans in GitHub Actions.',
          'Severity Thresholds: Failing pull requests if High or Critical security findings exist, while warning on Low/Medium findings.',
          'Fast Feedback Loops: Security scans must finish in under 3 minutes to avoid slowing developer deployment velocity.'
        ],
        qaPerspective: 'Integrating automated smoke and regression tests into the pull request merge checks.',
        securityPerspective: 'Configuring automated gates so vulnerable code cannot be merged into the main production branch.',
        handsOnTip: 'Add a GitHub Actions step running `snyk test --severity-threshold=high` that fails the pipeline if high-risk CVEs are found.',
        toolsOrLinks: ['GitHub Actions', 'GitLab CI', 'Jenkins', 'Trivy', 'Grype']
      },
      {
        id: 'm4-2',
        name: 'Threat Modeling & STRIDE Methodology',
        summary: 'Structured methodology for identifying potential security threats during software architecture and design.',
        keyPoints: [
          'S - Spoofing: Pretending to be someone else (e.g., fake identity, session hijacking).',
          'T - Tampering: Modifying data or code unlawfully (e.g., altering price in request, modifying database records).',
          'R - Repudiation: Denying performing an action due to lack of audit logs (e.g., "I never transferred that money").',
          'I - Information Disclosure: Exposing private information to unauthorized parties (e.g., stack trace leak, data breach).',
          'D - Denial of Service: Making a service unavailable to legitimate users (e.g., ReDoS, memory exhaustion).',
          'E - Elevation of Privilege: Gaining unauthorized administrative permissions (e.g., parameter tampering role="admin").'
        ],
        qaPerspective: 'Deriving edge-case test matrices and negative test cases from the threat model.',
        securityPerspective: 'Designing mitigation architectures before writing a single line of application code.',
        handsOnTip: 'For every user story, ask: "How could an attacker abuse this feature to achieve any of the 6 STRIDE outcomes?"',
        toolsOrLinks: ['Microsoft Threat Modeling Tool', 'OWASP Threat Dragon']
      },
      {
        id: 'm4-3',
        name: 'Writing Security User Stories & Abuse Cases',
        summary: 'Transforming standard Agile acceptance criteria into robust security abuse test cases.',
        keyPoints: [
          'User Story: "As a registered user, I want to upload an avatar image, so that my profile displays my photo."',
          'Abuse Case 1: "An attacker uploads a 2GB file to exhaust server disk storage (Denial of Service)."',
          'Abuse Case 2: "An attacker uploads an avatar named ../../../etc/cron.d/job to achieve code execution (Path Traversal)."',
          'Abuse Case 3: "An attacker uploads an SVG image containing <script>alert(1)</script> to steal visitor cookies (XSS)."'
        ],
        qaPerspective: 'Adding abuse test scenarios to the test case management system (TestRail, Zephyr) alongside functional tests.',
        securityPerspective: 'Ensuring developers write unit tests specifically asserting that malicious abuse cases are safely handled.',
        handsOnTip: 'Every file upload feature must have 4 test cases: valid image, non-image extension, oversized file, and traversal filename.',
        toolsOrLinks: ['Jira Security Epics', 'TestRail', 'OWASP Abuse Cases']
      }
    ]
  },
  {
    id: 'phase-5',
    phaseNumber: 5,
    title: 'Certifications & Practice Labs',
    subtitle: 'Career Progression & Hands-on Battlegrounds',
    icon: 'Award',
    description: 'Solidify your expertise, validate your credentials with recognized industry certifications, and practice legally in vulnerable web application lab environments.',
    modules: [
      {
        id: 'm5-1',
        name: 'Recommended Industry Certifications',
        summary: 'Certifications that bridge QA, software engineering, and application security.',
        keyPoints: [
          'CompTIA Security+: Foundational certification covering networking, threats, cryptography, and enterprise risk management.',
          'BSCP (Burp Suite Certified Practitioner): Rigorous hands-on certification proving mastery of Burp Suite in finding and exploiting web vulnerabilities.',
          'PJCC / eWPT (eLearnSecurity Web Application Penetration Tester): Practical web app assessment methodology and reporting.',
          'ISTQB Advanced Level Security Tester: Specialized certification for QA professionals transitioning into formal security testing roles.'
        ],
        qaPerspective: 'ISTQB Security Tester validates formal test design techniques applied to security standards.',
        securityPerspective: 'BSCP and eWPT prove practical exploitation and remediation verification skills.',
        handsOnTip: 'Start with PortSwigger Web Security Academy (free) as the most direct training path toward the BSCP certification.',
        toolsOrLinks: ['PortSwigger Web Security Academy', 'CompTIA Security+', 'ISTQB']
      },
      {
        id: 'm5-2',
        name: 'Hands-on Practice Labs & Vulnerable Apps',
        summary: 'Safe, legal environments specifically designed to practice vulnerability identification and testing.',
        keyPoints: [
          'OWASP Juice Shop: Modern JavaScript/Node.js vulnerable e-commerce application covering the entire OWASP Top 10 with interactive scoreboards.',
          'DVWA (Damn Vulnerable Web Application): Classic PHP/MySQL training ground with Low, Medium, High, and Impossible difficulty toggles.',
          'PortSwigger Web Security Academy: Free online interactive labs covering SQLi, XSS, SSRF, SSTI, CORS, and OAuth with real-world scenarios.',
          'WebGoat: OWASP’s Java-based training platform teaching common application security flaws in a guided tutorial style.'
        ],
        qaPerspective: 'Writing automated test scripts against Juice Shop to see if your tests catch intentional vulnerabilities.',
        securityPerspective: 'Practicing exploit payloads and verifying remediation code fixes.',
        handsOnTip: 'Spin up OWASP Juice Shop locally via Docker in one command: `docker run -p 3000:3000 bkimminich/juice-shop`.',
        toolsOrLinks: ['OWASP Juice Shop', 'PortSwigger Academy', 'DVWA', 'WebGoat']
      }
    ]
  }
];
