// Console output panel management

let consoleEl = null;
let outputEl = null;
let iframeContainer = null;

export function initConsole() {
    consoleEl = document.getElementById('console-panel');
    outputEl = document.getElementById('console-output');
    iframeContainer = document.getElementById('iframe-container');
}

export function clearConsole() {
    if (outputEl) outputEl.innerHTML = '';
    if (iframeContainer) {
        iframeContainer.innerHTML = '';
        iframeContainer.style.display = 'none';
    }
}

export function appendOutput(text, type = 'log') {
    if (!outputEl) return;

    // Hide iframe container, show text output
    if (iframeContainer) iframeContainer.style.display = 'none';

    // Each line of output gets its own div for proper line breaks
    const lines = text.split('\n');
    lines.forEach((content) => {
        const line = document.createElement('div');
        line.className = `console-line console-${type}`;
        line.textContent = content;
        outputEl.appendChild(line);
    });

    outputEl.scrollTop = outputEl.scrollHeight;
}

export function showExecutionResult(result) {
    clearConsole();

    if (result.html !== undefined) {
        // HTML mode - render in iframe
        showHTMLOutput(result.html);
        return;
    }

    // Show status header
    const statusLine = document.createElement('div');
    statusLine.className = `console-status ${result.success ? 'success' : 'error'}`;
    statusLine.innerHTML = `
    <span class="status-icon">${result.success ? '✅' : '❌'}</span>
    <span class="status-text">${result.success ? 'Execution successful' : 'Execution failed'}</span>
    <span class="status-time">⏱ ${result.executionTime}</span>
  `;
    outputEl.appendChild(statusLine);

    // Show output
    if (result.output && result.output.trim()) {
        appendOutput(result.output, 'log');
    }

    // Show errors
    if (result.error) {
        appendOutput(result.error, 'error');
    }

    if (!result.output?.trim() && !result.error) {
        appendOutput('(no output)', 'muted');
    }
}

export function showHTMLOutput(html) {
    if (!iframeContainer || !outputEl) return;

    outputEl.innerHTML = '';
    iframeContainer.style.display = 'block';
    iframeContainer.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.sandbox = 'allow-scripts allow-same-origin';
    iframe.style.cssText = 'width:100%;height:100%;border:none;background:#fff;border-radius:8px;';
    iframeContainer.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
}

export function showLoading() {
    clearConsole();
    const loader = document.createElement('div');
    loader.className = 'console-loading';
    loader.innerHTML = `
    <div class="loading-spinner"></div>
    <span>Running code...</span>
  `;
    outputEl.appendChild(loader);
}

// showStatus: called by main.js  — 'running' shows loader, 'success'/'error' shows status bar
export function showStatus(type, executionTime) {
    if (!outputEl) {
        outputEl = document.getElementById('console-output');
    }

    if (type === 'running') {
        showLoading();
        return;
    }

    // Remove any existing loading spinner
    const existingLoader = outputEl?.querySelector('.console-loading');
    if (existingLoader) existingLoader.remove();

    const statusEl = document.createElement('div');
    statusEl.className = `console-status ${type}`;
    statusEl.innerHTML = `
    <span>${type === 'success' ? '✅' : '❌'}</span>
    <span>${type === 'success' ? 'Execution successful' : 'Execution failed'}</span>
    ${executionTime ? `<span class="status-time">⏱ ${executionTime}</span>` : ''}
  `;

    // Insert at top if there's existing output, or just append
    if (outputEl.firstChild) {
        outputEl.insertBefore(statusEl, outputEl.firstChild);
    } else {
        outputEl.appendChild(statusEl);
    }
}

// showHTML: alias for showHTMLOutput — called by main.js
export function showHTML(html) {
    showHTMLOutput(html);
}
