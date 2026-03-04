// CodeForge Homepage — Interactions & Animations
import './home.css';

// ---- Particle Canvas Background ----
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const particles = [];
    const PARTICLE_COUNT = 60;
    const CONNECTION_DISTANCE = 150;
    const MOUSE_RADIUS = 200;
    const mouse = { x: -9999, y: -9999 };

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.radius = Math.random() * 2 + 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            // Some particles are code symbols
            this.isSymbol = Math.random() < 0.15;
            this.symbol = ['<', '>', '/', '{', '}', '(', ')', ';', '=', '+', '#', '::'][Math.floor(Math.random() * 12)];
            this.symbolOpacity = Math.random() * 0.15 + 0.05;
        }
        update() {
            // Mouse repulsion
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_RADIUS) {
                const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                this.vx += (dx / dist) * force * 0.3;
                this.vy += (dy / dist) * force * 0.3;
            }

            // Damping
            this.vx *= 0.99;
            this.vy *= 0.99;

            this.x += this.vx;
            this.y += this.vy;

            // Wrap around edges
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }
        draw() {
            if (this.isSymbol) {
                ctx.font = `${12 + this.radius * 3}px 'JetBrains Mono', monospace`;
                ctx.fillStyle = `rgba(129, 140, 248, ${this.symbolOpacity})`;
                ctx.fillText(this.symbol, this.x, this.y);
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(129, 140, 248, ${this.opacity})`;
                ctx.fill();
            }
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DISTANCE) {
                    const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.08;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(129, 140, 248, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawConnections();
        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });
}

// ---- Typing Animation ----
function initTypingAnimation() {
    const codeEl = document.getElementById('typing-code');
    const cursorEl = document.getElementById('cursor-blink');
    if (!codeEl) return;

    const codeSnippets = [
        {
            title: 'main.py',
            badge: 'Python',
            lines: [
                { text: '# Calculate Fibonacci sequence', cls: 'code-comment' },
                { text: 'def ', cls: 'code-keyword', append: [{ text: 'fibonacci', cls: 'code-function' }, { text: '(', cls: '' }, { text: 'n', cls: 'code-variable' }, { text: '):', cls: '' }] },
                { text: '    a, b = ', cls: '', append: [{ text: '0', cls: 'code-number' }, { text: ', ', cls: '' }, { text: '1', cls: 'code-number' }] },
                { text: '    for ', cls: 'code-keyword', append: [{ text: '_ ', cls: '' }, { text: 'in ', cls: 'code-keyword' }, { text: 'range', cls: 'code-function' }, { text: '(n):', cls: '' }] },
                { text: '        yield ', cls: 'code-keyword', append: [{ text: 'a', cls: 'code-variable' }] },
                { text: '        a, b = b, a + b', cls: '' },
                { text: '', cls: '' },
                { text: 'for ', cls: 'code-keyword', append: [{ text: 'num ', cls: '' }, { text: 'in ', cls: 'code-keyword' }, { text: 'fibonacci', cls: 'code-function' }, { text: '(', cls: '' }, { text: '10', cls: 'code-number' }, { text: '):', cls: '' }] },
                { text: '    print', cls: 'code-function', append: [{ text: '(num)', cls: '' }] },
            ]
        },
        {
            title: 'app.js',
            badge: 'JavaScript',
            lines: [
                { text: '// Fetch user data from API', cls: 'code-comment' },
                { text: 'const ', cls: 'code-keyword', append: [{ text: 'fetchUsers', cls: 'code-function' }, { text: ' = ', cls: '' }, { text: 'async ', cls: 'code-keyword' }, { text: '() => {', cls: '' }] },
                { text: '  const ', cls: 'code-keyword', append: [{ text: 'res ', cls: '' }, { text: '= ', cls: '' }, { text: 'await ', cls: 'code-keyword' }, { text: 'fetch', cls: 'code-function' }, { text: '(', cls: '' }, { text: "'https://api.example.com/users'", cls: 'code-string' }, { text: ')', cls: '' }] },
                { text: '  const ', cls: 'code-keyword', append: [{ text: 'data ', cls: '' }, { text: '= ', cls: '' }, { text: 'await ', cls: 'code-keyword' }, { text: 'res.json', cls: 'code-function' }, { text: '()', cls: '' }] },
                { text: '  return ', cls: 'code-keyword', append: [{ text: 'data', cls: '' }] },
                { text: '}', cls: '' },
                { text: '', cls: '' },
                { text: 'fetchUsers', cls: 'code-function', append: [{ text: '().', cls: '' }, { text: 'then', cls: 'code-function' }, { text: '(', cls: '' }, { text: 'console.log', cls: 'code-function' }, { text: ')', cls: '' }] },
            ]
        },
        {
            title: 'main.rs',
            badge: 'Rust',
            lines: [
                { text: '// Parallel processing with Rayon', cls: 'code-comment' },
                { text: 'fn ', cls: 'code-keyword', append: [{ text: 'main', cls: 'code-function' }, { text: '() {', cls: '' }] },
                { text: '    let ', cls: 'code-keyword', append: [{ text: 'nums: Vec<i32>', cls: '' }, { text: ' = ', cls: '' }, { text: '(0..100)', cls: 'code-number' }, { text: '.collect();', cls: '' }] },
                { text: '    let ', cls: 'code-keyword', append: [{ text: 'sum: i32', cls: '' }, { text: ' = nums', cls: '' }] },
                { text: '        .iter()', cls: '' },
                { text: '        .filter', cls: 'code-function', append: [{ text: '(|&&x| x % ', cls: '' }, { text: '2', cls: 'code-number' }, { text: ' == ', cls: 'code-operator' }, { text: '0', cls: 'code-number' }, { text: ')', cls: '' }] },
                { text: '        .sum();', cls: '' },
                { text: '    println!', cls: 'code-function', append: [{ text: '(', cls: '' }, { text: '"Sum: {}"', cls: 'code-string' }, { text: ', sum);', cls: '' }] },
                { text: '}', cls: '' },
            ]
        }
    ];

    let snippetIdx = 0;

    async function typeSnippet(snippet) {
        // Update header
        const titleEl = document.querySelector('.window-title');
        const badgeEl = document.querySelector('.window-badge');
        if (titleEl) titleEl.textContent = snippet.title;
        if (badgeEl) badgeEl.textContent = snippet.badge;

        codeEl.innerHTML = '';

        for (const line of snippet.lines) {
            const lineEl = document.createElement('div');
            lineEl.style.minHeight = '1.8em';

            // Build the full rich text for this line
            const segments = [];
            if (line.text) segments.push({ text: line.text, cls: line.cls });
            if (line.append) segments.push(...line.append);

            const fullText = segments.map(s => s.text).join('');
            let charIdx = 0;

            for (const segment of segments) {
                for (const char of segment.text) {
                    const span = document.createElement('span');
                    if (segment.cls) span.className = segment.cls;
                    span.textContent = char;
                    span.style.opacity = '0';
                    lineEl.appendChild(span);
                }
            }

            codeEl.appendChild(lineEl);

            // Animate characters appearing
            const chars = lineEl.querySelectorAll('span');
            for (const ch of chars) {
                ch.style.opacity = '1';
                await sleep(20 + Math.random() * 15);
            }
            await sleep(50);
        }

        // Pause before next snippet
        await sleep(4000);
    }

    async function loop() {
        while (true) {
            await typeSnippet(codeSnippets[snippetIdx]);
            snippetIdx = (snippetIdx + 1) % codeSnippets.length;
            // Fade out
            codeEl.style.transition = 'opacity 0.4s';
            codeEl.style.opacity = '0';
            await sleep(500);
            codeEl.style.opacity = '1';
        }
    }

    loop();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ---- Scroll Reveal Animations ----
function initScrollReveal() {
    const featureCards = document.querySelectorAll('.feature-card');
    const catCards = document.querySelectorAll('.lang-cat-card');
    const stepCards = document.querySelectorAll('.step-card');
    const sectionHeaders = document.querySelectorAll('.section-header-text');

    const allElements = [...featureCards, ...catCards, ...stepCards, ...sectionHeaders];

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.classList.add('visible');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    allElements.forEach((el, idx) => {
        // Use !important-level inline styles that we then clear when making visible
        el.style.setProperty('opacity', '0');
        el.style.setProperty('transform', 'translateY(30px)');
        el.style.setProperty('transition', `opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${(idx % 3) * 100}ms, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${(idx % 3) * 100}ms`);
        observer.observe(el);
    });

    // Fallback: reveal all elements after a timeout to prevent permanently hidden content
    setTimeout(() => {
        allElements.forEach(el => {
            if (!el.classList.contains('visible')) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
                el.classList.add('visible');
            }
        });
    }, 4000);
}

// ---- Stat Counter Animation ----
function initStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                animateCounter(el, target);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => observer.observe(el));
}

function animateCounter(el, target) {
    const duration = 1500;
    const start = performance.now();
    const suffix = el.closest('.stat')?.querySelector('.stat-label')?.textContent.includes('%') ? '' : '';

    function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4); // ease-out quart
        const current = Math.round(target * eased);
        el.textContent = current + suffix;
        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

// ---- Smooth Scroll for Anchor Links ----
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ---- Navbar Background on Scroll ----
function initNavScroll() {
    const nav = document.querySelector('.home-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(6, 6, 14, 0.85)';
            nav.style.borderBottomColor = 'rgba(255,255,255,0.08)';
        } else {
            nav.style.background = 'rgba(6, 6, 14, 0.6)';
            nav.style.borderBottomColor = 'rgba(255,255,255,0.06)';
        }
    });
}

// ---- Pause Carousel on Hover ----
function initCarouselHover() {
    document.querySelectorAll('.lang-scroll-track').forEach(track => {
        track.addEventListener('mouseenter', () => {
            track.style.animationPlayState = 'paused';
        });
        track.addEventListener('mouseleave', () => {
            track.style.animationPlayState = 'running';
        });
    });
}

// ---- Challenges Section ----
function initChallengesSection() {
    const grid = document.getElementById('challenge-grid');
    const tabs = document.getElementById('challenge-tabs');
    if (!grid || !tabs) return;

    // Dynamically import challenge data
    import('./challengesData.js').then(({ ALL_CHALLENGES, getChallengesByLevel }) => {
        let currentLevel = 'easy';

        function renderChallenges(level) {
            const challenges = getChallengesByLevel(level);
            grid.innerHTML = challenges.map((ch, i) => `
                <a href="editor.html?challenge=${ch.id}" class="challenge-card" data-delay="${(i % 4) * 50}">
                    <div class="challenge-card-header">
                        <span class="challenge-card-title">${ch.title}</span>
                        <span class="challenge-card-number">#${String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <div class="challenge-card-desc">${ch.description}</div>
                    <div class="challenge-card-footer">
                        <span class="challenge-diff-badge ${ch.difficulty}">${ch.difficulty}</span>
                        <span class="challenge-category">${ch.category}</span>
                    </div>
                </a>
            `).join('');
            grid.scrollTop = 0;

            // Stagger reveal
            grid.querySelectorAll('.challenge-card').forEach((card, i) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(15px)';
                setTimeout(() => {
                    card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, i * 30);
            });
        }

        // Tab clicks
        tabs.querySelectorAll('.challenge-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.querySelectorAll('.challenge-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentLevel = tab.dataset.level;
                renderChallenges(currentLevel);
            });
        });

        renderChallenges(currentLevel);
    });
}

// ---- Contact Form ----
function initContactForm() {
    const form = document.getElementById('contact-form');
    const msgInput = document.getElementById('contact-message');
    const counter = document.getElementById('word-counter');
    const submitBtn = document.getElementById('contact-submit');
    if (!form || !msgInput) return;

    const MIN_WORDS = 30;
    const MAX_WORDS = 250;
    const API_URL = 'http://localhost:3000/api/messages';

    function countWords(text) {
        return text.trim().split(/\s+/).filter(w => w.length > 0).length;
    }

    msgInput.addEventListener('input', () => {
        const words = countWords(msgInput.value);
        counter.textContent = `${words} / ${MIN_WORDS}-${MAX_WORDS} words`;
        if (words > MAX_WORDS || (words > 0 && words < MIN_WORDS)) {
            counter.classList.add('over-limit');
            submitBtn.disabled = words > MAX_WORDS;
        } else {
            counter.classList.remove('over-limit');
            submitBtn.disabled = false;
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('contact-email').value.trim();
        const message = msgInput.value.trim();

        if (!email || !message) {
            showHomeToast('Please fill in all fields.', 'error');
            return;
        }
        if (countWords(message) > MAX_WORDS) {
            showHomeToast('Message must be 250 words or less.', 'error');
            return;
        }
        if (countWords(message) < MIN_WORDS) {
            showHomeToast('Message must be at least 30 words.', 'error');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, message })
            });
            const data = await res.json();
            if (res.ok) {
                showHomeToast('Message sent successfully! ✉️', 'success');
                form.reset();
                counter.textContent = '0 / 30-250 words';
            } else {
                showHomeToast(data.error || 'Failed to send message.', 'error');
            }
        } catch (err) {
            showHomeToast('Network error. Is the server running?', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> Send Message`;
        }
    });
}

// ---- Simple Toast for Home Page ----
function showHomeToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `home-toast ${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600;
        color: white; margin-bottom: 8px; animation: fadeUp 0.4s ease;
        background: ${type === 'success' ? 'rgba(52,211,153,0.9)' : type === 'error' ? 'rgba(248,113,113,0.9)' : 'rgba(99,102,241,0.9)'};
        backdrop-filter: blur(10px); box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    `;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; }, 3000);
    setTimeout(() => toast.remove(), 3500);
}

// ---- Page View Tracking ----
function trackPageView() {
    try {
        fetch('http://localhost:3000/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page: window.location.pathname })
        }).catch(() => { });
    } catch { }
}

// ---- Init Everything ----
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initTypingAnimation();
    initScrollReveal();
    initStatCounters();
    initSmoothScroll();
    initNavScroll();
    initCarouselHover();
    initChallengesSection();
    initContactForm();
    trackPageView();
});
