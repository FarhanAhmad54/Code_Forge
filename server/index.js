import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { run, query, get } from './database.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const DEV_PASSWORD = process.env.DEV_PASSWORD;

if (!DEV_PASSWORD) {
    console.warn('WARNING: DEV_PASSWORD is not set in .env. Developer endpoints will be inaccessible.');
}

// ---- Helpers ----
function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
}

function devAuth(req, res, next) {
    const token = req.headers['x-dev-token'];
    if (!token || token !== DEV_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function countWords(text) {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

// ---- Public Endpoints ----

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Track page view
app.post('/api/track', async (req, res) => {
    try {
        const { page } = req.body;
        const ip = getClientIP(req);
        const ua = req.headers['user-agent'] || '';
        await run('INSERT INTO page_views (page, ip, user_agent) VALUES (?, ?, ?)', [page || '/', ip, ua]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Tracking failed' });
    }
});

// Submit contact message
app.post('/api/messages', async (req, res) => {
    try {
        const { email, message } = req.body;
        const ip = getClientIP(req);

        // Validate
        if (!email || !message) {
            return res.status(400).json({ error: 'Email and message are required.' });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email address.' });
        }
        if (countWords(message) > 250) {
            return res.status(400).json({ error: 'Message must be 250 words or less.' });
        }
        if (countWords(message) < 30) {
            return res.status(400).json({ error: 'Message must be at least 30 words.' });
        }
        if (message.trim().length < 5) {
            return res.status(400).json({ error: 'Message is too short.' });
        }

        // Rate limit: 1 message per IP per 24 hours
        const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
        const recent = await get(
            "SELECT COUNT(*) as cnt FROM rate_limits WHERE ip = ? AND action = 'message' AND created_at > ?",
            [ip, oneDayAgo]
        );
        if (recent && recent.cnt >= 1) {
            return res.status(429).json({ error: 'You can only send one message per 24 hours. Please try again later.' });
        }

        // Save message
        await run('INSERT INTO messages (email, message, ip) VALUES (?, ?, ?)', [email, message.trim(), ip]);
        // Track rate limit
        await run("INSERT INTO rate_limits (ip, action) VALUES (?, 'message')", [ip]);

        res.json({ ok: true, message: 'Message sent successfully!' });
    } catch (err) {
        console.error('Message submit error:', err);
        res.status(500).json({ error: 'Failed to send message. Try again later.' });
    }
});

// ---- Dev Endpoints (Protected) ----

// Dev login
app.post('/api/dev/login', (req, res) => {
    const { password } = req.body;
    if (password === DEV_PASSWORD) {
        res.json({ ok: true, token: DEV_PASSWORD });
    } else {
        // Slow down brute force
        setTimeout(() => {
            res.status(401).json({ error: 'Invalid password.' });
        }, 1000);
    }
});

// Get analytics
app.get('/api/dev/analytics', devAuth, async (req, res) => {
    try {
        const totalMessages = await get('SELECT COUNT(*) as cnt FROM messages');
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const messagesToday = await get('SELECT COUNT(*) as cnt FROM messages WHERE created_at > ?', [todayStart.toISOString()]);
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        const messagesWeek = await get('SELECT COUNT(*) as cnt FROM messages WHERE created_at > ?', [weekAgo]);
        const totalViews = await get('SELECT COUNT(*) as cnt FROM page_views');
        const viewsToday = await get('SELECT COUNT(*) as cnt FROM page_views WHERE created_at > ?', [todayStart.toISOString()]);
        const uniqueVisitors = await get('SELECT COUNT(DISTINCT ip) as cnt FROM page_views');

        res.json({
            messages: { total: totalMessages?.cnt || 0, today: messagesToday?.cnt || 0, week: messagesWeek?.cnt || 0 },
            views: { total: totalViews?.cnt || 0, today: viewsToday?.cnt || 0, uniqueVisitors: uniqueVisitors?.cnt || 0 }
        });
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ error: 'Failed to fetch analytics.' });
    }
});

// Get messages
app.get('/api/dev/messages', devAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;
        const messages = await query('SELECT id, email, message, ip, created_at FROM messages ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
        const total = await get('SELECT COUNT(*) as cnt FROM messages');
        res.json({ messages, total: total?.cnt || 0, page, pages: Math.ceil((total?.cnt || 0) / limit) });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages.' });
    }
});

// Delete message
app.delete('/api/dev/messages/:id', devAuth, async (req, res) => {
    try {
        await run('DELETE FROM messages WHERE id = ?', [req.params.id]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete message.' });
    }
});

// ---- Start Server ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`CodeForge Backend Server running on port ${PORT}`);
});
