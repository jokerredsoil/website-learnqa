import { ChallengeItem } from '../types';

export const CHALLENGES: ChallengeItem[] = [
  {
    id: 'ch-1',
    title: 'Challenge 1: The Double-Dot Disguise (Path Traversal)',
    category: 'backend',
    difficulty: 'Beginner',
    xp: 100,
    cwe: 'CWE-22',
    language: 'python',
    summary: 'A file viewer utility attempts to prevent directory traversal by stripping "../" once with filename.replace("../", ""). Find a payload that outsmarts this single-pass filter and escapes the /app/user_uploads directory!',
    dummiesAnalogy: 'Imagine a bouncer at a club who only confiscates fake IDs if they say "FAKE" once. If you print "FA-FAKE-KE", the bouncer cuts the middle "FAKE" out, and the leftover pieces snap right back together into "FAKE"!',
    vulnerableCode: `# Target Endpoint: /api/download?file=<your_input>
import os

def download_file(file_param: str):
    # FLAW: Single pass string replacement!
    clean_name = file_param.replace("../", "")
    target = os.path.normpath(os.path.join("/app/user_uploads", clean_name))
    
    if not target.startswith("/app/user_uploads"):
        return {"status": "VULNERABILITY EXPLOITED", "path": target}
    return {"status": "SAFE", "path": target}`,
    hint: 'What happens if you nest "../" inside another dot-dot-slash sequence, like "....//"? When the inner "../" is deleted, what does the remaining string become?',
    sampleExploitPayloads: ['....//....//etc/passwd', '....//....//....//etc/shadow', '....//secret.txt'],
    remediationCode: `from pathlib import Path
import os

BASE_DIR = Path("/app/user_uploads").resolve()

def download_file_safe(file_param: str):
    # Always extract only the basename, stripping any directory navigation
    safe_basename = os.path.basename(file_param.replace("\\\\", "/"))
    target = (BASE_DIR / safe_basename).resolve()
    
    # Strictly enforce boundary
    if not str(target).startswith(str(BASE_DIR)):
        raise PermissionError("Access Denied")
    return target`,
    remediationExplanation: 'Use `os.path.basename()` to discard path components completely, and check that `target.resolve()` starts with the canonical base directory path.',
    validateExploit: (input: string, execResult?: any) => {
      if (execResult && execResult.vulnerable && execResult.vulnerable.exploited) {
        return true;
      }
      const naive = input.replace(/\.\.\//g, '');
      return naive.includes('..') || input.includes('....//') || input.includes('....\\\\');
    }
  },
  {
    id: 'ch-2',
    title: 'Challenge 2: The Tautology Trick (SQL Injection)',
    category: 'backend',
    difficulty: 'Beginner',
    xp: 120,
    cwe: 'CWE-89',
    language: 'python',
    summary: 'An authentication query checks if the provided username exists in the database using raw string concatenation. Supply an input that turns the WHERE clause into an always-true statement or comments out the check to retrieve the admin account!',
    dummiesAnalogy: 'Imagine an inspector asking a gatekeeper: "Is your name Bob?" The attacker responds: "No, but 1 equals 1, so open the gate!" Because 1=1 is always true, the gate swings wide open.',
    vulnerableCode: `# Target Endpoint: /api/login (User Lookup)
import sqlite3

def check_login(username: str):
    query = f"SELECT id, username, role FROM users WHERE username = '{username}'"
    # When query runs, if it returns the admin row or multiple records, exploit triggers!
    return execute_query(query)`,
    hint: "Use a single quote (') to break out of the string boundary, followed by an OR condition like ' OR '1'='1 or comment operator --.",
    sampleExploitPayloads: ["' OR '1'='1", "admin' --", "' OR 1=1 --", "' UNION SELECT 1, 'admin', 'god' --"],
    remediationCode: `def check_login_safe(username: str):
    # Parameterized queries pass user input as pure data, never SQL commands!
    query = "SELECT id, username, role FROM users WHERE username = ?"
    cursor.execute(query, (username,))
    return cursor.fetchall()`,
    remediationExplanation: 'Prepared statements (parameterized queries) compile the SQL command structure before binding parameters. Untrusted characters are never interpreted as SQL syntax.',
    validateExploit: (input: string, execResult?: any) => {
      if (execResult && execResult.vulnerable && execResult.vulnerable.exploited) {
        return true;
      }
      const lowered = input.toLowerCase();
      return (lowered.includes("' or") || lowered.includes("'--") || lowered.includes("' --") || lowered.includes("union select"));
    }
  },
  {
    id: 'ch-3',
    title: 'Challenge 3: The Arithmetic Probe (Jinja2 SSTI)',
    category: 'backend',
    difficulty: 'Intermediate',
    xp: 150,
    cwe: 'CWE-1336',
    language: 'python',
    summary: 'An automated email template concatenates the user\'s name directly into the template string before compiling it with Jinja2. Inject a template expression that forces the server to evaluate arithmetic or execute code server-side!',
    dummiesAnalogy: 'Think of a fill-in-the-blank Mad-Libs story where instead of writing a silly noun like "banana", you write "COMMAND: Self-destruct the printing press". The naive printer blindly executes your command!',
    vulnerableCode: `# Target Endpoint: /api/preview-email?name=<your_input>
from jinja2 import Template

def generate_email(user_name: str):
    # FLAW: Formatting user input into the template source string
    tmpl = Template(f"Dear {user_name}, welcome to our platform!")
    return tmpl.render()`,
    hint: 'Jinja2 evaluates expressions wrapped inside double curly brackets {{ ... }}. Try a mathematical calculation like {{7*7}} or {{40+9}}.',
    sampleExploitPayloads: ['{{7*7}}', '{{1337*2}}', '{{config}}', '{{self}}'],
    remediationCode: `from jinja2 import Template

def generate_email_safe(user_name: str):
    # SECURE: Keep template string static, pass variable in context!
    tmpl = Template("Dear {{ name }}, welcome to our platform!", autoescape=True)
    return tmpl.render(name=user_name)`,
    remediationExplanation: 'Always keep template code immutable and static. Pass dynamic data exclusively through the template render context parameters.',
    validateExploit: (input: string, execResult?: any) => {
      if (execResult && execResult.vulnerable && execResult.vulnerable.exploited) {
        return true;
      }
      return /\{\{.*[\+\*\/\-\d\w]+.*\}\}/.test(input);
    }
  },
  {
    id: 'ch-4',
    title: 'Challenge 4: The Command Chainer (OS Command Injection)',
    category: 'backend',
    difficulty: 'Intermediate',
    xp: 160,
    cwe: 'CWE-78',
    language: 'python',
    summary: 'A network diagnostic utility runs system ping by formatting the user IP into a shell command with shell=True. Chain a secondary command using shell metacharacters to trigger remote command execution!',
    dummiesAnalogy: 'Like ordering food at a drive-thru and saying: "One burger, and also please open the cash register and hand over the money." The shell blindly obeys the "and also" delimiter.',
    vulnerableCode: `# Target Endpoint: /api/tools/ping?ip=<your_input>
import subprocess

def diagnostic_ping(ip_address: str):
    # DANGEROUS: Passing formatted string to shell=True
    cmd = f"ping -c 1 {ip_address}"
    return subprocess.check_output(cmd, shell=True)`,
    hint: 'Shell command separators include semicolon (;), pipe (|), double ampersand (&&), or command substitution $(whoami).',
    sampleExploitPayloads: ['127.0.0.1; whoami', '127.0.0.1 | id', '127.0.0.1 && cat /etc/passwd', '$(id)'],
    remediationCode: `import subprocess
import re

IP_REGEX = re.compile(r"^[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}$")

def diagnostic_ping_safe(ip_address: str):
    if not IP_REGEX.match(ip_address):
        raise ValueError("Invalid IP address")
        
    # SECURE: Array arguments without shell=True
    return subprocess.run(["ping", "-c", "1", ip_address], capture_output=True, text=True)`,
    remediationExplanation: 'Use array arguments `["ping", "-c", "1", ip]` with `shell=False` and strict regex whitelisting.',
    validateExploit: (input: string, execResult?: any) => {
      if (execResult && execResult.vulnerable && execResult.vulnerable.exploited) {
        return true;
      }
      return /[;&|`$]/.test(input);
    }
  },
  {
    id: 'ch-5',
    title: 'Challenge 5: The Shapeshifting Character (Unicode Normalization)',
    category: 'backend',
    difficulty: 'Advanced',
    xp: 200,
    cwe: 'CWE-179',
    language: 'python',
    summary: 'A comment system filters out dangerous HTML angle brackets "<" and ">", but normalizes Unicode with NFKC AFTER the filter. Supply a Unicode homoglyph that passes the filter and morphs into a real tag after normalization!',
    dummiesAnalogy: 'Imagine a customs agent checking for metal knives, but ignoring blocks of ice shaped like knives. Once inside the warm room, the ice melts or hardens into the forbidden weapon!',
    vulnerableCode: `# Target Endpoint: /api/comment
import unicodedata

def filter_comment(text: str):
    # FLAW: Filtering prohibited chars BEFORE Unicode normalization!
    filtered = text.replace("<", "").replace(">", "")
    
    # Downstream NFKC folds fullwidth chars back into standard ASCII!
    normalized = unicodedata.normalize("NFKC", filtered)
    return normalized`,
    hint: 'Look for fullwidth or small variant angle brackets in Unicode, such as fullwidth less-than "＜" (U+FF1C) or small less-than "﹤" (U+FE64).',
    sampleExploitPayloads: ['﹤script﹥alert(1)﹤/script﹥', '＜img src=x onerror=1＞', '﹤b﹥test﹤/b﹥'],
    remediationCode: `import unicodedata
import html

def filter_comment_safe(text: str):
    # 1. Normalize Unicode FIRST (canonical representation)
    normalized = unicodedata.normalize("NFKC", text)
    
    # 2. Escape or validate SECOND on canonical text
    return html.escape(normalized)`,
    remediationExplanation: 'Always canonicalize/normalize character encodings first before applying security validation rules or HTML entity escaping.',
    validateExploit: (input: string, execResult?: any) => {
      if (execResult && execResult.vulnerable && execResult.vulnerable.exploited) {
        return true;
      }
      return input.includes('﹤') || input.includes('﹥') || input.includes('＜') || input.includes('＞');
    }
  },
  {
    id: 'ch-6',
    title: 'Challenge 6: The Unsafe Sink (DOM XSS via innerHTML)',
    category: 'frontend',
    difficulty: 'Beginner',
    xp: 110,
    cwe: 'CWE-79',
    language: 'javascript',
    summary: 'A frontend client renders the user\'s status message into the page by directly assigning it to element.innerHTML. Deliver an HTML/JS payload that executes an alert handler in the DOM!',
    dummiesAnalogy: 'Giving someone a sealed letter vs giving them a piece of paper with instructions telling their body to spontaneously slap themselves. innerHTML opens and executes the instructions!',
    vulnerableCode: `// Target Component: User Status Widget
function renderStatus(userStatus) {
    const container = document.getElementById("status-preview");
    // DANGEROUS SINK: Parses and evaluates HTML elements
    container.innerHTML = "Status: <span>" + userStatus + "</span>";
}`,
    hint: 'Modern browsers block <script> inside innerHTML, but inline event handlers like <img src=x onerror=alert(1)> execute immediately upon rendering.',
    sampleExploitPayloads: ['<img src=x onerror="alert(1)">', '<svg onload="alert(1)">', '<body onload="alert(1)">'],
    remediationCode: `function renderStatusSafe(userStatus) {
    const container = document.getElementById("status-preview");
    // SECURE: Use textContent (treats all characters strictly as raw text)
    const span = document.createElement("span");
    span.textContent = userStatus;
    container.textContent = "Status: ";
    container.appendChild(span);
}`,
    remediationExplanation: 'Using `textContent` or `DOMPurify.sanitize()` prevents the browser HTML parser from turning untrusted input into active DOM executable scripts.',
    validateExploit: (input: string) => {
      const lower = input.toLowerCase();
      return (lower.includes('<img') && lower.includes('onerror')) ||
             (lower.includes('<svg') && lower.includes('onload')) ||
             (lower.includes('<script') && lower.includes('alert'));
    }
  },
  {
    id: 'ch-7',
    title: 'Challenge 7: The Catastrophic Cat (ReDoS Backtracking)',
    category: 'regex',
    difficulty: 'Intermediate',
    xp: 140,
    cwe: 'CWE-1333',
    language: 'javascript',
    summary: 'A username validator employs a flawed regex with nested quantifiers: /^([a-zA-Z0-9]+)+$/. Craft a payload that triggers catastrophic backtracking to exhaust CPU resources!',
    dummiesAnalogy: 'A cat trying to sort 25 identical toys into every possible combination of boxes before finally noticing one box has a tiny tear. The number of combinations doubles with every toy!',
    vulnerableCode: `// Target Function: validateUsername
function validateUsername(str) {
    // FLAW: Nested repetition (inner+)+ creates 2^N branch combinations
    const regex = /^([a-zA-Z0-9]+)+$/;
    return regex.test(str);
}`,
    hint: 'Provide a long sequence of characters matching the inner pattern (e.g. 20-30 "a"s) followed by a non-matching character like "!" at the very end.',
    sampleExploitPayloads: ['aaaaaaaaaaaaaaaaaaaaaaaaaaa!', 'bbbbbbbbbbbbbbbbbbbbbbbbbb!', '11111111111111111111111111@'],
    remediationCode: `function validateUsernameSafe(str) {
    // 1. Enforce length boundary FIRST
    if (typeof str !== "string" || str.length < 3 || str.length > 30) return false;
    
    // 2. Linear O(N) regex without nested quantifiers
    const regex = /^[a-zA-Z0-9]{3,30}$/;
    return regex.test(str);
}`,
    remediationExplanation: 'Eliminate nested quantifiers. Enforce length limits before regular expression execution.',
    validateExploit: (input: string) => {
      return /^([a-zA-Z0-9]{15,})[!@#$%^&*()_+~`\-={}\[\]:;"'<>,.?\/]$/.test(input);
    }
  },
  {
    id: 'ch-8',
    title: 'Challenge 8: The Cloud Key Heist (SSRF Metadata Attack)',
    category: 'backend',
    difficulty: 'Intermediate',
    xp: 170,
    cwe: 'CWE-918',
    language: 'python',
    summary: 'A profile avatar fetcher accepts an image URL and fetches it using requests.get(url). Exploit Server-Side Request Forgery by targeting the cloud instance metadata IP 169.254.169.254 or localhost loopback!',
    dummiesAnalogy: 'A customer asking a concierge: "Please run across the street and fetch my jacket." But the jacket is actually in the bank vault next door with the vault code written on the ticket!',
    vulnerableCode: `# Target Endpoint: /api/fetch-avatar?url=<your_input>
import requests

def fetch_avatar(image_url: str):
    # FLAW: Unchecked outbound HTTP request from server network
    resp = requests.get(image_url, timeout=2)
    return resp.text`,
    hint: 'Cloud metadata IP for AWS/GCP/Azure is 169.254.169.254, or test local services via 127.0.0.1 or 0.0.0.0.',
    sampleExploitPayloads: ['http://169.254.169.254/latest/meta-data/', 'http://127.0.0.1:8080/admin', 'http://0.0.0.0:3000'],
    remediationCode: `import socket, ipaddress
from urllib.parse import urlparse

def fetch_avatar_safe(image_url: str):
    parsed = urlparse(image_url)
    if parsed.scheme != "https":
        raise ValueError("HTTPS required")
    ip = socket.gethostbyname(parsed.hostname)
    ip_obj = ipaddress.ip_address(ip)
    if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local:
        raise PermissionError("Private IP prohibited")
    return requests.get(image_url, timeout=2)`,
    remediationExplanation: 'Enforce HTTPS, resolve DNS to IP address before connection, and strictly drop private, loopback, and link-local ranges.',
    validateExploit: (input: string, execResult?: any) => {
      if (execResult && execResult.vulnerable && execResult.vulnerable.exploited) {
        return true;
      }
      return input.includes('169.254.169.254') || input.includes('127.0.0.1') || input.includes('0.0.0.0') || input.includes('localhost');
    }
  }
];
