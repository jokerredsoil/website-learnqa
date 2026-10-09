export interface StrideFeatureTemplate {
  id: string;
  featureName: string;
  description: string;
  threats: {
    category: 'S' | 'T' | 'R' | 'I' | 'D' | 'E';
    categoryName: string;
    threatSummary: string;
    qaTestPerspective: string;
    abuseCasePayload: string;
    remediationAction: string;
  }[];
}

export const STRIDE_TEMPLATES: StrideFeatureTemplate[] = [
  {
    id: 'auth_login',
    featureName: 'User Authentication & Login Form',
    description: 'Username and password credential verification with session token generation.',
    threats: [
      {
        category: 'S',
        categoryName: 'Spoofing',
        threatSummary: 'Attacker logs in as victim using brute-force, credential stuffing, or session hijacking.',
        qaTestPerspective: 'Check account lockout after 5 consecutive failed attempts.',
        abuseCasePayload: 'Payload: 100 requests with common passwords via Intruder; or session token cookie reuse across IP change.',
        remediationAction: 'Implement rate limiting (5 attempts/min), Argon2/bcrypt hashing, MFA, and invalidate old session IDs upon login.'
      },
      {
        category: 'T',
        categoryName: 'Tampering',
        threatSummary: 'Attacker modifies login payload or alters remember_me cookie values.',
        qaTestPerspective: 'Verify modified cookie values are rejected and not decoded as valid sessions.',
        abuseCasePayload: 'Cookie: session_user=admin (tampered plaintext cookie).',
        remediationAction: 'Cryptographically sign sessions with HMAC-SHA256 or use secure server-side session stores.'
      },
      {
        category: 'R',
        categoryName: 'Repudiation',
        threatSummary: 'A rogue employee performs actions and denies it because logs lack user attribution or timestamps.',
        qaTestPerspective: 'Verify every failed and successful login creates an immutable audit log record.',
        abuseCasePayload: 'Rapid failed logins from anonymous proxies to test if origin IP and user-agent are logged.',
        remediationAction: 'Write structured audit logs to centralized write-once logging (e.g. CloudWatch / Datadog) with timestamps and actor IDs.'
      },
      {
        category: 'I',
        categoryName: 'Information Disclosure',
        threatSummary: 'Login error messages reveal whether an email or username exists in the database (Username Enumeration).',
        qaTestPerspective: 'Check error message consistency between registered and unregistered emails.',
        abuseCasePayload: 'Testing: "Invalid password for alice@company.com" vs "User does not exist".',
        remediationAction: 'Return generic error messages: "Invalid email or password" and normalize response timing to prevent timing attacks.'
      },
      {
        category: 'D',
        categoryName: 'Denial of Service',
        threatSummary: 'Attacker floods password hashing with 100,000-character passwords, pinning server CPU at 100%.',
        qaTestPerspective: 'Verify password length maximum boundary (e.g. max 128 characters).',
        abuseCasePayload: 'Password input containing 1,000,000 "A" characters submitted concurrently.',
        remediationAction: 'Enforce strict max-length constraint (e.g. 64-128 chars) before sending string to CPU-intensive bcrypt/argon2 hashing.'
      },
      {
        category: 'E',
        categoryName: 'Elevation of Privilege',
        threatSummary: 'Attacker injects SQL payloads into login fields to bypass authentication as administrator.',
        qaTestPerspective: 'Test login form against single quotes and SQL operators.',
        abuseCasePayload: "username: admin' -- and password: any",
        remediationAction: 'Use parameterized database queries and prepared statements exclusively.'
      }
    ]
  },
  {
    id: 'file_upload',
    featureName: 'Avatar & Document File Upload',
    description: 'Accepting binary files, saving to disk or object storage, and providing download URLs.',
    threats: [
      {
        category: 'S',
        categoryName: 'Spoofing',
        threatSummary: 'Attacker disguises executable shell scripts as harmless images (e.g. shell.php.png).',
        qaTestPerspective: 'Verify server checks file magic bytes, not just client Content-Type or file extension.',
        abuseCasePayload: 'File: shell.php with Content-Type: image/jpeg header.',
        remediationAction: 'Validate binary magic bytes (e.g. using python-magic), re-encode uploaded images, and store in isolated S3 buckets.'
      },
      {
        category: 'T',
        categoryName: 'Tampering',
        threatSummary: 'Attacker uses path traversal in filename to overwrite critical server configuration files.',
        qaTestPerspective: 'Check filenames containing ../ or %2e%2e/.',
        abuseCasePayload: 'Filename: ../../../../etc/cron.hourly/malicious_job',
        remediationAction: 'Discard user-supplied filenames; generate a random UUID on the server (e.g. uuid4() + ".png").'
      },
      {
        category: 'R',
        categoryName: 'Repudiation',
        threatSummary: 'Malicious file uploaded with no record of which user or IP uploaded it.',
        qaTestPerspective: 'Verify file metadata logs recording uploader user_id, hash (SHA256), timestamp, and IP.',
        abuseCasePayload: 'Upload payload from temporary session to check tracking.',
        remediationAction: 'Store upload event in audit log with cryptographic hash of the uploaded asset.'
      },
      {
        category: 'I',
        categoryName: 'Information Disclosure',
        threatSummary: 'Uploaded files can be browsed publicly via predictable sequential IDs (IDOR) or directory listing.',
        qaTestPerspective: 'Try accessing /uploads/1, /uploads/2 without authentication.',
        abuseCasePayload: 'GET /uploads/ -> check if Apache/Nginx directory listing is enabled.',
        remediationAction: 'Disable directory index in web server; use cryptographically random unguessable object keys or signed URLs.'
      },
      {
        category: 'D',
        categoryName: 'Denial of Service',
        threatSummary: 'Decompression bomb ("Zip Bomb" / "Pixel Flood") or 50GB file upload exhausts server disk and memory.',
        qaTestPerspective: 'Test upload limit exceeding maximum allowed threshold (e.g. 10MB limit).',
        abuseCasePayload: 'Uploading 10,000x10,000 pixel image with tiny compressed file size (Pixel Flood).',
        remediationAction: 'Enforce strict file size limits in reverse proxy (Nginx client_max_body_size), and validate image dimensions before processing.'
      },
      {
        category: 'E',
        categoryName: 'Elevation of Privilege',
        threatSummary: 'Executable script placed in web root is requested via browser, executing arbitrary code as www-data.',
        qaTestPerspective: 'Verify upload directory has execution permissions disabled.',
        abuseCasePayload: 'Upload exploit.py or exploit.php and browse directly to its URL.',
        remediationAction: 'Mount uploads directory with noexec flag; serve user files from separate domain/CDN with Content-Disposition: attachment.'
      }
    ]
  },
  {
    id: 'payment_checkout',
    featureName: 'E-Commerce Cart & Payment Checkout',
    description: 'Shopping cart calculation, discount codes, currency handling, and payment gateway dispatch.',
    threats: [
      {
        category: 'S',
        categoryName: 'Spoofing',
        threatSummary: 'Attacker forges payment callback webhook from payment provider (Stripe/PayPal) to mark orders paid.',
        qaTestPerspective: 'Verify payment webhook requires valid cryptographic signature header.',
        abuseCasePayload: 'POST /api/webhooks/stripe with spoofed JSON event {"type": "payment_intent.succeeded"} without stripe-signature.',
        remediationAction: 'Verify webhook cryptographic signature using official SDK with webhook signing secret.'
      },
      {
        category: 'T',
        categoryName: 'Tampering',
        threatSummary: 'Attacker tampers with price or quantity in browser request payload (Negative price or 0.01 price).',
        qaTestPerspective: 'Test intercepting checkout POST request and changing price=100.00 to price=0.01 or quantity=-5.',
        abuseCasePayload: '{"item_id": 42, "unit_price": 0.01, "quantity": -1}',
        remediationAction: 'Never trust price or totals from client-side requests. Look up canonical product prices exclusively in backend database.'
      },
      {
        category: 'R',
        categoryName: 'Repudiation',
        threatSummary: 'User claims refund, stating they never authorized the purchase.',
        qaTestPerspective: 'Verify 3D Secure (3DS) authentication challenge logs and transaction reference IDs.',
        abuseCasePayload: 'Checkout simulation without 3DS flow.',
        remediationAction: 'Enforce 3D Secure / PSD2 Strong Customer Authentication for payment processing.'
      },
      {
        category: 'I',
        categoryName: 'Information Disclosure',
        threatSummary: 'Full credit card numbers or CVVs stored in database or printed in debug server logs.',
        qaTestPerspective: 'Search server logs and database tables for 16-digit card numbers.',
        abuseCasePayload: 'Submit test card numbers and inspect network and log output.',
        remediationAction: 'PCI-DSS compliance: tokenize cards via Stripe Elements/Braintree iframe; server must never receive raw PAN or CVV.'
      },
      {
        category: 'D',
        categoryName: 'Denial of Service',
        threatSummary: 'Card testing bot submits 50,000 micro-transactions per hour, triggering payment gateway bans and processor fees.',
        qaTestPerspective: 'Verify CAPTCHA and rate limits on checkout attempt endpoints.',
        abuseCasePayload: 'Script triggering 50 consecutive failed card authorizations in 10 seconds.',
        remediationAction: 'Enforce Cloudflare Turnstile / reCAPTCHA on checkout, velocity checks per IP and per fingerprint.'
      },
      {
        category: 'E',
        categoryName: 'Elevation of Privilege',
        threatSummary: 'User applies employee or wholesale discount code by tampering with discount_role parameter.',
        qaTestPerspective: 'Verify discount eligibility is strictly checked against authenticated session role in database.',
        abuseCasePayload: 'POST /checkout with {"discount_code": "VIP100", "override_auth": true}',
        remediationAction: 'Authorize coupons server-side against the authenticated account profile.'
      }
    ]
  }
];
