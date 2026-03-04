// Debugger Lite — Step-by-Step JavaScript Execution
// Instruments code line-by-line with variable snapshots

import { showToast } from './toast.js';

let debugState = {
    lines: [],
    currentLine: 0,
    variables: {},
    running: false,
    paused: false,
    breakpoints: new Set(),
    decorations: [],
};

let editorInstance = null;
let onStepUpdate = null;

export function initDebugger(editor, stepCallback) {
    editorInstance = editor;
    onStepUpdate = stepCallback;
}

export function startDebugging(code) {
    const lines = code.split('\n');
    debugState = {
        lines,
        currentLine: 0,
        variables: {},
        running: true,
        paused: true,
        breakpoints: debugState.breakpoints,
        decorations: debugState.decorations,
    };

    highlightLine(0);
    updateDebugPanel();
    showToast('Debugger started. Use Step to advance.', 'info');
    return debugState;
}

export function stepForward() {
    if (!debugState.running) return;
    if (debugState.currentLine >= debugState.lines.length) {
        stopDebugging();
        return;
    }

    const line = debugState.lines[debugState.currentLine];
    executeLine(line);
    debugState.currentLine++;

    // Skip empty lines and comments
    while (debugState.currentLine < debugState.lines.length) {
        const nextLine = debugState.lines[debugState.currentLine].trim();
        if (nextLine === '' || nextLine.startsWith('//') || nextLine.startsWith('#')) {
            debugState.currentLine++;
        } else {
            break;
        }
    }

    if (debugState.currentLine >= debugState.lines.length) {
        stopDebugging();
        return;
    }

    highlightLine(debugState.currentLine);
    updateDebugPanel();
}

export function stepBack() {
    if (!debugState.running || debugState.currentLine <= 0) return;
    debugState.currentLine = Math.max(0, debugState.currentLine - 1);

    // Skip empty lines going backwards
    while (debugState.currentLine > 0) {
        const prevLine = debugState.lines[debugState.currentLine].trim();
        if (prevLine === '' || prevLine.startsWith('//') || prevLine.startsWith('#')) {
            debugState.currentLine--;
        } else {
            break;
        }
    }

    highlightLine(debugState.currentLine);
    updateDebugPanel();
}

export function stopDebugging() {
    debugState.running = false;
    debugState.paused = false;
    clearHighlight();
    updateDebugPanel();
    showToast('Debugger stopped.', 'info');
}

export function toggleBreakpoint(lineNumber) {
    if (debugState.breakpoints.has(lineNumber)) {
        debugState.breakpoints.delete(lineNumber);
    } else {
        debugState.breakpoints.add(lineNumber);
    }
}

function executeLine(line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) return;

    // Simple variable extraction patterns
    const letMatch = trimmed.match(/(?:let|const|var)\s+(\w+)\s*=\s*(.+?)(?:;|$)/);
    if (letMatch) {
        try {
            const value = evaluateSimple(letMatch[2]);
            debugState.variables[letMatch[1]] = value;
        } catch {
            debugState.variables[letMatch[1]] = letMatch[2];
        }
    }

    // Assignment pattern
    const assignMatch = trimmed.match(/^(\w+)\s*=\s*(.+?)(?:;|$)/);
    if (assignMatch && !trimmed.startsWith('let') && !trimmed.startsWith('const') && !trimmed.startsWith('var')) {
        try {
            const value = evaluateSimple(assignMatch[2]);
            debugState.variables[assignMatch[1]] = value;
        } catch {
            debugState.variables[assignMatch[1]] = assignMatch[2];
        }
    }

    // Function call console.log extraction
    const logMatch = trimmed.match(/console\.log\((.+)\)/);
    if (logMatch) {
        debugState.variables['_lastLog'] = logMatch[1];
    }
}

function evaluateSimple(expr) {
    const trimmed = expr.trim();
    // Numbers
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
    // Strings
    if (/^["'`].*["'`]$/.test(trimmed)) return trimmed.slice(1, -1);
    // Booleans
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    if (trimmed === 'null') return null;
    // Arrays
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) return trimmed;
    // Objects
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;

    return trimmed;
}

function highlightLine(lineNumber) {
    if (!editorInstance) return;

    const monaco = window.monaco || editorInstance.constructor;
    clearHighlight();

    debugState.decorations = editorInstance.deltaDecorations([], [
        {
            range: { startLineNumber: lineNumber + 1, startColumn: 1, endLineNumber: lineNumber + 1, endColumn: 1 },
            options: {
                isWholeLine: true,
                className: 'debug-current-line',
                glyphMarginClassName: 'debug-glyph-margin',
            }
        }
    ]);
}

function clearHighlight() {
    if (editorInstance && debugState.decorations.length > 0) {
        debugState.decorations = editorInstance.deltaDecorations(debugState.decorations, []);
    }
}

function updateDebugPanel() {
    if (onStepUpdate) {
        onStepUpdate({
            currentLine: debugState.currentLine,
            totalLines: debugState.lines.length,
            variables: { ...debugState.variables },
            running: debugState.running,
            currentCode: debugState.lines[debugState.currentLine] || '',
        });
    }
}

export function getDebugState() {
    return { ...debugState };
}

export function isDebugging() {
    return debugState.running;
}
