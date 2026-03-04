// Developer Dashboard Logic
const API = 'http://localhost:3000/api';
let devToken = sessionStorage.getItem('dev_token') || '';
let currentPage = 1;
let autoRefreshTimer = null;

// ---- Elements ----
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const loginPassword = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const loginBtn = document.getElementById('login-btn');

// ---- Auth ----
async function attemptLogin(password) {
    loginBtn.disabled = true;
    loginBtn.textContent = 'Authenticating...';
    loginError.textContent = '';

    try {
        const res = await fetch(`${API}/dev/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        const data = await res.json();
        if (res.ok && data.ok) {
            devToken = data.token;
            sessionStorage.setItem('dev_token', devToken);
            showDashboard();
        } else {
            loginError.textContent = data.error || 'Authentication failed.';
        }
    } catch (err) {
        loginError.textContent = 'Server error. Is the backend running on port 3000?';
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Authenticate';
    }
}

function logout() {
    devToken = '';
    sessionStorage.removeItem('dev_token');
    clearInterval(autoRefreshTimer);
    dashboard.style.display = 'none';
    loginScreen.style.display = 'flex';
    loginPassword.value = '';
    loginError.textContent = '';
}

function showDashboard() {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'block';
    fetchAll();
    startAutoRefresh();
}

// ---- Data Fetching ----
function authHeaders() {
    return { 'Content-Type': 'application/json', 'x-dev-token': devToken };
}

async function fetchAnalytics() {
    try {
        const res = await fetch(`${API}/dev/analytics`, { headers: authHeaders() });
        if (res.status === 401) { logout(); return; }
        const data = await res.json();
        document.getElementById('s-total-msg').textContent = data.messages.total;
        document.getElementById('s-today-msg').textContent = data.messages.today;
        document.getElementById('s-week-msg').textContent = data.messages.week;
        document.getElementById('s-total-views').textContent = data.views.total;
        document.getElementById('s-today-views').textContent = data.views.today;
        document.getElementById('s-unique').textContent = data.views.uniqueVisitors;
    } catch (err) {
        console.error('Failed to fetch analytics:', err);
    }
}

async function fetchMessages(page = 1) {
    currentPage = page;
    const list = document.getElementById('messages-list');
    try {
        const res = await fetch(`${API}/dev/messages?page=${page}`, { headers: authHeaders() });
        if (res.status === 401) { logout(); return; }
        const data = await res.json();

        if (!data.messages.length) {
            list.innerHTML = '<div class="msg-empty">No messages yet.</div>';
            document.getElementById('pagination').innerHTML = '';
            return;
        }

        list.innerHTML = data.messages.map(msg => `
            <div class="msg-card" data-id="${msg.id}">
                <div class="msg-body">
                    <div class="msg-email">${escapeHTML(msg.email)}</div>
                    <div class="msg-text">${escapeHTML(msg.message)}</div>
                    <div class="msg-meta">
                        <span>${formatDate(msg.created_at)}</span>
                        <span>IP: ${msg.ip || 'unknown'}</span>
                    </div>
                </div>
                <button class="msg-delete" onclick="deleteMessage(${msg.id})">Delete</button>
            </div>
        `).join('');

        // Pagination
        const pag = document.getElementById('pagination');
        if (data.pages > 1) {
            let html = '';
            for (let i = 1; i <= data.pages; i++) {
                html += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="fetchMessages(${i})">${i}</button>`;
            }
            pag.innerHTML = html;
        } else {
            pag.innerHTML = '';
        }
    } catch (err) {
        list.innerHTML = '<div class="msg-empty">Failed to load messages.</div>';
    }
}

async function deleteMessage(id) {
    if (!confirm('Delete this message?')) return;
    try {
        await fetch(`${API}/dev/messages/${id}`, { method: 'DELETE', headers: authHeaders() });
        fetchAll();
    } catch (err) {
        alert('Failed to delete message.');
    }
}

// Make deleteMessage and fetchMessages globally accessible for onclick
window.deleteMessage = deleteMessage;
window.fetchMessages = fetchMessages;

function fetchAll() {
    fetchAnalytics();
    fetchMessages(currentPage);
    document.getElementById('last-updated').textContent = `Updated: ${new Date().toLocaleTimeString()}`;
}

function startAutoRefresh() {
    clearInterval(autoRefreshTimer);
    autoRefreshTimer = setInterval(fetchAll, 30000); // Every 30s
}

// ---- Helpers ----
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(iso) {
    try {
        const d = new Date(iso);
        return d.toLocaleString();
    } catch {
        return iso;
    }
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        attemptLogin(loginPassword.value.trim());
    });

    document.getElementById('refresh-btn').addEventListener('click', fetchAll);
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Auto-login if token in session
    if (devToken) {
        showDashboard();
    }
});
