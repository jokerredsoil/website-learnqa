import { ScenarioDefinition } from '../types';

export const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'path_traversal',
    title: 'Path Traversal via Flawed String Stripping',
    category: 'backend',
    language: 'python',
    difficulty: 'Beginner',
    cwe: 'CWE-22',
    cweName: 'Improper Limitation of a Pathname to a Restricted Directory',
    owaspTop10: 'A01:2021 - Broken Access Control',
    asvsRequirement: 'V12.3 - Verify that the application protects against Path Traversal and Local File Inclusion',
    summary: 'A common developer pitfall: trying to sanitize user input by stripping "../" once with string.replace(). Attackers bypass this easily using nested sequences like "....//".',
    whyItMatters: 'If untrusted filenames escape the designated upload directory, attackers can read /etc/passwd, application source code, API keys, or write arbitrary files over executable scripts.',
    vulnerableCode: `# Vulnerable Python (Flask/FastAPI file downloader)
import os

def get_user_file(filename: str):
    # DANGEROUS: Naive single-pass replacement
    sanitized = filename.replace("../", "")
    target_path = os.path.normpath(os.path.join("/app/user_uploads", sanitized))
    
    # Opens and returns file
    with open(target_path, "rb") as f:
        return f.read()`,
    vulnerableExplanation: 'When `filename` is "....//etc/passwd", Python replaces "../" once, collapsing the outer ".." and "/" around it to form a new "../"! Downstream `os.path.join` now traverses all the way to root.',
    remediatedCode: `# Remediated Secure Python
import os
from pathlib import Path

BASE_DIR = Path("/app/user_uploads").resolve()

def get_user_file_safe(filename: str):
    # 1. Reject path separators or extract only safe basename
    safe_name = os.path.basename(filename.replace("\\\\", "/"))
    target = (BASE_DIR / safe_name).resolve()
    
    # 2. Strict directory boundary verification
    if not str(target).startswith(str(BASE_DIR)):
        raise PermissionError("Directory traversal detected")
        
    if not target.is_file():
        raise FileNotFoundError("Requested resource not found")
        
    return target.read_bytes()`,
    remediatedExplanation: 'The secure version extracts `os.path.basename()` to strip all directory prefixes, resolves the canonical path with `Path.resolve()`, and strictly verifies that the resulting target resides inside `BASE_DIR`.',
    edgeCases: [
      {
        name: 'Happy Path File',
        category: 'normal',
        payload: 'avatar.png',
        description: 'Standard safe alphanumeric filename with extension.',
        expectedResult: 'pass'
      },
      {
        name: 'Naive Path Traversal',
        category: 'injection',
        payload: '../../etc/passwd',
        description: 'Basic double-dot sequence. Caught by naive replace.',
        expectedResult: 'fail'
      },
      {
        name: 'Nested Bypass (....//)',
        category: 'injection',
        payload: '....//....//etc/passwd',
        description: 'When "../" is stripped once, "....//" collapses into "../"!',
        expectedResult: 'exploit'
      },
      {
        name: 'Null Byte Truncation',
        category: 'nullbyte',
        payload: 'safe.png\\x00.php',
        description: 'Null byte injection to truncate file extension checks in legacy runtimes.',
        expectedResult: 'fail'
      },
      {
        name: 'Windows Reverse Slash',
        category: 'boundary',
        payload: '..\\\\..\\\\windows\\\\win.ini',
        description: 'Backslash directory traversal for Windows or mixed environments.',
        expectedResult: 'exploit'
      }
    ],
    qaTestCases: [
      {
        name: 'TC-01: Valid Alphanumeric Upload',
        type: 'Positive (QA)',
        input: 'report_2026.pdf',
        expectedBehavior: 'Returns file from /app/user_uploads/report_2026.pdf.',
        securityRiskIfFailed: 'Legitimate business functionality breaks.'
      },
      {
        name: 'TC-02: Nested Traversal Sequence',
        type: 'Abuse Case (Security)',
        input: '....//....//etc/shadow',
        expectedBehavior: 'Application must reject request with 400 Bad Request or 403 Forbidden.',
        securityRiskIfFailed: 'Arbitrary host file read or credential disclosure.'
      },
      {
        name: 'TC-03: Empty String & Dot Only',
        type: 'Negative (QA)',
        input: '.',
        expectedBehavior: 'Validation error; refuses to open directory handle as file.',
        securityRiskIfFailed: 'IsADirectoryError causing server 500 crash.'
      }
    ]
  },
  {
    id: 'sql_injection',
    title: 'SQL Injection via String Interpolation',
    category: 'backend',
    language: 'python',
    difficulty: 'Beginner',
    cwe: 'CWE-89',
    cweName: 'Improper Neutralization of Special Elements used in an SQL Command',
    owaspTop10: 'A03:2021 - Injection',
    asvsRequirement: 'V5.3 - Verify that database queries use parameterized queries or ORM abstractions',
    summary: 'Constructing SQL queries using Python f-strings, format(), or % string operators allows untrusted input to break out of query data literals and alter database logic.',
    whyItMatters: 'SQL injection allows attackers to bypass login authentication, dump entire database contents, delete tables, or even execute OS commands via database extensions.',
    vulnerableCode: `# Vulnerable Python (SQLite / PostgreSQL)
import sqlite3

def authenticate_user(username: str):
    conn = sqlite3.connect("app.db")
    cursor = conn.cursor()
    
    # DANGEROUS: String formatting in SQL query
    query = f"SELECT id, username, role FROM users WHERE username = '{username}'"
    cursor.execute(query)
    return cursor.fetchall()`,
    vulnerableExplanation: 'When `username` contains a single quote such as `admin\' --`, the quote terminates the string literal, and `--` comments out the remainder of the query.',
    remediatedCode: `# Remediated Secure Python
import sqlite3

def authenticate_user_safe(username: str):
    conn = sqlite3.connect("app.db")
    cursor = conn.cursor()
    
    # SECURE: Parameterized query (placeholders)
    # The database engine treats untrusted input strictly as data, never executable code!
    query = "SELECT id, username, role FROM users WHERE username = ?"
    cursor.execute(query, (username,))
    return cursor.fetchall()`,
    remediatedExplanation: 'Using parameterized queries with placeholders (`?` or `%s`) ensures the database driver separates SQL command tokens from user data, rendering SQL syntax manipulation impossible.',
    edgeCases: [
      {
        name: 'Standard Alphanumeric Username',
        category: 'normal',
        payload: 'alice',
        description: 'Standard valid user lookup.',
        expectedResult: 'pass'
      },
      {
        name: 'Classic Authentication Bypass',
        category: 'injection',
        payload: "' OR '1'='1",
        description: 'Classic SQL injection payload that makes the WHERE clause always TRUE.',
        expectedResult: 'exploit'
      },
      {
        name: 'Comment Operator Truncation',
        category: 'injection',
        payload: "admin' --",
        description: 'Terminates query literal and comments out password check.',
        expectedResult: 'exploit'
      },
      {
        name: 'UNION-Based Data Exfiltration',
        category: 'injection',
        payload: "nonexistent' UNION SELECT 1, 'hacker', secret_token FROM users --",
        description: 'Attempts to join results from another table or sensitive column.',
        expectedResult: 'exploit'
      },
      {
        name: 'Name with Legit Apostrophe (O\'Connor)',
        category: 'boundary',
        payload: "O'Connor",
        description: 'Irish or foreign names with legitimate apostrophes break naive SQL strings!',
        expectedResult: 'fail'
      }
    ],
    qaTestCases: [
      {
        name: 'TC-01: Valid User Lookup',
        type: 'Positive (QA)',
        input: 'bob',
        expectedBehavior: 'Returns single user record for bob.',
        securityRiskIfFailed: 'Legitimate login failure.'
      },
      {
        name: 'TC-02: Single Quote Handling (O\'Brian)',
        type: 'Boundary (QA)',
        input: "O'Brian",
        expectedBehavior: 'Successfully queries without syntax error 500.',
        securityRiskIfFailed: 'Denial of service for users with apostrophes in name.'
      },
      {
        name: 'TC-03: Tautology Authentication Bypass',
        type: 'Abuse Case (Security)',
        input: "' OR 1=1 --",
        expectedBehavior: 'Database treats as literal username query; returns 0 rows if no user is named literally "\' OR 1=1 --".',
        securityRiskIfFailed: 'Complete authentication bypass and full user data dump.'
      }
    ]
  },
  {
    id: 'command_injection',
    title: 'OS Command Injection via Shell Metacharacters',
    category: 'backend',
    language: 'python',
    difficulty: 'Intermediate',
    cwe: 'CWE-78',
    cweName: 'Improper Neutralization of Special Elements used in an OS Command',
    owaspTop10: 'A03:2021 - Injection',
    asvsRequirement: 'V5.2 - Verify that the application does not execute arbitrary shell commands',
    summary: 'Invoking system utilities using subprocess with `shell=True` or `os.system()` with formatted user input enables attackers to chain arbitrary system commands using `;`, `|`, or `&`.',
    whyItMatters: 'OS command injection provides the attacker with an interactive terminal shell on your server, leading to immediate remote code execution (RCE).',
    vulnerableCode: `# Vulnerable Python
import subprocess

def check_host_availability(host: str):
    # DANGEROUS: Passing formatted string with shell=True
    command = f"ping -c 1 {host}"
    output = subprocess.check_output(command, shell=True)
    return output.decode()`,
    vulnerableExplanation: 'When `host` is "8.8.8.8; cat /etc/passwd", the shell interprets the semicolon as a command delimiter, executing ping first and then dumping the sensitive passwd file.',
    remediatedCode: `# Remediated Secure Python
import re
import subprocess

# 1. Strict whitelist validation for hostnames / IPs
HOSTNAME_REGEX = re.compile(r"^[a-zA-Z0-9.-]{1,253}$")

def check_host_availability_safe(host: str):
    # Reject shell metacharacters and invalid formats upfront
    if not HOSTNAME_REGEX.match(host) or host.startswith("-"):
        raise ValueError("Invalid target hostname format")
        
    # 2. SECURE: Pass arguments as an array list, NEVER shell=True
    cmd = ["ping", "-c", "1", host]
    result = subprocess.run(
        cmd, 
        shell=False, 
        capture_output=True, 
        text=True, 
        timeout=5
    )
    return result.stdout`,
    remediatedExplanation: 'Using an array of arguments with `shell=False` prevents invoking the system command shell interpreter. The argument is passed directly to the `ping` executable as data, not instructions.',
    edgeCases: [
      {
        name: 'Valid IP Address',
        category: 'normal',
        payload: '127.0.0.1',
        description: 'Standard valid target IP.',
        expectedResult: 'pass'
      },
      {
        name: 'Semicolon Command Chaining',
        category: 'injection',
        payload: '127.0.0.1; whoami',
        description: 'Uses semicolon `;` to terminate ping and execute arbitrary command.',
        expectedResult: 'exploit'
      },
      {
        name: 'Pipe Operator Injection',
        category: 'injection',
        payload: '127.0.0.1 | id',
        description: 'Uses pipe `|` to feed command to another utility.',
        expectedResult: 'exploit'
      },
      {
        name: 'Subshell Command Substitution',
        category: 'injection',
        payload: '$(id)',
        description: 'Evaluates commands inside `$()` subshell.',
        expectedResult: 'exploit'
      },
      {
        name: 'Flag Argument Injection',
        category: 'boundary',
        payload: '-c 5 -i 0.2 127.0.0.1',
        description: 'Injects CLI argument flags to change process execution parameters.',
        expectedResult: 'fail'
      }
    ],
    qaTestCases: [
      {
        name: 'TC-01: Valid Domain Ping',
        type: 'Positive (QA)',
        input: 'google.com',
        expectedBehavior: 'Runs ping against domain and returns output.',
        securityRiskIfFailed: 'Legitimate network diagnostics fail.'
      },
      {
        name: 'TC-02: Command Delimiter Injection',
        type: 'Abuse Case (Security)',
        input: '127.0.0.1; rm -rf /',
        expectedBehavior: 'Input validation rejects payload before executing subprocess.',
        securityRiskIfFailed: 'Critical Remote Code Execution and host compromise.'
      }
    ]
  },
  {
    id: 'ssti',
    title: 'Server-Side Template Injection (Jinja2 / SSTI)',
    category: 'backend',
    language: 'python',
    difficulty: 'Intermediate',
    cwe: 'CWE-1336',
    cweName: 'Improper Neutralization of Special Elements in Template Engine',
    owaspTop10: 'A03:2021 - Injection',
    asvsRequirement: 'V5.2.4 - Verify that template engines do not evaluate untrusted input as code',
    summary: 'When developers interpolate user input directly into the template string before compiling it with Jinja2, the engine treats expressions inside {{ }} as executable Python code.',
    whyItMatters: 'Jinja2 SSTI allows attackers to escape the template sandbox, access Python class MRO (__mro__), and spawn shell processes directly on the server.',
    vulnerableCode: `# Vulnerable Python (Flask with Jinja2)
from jinja2 import Template

def render_welcome_email(user_name: str):
    # DANGEROUS: User input formatted directly into the template source
    template_source = f"Hello {{ user_name }}, welcome back! Thank you, {user_name}."
    template = Template(template_source)
    return template.render(user_name="Guest")`,
    vulnerableExplanation: 'When `user_name` is `{{7*7}}`, Jinja parses the injected brackets as a template expression and calculates 49. Attackers then escalate to `{{config.__class__.__init__.__globals__["os"].popen("id").read()}}`.',
    remediatedCode: `# Remediated Secure Python
from jinja2 import Template, select_autoescape

def render_welcome_email_safe(user_name: str):
    # SECURE: Static template with untrusted input passed in context dictionary
    template_source = "Hello {{ name }}, welcome back!"
    template = Template(template_source, autoescape=True)
    
    # Input is treated strictly as a context variable, never parsed as template directives
    return template.render(name=user_name)`,
    remediatedExplanation: 'Never format untrusted data into the template definition string. Keep template code static, enable autoescaping, and pass user data via the render context variables.',
    edgeCases: [
      {
        name: 'Standard User Name',
        category: 'normal',
        payload: 'Sarah Connor',
        description: 'Standard user greeting string.',
        expectedResult: 'pass'
      },
      {
        name: 'Math Probe Payload',
        category: 'injection',
        payload: '{{7*7}}',
        description: 'Standard SSTI detection probe. If rendered as 49, SSTI is present!',
        expectedResult: 'exploit'
      },
      {
        name: 'Object Introspection Probe',
        category: 'injection',
        payload: '{{self.__class__.__name__}}',
        description: 'Attempts to inspect internal Python template runtime object.',
        expectedResult: 'exploit'
      },
      {
        name: 'Complex Expression with Spaces',
        category: 'injection',
        payload: '{{ 1337 + 7331 }}',
        description: 'Detects whitespace variations in template parsers.',
        expectedResult: 'exploit'
      }
    ],
    qaTestCases: [
      {
        name: 'TC-01: Name with Punctuation',
        type: 'Positive (QA)',
        input: 'Dr. Jane Doe, Ph.D.',
        expectedBehavior: 'Renders greeting with proper punctuation.',
        securityRiskIfFailed: 'User profile greeting corrupted.'
      },
      {
        name: 'TC-02: Jinja Expression Ingestion',
        type: 'Abuse Case (Security)',
        input: '{{7*7}}',
        expectedBehavior: 'Outputs literal text "{{7*7}}", NOT "49".',
        securityRiskIfFailed: 'Server-Side Template Injection leading to full RCE.'
      }
    ]
  },
  {
    id: 'unicode_normalization',
    title: 'Unicode Normalization & Filter Order Flaw',
    category: 'backend',
    language: 'python',
    difficulty: 'Advanced',
    cwe: 'CWE-179',
    cweName: 'Incorrect Behavior Order: Early Validation Before Canonicalization',
    owaspTop10: 'A03:2021 - Injection / Data Validation',
    asvsRequirement: 'V5.1.5 - Verify that input data is normalized to a known encoding before validation',
    summary: 'When applications sanitize forbidden characters BEFORE normalizing Unicode (e.g. NFKC), homoglyphic characters (like fullwidth "＜") pass the filter and transform back into dangerous characters downstream.',
    whyItMatters: 'Attackers can bypass WAFs, XSS filters, and regex filters by sending Unicode equivalents that transform into malicious syntax after the security check has passed.',
    vulnerableCode: `# Vulnerable Python
import unicodedata

def clean_comment(comment: str):
    # FLAW: Filtering prohibited HTML tags BEFORE Unicode normalization!
    filtered = comment.replace("<", "").replace(">", "")
    
    # Normalizing afterwards reconstructs dangerous characters!
    normalized = unicodedata.normalize("NFKC", filtered)
    return normalized`,
    vulnerableExplanation: 'The fullwidth character "﹤" (U+FE64) or "＜" (U+FF1C) does not match the ASCII "<". The filter ignores it. Later, `unicodedata.normalize("NFKC")` folds it directly into ASCII "<"!',
    remediatedCode: `# Remediated Secure Python
import unicodedata
import html

def clean_comment_safe(comment: str):
    # SECURE ORDER:
    # 1. Normalize Unicode FIRST (canonical form)
    normalized = unicodedata.normalize("NFKC", comment)
    
    # 2. Validate and Escape SECOND on canonical text
    safe_escaped = html.escape(normalized)
    return safe_escaped`,
    remediatedExplanation: 'Always canonicalize and normalize character encodings before performing security checks and output encoding. Never sanitize before normalization.',
    edgeCases: [
      {
        name: 'Standard Text with Accent',
        category: 'normal',
        payload: 'Café résumé',
        description: 'Standard accented latin characters.',
        expectedResult: 'pass'
      },
      {
        name: 'Fullwidth Unicode Homoglyph',
        category: 'unicode',
        payload: '﹤script﹥alert(1)﹤/script﹥',
        description: 'Uses small variant / fullwidth brackets U+FE64 / U+FE65.',
        expectedResult: 'exploit'
      },
      {
        name: 'Alternate Fullwidth Bracket',
        category: 'unicode',
        payload: '＜img src=x onerror=1＞',
        description: 'Uses fullwidth less-than U+FF1C and greater-than U+FF1E.',
        expectedResult: 'exploit'
      }
    ],
    qaTestCases: [
      {
        name: 'TC-01: Multilingual International Text',
        type: 'Positive (QA)',
        input: '你好, こんにちは, Schön',
        expectedBehavior: 'Preserves valid international characters safely.',
        securityRiskIfFailed: 'Localization failure for global users.'
      },
      {
        name: 'TC-02: Unicode Homoglyph XSS Filter Bypass',
        type: 'Abuse Case (Security)',
        input: '﹤script﹥alert(1)﹤/script﹥',
        expectedBehavior: 'Output escapes tags to &lt;script&gt;, neutralizing execution.',
        securityRiskIfFailed: 'Cross-Site Scripting filter bypass in comments or profile fields.'
      }
    ]
  },
  {
    id: 'ssrf',
    title: 'Server-Side Request Forgery (SSRF) in Webhooks',
    category: 'backend',
    language: 'python',
    difficulty: 'Intermediate',
    cwe: 'CWE-918',
    cweName: 'Server-Side Request Forgery (SSRF)',
    owaspTop10: 'A10:2021 - Server-Side Request Forgery',
    asvsRequirement: 'V12.6 - Verify that requests sent to remote services use verified destination whitelists',
    summary: 'Allowing users to specify arbitrary URLs for webhooks, avatar fetching, or PDF generation without validating destination IPs allows attackers to scan internal networks and cloud metadata.',
    whyItMatters: 'In cloud environments like AWS, GCP, or Azure, accessing 169.254.169.254 allows attackers to steal cloud IAM instance profile credentials and hijack the entire cloud infrastructure.',
    vulnerableCode: `# Vulnerable Python
import requests

def trigger_webhook(user_url: str):
    # FLAW: Only checking scheme prefix
    if not user_url.startswith("http"):
        raise ValueError("Must be HTTP or HTTPS")
        
    # Directly fetches URL from backend server network!
    response = requests.get(user_url, timeout=3)
    return response.text`,
    vulnerableExplanation: 'Attackers supply "http://169.254.169.254/latest/meta-data/" or "http://127.0.0.1:8080/admin", causing the backend server to query its own loopback and private cloud VPC.',
    remediatedCode: `# Remediated Secure Python
import ipaddress
import socket
from urllib.parse import urlparse

def trigger_webhook_safe(user_url: str):
    parsed = urlparse(user_url)
    
    # 1. Enforce HTTPS scheme only
    if parsed.scheme != "https":
        raise ValueError("Only secure HTTPS webhooks permitted")
        
    # 2. Resolve DNS hostname to IP address
    hostname = parsed.hostname
    if not hostname:
        raise ValueError("Missing hostname")
        
    ip_addr = socket.gethostbyname(hostname)
    ip_obj = ipaddress.ip_address(ip_addr)
    
    # 3. Block loopback, private RFC1918, link-local, and cloud metadata (169.254.169.254)
    if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local:
        raise PermissionError(f"Egress to private IP {ip_addr} is prohibited")
        
    return f"Safe request dispatched to verified public IP: {ip_addr}"`,
    remediatedExplanation: 'The secure version resolves the destination IP address before connecting and strictly blocks private RFC1918, loopback, link-local, and cloud metadata IP ranges.',
    edgeCases: [
      {
        name: 'Public HTTPS Webhook',
        category: 'normal',
        payload: 'https://api.github.com/events',
        description: 'Standard legitimate external public API.',
        expectedResult: 'pass'
      },
      {
        name: 'AWS/GCP Cloud Metadata IP',
        category: 'injection',
        payload: 'http://169.254.169.254/computeMetadata/v1/',
        description: 'Cloud link-local metadata IP to steal IAM credentials.',
        expectedResult: 'exploit'
      },
      {
        name: 'Localhost Loopback IP',
        category: 'injection',
        payload: 'http://127.0.0.1:3000/internal-admin',
        description: 'Targets local microservices on loopback interface.',
        expectedResult: 'exploit'
      },
      {
        name: '0.0.0.0 Bind Address Bypass',
        category: 'boundary',
        payload: 'http://0.0.0.0:8000',
        description: 'Alternative representation of localhost that confuses weak regexes.',
        expectedResult: 'exploit'
      }
    ],
    qaTestCases: [
      {
        name: 'TC-01: Valid Secure Webhook Endpoint',
        type: 'Positive (QA)',
        input: 'https://webhook.site/my-test-id',
        expectedBehavior: 'Dispatches HTTP POST to external webhook.',
        securityRiskIfFailed: 'Webhook notification feature broken.'
      },
      {
        name: 'TC-02: Cloud Instance Metadata Access',
        type: 'Abuse Case (Security)',
        input: 'http://169.254.169.254/latest/meta-data/',
        expectedBehavior: 'Application throws security validation error; aborts network connection.',
        securityRiskIfFailed: 'Critical Cloud Infrastructure Takeover.'
      }
    ]
  },
  {
    id: 'dom_xss',
    title: 'DOM-Based XSS via Unsafe innerHTML Sink',
    category: 'frontend',
    language: 'javascript',
    difficulty: 'Beginner',
    cwe: 'CWE-79',
    cweName: 'Improper Neutralization of Input During Web Page Generation (XSS)',
    owaspTop10: 'A03:2021 - Injection',
    asvsRequirement: 'V5.3.3 - Verify that context-aware output encoding or DOM safe APIs are used',
    summary: 'Writing untrusted user data directly to dangerous DOM sinks like `element.innerHTML` or `document.write` allows user-controlled HTML tags to execute arbitrary JavaScript in the victim’s browser.',
    whyItMatters: 'Cross-Site Scripting allows attackers to steal session cookies, hijack user accounts, log keystrokes, and perform unauthorized actions on behalf of the victim.',
    vulnerableCode: `// Vulnerable Frontend JavaScript
function displayGreeting(userInput) {
    const greetingBox = document.getElementById("greeting-box");
    
    // DANGEROUS SINK: innerHTML parses HTML tags from untrusted input
    greetingBox.innerHTML = "<h3>Welcome back, " + userInput + "!</h3>";
}`,
    vulnerableExplanation: 'When `userInput` contains `<img src=x onerror=alert(document.cookie)>`, the browser constructs the DOM node, encounters an error loading the dummy image, and triggers the inline JavaScript handler.',
    remediatedCode: `// Remediated Secure Frontend JavaScript
function displayGreetingSafe(userInput) {
    const greetingBox = document.getElementById("greeting-box");
    
    // SECURE PATTERN 1: Use textContent (treats all characters strictly as text)
    const title = document.createElement("h3");
    title.textContent = \`Welcome back, \${userInput}!\`;
    
    greetingBox.replaceChildren(title);
    
    // OR SECURE PATTERN 2: If HTML markup is required, sanitize with DOMPurify:
    // greetingBox.innerHTML = DOMPurify.sanitize(userInput);
}`,
    remediatedExplanation: 'Using `element.textContent` ensures the browser never passes the string to its HTML parser. Even if the user submits `<script>` tags, they appear as harmless literal text on screen.',
    edgeCases: [
      {
        name: 'Standard Text Name',
        category: 'normal',
        payload: 'Taylor Swift',
        description: 'Standard text input.',
        expectedResult: 'pass'
      },
      {
        name: 'Classic Script Tag',
        category: 'injection',
        payload: '<script>alert(1)</script>',
        description: 'Direct script tag (ignored by innerHTML in modern HTML5, but triggers in other sinks).',
        expectedResult: 'fail'
      },
      {
        name: 'IMG Error Event Handler',
        category: 'injection',
        payload: '<img src=invalid-img onerror="alert(document.domain)">',
        description: 'Inline event handler that executes automatically upon image load failure.',
        expectedResult: 'exploit'
      },
      {
        name: 'SVG Vector with Inline Script',
        category: 'injection',
        payload: '<svg onload="alert(\'DOM XSS\')">',
        description: 'SVG graphics payload executed immediately upon DOM insertion.',
        expectedResult: 'exploit'
      }
    ],
    qaTestCases: [
      {
        name: 'TC-01: Name with Math Brackets (Score < 50)',
        type: 'Boundary (QA)',
        input: 'Test User (Score < 50)',
        expectedBehavior: 'Displays literal string "(Score < 50)" without broken formatting.',
        securityRiskIfFailed: 'Corrupted UI rendering.'
      },
      {
        name: 'TC-02: Stored Event Handler Injection',
        type: 'Abuse Case (Security)',
        input: '<img src=x onerror=alert(1)>',
        expectedBehavior: 'Rendered strictly as inert text; no alert box executes.',
        securityRiskIfFailed: 'Session hijacking and credential theft via XSS.'
      }
    ]
  },
  {
    id: 'redos',
    title: 'Regular Expression Denial of Service (ReDoS)',
    category: 'regex',
    language: 'javascript',
    difficulty: 'Intermediate',
    cwe: 'CWE-1333',
    cweName: 'Inefficient Regular Expression Complexity (ReDoS)',
    owaspTop10: 'A04:2021 - Insecure Design / Availability',
    asvsRequirement: 'V5.1 - Verify that regular expressions do not exhibit catastrophic backtracking',
    summary: 'Using nested quantifiers like `([a-zA-Z0-9]+)+$` causes backtracking regex engines to evaluate an exponential number of permutations when matching near-miss strings, freezing the CPU.',
    whyItMatters: 'A single HTTP request containing a 30-character string can lock an entire CPU core at 100% usage for several minutes, causing immediate denial of service (DoS) for all users.',
    vulnerableCode: `// Vulnerable Regex (Catastrophic Backtracking)
function validateUsername(input) {
    // DANGEROUS: Nested quantifiers (group+)+ causes 2^n permutations!
    const re = /^([a-zA-Z0-9_]+)+$/;
    return re.test(input);
}`,
    vulnerableExplanation: 'When testing `aaaaaaaaaaaaaaaaaaaaaaaaaaaa!`, the engine tries dividing the 28 "a"s into all possible combinations across inner and outer `+` before giving up on the exclamation point: O(2^N) complexity.',
    remediatedCode: `// Remediated Secure Regex
function validateUsernameSafe(input) {
    // SECURE: Enforce maximum length limit FIRST
    if (typeof input !== "string" || input.length < 3 || input.length > 32) {
        return false;
    }
    
    // SECURE: Linear O(N) pattern with atomic/single quantifier
    const safeRegex = /^[a-zA-Z0-9_]{3,32}$/;
    return safeRegex.test(input);
}`,
    remediatedExplanation: 'Always check string length before regex evaluation, avoid nested repetitions `(a+)+`, and use linear single quantifiers `{min,max}`.',
    edgeCases: [
      {
        name: 'Valid Username',
        category: 'normal',
        payload: 'john_doe_99',
        description: 'Standard alphanumeric username with underscore.',
        expectedResult: 'pass'
      },
      {
        name: 'ReDoS Catastrophic Backtracking Trigger',
        category: 'injection',
        payload: 'aaaaaaaaaaaaaaaaaaaaaaaaaaa!',
        description: '27 matching characters followed by an unexpected character causing exponential backtracking.',
        expectedResult: 'exploit'
      },
      {
        name: 'Length Overflow Attack',
        category: 'boundary',
        payload: 'A'.repeat(5000),
        description: 'Huge input designed to exhaust parser memory.',
        expectedResult: 'fail'
      }
    ],
    qaTestCases: [
      {
        name: 'TC-01: Valid 12-char Username',
        type: 'Positive (QA)',
        input: 'cyber_tester',
        expectedBehavior: 'Returns true in < 1ms.',
        securityRiskIfFailed: 'Valid user registration blocked.'
      },
      {
        name: 'TC-02: Malicious Catastrophic Backtrack String',
        type: 'Abuse Case (Security)',
        input: 'aaaaaaaaaaaaaaaaaaaaa!',
        expectedBehavior: 'Regex validates or rejects within 2ms without CPU hang.',
        securityRiskIfFailed: 'Denial of Service; node thread blocked for all users.'
      }
    ]
  }
];
