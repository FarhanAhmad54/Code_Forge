// Annotations — Line-level comments for CodeForge
// Comments stored per-file in localStorage

const ANNOTATIONS_KEY = 'codeforge_annotations';

function getAllAnnotations() {
    try {
        return JSON.parse(localStorage.getItem(ANNOTATIONS_KEY) || '{}');
    } catch { return {}; }
}

function saveAllAnnotations(data) {
    localStorage.setItem(ANNOTATIONS_KEY, JSON.stringify(data));
}

export function getAnnotationsForFile(fileName) {
    const all = getAllAnnotations();
    return all[fileName] || {};
}

export function addAnnotation(fileName, lineNumber, text, author = 'You') {
    const all = getAllAnnotations();
    if (!all[fileName]) all[fileName] = {};
    if (!all[fileName][lineNumber]) all[fileName][lineNumber] = [];

    all[fileName][lineNumber].push({
        id: 'ann_' + Date.now(),
        text,
        author,
        createdAt: Date.now(),
    });

    saveAllAnnotations(all);
    return all[fileName][lineNumber];
}

export function removeAnnotation(fileName, lineNumber, annotationId) {
    const all = getAllAnnotations();
    if (all[fileName]?.[lineNumber]) {
        all[fileName][lineNumber] = all[fileName][lineNumber].filter(a => a.id !== annotationId);
        if (all[fileName][lineNumber].length === 0) {
            delete all[fileName][lineNumber];
        }
        saveAllAnnotations(all);
    }
}

export function clearAnnotationsForFile(fileName) {
    const all = getAllAnnotations();
    delete all[fileName];
    saveAllAnnotations(all);
}

export function getAnnotationCount(fileName) {
    const annotations = getAnnotationsForFile(fileName);
    return Object.values(annotations).reduce((sum, arr) => sum + arr.length, 0);
}

// Apply annotation decorations to Monaco editor
export function applyAnnotationDecorations(editor, fileName) {
    const annotations = getAnnotationsForFile(fileName);
    const decorations = [];

    for (const [line, comments] of Object.entries(annotations)) {
        const lineNum = parseInt(line);
        const text = comments.map(c => `${c.author}: ${c.text}`).join(' | ');
        decorations.push({
            range: { startLineNumber: lineNum, startColumn: 1, endLineNumber: lineNum, endColumn: 1 },
            options: {
                isWholeLine: true,
                glyphMarginClassName: 'annotation-glyph',
                glyphMarginHoverMessage: { value: `💬 ${text}` },
                after: {
                    content: ` 💬 ${comments.length}`,
                    inlineClassName: 'annotation-inline',
                }
            }
        });
    }

    return editor.deltaDecorations([], decorations);
}
