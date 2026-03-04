// Snippet Library for CodeForge
// Save, browse, star, and fork code snippets (local-first)

const SNIPPETS_KEY = 'codeforge_snippets';

function getSnippets() {
    try {
        return JSON.parse(localStorage.getItem(SNIPPETS_KEY) || '[]');
    } catch { return []; }
}

function saveSnippets(snippets) {
    localStorage.setItem(SNIPPETS_KEY, JSON.stringify(snippets));
}

export function publishSnippet(title, code, language, description = '') {
    const snippets = getSnippets();
    const snippet = {
        id: 'snip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        title,
        code,
        language,
        description,
        stars: 0,
        starred: false,
        forkCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
    snippets.unshift(snippet);
    saveSnippets(snippets);
    return snippet;
}

export function getAllSnippets() {
    return getSnippets();
}

export function getSnippetsByLanguage(language) {
    return getSnippets().filter(s => s.language === language);
}

export function searchSnippets(query) {
    const q = query.toLowerCase();
    return getSnippets().filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.language.toLowerCase().includes(q)
    );
}

export function toggleStar(snippetId) {
    const snippets = getSnippets();
    const snippet = snippets.find(s => s.id === snippetId);
    if (snippet) {
        snippet.starred = !snippet.starred;
        snippet.stars += snippet.starred ? 1 : -1;
        saveSnippets(snippets);
    }
    return snippet;
}

export function forkSnippet(snippetId) {
    const snippets = getSnippets();
    const original = snippets.find(s => s.id === snippetId);
    if (!original) return null;

    original.forkCount++;
    const fork = {
        ...original,
        id: 'snip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        title: `${original.title} (Fork)`,
        stars: 0,
        starred: false,
        forkCount: 0,
        createdAt: Date.now(),
        forkedFrom: snippetId,
    };

    snippets.unshift(fork);
    saveSnippets(snippets);
    return fork;
}

export function deleteSnippet(snippetId) {
    const snippets = getSnippets().filter(s => s.id !== snippetId);
    saveSnippets(snippets);
}

export function getStarredSnippets() {
    return getSnippets().filter(s => s.starred);
}
