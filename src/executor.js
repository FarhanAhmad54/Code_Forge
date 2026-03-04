// Code execution engine
// Handles both browser-side and API-based execution via Judge0 CE

const JUDGE0_API = 'https://ce.judge0.com';

// Judge0 CE language IDs for supported languages
const JUDGE0_LANG_MAP = {
    'typescript': 74,    // TypeScript
    'python': 71,        // Python 3
    'c': 50,             // C (GCC 9.2.0)
    'cpp': 54,           // C++ (GCC 9.2.0)
    'java': 62,          // Java (OpenJDK 13)
    'csharp': 51,        // C# (Mono 6.6.0)
    'go': 60,            // Go (1.13.5)
    'rust': 73,          // Rust (1.40.0)
    'ruby': 72,          // Ruby (2.7.0)
    'php': 68,           // PHP (7.4.1)
    'swift': 83,         // Swift (5.2.3)
    'kotlin': 78,        // Kotlin (1.3.70)
    'dart': 90,          // Dart (2.19.2)
    'lua': 64,           // Lua (5.3.5)
    'perl': 85,          // Perl (5.28.1)
    'r': 80,             // R (4.0.0)
    'bash': 46,          // Bash (5.0.0)
    'sql': 82,           // SQL (SQLite 3.27.2)
};

// Execute JavaScript in a sandboxed environment
function executeJavaScript(code) {
    return new Promise((resolve) => {
        const logs = [];
        const errors = [];
        const startTime = performance.now();

        // Create a sandboxed console
        const sandboxConsole = {
            log: (...args) => logs.push(args.map(formatArg).join(' ')),
            error: (...args) => errors.push(args.map(formatArg).join(' ')),
            warn: (...args) => logs.push(`⚠️ ${args.map(formatArg).join(' ')}`),
            info: (...args) => logs.push(`ℹ️ ${args.map(formatArg).join(' ')}`),
            table: (data) => logs.push(formatTable(data)),
            clear: () => { logs.length = 0; },
            dir: (obj) => logs.push(JSON.stringify(obj, null, 2)),
            time: () => { },
            timeEnd: () => { },
        };

        try {
            // Create a function with sandboxed console and print mapped to console.log
            const fn = new Function('console', 'print', code);
            const result = fn(sandboxConsole, sandboxConsole.log);

            // If the code returns a value, add it to logs
            if (result !== undefined) {
                logs.push(`→ ${formatArg(result)}`);
            }

            const elapsed = ((performance.now() - startTime) / 1000).toFixed(3);
            resolve({
                success: true,
                output: logs.join('\n'),
                error: errors.length > 0 ? errors.join('\n') : null,
                executionTime: `${elapsed}s`,
            });
        } catch (err) {
            const elapsed = ((performance.now() - startTime) / 1000).toFixed(3);
            resolve({
                success: false,
                output: logs.join('\n'),
                error: `${err.name}: ${err.message}`,
                executionTime: `${elapsed}s`,
            });
        }
    });
}

// Execute HTML/CSS in a sandboxed iframe
function executeHTML(code) {
    return new Promise((resolve) => {
        resolve({
            success: true,
            output: null,
            html: code,
            executionTime: '0s',
        });
    });
}

// Execute code via Judge0 CE API
async function executeViaAPI(code, language) {
    const startTime = performance.now();

    const langId = JUDGE0_LANG_MAP[language.id];
    if (!langId) {
        return {
            success: false,
            output: '',
            error: `Language "${language.name}" is not supported for API execution. Judge0 language ID not configured.`,
            executionTime: '0s',
        };
    }

    try {
        // Submit code for execution
        const submitResponse = await fetch(`${JUDGE0_API}/submissions?base64_encoded=true&wait=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                language_id: langId,
                source_code: btoa(unescape(encodeURIComponent(code))),
                stdin: '',
            }),
        });

        if (!submitResponse.ok) {
            // If Judge0 CE fails, try the fallback
            const errorText = await submitResponse.text();
            throw new Error(`Judge0 API returned ${submitResponse.status}: ${errorText}`);
        }

        const result = await submitResponse.json();
        const elapsed = ((performance.now() - startTime) / 1000).toFixed(3);

        // Decode base64 outputs
        const stdout = result.stdout ? decodeURIComponent(escape(atob(result.stdout))) : '';
        const stderr = result.stderr ? decodeURIComponent(escape(atob(result.stderr))) : '';
        const compileOutput = result.compile_output ? decodeURIComponent(escape(atob(result.compile_output))) : '';

        // Status ID mapping:
        // 1-2: In Queue/Processing, 3: Accepted, 4: Wrong Answer, 
        // 5: Time Limit, 6: Compilation Error, 7-12: Runtime errors
        const statusId = result.status?.id;

        if (statusId === 6) {
            // Compilation error
            return {
                success: false,
                output: '',
                error: `Compilation Error:\n${compileOutput}`,
                executionTime: `${elapsed}s`,
            };
        }

        if (statusId >= 7) {
            // Runtime error
            return {
                success: false,
                output: stdout,
                error: stderr || result.status?.description || 'Runtime error',
                executionTime: `${elapsed}s`,
            };
        }

        if (statusId === 5) {
            return {
                success: false,
                output: stdout,
                error: 'Time Limit Exceeded - your code took too long to execute.',
                executionTime: `${elapsed}s`,
            };
        }

        const hasError = stderr && stderr.trim().length > 0;

        return {
            success: !hasError,
            output: stdout || '',
            error: hasError ? stderr : null,
            executionTime: result.time ? `${result.time}s` : `${elapsed}s`,
        };
    } catch (err) {
        const elapsed = ((performance.now() - startTime) / 1000).toFixed(3);
        return {
            success: false,
            output: '',
            error: `Execution failed: ${err.message}\n\nThis could be a network issue or the code execution API may be temporarily unavailable.`,
            executionTime: `${elapsed}s`,
        };
    }
}

// Format argument for console output
function formatArg(arg) {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'object') {
        try {
            return JSON.stringify(arg, null, 2);
        } catch {
            return String(arg);
        }
    }
    return String(arg);
}

// Format table data
function formatTable(data) {
    if (Array.isArray(data)) {
        if (data.length === 0) return '(empty array)';
        if (typeof data[0] === 'object') {
            const keys = Object.keys(data[0]);
            const header = keys.join(' | ');
            const separator = keys.map(() => '---').join(' | ');
            const rows = data.map(row => keys.map(k => String(row[k])).join(' | '));
            return [header, separator, ...rows].join('\n');
        }
        return data.map((v, i) => `${i}: ${v}`).join('\n');
    }
    return JSON.stringify(data, null, 2);
}

// Main execute function
export async function executeCode(code, language) {
    if (!code.trim()) {
        return {
            success: true,
            output: '(no code to execute)',
            error: null,
            executionTime: '0s',
        };
    }

    switch (language.mode) {
        case 'browser':
            return executeJavaScript(code);
        case 'browser-html':
            return executeHTML(code);
        case 'api':
            return executeViaAPI(code, language);
        default:
            return {
                success: false,
                output: '',
                error: `Unsupported execution mode: ${language.mode}`,
                executionTime: '0s',
            };
    }
}
