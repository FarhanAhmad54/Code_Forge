// CodeForge — Main Application Entry Point
import './style.css';
import { LANGUAGES, getLanguageById, getDefaultLanguage } from './languages.js';
import { initEditor, setLanguage, setCode, getCode, getEditorInstance } from './editor.js';
import { executeCode } from './executor.js';
import { appendOutput, clearConsole, showStatus, showHTML } from './console.js';
import { initTheme, toggleTheme } from './theme.js';
import { downloadCode, copyCode, shareLink } from './share.js';
import { showToast } from './toast.js';
import {
    saveFile, loadFile, deleteFile, getAllFiles, getFileCount,
    getStorageUsed, getStoragePercent, formatBytes, formatTimestamp,
    setCurrentFile, getCurrentFile, scheduleAutoSave, forceAutoSave,
    getHistoryEntries, clearHistory, addRunHistory
} from './storage.js';
import { initFileUpload } from './fileUpload.js';
import { checkRateLimit, isSafeToExecute, addAuditEntry } from './security.js';
import { analyzeError, formatErrorIntelligence } from './errorIntelligence.js';
import { initDebugger, startDebugging, stepForward, stepBack, stopDebugging, isDebugging } from './debugger.js';
import { explainCode, formatExplanations } from './explainer.js';
import { CHALLENGES, isChallengeCompleted, checkChallengeOutput, getSolution, markChallengeCompleted } from './challenges.js';
import { publishSnippet, getAllSnippets, searchSnippets, toggleStar, forkSnippet, deleteSnippet } from './snippets.js';
import { initAccessibility, getAccessibilitySettings, updateSetting, announce, setupKeyboardNavigation, resetSettings } from './accessibility.js';
import { initCollaboration, destroyCollaboration, isCollaborating, generateRoomId, getConnectedUsers } from './collab.js';

let currentLanguage = getDefaultLanguage();
let isRunning = false;

function setCurrentLanguage(lang) {
    currentLanguage = lang;
}

// ---- Initialize ----
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize editor - wrap in try/catch so UI setup still runs
    try {
        await initEditor(document.getElementById('editor-container'));
    } catch (err) {
        console.error('Editor init failed:', err);
    }

    try { initTheme(); } catch (e) { console.error('Theme init error:', e); }

    // Try to restore last session
    try { restoreSession(); } catch (e) { console.error('Session restore error:', e); }

    // Set up all event listeners (each wrapped so one failure doesn't block others)
    try { buildLanguageDropdown(); } catch (e) { console.error('Dropdown build error:', e); }
    try { setupLanguageSelector(); } catch (e) { console.error('Lang selector error:', e); }
    try { setupRunButton(); } catch (e) { console.error('Run button error:', e); }
    try { setupPreviewButton(); } catch (e) { console.error('Preview button error:', e); }
    try { setupThemeToggle(); } catch (e) { console.error('Theme toggle error:', e); }
    try { setupShareMenu(); } catch (e) { console.error('Share menu error:', e); }
    try { setupCollaboration(); } catch (e) { console.error('Collab error:', e); }
    try { setupResizer(); } catch (e) { console.error('Resizer error:', e); }
    try { setupTerminalToggle(); } catch (e) { console.error('Terminal toggle error:', e); }
    try { setupClickOutside(); } catch (e) { console.error('Click outside error:', e); }
    try { setupFilesPanel(); } catch (e) { console.error('Files panel error:', e); }
    try { setupHomeButton(); } catch (e) { console.error('Home button error:', e); }
    try { setupAutoSave(); } catch (e) { console.error('Auto-save error:', e); }

    // New feature setups
    try { setupFileUploadFeature(); } catch (e) { console.error('File upload error:', e); }
    try { setupDebugger(); } catch (e) { console.error('Debugger error:', e); }
    try { setupChallenges(); } catch (e) { console.error('Challenges error:', e); }
    try { setupSnippetsPanel(); } catch (e) { console.error('Snippets error:', e); }
    try { setupExplainMode(); } catch (e) { console.error('Explain error:', e); }
    try { setupAccessibilityPanel(); } catch (e) { console.error('A11y error:', e); }
    try { initAccessibility(); } catch (e) { console.error('A11y init error:', e); }
    try { setupKeyboardNavigation(); } catch (e) { console.error('Keyboard nav error:', e); }

    // Load challenge from URL if present (e.g. ?challenge=e1)
    try { loadChallengeFromURL(); } catch (e) { console.error('Challenge URL load error:', e); }

    try { updateStorageDisplay(); } catch (e) { console.error('Storage display error:', e); }

    // Set initial language icon
    try {
        const defaultLang = currentLanguage;
        const iconImg = document.getElementById('lang-icon-img');
        if (iconImg) {
            iconImg.src = defaultLang.icon;
            iconImg.alt = defaultLang.name;
        }
        // Show/hide preview button for initial language
        const previewBtn = document.getElementById('preview-btn');
        if (previewBtn) {
            previewBtn.style.display = defaultLang.mode === 'browser-html' ? 'flex' : 'none';
        }
    } catch (e) { console.error('Initial icon error:', e); }

    // Load shared code if present in URL (AFTER setup, so UI is ready)
    try { loadSharedCode(); } catch (e) { console.error('Shared code error:', e); }

    // Auto-open files panel if coming from homepage History button
    if (window.location.hash === '#history') {
        setTimeout(() => {
            document.getElementById('files-btn')?.click();
        }, 500);
        // Clean the hash
        history.replaceState(null, '', window.location.pathname);
    }

    console.log('CodeForge initialized successfully');
});

// ---- Load Challenge from URL ----
function loadChallengeFromURL() {
    const params = new URLSearchParams(window.location.search);
    const challengeId = params.get('challenge');
    if (!challengeId) return;

    const ch = CHALLENGES.find(c => c.id === challengeId);
    if (!ch) return;

    // Load the challenge starter code
    const langId = currentLanguage.id;
    const starter = ch.starterCode[langId] || ch.starterCode.javascript || `// ${ch.title}\n// ${ch.description}\n`;
    setCode(starter);

    // Set active challenge for auto-checking
    window.__activeChallenge = ch.id;

    // Show toast
    showToast(`Challenge: ${ch.title} (${ch.difficulty}). Run your code to check!`, 'info');
    announce(`Challenge loaded: ${ch.title}`);

    // Clear the URL param so refreshing doesn't re-load
    history.replaceState(null, '', window.location.pathname);
}

// ---- Restore Session ----
function restoreSession() {
    const current = getCurrentFile();
    if (current) {
        const lang = getLanguageById(current.language);
        if (lang) {
            selectLanguage(lang);
            const file = loadFile(current.name);
            if (file && file.code) {
                setCode(file.code);
            }
        }
    }
}

// ---- Language Dropdown ----
function buildLanguageDropdown() {
    const dropdown = document.getElementById('language-dropdown');
    dropdown.innerHTML = '';

    LANGUAGES.forEach(lang => {
        const option = document.createElement('button');
        option.className = `lang-option ${lang.id === currentLanguage.id ? 'active' : ''}`;
        option.dataset.langId = lang.id;
        option.innerHTML = `
      <img class="lang-option-icon" src="${lang.icon}" alt="${lang.name}" width="20" height="20" />
      <span class="lang-option-name">${lang.name}</span>
      <span class="lang-option-mode">${lang.mode === 'browser' || lang.mode === 'browser-html' ? 'local' : 'api'}</span>
    `;
        dropdown.appendChild(option);
    });
}

function setupLanguageSelector() {
    const selector = document.getElementById('language-selector');
    const btn = document.getElementById('language-btn');
    const dropdown = document.getElementById('language-dropdown');

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        selector.classList.toggle('open');
        // Close share menu if open
        document.getElementById('share-menu')?.classList.remove('open');
    });

    dropdown.addEventListener('click', (e) => {
        const option = e.target.closest('.lang-option');
        if (!option) return;

        const lang = getLanguageById(option.dataset.langId);
        if (lang) {
            selectLanguage(lang);
            selector.classList.remove('open');
        }
    });
}

function selectLanguage(lang) {
    // Auto-save current work before switching
    const currentFileName = document.getElementById('file-name').textContent;
    const code = getCode();
    if (code && code.trim()) {
        forceAutoSave(currentFileName, code, currentLanguage.id);
    }

    currentLanguage = lang;

    // Update UI with img logos
    const iconImg = document.getElementById('lang-icon-img');
    if (iconImg) {
        iconImg.src = lang.icon;
        iconImg.alt = lang.name;
    }
    document.getElementById('lang-name').textContent = lang.name;
    const newFileName = `main.${lang.extension}`;
    document.getElementById('file-name').textContent = newFileName;

    // Update active state in dropdown
    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.langId === lang.id);
    });

    // Update editor
    setCurrentLanguage(lang);
    setLanguage(lang);

    // Show/hide preview button for HTML
    const previewBtn = document.getElementById('preview-btn');
    if (previewBtn) {
        previewBtn.style.display = lang.mode === 'browser-html' ? 'flex' : 'none';
    }

    // Try to load saved file for this language, or use default
    const savedFile = loadFile(newFileName);
    if (savedFile && savedFile.code) {
        setCode(savedFile.code);
    } else {
        const currentCode = getCode();
        const isDefaultCode = LANGUAGES.some(l => l.defaultCode.trim() === currentCode.trim());
        if (!currentCode.trim() || isDefaultCode) {
            setCode(lang.defaultCode);
        }
    }

    // Track current file
    setCurrentFile(newFileName, lang.id);
}

// ---- Run Button ----
function setupRunButton() {
    const runBtn = document.getElementById('run-btn');

    runBtn.addEventListener('click', runCode);

    // Keyboard shortcut: Ctrl + Enter
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            runCode();
        }
    });
}

async function runCode() {
    if (isRunning) return;

    const code = getCode();

    // Security checks
    if (!checkRateLimit()) return;
    if (!isSafeToExecute(code)) return;

    isRunning = true;

    const runBtn = document.getElementById('run-btn');
    runBtn.classList.add('running');
    runBtn.disabled = true;

    clearConsole();
    showStatus('running');
    announce('Running code...');

    // Auto-save before running
    const fileName = document.getElementById('file-name').textContent;
    forceAutoSave(fileName, code, currentLanguage.id);
    addRunHistory(fileName, currentLanguage.id);

    try {
        const result = await executeCode(code, currentLanguage);

        // Audit log
        addAuditEntry({
            action: 'execute',
            language: currentLanguage.id,
            code: code.substring(0, 200),
            outcome: result.success ? 'success' : 'error',
            executionTime: result.executionTime,
        });

        if (result.html !== undefined) {
            showHTML(result.html);
            announce('HTML preview rendered.');
        } else {
            if (result.output) {
                appendOutput(result.output, 'output');
            }
            if (result.error) {
                appendOutput(result.error, 'error');
                // Error Intelligence
                const analysis = analyzeError(result.error, currentLanguage.id);
                if (analysis) {
                    const outputEl = document.getElementById('console-output');
                    if (outputEl) {
                        const div = document.createElement('div');
                        div.innerHTML = formatErrorIntelligence(analysis);
                        outputEl.appendChild(div);
                    }
                }
            }

            // Execution insights: show memory and time
            const insights = [];
            if (result.executionTime) insights.push(`⏱ ${result.executionTime}`);
            if (result.memory) insights.push(`💾 ${(result.memory / 1024).toFixed(1)} KB`);
            showStatus(result.success ? 'success' : 'error', insights.join(' | ') || result.executionTime);
            announce(result.success ? 'Execution successful.' : 'Execution failed.');

            // Auto-check challenge if active
            if (window.__activeChallenge && result.output) {
                const checkResult = checkChallengeOutput(window.__activeChallenge, result.output);
                showChallengeResult(checkResult, window.__activeChallenge);
            }
        }
    } catch (err) {
        appendOutput(`Execution failed: ${err.message}`, 'error');
        showStatus('error', '0s');
        announce('Execution failed.');
    }

    runBtn.classList.remove('running');
    runBtn.disabled = false;
    isRunning = false;
    updateStorageDisplay();
}

// ---- Preview Button (HTML in new tab) ----
function setupPreviewButton() {
    const previewBtn = document.getElementById('preview-btn');
    if (!previewBtn) return;

    previewBtn.addEventListener('click', () => {
        const code = getCode();
        if (!code.trim()) {
            showToast('No code to preview', 'warning');
            return;
        }

        // Save first
        const fileName = document.getElementById('file-name').textContent;
        forceAutoSave(fileName, code, currentLanguage.id);

        // Open preview in new tab
        const blob = new Blob([code], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (win) {
            win.addEventListener('load', () => {
                // Revoke after load to free memory
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            });
        } else {
            showToast('Pop-up blocked! Allow pop-ups for preview.', 'error');
        }
    });
}

// ---- Theme Toggle ----
function setupThemeToggle() {
    document.getElementById('theme-toggle').addEventListener('click', () => {
        toggleTheme();
    });
}

// ---- Share Menu ----
function setupShareMenu() {
    const menu = document.getElementById('share-menu');
    const btn = document.getElementById('share-btn');

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('open');
        // Close language dropdown if open
        document.getElementById('language-selector')?.classList.remove('open');
    });

    document.getElementById('share-download').addEventListener('click', () => {
        downloadCode(getCode(), `main.${currentLanguage.extension}`);
        menu.classList.remove('open');
        showToast('File downloaded!', 'success');
    });

    document.getElementById('share-copy').addEventListener('click', () => {
        copyCode(getCode());
        menu.classList.remove('open');
        showToast('Code copied to clipboard!', 'success');
    });

    document.getElementById('share-link').addEventListener('click', () => {
        shareLink(getCode(), currentLanguage.id);
        menu.classList.remove('open');
        showToast('Share link copied!', 'success');
    });
}

// ---- Load Shared Code ----
function loadSharedCode() {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;

    try {
        const data = JSON.parse(atob(hash.substring(1)));
        if (data.code && data.lang) {
            const lang = getLanguageById(data.lang);
            if (lang) {
                selectLanguage(lang);
                setCode(data.code);
            }
        }
    } catch {
        // Invalid hash, ignore
    }
}

// ---- Home Button (auto-save & navigate) ----
function setupHomeButton() {
    const homeBtn = document.getElementById('home-btn');
    if (!homeBtn) return;

    homeBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // Auto-save before leaving
        const fileName = document.getElementById('file-name').textContent;
        const code = getCode();
        if (code && code.trim()) {
            forceAutoSave(fileName, code, currentLanguage.id);
        }

        // Navigate to home
        window.location.href = '/';
    });
}

// ---- Auto-save on typing ----
function setupAutoSave() {
    // Listen for editor changes - Monaco fires 'onDidChangeModelContent'
    // We'll use a polling approach since we can't access the Monaco instance directly
    let lastCode = getCode();

    setInterval(() => {
        const currentCode = getCode();
        if (currentCode !== lastCode) {
            lastCode = currentCode;
            scheduleAutoSave(
                () => document.getElementById('file-name').textContent,
                () => currentCode,
                () => currentLanguage.id
            );
        }
    }, 1000);

    // Save before page unload
    window.addEventListener('beforeunload', () => {
        const fileName = document.getElementById('file-name').textContent;
        const code = getCode();
        if (code && code.trim()) {
            forceAutoSave(fileName, code, currentLanguage.id);
        }
    });
}

// ---- Files Panel ----
function setupFilesPanel() {
    const filesBtn = document.getElementById('files-btn');
    const filsPanel = document.getElementById('files-panel');
    const overlay = document.getElementById('files-overlay');
    const closeBtn = document.getElementById('files-close');
    const saveCurrentBtn = document.getElementById('save-current-btn');

    function openPanel() {
        filsPanel.classList.add('open');
        overlay.style.display = 'block';
        setTimeout(() => overlay.classList.add('visible'), 10);
        renderFilesList();
        renderHistoryList();
        updateStorageDisplay();
    }

    function closePanel() {
        filsPanel.classList.remove('open');
        overlay.classList.remove('visible');
        setTimeout(() => { overlay.style.display = 'none'; }, 300);
    }

    filesBtn.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);

    // Save current file button
    saveCurrentBtn.addEventListener('click', () => {
        const fileName = document.getElementById('file-name').textContent;
        const code = getCode();

        if (!code.trim()) {
            showToast('Nothing to save — editor is empty', 'warning');
            return;
        }

        const storagePercent = getStoragePercent();
        if (storagePercent >= 100) {
            showToast('Storage full! Delete some files first.', 'error');
            return;
        }

        forceAutoSave(fileName, code, currentLanguage.id);
        setCurrentFile(fileName, currentLanguage.id);
        showToast(`Saved ${fileName}`, 'success');
        renderFilesList();
        updateStorageDisplay();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && filsPanel.classList.contains('open')) {
            closePanel();
        }
    });
}

function renderFilesList() {
    const list = document.getElementById('files-list');
    const files = getAllFiles();

    if (files.length === 0) {
        list.innerHTML = '<div class="panel-empty">No saved files yet.<br>Click "Save Current" to save your work.</div>';
        return;
    }

    list.innerHTML = files.map(file => {
        const lang = getLanguageById(file.language);
        const icon = lang ? lang.icon : '';
        const isActive = document.getElementById('file-name').textContent === file.name;

        return `
      <div class="file-item ${isActive ? 'active' : ''}" data-filename="${file.name}" data-lang="${file.language}">
        <div class="file-item-left">
          ${icon ? `<img src="${icon}" alt="" width="16" height="16" class="file-icon" />` : ''}
          <div class="file-item-info">
            <span class="file-item-name">${file.name}</span>
            <span class="file-item-meta">${formatBytes(file.size)} · ${formatTimestamp(file.updatedAt)}</span>
          </div>
        </div>
        <button class="file-delete-btn" data-filename="${file.name}" title="Delete file">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `;
    }).join('');

    // Click to load file
    list.querySelectorAll('.file-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.file-delete-btn')) return;

            const fileName = item.dataset.filename;
            const langId = item.dataset.lang;
            const file = loadFile(fileName);
            if (!file) return;

            const lang = getLanguageById(langId);
            if (lang) {
                selectLanguage(lang);
                setCode(file.code);
                setCurrentFile(fileName, langId);
                document.getElementById('file-name').textContent = fileName;
                showToast(`Loaded ${fileName}`, 'success');

                // Close panel
                document.getElementById('files-panel').classList.remove('open');
                document.getElementById('files-overlay').classList.remove('visible');
                setTimeout(() => { document.getElementById('files-overlay').style.display = 'none'; }, 300);
            }
        });
    });

    // Delete file
    list.querySelectorAll('.file-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const fileName = btn.dataset.filename;
            if (confirm(`Delete "${fileName}"?`)) {
                deleteFile(fileName);
                showToast(`Deleted ${fileName}`, 'success');
                renderFilesList();
                updateStorageDisplay();
            }
        });
    });
}

function renderHistoryList() {
    const list = document.getElementById('history-list');
    const history = getHistoryEntries();

    if (history.length === 0) {
        list.innerHTML = '<div class="panel-empty">No history yet.</div>';
        return;
    }

    // Show last 15 entries
    list.innerHTML = history.slice(0, 15).map(entry => {
        const actionIcons = {
            save: '💾',
            run: '▶️',
            delete: '🗑️',
        };

        const lang = entry.language ? getLanguageById(entry.language) : null;
        const icon = lang ? `<img src="${lang.icon}" alt="" width="12" height="12" />` : '';

        return `
      <div class="history-item">
        <span class="history-action">${actionIcons[entry.action] || '📝'}</span>
        <div class="history-info">
          <span class="history-file">${icon} ${entry.fileName || 'Unknown'}</span>
          <span class="history-time">${formatTimestamp(entry.timestamp)}</span>
        </div>
      </div>
    `;
    }).join('');
}

function updateStorageDisplay() {
    const used = getStorageUsed();
    const percent = getStoragePercent();

    // Update panel storage bar
    const fill = document.getElementById('storage-fill');
    const label = document.getElementById('storage-label');
    if (fill) fill.style.width = `${percent}%`;
    if (label) label.textContent = `${formatBytes(used)} / 15 MB`;

    // Update header storage indicator
    const text = document.getElementById('storage-text');
    if (text) text.textContent = formatBytes(used);
}


// ---- Terminal Toggle ----
function setupTerminalToggle() {
    const toggleBtn = document.getElementById('terminal-toggle-btn');
    const closeBtn = document.getElementById('close-terminal-btn');
    const editorSection = document.getElementById('editor-section');
    const outputSection = document.getElementById('output-section');
    const gutter = document.getElementById('gutter');

    if (!toggleBtn || !outputSection) return;

    let isTerminalOpen = true;
    let lastEditorSize = '60%';
    let lastOutputSize = '40%';
    let lastIsVertical = window.innerWidth <= 768;

    function toggleTerminal() {
        isTerminalOpen = !isTerminalOpen;
        const isVertical = window.innerWidth <= 768;

        if (isTerminalOpen) {
            if (isVertical !== lastIsVertical) {
                lastEditorSize = '60%';
                lastOutputSize = '40%';
            }

            outputSection.style.display = 'flex';
            gutter.style.display = isVertical ? 'block' : 'flex';

            if (isVertical) {
                editorSection.style.height = lastEditorSize;
                outputSection.style.height = lastOutputSize;
                editorSection.style.width = '100%';
                outputSection.style.width = '100%';
            } else {
                editorSection.style.width = lastEditorSize;
                outputSection.style.width = lastOutputSize;
                editorSection.style.height = '100%';
                outputSection.style.height = '100%';
            }
            toggleBtn.classList.add('active');
        } else {
            lastIsVertical = isVertical;
            if (isVertical) {
                lastEditorSize = editorSection.style.height || '60%';
                lastOutputSize = outputSection.style.height || '40%';
                editorSection.style.height = '100%';
            } else {
                lastEditorSize = editorSection.style.width || '60%';
                lastOutputSize = outputSection.style.width || '40%';
                editorSection.style.width = '100%';
            }

            outputSection.style.display = 'none';
            gutter.style.display = 'none';
            toggleBtn.classList.remove('active');
        }

        // Ensure Monaco editor resizes properly
        setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    }

    toggleBtn.addEventListener('click', toggleTerminal);
    if (isTerminalOpen) toggleBtn.classList.add('active');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (isTerminalOpen) toggleTerminal();
        });
    }
}

// ---- Resizable Panels ----
function setupResizer() {
    const container = document.getElementById('main-container');
    const gutter = document.getElementById('gutter');
    const editorSection = document.getElementById('editor-section');
    const outputSection = document.getElementById('output-section');

    if (!gutter || !container) return;

    let isResizing = false;
    let startX, startY;
    let startEditorSize;

    function getIsVertical() {
        return window.innerWidth <= 768;
    }

    gutter.addEventListener('mousedown', startResize);
    gutter.addEventListener('touchstart', startResize, { passive: false });

    function startResize(e) {
        e.preventDefault();
        isResizing = true;
        const rect = container.getBoundingClientRect();
        const isVertical = getIsVertical();

        if (e.type === 'touchstart') {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        } else {
            startX = e.clientX;
            startY = e.clientY;
        }

        if (isVertical) {
            startEditorSize = editorSection.getBoundingClientRect().height / rect.height * 100;
        } else {
            startEditorSize = editorSection.getBoundingClientRect().width / rect.width * 100;
        }

        document.body.style.cursor = isVertical ? 'row-resize' : 'col-resize';
        document.body.style.userSelect = 'none';
        gutter.classList.add('active');

        document.addEventListener('mousemove', doResize);
        document.addEventListener('touchmove', doResize, { passive: false });
        document.addEventListener('mouseup', stopResize);
        document.addEventListener('touchend', stopResize);
    }

    function doResize(e) {
        if (!isResizing) return;

        const rect = container.getBoundingClientRect();
        const isVertical = getIsVertical();
        let currentPos;

        if (e.type === 'touchmove') {
            e.preventDefault();
            currentPos = isVertical ? e.touches[0].clientY : e.touches[0].clientX;
        } else {
            currentPos = isVertical ? e.clientY : e.clientX;
        }

        let newSize;
        if (isVertical) {
            newSize = ((currentPos - rect.top) / rect.height) * 100;
        } else {
            newSize = ((currentPos - rect.left) / rect.width) * 100;
        }

        newSize = Math.max(20, Math.min(80, newSize));

        if (isVertical) {
            editorSection.style.height = `${newSize}%`;
            outputSection.style.height = `${100 - newSize}%`;
            editorSection.style.width = '100%';
            outputSection.style.width = '100%';
        } else {
            editorSection.style.width = `${newSize}%`;
            outputSection.style.width = `${100 - newSize}%`;
            editorSection.style.height = '100%';
            outputSection.style.height = '100%';
        }
    }

    function stopResize() {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        gutter.classList.remove('active');

        document.removeEventListener('mousemove', doResize);
        document.removeEventListener('touchmove', doResize);
        document.removeEventListener('mouseup', stopResize);
        document.removeEventListener('touchend', stopResize);
    }

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            editorSection.style.width = '';
            editorSection.style.height = '';
            outputSection.style.width = '';
            outputSection.style.height = '';
        }, 200);
    });
}

// ---- Click Outside to Close Dropdowns ----
function setupClickOutside() {
    document.addEventListener('click', (e) => {
        // Close language dropdown (toggle on parent .language-selector)
        const langSelector = document.getElementById('language-selector');
        if (langSelector && !langSelector.contains(e.target)) {
            langSelector.classList.remove('open');
        }

        // Close share dropdown (toggle on parent .share-menu)
        const shareMenu = document.getElementById('share-menu');
        if (shareMenu && !shareMenu.contains(e.target)) {
            shareMenu.classList.remove('open');
        }
    });
}

// ---- Clear Button ----
document.getElementById('clear-btn')?.addEventListener('click', clearConsole);

// ---- Collaboration ----
function setupCollaboration() {
    const collabBtn = document.getElementById('collab-btn');
    const collabModal = document.getElementById('collab-modal');
    const collabModalClose = document.getElementById('collab-modal-close');
    const collabCreate = document.getElementById('collab-create');
    const collabJoin = document.getElementById('collab-join');
    const collabRoomInput = document.getElementById('collab-room-input');
    const collabBar = document.getElementById('collab-bar');
    const collabRoomId = document.getElementById('collab-room-id');
    const collabUsers = document.getElementById('collab-users');
    const collabCopyLink = document.getElementById('collab-copy-link');
    const collabLeave = document.getElementById('collab-leave');

    if (!collabBtn) return;

    let usersInterval = null;

    function showCollabBar(roomId) {
        if (collabBar) {
            collabBar.style.display = 'flex';
            if (collabRoomId) collabRoomId.textContent = roomId;
        }
        // Poll connected users
        usersInterval = setInterval(() => {
            const users = getConnectedUsers();
            if (collabUsers) {
                collabUsers.innerHTML = users.map(u =>
                    `<span class="collab-user" style="background:${u.color}20; color:${u.color}; border:1px solid ${u.color}40; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:600;">${u.name}</span>`
                ).join('');
            }
        }, 2000);
    }

    function hideCollabBar() {
        if (collabBar) collabBar.style.display = 'none';
        if (usersInterval) {
            clearInterval(usersInterval);
            usersInterval = null;
        }
    }

    collabBtn.addEventListener('click', () => {
        if (isCollaborating()) {
            // Already in a session, toggle the bar visibility or leave
            destroyCollaboration();
            hideCollabBar();
            showToast('Left collaboration session.', 'info');
            announce('Left collaboration session.');
            return;
        }
        if (collabModal) collabModal.style.display = 'flex';
    });

    collabModalClose?.addEventListener('click', () => {
        if (collabModal) collabModal.style.display = 'none';
    });

    collabModal?.addEventListener('click', (e) => {
        if (e.target === collabModal) collabModal.style.display = 'none';
    });

    collabCreate?.addEventListener('click', async () => {
        const roomId = generateRoomId();
        const editor = getEditorInstance();
        if (!editor) {
            showToast('Editor not ready.', 'error');
            return;
        }

        showToast('Creating room...', 'info');
        const result = await initCollaboration(editor, roomId);
        if (result) {
            if (collabModal) collabModal.style.display = 'none';
            showCollabBar(roomId);
            showToast(`Room created! ID: ${roomId}`, 'success');
            announce(`Collaboration room created: ${roomId}`);
        } else {
            showToast('Failed to create room. Check console for errors.', 'error');
        }
    });

    collabJoin?.addEventListener('click', async () => {
        const roomId = collabRoomInput?.value?.trim();
        if (!roomId) {
            showToast('Please enter a room ID.', 'warning');
            return;
        }

        const editor = getEditorInstance();
        if (!editor) {
            showToast('Editor not ready.', 'error');
            return;
        }

        showToast('Joining room...', 'info');
        const result = await initCollaboration(editor, roomId);
        if (result) {
            if (collabModal) collabModal.style.display = 'none';
            showCollabBar(roomId);
            showToast(`Joined room: ${roomId}`, 'success');
            announce(`Joined collaboration room: ${roomId}`);
        } else {
            showToast('Failed to join room. Check console for errors.', 'error');
        }
    });

    collabCopyLink?.addEventListener('click', () => {
        const roomId = collabRoomId?.textContent;
        if (roomId) {
            navigator.clipboard.writeText(roomId).then(() => {
                showToast('Room ID copied!', 'success');
            }).catch(() => {
                showToast('Could not copy room ID.', 'error');
            });
        }
    });

    collabLeave?.addEventListener('click', () => {
        destroyCollaboration();
        hideCollabBar();
        showToast('Left collaboration session.', 'info');
        announce('Left collaboration session.');
    });
}

// ---- File Upload Feature ----
function setupFileUploadFeature() {
    initFileUpload((code, langId, fileName) => {
        const lang = getLanguageById(langId);
        if (lang) {
            selectLanguage(lang);
            setCode(code);
            document.getElementById('file-name').textContent = fileName;
            setCurrentFile(fileName, lang.id);
            announce(`Loaded file: ${fileName}`);
        }
    });
}

// ---- Debugger ----
function setupDebugger() {
    const debugBtn = document.getElementById('debug-btn');
    const debugBar = document.getElementById('debugger-bar');
    const debugStepBtn = document.getElementById('debug-step-btn');
    const debugBackBtn = document.getElementById('debug-back-btn');
    const debugStopBtn = document.getElementById('debug-stop-btn');
    const debugInfo = document.getElementById('debug-info');
    const debugVars = document.getElementById('debug-variables');

    if (!debugBtn) return;

    debugBtn.addEventListener('click', () => {
        if (currentLanguage.id !== 'javascript') {
            showToast('Debugger is currently available for JavaScript only.', 'warning');
            return;
        }

        const editor = getEditorInstance();
        if (!editor) return;

        initDebugger(editor, (state) => {
            if (state.running) {
                debugBar.style.display = 'flex';
                debugInfo.textContent = `Line ${state.currentLine + 1} / ${state.totalLines}`;

                // Show variables
                const vars = Object.entries(state.variables).filter(([k]) => !k.startsWith('_'));
                debugVars.innerHTML = vars.map(([k, v]) =>
                    `<span class="debug-var">${k} = ${typeof v === 'string' ? v : JSON.stringify(v)}</span>`
                ).join('');
            } else {
                debugBar.style.display = 'none';
                debugVars.innerHTML = '';
            }
        });

        const code = getCode();
        startDebugging(code);
    });

    debugStepBtn?.addEventListener('click', () => stepForward());
    debugBackBtn?.addEventListener('click', () => stepBack());
    debugStopBtn?.addEventListener('click', () => {
        stopDebugging();
        debugBar.style.display = 'none';
    });
}

// ---- Challenges ----
function setupChallenges() {
    const challengesBtn = document.getElementById('challenges-btn');
    const challengesModal = document.getElementById('challenges-modal');
    const challengesClose = document.getElementById('challenges-close');
    const challengesList = document.getElementById('challenges-list');

    if (!challengesBtn || !challengesModal) return;

    function renderChallenges() {
        challengesList.innerHTML = CHALLENGES.map(ch => {
            const completed = isChallengeCompleted(ch.id);
            return `
                <div class="challenge-item ${completed ? 'completed' : ''}" data-challenge-id="${ch.id}">
                    <div class="challenge-info">
                        <div class="challenge-title">${ch.title}</div>
                        <div class="challenge-meta">
                            <span class="challenge-difficulty ${ch.difficulty}">${ch.difficulty}</span>
                            <span class="challenge-category">${ch.category}</span>
                        </div>
                    </div>
                    <div class="challenge-actions">
                        ${completed ? '<span class="challenge-tick">✅</span>' : ''}
                        <button class="challenge-sol-btn" data-sol-id="${ch.id}" title="View Solution">💡</button>
                        <span class="challenge-play">▶️</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    challengesBtn.addEventListener('click', () => {
        renderChallenges();
        challengesModal.style.display = 'flex';
    });

    challengesClose?.addEventListener('click', () => {
        challengesModal.style.display = 'none';
    });

    challengesModal.addEventListener('click', (e) => {
        if (e.target === challengesModal) challengesModal.style.display = 'none';

        // View Solution button
        const solBtn = e.target.closest('.challenge-sol-btn');
        if (solBtn) {
            e.stopPropagation();
            const chId = solBtn.dataset.solId;
            showSolutionOverlay(chId);
            return;
        }

        const item = e.target.closest('.challenge-item');
        if (item) {
            const ch = CHALLENGES.find(c => c.id === item.dataset.challengeId);
            if (ch) {
                const langId = currentLanguage.id;
                const starter = ch.starterCode[langId] || ch.starterCode.javascript || `// ${ch.title}\n// ${ch.description}\n`;
                setCode(starter);
                challengesModal.style.display = 'none';
                showToast(`Challenge: ${ch.title}. Run your code to check!`, 'info');
                announce(`Challenge loaded: ${ch.title}`);

                // Store active challenge for auto-checking
                window.__activeChallenge = ch.id;
            }
        }
    });
}

// ---- Challenge Result Overlay ----
function showChallengeResult(result, challengeId) {
    // Remove existing overlay
    document.getElementById('challenge-result-overlay')?.remove();

    const ch = CHALLENGES.find(c => c.id === challengeId);
    const overlay = document.createElement('div');
    overlay.id = 'challenge-result-overlay';
    overlay.className = 'challenge-result-overlay';

    if (result.passed) {
        overlay.innerHTML = `
            <div class="challenge-result-card success">
                <div class="cr-icon">🎉</div>
                <h3>Challenge Completed!</h3>
                <p>"${ch?.title || 'Challenge'}" solved correctly.</p>
                <div class="cr-actions">
                    <button class="cr-btn cr-btn-primary" id="cr-next">Next Challenge</button>
                    <button class="cr-btn cr-btn-secondary" id="cr-close">Continue Coding</button>
                </div>
            </div>
        `;
    } else {
        overlay.innerHTML = `
            <div class="challenge-result-card failure">
                <div class="cr-icon">❌</div>
                <h3>Not Quite Right</h3>
                <p>${escapeHtml(result.message)}</p>
                <div class="cr-actions">
                    <button class="cr-btn cr-btn-primary" id="cr-retry">Try Again</button>
                    <button class="cr-btn cr-btn-solution" id="cr-show-sol" data-ch="${challengeId}">💡 Show Solution</button>
                    <button class="cr-btn cr-btn-secondary" id="cr-close">Close</button>
                </div>
            </div>
        `;
    }

    document.body.appendChild(overlay);

    // Event listeners
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.id === 'cr-close') {
            overlay.remove();
        }
        if (e.target.id === 'cr-retry') {
            overlay.remove();
            // Re-load the starter code
            if (ch) {
                const langId = currentLanguage.id;
                const starter = ch.starterCode[langId] || ch.starterCode.javascript || '';
                setCode(starter);
                showToast('Try again! Good luck! 💪', 'info');
            }
        }
        if (e.target.id === 'cr-next') {
            overlay.remove();
            window.__activeChallenge = null;
            document.getElementById('challenges-btn')?.click();
        }
        if (e.target.id === 'cr-show-sol') {
            overlay.remove();
            showSolutionOverlay(e.target.dataset.ch);
        }
    });
}

function showSolutionOverlay(challengeId) {
    document.getElementById('challenge-solution-overlay')?.remove();
    const ch = CHALLENGES.find(c => c.id === challengeId);
    const sol = getSolution(challengeId);

    const overlay = document.createElement('div');
    overlay.id = 'challenge-solution-overlay';
    overlay.className = 'challenge-result-overlay';
    overlay.innerHTML = `
        <div class="challenge-result-card solution">
            <div class="cr-icon">💡</div>
            <h3>Solution: ${ch?.title || 'Challenge'}</h3>
            <pre class="cr-solution-code">${escapeHtml(sol || 'No solution available.')}</pre>
            <div class="cr-actions">
                <button class="cr-btn cr-btn-primary" id="sol-load">Load Solution in Editor</button>
                <button class="cr-btn cr-btn-secondary" id="sol-close">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.id === 'sol-close') overlay.remove();
        if (e.target.id === 'sol-load') {
            setCode(sol);
            overlay.remove();
            showToast('Solution loaded. Run to verify!', 'info');
        }
    });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ---- Snippets Panel ----
function setupSnippetsPanel() {
    const snippetsBtn = document.getElementById('snippets-btn');
    const snippetsModal = document.getElementById('snippets-modal');
    const snippetsClose = document.getElementById('snippets-close');
    const snippetsList = document.getElementById('snippets-list');
    const snippetSearch = document.getElementById('snippet-search');
    const saveSnippetBtn = document.getElementById('save-snippet-btn');

    if (!snippetsBtn || !snippetsModal) return;

    function renderSnippets(filter = '') {
        const snippets = filter ? searchSnippets(filter) : getAllSnippets();
        if (snippets.length === 0) {
            snippetsList.innerHTML = '<div class="panel-empty">No snippets yet. Save your current code to start!</div>';
            return;
        }

        snippetsList.innerHTML = snippets.map(s => `
            <div class="snippet-item" data-snippet-id="${s.id}">
                <div class="snippet-header">
                    <span class="snippet-title">${s.title}</span>
                    <div class="snippet-actions">
                        <button class="snippet-action-btn ${s.starred ? 'starred' : ''}" data-action="star">⭐ ${s.stars}</button>
                        <button class="snippet-action-btn" data-action="fork">🔀</button>
                        <button class="snippet-action-btn" data-action="load">📥</button>
                        <button class="snippet-action-btn" data-action="delete">🗑️</button>
                    </div>
                </div>
                <div class="snippet-preview">${s.code.substring(0, 80)}...</div>
                <div class="snippet-meta">
                    <span>${s.language}</span>
                    <span>•</span>
                    <span>${new Date(s.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
    }

    snippetsBtn.addEventListener('click', () => {
        renderSnippets();
        snippetsModal.style.display = 'flex';
    });

    snippetsClose?.addEventListener('click', () => {
        snippetsModal.style.display = 'none';
    });

    snippetsModal.addEventListener('click', (e) => {
        if (e.target === snippetsModal) snippetsModal.style.display = 'none';
    });

    snippetSearch?.addEventListener('input', (e) => {
        renderSnippets(e.target.value);
    });

    saveSnippetBtn?.addEventListener('click', () => {
        const code = getCode();
        const title = prompt('Snippet title:', `${currentLanguage.name} snippet`);
        if (title) {
            publishSnippet(title, code, currentLanguage.id);
            renderSnippets();
            showToast('Snippet saved!', 'success');
        }
    });

    snippetsList?.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const item = btn.closest('.snippet-item');
        const snippetId = item?.dataset.snippetId;
        if (!snippetId) return;

        const action = btn.dataset.action;
        switch (action) {
            case 'star':
                toggleStar(snippetId);
                renderSnippets(snippetSearch?.value || '');
                break;
            case 'fork':
                forkSnippet(snippetId);
                renderSnippets(snippetSearch?.value || '');
                showToast('Snippet forked!', 'success');
                break;
            case 'load': {
                const snippets = getAllSnippets();
                const snippet = snippets.find(s => s.id === snippetId);
                if (snippet) {
                    const lang = getLanguageById(snippet.language);
                    if (lang) selectLanguage(lang);
                    setCode(snippet.code);
                    snippetsModal.style.display = 'none';
                    showToast('Snippet loaded!', 'success');
                }
                break;
            }
            case 'delete':
                if (confirm('Delete this snippet?')) {
                    deleteSnippet(snippetId);
                    renderSnippets(snippetSearch?.value || '');
                    showToast('Snippet deleted.', 'info');
                }
                break;
        }
    });
}

// ---- Explain Mode ----
function setupExplainMode() {
    const explainBtn = document.getElementById('explain-btn');
    const explainModal = document.getElementById('explain-modal');
    const explainClose = document.getElementById('explain-close');
    const explainBody = document.getElementById('explain-body');

    if (!explainBtn || !explainModal) return;

    explainBtn.addEventListener('click', () => {
        const code = getCode();
        const explanations = explainCode(code);
        explainBody.innerHTML = formatExplanations(explanations);
        explainModal.style.display = 'flex';
    });

    explainClose?.addEventListener('click', () => {
        explainModal.style.display = 'none';
    });

    explainModal.addEventListener('click', (e) => {
        if (e.target === explainModal) explainModal.style.display = 'none';
    });
}

// ---- Accessibility Panel ----
function setupAccessibilityPanel() {
    const a11yBtn = document.getElementById('a11y-btn');
    const a11yModal = document.getElementById('a11y-modal');
    const a11yClose = document.getElementById('a11y-close');

    if (!a11yBtn || !a11yModal) return;

    a11yBtn.addEventListener('click', () => {
        const settings = getAccessibilitySettings();

        // Sync UI to current settings
        const fontSize = document.getElementById('a11y-font-size');
        const fontSizeVal = document.getElementById('a11y-font-size-val');
        const lineSpacing = document.getElementById('a11y-line-spacing');
        const lineSpacingVal = document.getElementById('a11y-line-spacing-val');
        const fontFamily = document.getElementById('a11y-font');
        const highContrast = document.getElementById('a11y-high-contrast');
        const reducedMotion = document.getElementById('a11y-reduced-motion');

        if (fontSize) { fontSize.value = settings.fontSize; fontSizeVal.textContent = settings.fontSize; }
        if (lineSpacing) { lineSpacing.value = settings.lineSpacing; lineSpacingVal.textContent = settings.lineSpacing; }
        if (fontFamily) fontFamily.value = settings.fontFamily;
        if (highContrast) highContrast.checked = settings.highContrast;
        if (reducedMotion) reducedMotion.checked = settings.reducedMotion;

        a11yModal.style.display = 'flex';
    });

    a11yClose?.addEventListener('click', () => {
        a11yModal.style.display = 'none';
    });

    a11yModal.addEventListener('click', (e) => {
        if (e.target === a11yModal) a11yModal.style.display = 'none';
    });

    document.getElementById('a11y-font-size')?.addEventListener('input', (e) => {
        document.getElementById('a11y-font-size-val').textContent = e.target.value;
        updateSetting('fontSize', parseInt(e.target.value));
    });

    document.getElementById('a11y-line-spacing')?.addEventListener('input', (e) => {
        document.getElementById('a11y-line-spacing-val').textContent = e.target.value;
        updateSetting('lineSpacing', parseFloat(e.target.value));
    });

    document.getElementById('a11y-font')?.addEventListener('change', (e) => {
        updateSetting('fontFamily', e.target.value);
    });

    document.getElementById('a11y-high-contrast')?.addEventListener('change', (e) => {
        updateSetting('highContrast', e.target.checked);
    });

    document.getElementById('a11y-reduced-motion')?.addEventListener('change', (e) => {
        updateSetting('reducedMotion', e.target.checked);
    });

    document.getElementById('a11y-reset')?.addEventListener('click', () => {
        const defaults = resetSettings();
        // Sync UI back
        const fontSize = document.getElementById('a11y-font-size');
        const lineSpacing = document.getElementById('a11y-line-spacing');
        if (fontSize) { fontSize.value = defaults.fontSize; document.getElementById('a11y-font-size-val').textContent = defaults.fontSize; }
        if (lineSpacing) { lineSpacing.value = defaults.lineSpacing; document.getElementById('a11y-line-spacing-val').textContent = defaults.lineSpacing; }
        document.getElementById('a11y-font').value = defaults.fontFamily;
        document.getElementById('a11y-high-contrast').checked = defaults.highContrast;
        document.getElementById('a11y-reduced-motion').checked = defaults.reducedMotion;
        showToast('Accessibility settings reset.', 'info');
    });
}
