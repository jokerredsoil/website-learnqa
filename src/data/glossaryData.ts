export interface DummiesAnalogy {
  title: string;
  category: string;
  technicalTerm: string;
  theDummiesAnalogy: string;
  theDeveloperMistake: string;
  theSecQARemedy: string;
}

export const DUMMIES_ANALOGIES: DummiesAnalogy[] = [
  {
    title: 'The Pizza Delivery (CIA Triad)',
    category: 'Foundations',
    technicalTerm: 'Confidentiality, Integrity, Availability',
    theDummiesAnalogy: 'Imagine ordering a pizza. Confidentiality means the delivery box is opaque and taped shut so your neighbors cannot see what toppings you bought. Integrity means nobody opened the box on the way to take a bite or swap your pepperoni for anchovies. Availability means the pizzeria is open, answers the phone, and the delivery driver actually shows up before you starve!',
    theDeveloperMistake: 'Focusing 100% on keeping the database online (Availability) while sending passwords in plaintext HTTP (violating Confidentiality) and allowing price tampering (violating Integrity).',
    theSecQARemedy: 'Every test plan must evaluate all three: Can data leak? Can data be tampered with? Can the service be frozen?'
  },
  {
    title: 'The Bouncer with Amnesia (AAA Framework)',
    category: 'Foundations',
    technicalTerm: 'Authentication, Authorization, Accounting',
    theDummiesAnalogy: 'Authentication is checking your driver’s license at the VIP nightclub door (verifying you are Alice). Authorization is checking the VIP guest list to see if Alice is allowed into the restricted rooftop lounge (checking permissions). Accounting is the security guard writing down in the guestbook: "Alice entered the rooftop at 11:42 PM" (logging and auditing).',
    theDeveloperMistake: 'Checking that the user is logged in (Authentication), but forgetting to check if they own the invoice #9482 they are requesting (Broken Authorization / IDOR).',
    theSecQARemedy: 'Always test both: Who is the user, what are their allowed boundaries, and was the attempt recorded?'
  },
  {
    title: 'The Mad-Libs Storyboard (SSTI)',
    category: 'Vulnerabilities',
    technicalTerm: 'Server-Side Template Injection',
    theDummiesAnalogy: 'Imagine a children\'s Mad-Libs book where you fill in a blank for a greeting: "Dear [NAME], welcome!" If a kid writes their name as "Alice", the book prints "Dear Alice, welcome!". But if the publisher accidentally prints the blank as executable instructions, an evil kid writes: "NAME: Burn this book and delete the library". The printing press reads the command and burns down the building!',
    theDeveloperMistake: 'Using Python string formatting `f"Hello {name}!"` inside `jinja2.Template()` instead of passing `{name: value}` inside `template.render()`.',
    theSecQARemedy: 'Keep template source files completely static and immutable. Pass untrusted user data exclusively into context parameters with autoescaping on.'
  },
  {
    title: 'The Stubborn Sorter Cat (ReDoS)',
    category: 'Vulnerabilities',
    technicalTerm: 'Regular Expression Denial of Service',
    theDummiesAnalogy: 'Imagine a cat sorting colored socks into piles. You tell the cat: "Find all socks that can be grouped into groups of groups". If you give the cat 25 matching white socks and one black sock at the very end, the cat tries every mathematical permutation of dividing 25 items across groups before giving up. The cat spends 4 hours frantically rearranging socks, completely ignoring other duties!',
    theDeveloperMistake: 'Writing regexes with nested repetitions like `([a-zA-Z0-9]+)+$` or `(a|aa)+$` without testing worst-case near-miss inputs.',
    theSecQARemedy: 'Limit string length before running regexes, avoid nested quantifiers, and test expressions using ReDoS analyzer tools.'
  },
  {
    title: 'The Trojan Gift Basket (DOM XSS)',
    category: 'Vulnerabilities',
    technicalTerm: 'Cross-Site Scripting via innerHTML',
    theDummiesAnalogy: 'Imagine receiving a fruit basket in the mail. If you open it and just set the apples on your table (`textContent`), you are safe. But if you tell your butler: "Whatever is inside this box, immediately assemble and activate it" (`innerHTML`), and inside the basket was a spring-loaded mouse trap, your butler gets snapped in the face!',
    theDeveloperMistake: 'Using `element.innerHTML = userInput` because it looks easy, instead of `element.textContent` or sanitizing with DOMPurify.',
    theSecQARemedy: 'Treat user data as raw text by default. Use safe DOM methods like `textContent` and `createElement`.'
  },
  {
    title: 'The Sneaky Concierge (SSRF)',
    category: 'Vulnerabilities',
    technicalTerm: 'Server-Side Request Forgery',
    theDummiesAnalogy: 'You visit a luxury hotel and tell the concierge: "Hey, can you fetch a book for me from this web address?". Instead of giving the concierge a public bookstore link, you tell them: "Go fetch http://127.0.0.1:8080/hotel-master-vault-keys". The concierge is already inside the hotel\'s private network, so the internal vault gladly hands over the keys to the concierge!',
    theDeveloperMistake: 'Allowing backend servers to make outbound HTTP requests to user-supplied URLs without blocking loopback and internal cloud VPC IP addresses (169.254.169.254).',
    theSecQARemedy: 'Resolve hostnames to IP addresses before connecting, and enforce egress firewalls that strictly drop RFC1918, loopback, and cloud link-local metadata ranges.'
  }
];

export const EDGE_CASE_CHEAT_SHEET = [
  {
    category: 'Boundary & Length',
    description: 'Testing the minimum and maximum capacity boundaries of parsers and database column definitions.',
    payloads: [
      { name: 'Empty String', value: '""', risk: 'NullPointer / TypeError / validation bypass' },
      { name: 'Whitespace Only', value: '"   \\t\\n\\r   "', risk: 'Bypasses naive non-empty checks' },
      { name: 'Max Boundary + 1', value: '"A" * 256 (for VARCHAR(255))', risk: 'Database truncation or 500 error' },
      { name: 'Buffer Overflow Payload', value: '"A" * 100000', risk: 'Memory exhaustion or crash' }
    ]
  },
  {
    category: 'Null Bytes & Control Chars',
    description: 'Characters that alter string termination in low-level C libraries or POSIX file handlers.',
    payloads: [
      { name: 'Null Byte (URL Encoded)', value: '%00', risk: 'File extension truncation in legacy parsers' },
      { name: 'Null Byte (Raw Escaped)', value: '\\x00 or \\0', risk: 'C-string termination bugs' },
      { name: 'Newline Injection', value: '\\r\\n or %0d%0a', risk: 'HTTP Response Splitting / Log Injection' }
    ]
  },
  {
    category: 'Unicode & Homoglyphs',
    description: 'Characters that look identical or normalize to dangerous ASCII symbols after security filters.',
    payloads: [
      { name: 'Fullwidth Angle Bracket', value: '＜ (U+FF1C) / ＞ (U+FF1E)', risk: 'Transforms into < > during NFKC normalization' },
      { name: 'Small Form Variant', value: '﹤ (U+FE64) / ﹥ (U+FE65)', risk: 'Bypasses XSS filters and normalizes to < >' },
      { name: 'Cyrillic Homoglyph "a"', value: 'а (U+0430) vs a (U+0061)', risk: 'Username spoofing / duplicate account takeover' }
    ]
  },
  {
    category: 'SQL Metacharacters',
    description: 'Characters that alter SQL query syntax and logic.',
    payloads: [
      { name: 'Single Quote', value: "'", risk: 'Breaks out of SQL string literal' },
      { name: 'Tautology Expression', value: "' OR '1'='1", risk: 'Forces WHERE clause to TRUE (Auth bypass)' },
      { name: 'SQL Comment Delimiter', value: "-- or # or /* */", risk: 'Comments out remainder of query' },
      { name: 'UNION SELECT Probe', value: "' UNION SELECT 1,2,3 --", risk: 'Data exfiltration across tables' }
    ]
  },
  {
    category: 'Shell Metacharacters',
    description: 'Characters that delimit commands or substitute subshell execution.',
    payloads: [
      { name: 'Command Delimiter', value: "; whoami", risk: 'Sequential execution of second command' },
      { name: 'Pipe Operator', value: "| id", risk: 'Pipes stdout into arbitrary tool' },
      { name: 'Background Operator', value: "& ping 127.0.0.1", risk: 'Spawns async detached process' },
      { name: 'Command Substitution', value: "$(id) or `id`", risk: 'Evaluates output inside parent command' }
    ]
  },
  {
    category: 'Path Traversal Sequences',
    description: 'Directory navigation tokens designed to escape application sandboxes.',
    payloads: [
      { name: 'Standard Dot-Dot-Slash', value: "../../etc/passwd", risk: 'Direct directory climbing' },
      { name: 'Nested Stripping Bypass', value: "....//....//etc/passwd", risk: 'Bypasses single-pass replace("../", "")' },
      { name: 'URL Encoded Dots', value: "..%2f..%2f", risk: 'Bypasses naive WAF string matches' },
      { name: 'Windows Reverse Slash', value: "..\\..\\windows\\win.ini", risk: 'Windows filesystem traversal' }
    ]
  }
];
