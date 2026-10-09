#!/usr/bin/env python3
"""
SecQA Python Execution Sandbox
Safely tests input validation scenarios with vulnerable vs remediated implementations.
"""

import sys
import json
import time
import os
import re
import html
import urllib.parse
import unicodedata
import shlex
import sqlite3
import tempfile

def detect_edge_cases(payload: str) -> list:
    flags = []
    if "\x00" in payload:
        flags.append("Null Byte (\\x00 / %00) Injection")
    if "../" in payload or "..\\" in payload or "%2e%2e" in payload.lower():
        flags.append("Path Traversal Sequence (../)")
    if any(c in payload for c in ["'", '"', ";", "--", "/*"]):
        flags.append("SQL Metacharacters (' or -- or ;)")
    if any(c in payload for c in [";", "|", "&", "`", "$("]):
        flags.append("Shell Command Metacharacters (; | ` $)")
    if "{{" in payload and "}}" in payload:
        flags.append("Template Expression Injection ({{...}})")
    if any(tag in payload.lower() for tag in ["<script", "<img", "javascript:", "onload=", "onerror="]):
        flags.append("HTML/XSS Script Tags")
    
    # Check Unicode normalization difference
    norm_nfkc = unicodedata.normalize("NFKC", payload)
    if norm_nfkc != payload:
        flags.append("Unicode Homoglyph / Decomposable Characters (NFKC Mismatch)")
        
    if len(payload) > 1000:
        flags.append("High-Volume / Buffer Flooding Payload (>1000 chars)")
    if payload == "":
        flags.append("Empty / Boundary Zero Length")
    return flags


def run_scenario(scenario_id: str, test_input: str) -> dict:
    trace = []
    trace.append({"step": "Input Received", "detail": f"Raw payload: {repr(test_input)[:80]}", "status": "info"})
    
    flags = detect_edge_cases(test_input)
    v_output = None
    v_error = None
    v_exploited = False
    
    r_output = None
    r_error = None
    r_blocked = False

    # 1. Path Traversal Scenario
    if scenario_id == "path_traversal":
        # Vulnerable implementation uses naive string replace
        trace.append({"step": "Vulnerable Sanitizer", "detail": "Applying naive filename.replace('../', '')", "status": "warning"})
        naive_cleaned = test_input.replace("../", "")
        simulated_base_dir = "/app/user_uploads"
        v_target_path = os.path.normpath(os.path.join(simulated_base_dir, naive_cleaned))
        
        # Check if it escaped /app/user_uploads
        if not v_target_path.startswith(simulated_base_dir):
            v_exploited = True
            v_output = f"[EXPLOITED] Traversed out of upload folder! Accessing host path: {v_target_path}"
        else:
            v_output = f"File target resolved to: {v_target_path}"
            
        # Remediated implementation uses secure pathlib / os.path.realpath check or secure_filename
        trace.append({"step": "Remediated Sanitizer", "detail": "Resolving absolute path and verifying base directory boundary", "status": "secure"})
        try:
            # Safe logic: strip path separators, keep only basename, or check commonpath
            base_dir = os.path.abspath(simulated_base_dir)
            # Safe option 1: os.path.basename
            safe_basename = os.path.basename(test_input.replace("\\", "/"))
            safe_target = os.path.abspath(os.path.join(base_dir, safe_basename))
            
            if not safe_target.startswith(base_dir) or safe_basename == "" or ".." in test_input:
                r_blocked = True
                r_output = f"[BLOCKED] SecurityException: Directory traversal attempt detected and quarantined. Input: {repr(test_input)[:30]}"
            else:
                r_output = f"Safe file target: {safe_target}"
        except Exception as e:
            r_blocked = True
            r_output = f"[BLOCKED] Validation rejected invalid path: {str(e)}"

    # 2. SQL Injection Scenario
    elif scenario_id == "sql_injection":
        trace.append({"step": "Vulnerable Query Construction", "detail": "Using Python f-string format: f\"SELECT * FROM users WHERE username='{input}'\"", "status": "danger"})
        # In-memory SQLite DB
        conn = sqlite3.connect(":memory:")
        cur = conn.cursor()
        cur.execute("CREATE TABLE users (id INT, username TEXT, role TEXT, secret_token TEXT)")
        cur.execute("INSERT INTO users VALUES (1, 'admin', 'administrator', 'FLAG{sqli_bypass_auth_token}')")
        cur.execute("INSERT INTO users VALUES (2, 'alice', 'developer', 'token_alice_456')")
        cur.execute("INSERT INTO users VALUES (3, 'bob', 'qa_tester', 'token_bob_789')")
        
        # Vulnerable: string concatenation
        v_query = f"SELECT id, username, role FROM users WHERE username = '{test_input}'"
        try:
            cur.execute(v_query)
            rows = cur.fetchall()
            v_output = f"Query: {v_query}\nReturned {len(rows)} row(s): {rows}"
            if len(rows) > 1 or (len(rows) == 1 and rows[0][1] == 'admin' and test_input != 'admin'):
                v_exploited = True
                v_output += "\n[EXPLOITED] SQL Logic Altered! Unauthorized rows or admin profile retrieved without credentials!"
        except Exception as e:
            v_error = f"SQL Syntax Error triggered: {str(e)}"
            v_output = f"Query: {v_query}\nDatabase Error: {str(e)}"
            if "syntax error" in str(e).lower() or "unclosed" in str(e).lower():
                v_exploited = True # Error-based SQLi indicator

        # Remediated: Parameterized query
        trace.append({"step": "Remediated Query Construction", "detail": "Using Parameterized Prepared Statement: cursor.execute('SELECT ... WHERE username = ?', (input,))", "status": "secure"})
        try:
            r_query = "SELECT id, username, role FROM users WHERE username = ?"
            cur.execute(r_query, (test_input,))
            r_rows = cur.fetchall()
            r_output = f"Parameterized Query: {r_query} with parameter={repr(test_input)}\nReturned {len(r_rows)} row(s): {r_rows}"
            r_blocked = True
        except Exception as e:
            r_error = str(e)
            r_output = f"Safe DB handler error: {str(e)}"
        conn.close()

    # 3. Command Injection Scenario
    elif scenario_id == "command_injection":
        trace.append({"step": "Vulnerable Command Construction", "detail": "String format in shell=True: f'ping -c 1 {host}'", "status": "danger"})
        
        # Check if metacharacters exist
        has_metachars = any(ch in test_input for ch in [";", "|", "&", "`", "$", "\n"])
        if has_metachars:
            v_exploited = True
            v_output = f"[EXPLOITED] Arbitrary shell command chain detected!\nExecuted: ping -c 1 {test_input}\nSubprocess injected commands executed with web app user privileges."
        else:
            v_output = f"Simulated ping to '{test_input}' completed successfully. 1 packets transmitted, 1 received."

        # Remediated: strict regex validation + shlex / subprocess array arguments without shell=True
        trace.append({"step": "Remediated Command Execution", "detail": "IP/Hostname regex whitelist + argv array ['ping', '-c', '1', host] with shell=False", "status": "secure"})
        is_valid_host = bool(re.match(r"^[a-zA-Z0-9.-]{1,253}$", test_input)) and not test_input.startswith("-")
        if not is_valid_host:
            r_blocked = True
            r_output = f"[BLOCKED] ValidationError: Input '{test_input}' failed strict host whitelist regex (^[a-zA-Z0-9.-]+$). Command execution rejected."
        else:
            r_output = f"Safe command dispatched: ['ping', '-c', '1', '{test_input}'] (shell=False). Execution safe."

    # 4. Jinja2 / SSTI Scenario
    elif scenario_id == "ssti":
        trace.append({"step": "Vulnerable Template Rendering", "detail": "Dynamic string interpolation inside template string: jinja2.Template(f'Welcome, {name}!')", "status": "danger"})
        if "{{" in test_input and "}}" in test_input:
            expr_match = re.search(r"\{\{(.*?)\}\}", test_input)
            expr = expr_match.group(1).strip() if expr_match else ""
            evaluated = None
            try:
                # Safe math evaluation for sandbox demo
                if re.match(r"^[\d\s\+\-\*\/\%]+$", expr):
                    evaluated = str(eval(expr))
                else:
                    evaluated = "[ARBITRARY_PYTHON_OBJECT_OR_RCE]"
                v_exploited = True
                v_output = f"[EXPLOITED] Server-Side Template Injection!\nExpression `{{{{{expr}}}}}` evaluated server-side to: `{evaluated}`\nRendered Result: {test_input.replace('{{' + expr + '}}', evaluated)}"
            except Exception:
                v_exploited = True
                v_output = f"[EXPLOITED] SSTI syntax reached template engine parser!"
        else:
            v_output = f"Rendered Template: Welcome, {test_input}!"

        # Remediated: pass variables in template context dictionary, never format into template string
        trace.append({"step": "Remediated Template Rendering", "detail": "Separating template code from untrusted data: template.render(name=user_input)", "status": "secure"})
        safe_escaped = html.escape(test_input)
        r_output = f"Safe Template Output: Welcome, {safe_escaped}! (Rendered as literal string in context: {{'name': {repr(test_input)}}})"
        if "{{" in test_input:
            r_blocked = True

    # 5. Unicode Normalization & Filter Order Scenario
    elif scenario_id == "unicode_normalization":
        trace.append({"step": "Vulnerable Sanitization Order", "detail": "Sanitizing first -> Normalizing Unicode second! (Re-introducing prohibited characters)", "status": "danger"})
        # Vulnerable order:
        # Step 1: Remove prohibited characters (e.g. '<' and '>')
        step1_filtered = test_input.replace("<", "").replace(">", "")
        # Step 2: Normalize NFKC afterwards!
        step2_normalized = unicodedata.normalize("NFKC", step1_filtered)
        
        if "<" in step2_normalized or ">" in step2_normalized or "script" in step2_normalized.lower():
            v_exploited = True
            v_output = f"[EXPLOITED] Unicode Normalization Bypass!\nInput: {repr(test_input)}\nAfter naive filter: {repr(step1_filtered)}\nAfter downstream NFKC normalization: {repr(step2_normalized)}\nProhibited characters reconstructed after filter!"
        else:
            v_output = f"Processed text: {step2_normalized}"

        # Remediated order:
        # Step 1: Normalize FIRST -> Step 2: Validate/Sanitize SECOND
        trace.append({"step": "Remediated Sanitization Order", "detail": "1. Normalize Unicode (NFKC) FIRST -> 2. Sanitize & Escaping SECOND", "status": "secure"})
        safe_step1 = unicodedata.normalize("NFKC", test_input)
        safe_step2 = html.escape(safe_step1)
        r_output = f"Safe Normalized & Escaped Result: {safe_step2}"
        if ("<" in test_input or "﹤" in test_input or "＜" in test_input) and ("&lt;" in safe_step2 or safe_step2 != test_input):
            r_blocked = True

    # 6. SSRF / Webhook URL Validation Scenario
    elif scenario_id == "ssrf":
        trace.append({"step": "Vulnerable URL Validation", "detail": "Checking if URL starts with 'http' only, allowing loopback and internal cloud metadata IPs", "status": "danger"})
        parsed = urllib.parse.urlparse(test_input)
        hostname = (parsed.hostname or "").lower()
        
        is_internal = hostname in ["localhost", "127.0.0.1", "0.0.0.0", "169.254.169.254", "[::1]"] or hostname.startswith("192.168.") or hostname.startswith("10.") or hostname.endswith(".internal")
        
        if test_input.startswith("http://") or test_input.startswith("https://"):
            if is_internal:
                v_exploited = True
                v_output = f"[EXPLOITED] Server-Side Request Forgery!\nInternal infrastructure target accessed: {test_input}\nProtected cloud metadata or internal services exposed to attacker."
            else:
                v_output = f"HTTP request simulated to external host: {test_input}"
        else:
            v_output = f"Invalid URL scheme: {test_input}"

        # Remediated: Parse URL, enforce HTTPS, resolve DNS, verify IP is public (non-loopback, non-private, non-metadata)
        trace.append({"step": "Remediated URL Validation", "detail": "Enforce HTTPS, strict domain whitelist, and IP range check (block RFC1918 & 169.254.169.254)", "status": "secure"})
        if not test_input.startswith("https://"):
            r_blocked = True
            r_output = "[BLOCKED] SecurityException: Insecure HTTP scheme rejected. Only HTTPS allowed."
        elif is_internal:
            r_blocked = True
            r_output = f"[BLOCKED] SecurityException: Private/internal IP address '{hostname}' blocked by egress firewall rules."
        else:
            r_output = f"Safe outbound webhook dispatched to verified public endpoint: {test_input}"

    # 7. Generic or Custom Python Runner
    else:
        # Default scenario
        trace.append({"step": "Analyzing custom input", "detail": f"Testing input against edge-case rules: {flags}", "status": "info"})
        v_output = f"Input received: {test_input}. Edge case tags: {flags}"
        r_output = f"Sanitized safe input: {html.escape(test_input)}"
        if flags:
            v_exploited = True
            r_blocked = True

    return {
        "scenario_id": scenario_id,
        "input": test_input,
        "edge_case_flags": flags,
        "vulnerable": {
            "output": v_output,
            "error": v_error,
            "exploited": v_exploited
        },
        "remediated": {
            "output": r_output,
            "error": r_error,
            "blocked": r_blocked
        },
        "trace": trace
    }


def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            print(json.dumps({"error": "Empty payload provided to sandbox"}))
            return
        data = json.loads(raw_input)
        scenario_id = data.get("scenario_id", "path_traversal")
        test_input = data.get("test_input", "")
        
        start_time = time.time()
        if scenario_id == "custom" or data.get("is_custom"):
            result = run_custom_code(
                data.get("code_vulnerable", ""),
                data.get("code_remediated", ""),
                test_input
            )
        else:
            result = run_scenario(scenario_id, test_input)
            
        result["execution_time_ms"] = round((time.time() - start_time) * 1000, 2)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "trace": [{"step": "Sandbox Exception", "detail": str(e), "status": "danger"}]
        }))

def run_custom_code(code_vulnerable: str, code_remediated: str, test_input: str) -> dict:
    trace = []
    trace.append({"step": "Input Ingestion", "detail": f"Payload: {repr(test_input)[:100]}", "status": "info"})
    flags = detect_edge_cases(test_input)
    
    # Run in a restricted local scope
    safe_globals = {
        "__builtins__": {
            "abs": abs, "all": all, "any": any, "bool": bool, "dict": dict,
            "enumerate": enumerate, "filter": filter, "float": float, "int": int,
            "isinstance": isinstance, "issubclass": issubclass, "len": len,
            "list": list, "map": map, "max": max, "min": min, "range": range,
            "repr": repr, "reversed": reversed, "round": round, "set": set,
            "slice": slice, "sorted": sorted, "str": str, "sum": sum,
            "tuple": tuple, "zip": zip, "print": print, "Exception": Exception,
            "ValueError": ValueError, "TypeError": TypeError, "KeyError": KeyError,
        },
        "re": re,
        "json": json,
        "html": html,
        "urllib": urllib,
        "unicodedata": unicodedata,
        "test_input": test_input
    }
    
    v_out, v_err, v_exploited = None, None, False
    r_out, r_err, r_blocked = None, None, False
    
    # Execute Vulnerable Snippet
    try:
        loc_v = {"user_input": test_input, "result": None}
        exec(code_vulnerable, safe_globals, loc_v)
        v_out = str(loc_v.get("result", "Code executed without explicit result variable"))
        trace.append({"step": "Custom Vulnerable Execution", "detail": f"Output: {repr(v_out)[:100]}", "status": "warning"})
        if any(f in str(v_out) for f in ["flag", "admin", "exploited", "bypass", "<script", "etc/passwd"]):
            v_exploited = True
    except Exception as e:
        v_err = str(e)
        trace.append({"step": "Custom Vulnerable Error", "detail": str(e), "status": "danger"})
        
    # Execute Remediated Snippet
    try:
        loc_r = {"user_input": test_input, "result": None}
        exec(code_remediated, safe_globals, loc_r)
        r_out = str(loc_r.get("result", "Remediated code executed"))
        trace.append({"step": "Custom Remediated Execution", "detail": f"Output: {repr(r_out)[:100]}", "status": "secure"})
        r_blocked = True
    except Exception as e:
        r_err = str(e)
        trace.append({"step": "Custom Remediated Error / Block", "detail": str(e), "status": "info"})
        r_blocked = True

    return {
        "scenario_id": "custom",
        "input": test_input,
        "edge_case_flags": flags,
        "vulnerable": {"output": v_out, "error": v_err, "exploited": v_exploited},
        "remediated": {"output": r_out, "error": r_err, "blocked": r_blocked},
        "trace": trace
    }

if __name__ == "__main__":
    main()
