// Share/Save functionality

// Download code as file
export function downloadCode(code, filename) {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'code.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Copy code to clipboard
export async function copyCode(code) {
    try {
        await navigator.clipboard.writeText(code);
    } catch {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

// Share via URL hash — accepts code and langId from main.js
export function shareLink(code, langId) {
    const payload = JSON.stringify({ lang: langId, code });
    const encoded = btoa(unescape(encodeURIComponent(payload)));
    const url = `${window.location.origin}${window.location.pathname}#${encoded}`;

    navigator.clipboard.writeText(url).catch(() => {
        prompt('Share this link:', url);
    });
}

// Legacy alias
export const shareCode = shareLink;
