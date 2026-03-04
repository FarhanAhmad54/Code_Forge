// LocalStorage-based file system for CodeForge
// Supports saving files, history tracking, and 15MB storage limit

const STORAGE_KEY = 'codeforge_files';
const HISTORY_KEY = 'codeforge_history';
const CURRENT_FILE_KEY = 'codeforge_current';
const MAX_STORAGE_BYTES = 15 * 1024 * 1024; // 15MB
const MAX_HISTORY_ITEMS = 50;

// ---- File Storage ----

function getStoredFiles() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch {
        return {};
    }
}

function saveStoredFiles(files) {
    try {
        const json = JSON.stringify(files);
        localStorage.setItem(STORAGE_KEY, json);
        return true;
    } catch (e) {
        console.error('Storage save failed:', e);
        return false;
    }
}

export function getStorageUsed() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('codeforge_')) {
            total += localStorage.getItem(key).length * 2; // UTF-16 bytes
        }
    }
    return total;
}

export function getStoragePercent() {
    return Math.min(100, (getStorageUsed() / MAX_STORAGE_BYTES) * 100);
}

export function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Save a file to storage
export function saveFile(name, code, language) {
    const files = getStoredFiles();
    const now = Date.now();

    files[name] = {
        name,
        code,
        language, // language id string
        createdAt: files[name]?.createdAt || now,
        updatedAt: now,
        size: new Blob([code]).size,
    };

    const success = saveStoredFiles(files);
    if (success) {
        addToHistory({
            action: 'save',
            fileName: name,
            language,
            timestamp: now,
            codePreview: code.substring(0, 100),
        });
    }
    return success;
}

// Load a file from storage
export function loadFile(name) {
    const files = getStoredFiles();
    return files[name] || null;
}

// Delete a file from storage
export function deleteFile(name) {
    const files = getStoredFiles();
    if (files[name]) {
        delete files[name];
        saveStoredFiles(files);
        addToHistory({
            action: 'delete',
            fileName: name,
            timestamp: Date.now(),
        });
        return true;
    }
    return false;
}

// Rename a file
export function renameFile(oldName, newName) {
    const files = getStoredFiles();
    if (files[oldName] && !files[newName]) {
        files[newName] = { ...files[oldName], name: newName, updatedAt: Date.now() };
        delete files[oldName];
        saveStoredFiles(files);
        return true;
    }
    return false;
}

// Get all files as sorted array
export function getAllFiles() {
    const files = getStoredFiles();
    return Object.values(files).sort((a, b) => b.updatedAt - a.updatedAt);
}

// Get total file count
export function getFileCount() {
    return Object.keys(getStoredFiles()).length;
}

// ---- Current File Tracking ----

export function setCurrentFile(name, language) {
    localStorage.setItem(CURRENT_FILE_KEY, JSON.stringify({ name, language }));
}

export function getCurrentFile() {
    try {
        const data = localStorage.getItem(CURRENT_FILE_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

// ---- Auto-save ----

let autoSaveTimer = null;

export function scheduleAutoSave(getName, getCode, getLanguage) {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        const name = getName();
        const code = getCode();
        const lang = getLanguage();
        if (name && code.trim()) {
            saveFile(name, code, lang);
        }
    }, 2000); // 2-second debounce
}

export function forceAutoSave(name, code, language) {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    if (name && code.trim()) {
        saveFile(name, code, language);
    }
}

// ---- History ----

function getHistory() {
    try {
        const data = localStorage.getItem(HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveHistory(history) {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
        // If storage is full, trim history
        history = history.slice(0, 20);
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch { }
    }
}

function addToHistory(entry) {
    const history = getHistory();
    history.unshift(entry);
    // Keep only MAX_HISTORY_ITEMS entries
    if (history.length > MAX_HISTORY_ITEMS) {
        history.length = MAX_HISTORY_ITEMS;
    }
    saveHistory(history);
}

export function getHistoryEntries() {
    return getHistory();
}

export function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
}

// Add run entry to history
export function addRunHistory(fileName, language) {
    addToHistory({
        action: 'run',
        fileName,
        language,
        timestamp: Date.now(),
    });
}

// Format timestamp to readable date
export function formatTimestamp(ts) {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}
