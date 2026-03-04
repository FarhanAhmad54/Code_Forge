// Accessibility Module for CodeForge
// Settings for font size, font family, contrast mode, line spacing
// ARIA live region management

import { getEditor } from './editor.js';

const A11Y_KEY = 'codeforge_accessibility';

const DEFAULT_SETTINGS = {
    fontSize: 15,
    fontFamily: 'default', // 'default', 'opendyslexic', 'comic-sans'
    highContrast: false,
    lineSpacing: 1.5,
    reducedMotion: false,
};

// Resolve the actual CSS font-family string from the setting key
function resolveFontFamily(key) {
    switch (key) {
        case 'opendyslexic':
            return "'OpenDyslexic', 'Comic Sans MS', sans-serif";
        case 'comic-sans':
            return "'Comic Sans MS', 'Comic Neue', cursive";
        default:
            return "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace";
    }
}

function getSettings() {
    try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(A11Y_KEY) || '{}') };
    } catch { return { ...DEFAULT_SETTINGS }; }
}

function saveSettings(settings) {
    localStorage.setItem(A11Y_KEY, JSON.stringify(settings));
}

export function initAccessibility() {
    const settings = getSettings();
    applySettings(settings);
    setupLiveRegion();
}

export function getAccessibilitySettings() {
    return getSettings();
}

export function updateSetting(key, value) {
    const settings = getSettings();
    settings[key] = value;
    saveSettings(settings);
    applySettings(settings);
    return settings;
}

function applySettings(settings) {
    const root = document.documentElement;

    // Resolve font family string
    const fontFamilyStr = resolveFontFamily(settings.fontFamily);

    // Set CSS custom properties (for any non-Monaco elements that use them)
    root.style.setProperty('--editor-font-size', `${settings.fontSize}px`);
    root.style.setProperty('--editor-font-family', fontFamilyStr);
    root.style.setProperty('--editor-line-height', `${settings.lineSpacing}`);

    // Load external font if needed
    if (settings.fontFamily === 'opendyslexic') {
        loadFont('OpenDyslexic', 'https://fonts.cdnfonts.com/css/opendyslexic');
    }

    // *** Update the Monaco editor instance directly ***
    const editor = getEditor();
    if (editor) {
        editor.updateOptions({
            fontSize: settings.fontSize,
            fontFamily: fontFamilyStr,
            lineHeight: Math.round(settings.fontSize * settings.lineSpacing),
        });
    }

    // High contrast mode
    if (settings.highContrast) {
        root.classList.add('high-contrast');
    } else {
        root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (settings.reducedMotion) {
        root.classList.add('reduced-motion');
    } else {
        root.classList.remove('reduced-motion');
    }
}

function loadFont(name, url) {
    if (!document.querySelector(`link[href="${url}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        document.head.appendChild(link);
    }
}

// ---- ARIA Live Region ----
let liveRegion = null;

function setupLiveRegion() {
    liveRegion = document.getElementById('aria-live-region');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
    }
}

export function announce(message) {
    if (!liveRegion) setupLiveRegion();
    liveRegion.textContent = '';
    // Small delay ensures screen reader picks up the change
    setTimeout(() => {
        liveRegion.textContent = message;
    }, 50);
}

// ---- Keyboard Navigation Helpers ----
export function setupKeyboardNavigation() {
    // Tab trapping in modals
    document.addEventListener('keydown', (e) => {
        const modal = document.querySelector('.modal-overlay[style*="flex"]');
        if (modal && e.key === 'Tab') {
            const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
    });
}

export function resetSettings() {
    saveSettings(DEFAULT_SETTINGS);
    applySettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
}
