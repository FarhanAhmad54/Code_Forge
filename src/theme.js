// Theme management module
const THEME_KEY = 'code-editor-theme';

let isDark = true;
let onThemeChangeCallbacks = [];

export function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    isDark = saved !== null ? saved === 'dark' : true;
    applyTheme();
    return isDark;
}

export function toggleTheme() {
    isDark = !isDark;
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    applyTheme();
    onThemeChangeCallbacks.forEach(cb => cb(isDark));
    return isDark;
}

export function isDarkTheme() {
    return isDark;
}

export function onThemeChange(callback) {
    onThemeChangeCallbacks.push(callback);
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}
