// Security Module for CodeForge
// Execution queue, rate limiting, malicious code detection, and audit logging

import { showToast } from './toast.js';

// ---- Execution Queue ----
const executionQueue = [];
let isExecuting = false;
const MAX_QUEUE_SIZE = 5;

export function enqueueExecution(executeFn) {
    return new Promise((resolve, reject) => {
        if (executionQueue.length >= MAX_QUEUE_SIZE) {
            showToast('Execution queue full. Please wait.', 'warning');
            reject(new Error('Queue full'));
            return;
        }

        executionQueue.push({ executeFn, resolve, reject });

        if (!isExecuting) {
            processQueue();
        } else if (executionQueue.length > 1) {
            showToast(`Queued (position ${executionQueue.length})`, 'info');
        }
    });
}

async function processQueue() {
    if (executionQueue.length === 0) {
        isExecuting = false;
        return;
    }

    isExecuting = true;
    const { executeFn, resolve, reject } = executionQueue.shift();

    try {
        const result = await executeFn();
        resolve(result);
    } catch (err) {
        reject(err);
    }

    // Cooldown between executions (500ms)
    setTimeout(() => processQueue(), 500);
}

// ---- Rate Limiting ----
const rateLimitState = {
    timestamps: [],
    maxPerMinute: 15,
    cooldownActive: false,
};

export function checkRateLimit() {
    const now = Date.now();
    // Remove timestamps older than 1 minute
    rateLimitState.timestamps = rateLimitState.timestamps.filter(t => now - t < 60000);

    if (rateLimitState.timestamps.length >= rateLimitState.maxPerMinute) {
        const waitTime = Math.ceil((60000 - (now - rateLimitState.timestamps[0])) / 1000);
        showToast(`Rate limit reached. Wait ${waitTime}s.`, 'warning');
        return false;
    }

    rateLimitState.timestamps.push(now);
    return true;
}

// ---- Malicious Code Detection ----
const MALICIOUS_PATTERNS = [
    // Fork bombs
    { pattern: /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}/g, name: 'Fork bomb (Bash)', severity: 'critical' },
    { pattern: /fork\s*\(\s*\)\s*.*fork/gi, name: 'Fork bomb pattern', severity: 'critical' },

    // Filesystem abuse
    { pattern: /rm\s+-rf\s+\//g, name: 'Recursive delete root', severity: 'critical' },
    { pattern: /os\s*\.\s*system\s*\(\s*['"]rm/gi, name: 'OS command injection (rm)', severity: 'critical' },
    { pattern: /subprocess\s*\.\s*(call|run|Popen)\s*\(\s*\[?\s*['"]rm/gi, name: 'Subprocess rm command', severity: 'high' },
    { pattern: /exec\s*\(\s*['"]rm\s+-rf/gi, name: 'Exec rm command', severity: 'critical' },
    { pattern: /\bformat\s+[A-Z]:\s*/gi, name: 'Drive format command', severity: 'critical' },

    // Network abuse
    { pattern: /while\s*\(?true\)?\s*\{?\s*(fetch|http|request|axios)/gi, name: 'Infinite network requests', severity: 'high' },

    // Infinite resource consumption
    { pattern: /while\s*\(?\s*true\s*\)?\s*\{\s*new\s+Array/gi, name: 'Infinite memory allocation', severity: 'high' },
    { pattern: /setInterval\s*\(\s*\(\)\s*=>\s*\{\s*while/gi, name: 'Infinite interval loop', severity: 'high' },

    // Crypto mining
    { pattern: /crypto\s*\.\s*createHash.*while\s*\(true\)/gi, name: 'Crypto mining pattern', severity: 'high' },
    { pattern: /coinhive|cryptonight|stratum\+tcp/gi, name: 'Known mining reference', severity: 'critical' },
];

export function scanForMaliciousCode(code) {
    const detections = [];

    for (const rule of MALICIOUS_PATTERNS) {
        rule.pattern.lastIndex = 0; // Reset regex state
        if (rule.pattern.test(code)) {
            detections.push({
                name: rule.name,
                severity: rule.severity,
            });
        }
    }

    return detections;
}

export function isSafeToExecute(code) {
    const detections = scanForMaliciousCode(code);

    if (detections.length > 0) {
        const critical = detections.filter(d => d.severity === 'critical');
        if (critical.length > 0) {
            showToast(`🚫 Blocked: ${critical[0].name}`, 'error');
            return false;
        }

        // Warn but allow for non-critical
        const warnings = detections.map(d => d.name).join(', ');
        showToast(`⚠️ Warning: ${warnings}`, 'warning');
    }

    return true;
}

// ---- Audit Log ----
const AUDIT_KEY = 'codeforge_audit';
const MAX_AUDIT_ENTRIES = 200;

function getAuditLog() {
    try {
        const data = localStorage.getItem(AUDIT_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveAuditLog(log) {
    try {
        localStorage.setItem(AUDIT_KEY, JSON.stringify(log));
    } catch {
        // If full, trim
        log = log.slice(0, 50);
        try { localStorage.setItem(AUDIT_KEY, JSON.stringify(log)); } catch { }
    }
}

export function addAuditEntry(entry) {
    const log = getAuditLog();
    log.unshift({
        ...entry,
        timestamp: Date.now(),
        codeHash: hashCode(entry.code || ''),
    });

    if (log.length > MAX_AUDIT_ENTRIES) {
        log.length = MAX_AUDIT_ENTRIES;
    }

    saveAuditLog(log);
}

export function getAuditEntries(limit = 50) {
    return getAuditLog().slice(0, limit);
}

export function clearAuditLog() {
    localStorage.removeItem(AUDIT_KEY);
}

// Simple hash for code tracking
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return hash.toString(16);
}
