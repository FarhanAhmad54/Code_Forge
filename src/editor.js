// Monaco Editor setup and management
import * as monaco from 'monaco-editor';
import { getDefaultLanguage } from './languages.js';

let editorInstance = null;
let currentLanguage = getDefaultLanguage();

// Configure Monaco workers
self.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === 'json') {
            return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url), { type: 'module' });
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return new Worker(new URL('monaco-editor/esm/vs/language/css/css.worker.js', import.meta.url), { type: 'module' });
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return new Worker(new URL('monaco-editor/esm/vs/language/html/html.worker.js', import.meta.url), { type: 'module' });
        }
        if (label === 'typescript' || label === 'javascript') {
            return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url), { type: 'module' });
        }
        return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' });
    }
};

export function initEditor(container, isDark = true) {
    editorInstance = monaco.editor.create(container, {
        value: currentLanguage.defaultCode,
        language: currentLanguage.monacoId,
        theme: isDark ? 'vs-dark' : 'vs',
        fontSize: 15,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
        fontLigatures: true,
        minimap: { enabled: true, scale: 1 },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 16, bottom: 16 },
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        bracketPairColorization: { enabled: true },
        roundedSelection: true,
        renderLineHighlight: 'all',
        lineNumbers: 'on',
        wordWrap: 'on',
        tabSize: 2,
        suggest: { showMethods: true, showFunctions: true, showVariables: true },
        scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
            verticalSliderSize: 8,
        },
    });

    // Add keyboard shortcut: Ctrl+Enter to run
    editorInstance.addAction({
        id: 'run-code',
        label: 'Run Code',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
        run: () => {
            document.getElementById('run-btn')?.click();
        }
    });

    return editorInstance;
}

export function getEditor() {
    return editorInstance;
}

export function getCode() {
    return editorInstance?.getValue() || '';
}

export function setCode(code) {
    editorInstance?.setValue(code);
}

export function setLanguage(language) {
    currentLanguage = language;
    const model = editorInstance?.getModel();
    if (model) {
        monaco.editor.setModelLanguage(model, language.monacoId);
    }
}

export function setTheme(isDark) {
    monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs');
}

export function getCurrentLanguage() {
    return currentLanguage;
}

export function setCurrentLanguage(lang) {
    currentLanguage = lang;
}

export function layout() {
    editorInstance?.layout();
}

export function getEditorInstance() {
    return editorInstance;
}
