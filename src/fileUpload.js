// File Upload & Drag-and-Drop Handler for CodeForge
import { LANGUAGES, getLanguageById } from './languages.js';
import { showToast } from './toast.js';

// Extension to language ID mapping
const EXT_MAP = {};
LANGUAGES.forEach(lang => {
    EXT_MAP[lang.extension] = lang.id;
});

// Additional common extension mappings
Object.assign(EXT_MAP, {
    'jsx': 'javascript',
    'mjs': 'javascript',
    'cjs': 'javascript',
    'tsx': 'typescript',
    'h': 'c',
    'hpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'htm': 'html',
    'bash': 'bash',
    'zsh': 'bash',
    'R': 'r',
    'rmd': 'r',
});

let onFileLoaded = null; // callback: (code, langId, fileName) => void

export function initFileUpload(fileLoadedCallback) {
    onFileLoaded = fileLoadedCallback;
    setupDragAndDrop();
    setupUploadButton();
}

function setupDragAndDrop() {
    const editorSection = document.getElementById('editor-section');
    const dropOverlay = document.getElementById('drop-overlay');
    if (!editorSection || !dropOverlay) return;

    let dragCounter = 0;

    editorSection.addEventListener('dragenter', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter++;
        dropOverlay.classList.add('visible');
    });

    editorSection.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter--;
        if (dragCounter <= 0) {
            dragCounter = 0;
            dropOverlay.classList.remove('visible');
        }
    });

    editorSection.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    editorSection.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter = 0;
        dropOverlay.classList.remove('visible');

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    });

    // Also allow drag-drop on the entire document as a fallback
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());
}

function setupUploadButton() {
    const uploadBtn = document.getElementById('upload-file-btn');
    const uploadInput = document.getElementById('file-upload-input');
    if (!uploadBtn || !uploadInput) return;

    uploadBtn.addEventListener('click', () => {
        uploadInput.click();
    });

    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
            uploadInput.value = ''; // Reset for re-upload
        }
    });
}

function handleFile(file) {
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showToast('File too large. Maximum size is 2MB.', 'error');
        return;
    }

    const fileName = file.name;
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const langId = EXT_MAP[ext];

    if (!langId) {
        showToast(`Unsupported file type: .${ext}`, 'warning');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const code = e.target?.result;
        if (typeof code === 'string' && onFileLoaded) {
            onFileLoaded(code, langId, fileName);
            showToast(`Loaded ${fileName}`, 'success');
        }
    };
    reader.onerror = () => {
        showToast('Failed to read file', 'error');
    };
    reader.readAsText(file);
}

export function getExtensionMap() {
    return { ...EXT_MAP };
}
