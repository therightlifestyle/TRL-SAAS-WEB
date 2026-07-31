'use strict';

// ── HELPERS ──
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── LOADER ──
const loader = document.getElementById('loader');
let loaderHidden = false;
function hideLoader() {
    if (loaderHidden) return;
    loaderHidden = true;
    loader.classList.add('hidden');
}
window.addEventListener('load', () => setTimeout(hideLoader, 400));
// Hard fallback: never trap the page behind the loader, even if 'load' hangs
setTimeout(hideLoader, 3500);

// ── CUSTOM CURSOR (desktop, precise pointers only) ──
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
const finePointer = window.matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)').matches;

if (finePointer && !reducedMotion) {
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        // The follower's CSS transition on left/top creates the lag — no timers needed
        follower.style.left = e.clientX + 'px';
        follower.style.top = e.clientY + 'px';
    }, { passive: true });

    document.querySelectorAll('a, button, .ecosystem-card, .value-card, .faq-question').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%,-50%) scale(2)';
            follower.style.transform = 'translate(-50%,-50%) scale(1.4)';
            follower.style.borderColor = 'rgba(37,99,235,0.7)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%,-50%) scale(1)';
            follower.style.transform = 'translate(-50%,-50%) scale(1)';
            follower.style.borderColor = 'rgba(37,99,235,0.4)';
        });
    });
}

// ── PARTICLE CANVAS (paused off-screen, retina-sharp, reduced-motion aware) ──
const canvas = document.getElementById('particleCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let cw = 0, ch = 0, particleRaf = null;

const particles = Array.from({ length: 55 }, () => ({
    x: 0, y: 0,
    r: Math.random() * 1.5 + 0.3,
    dx: (Math.random() - 0.5) * 0.35,
    dy: (Math.random() - 0.5) * 0.35,
    opacity: Math.random() * 0.4 + 0.1
}));

function resizeCanvas() {
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = window.innerWidth;
    ch = window.innerHeight;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles.forEach(p => {
        if (p.x === 0 && p.y === 0) {
            p.x = Math.random() * cw;
            p.y = Math.random() * ch;
        } else {
            // pull particles back in bounds after the window shrinks
            p.x = Math.min(p.x, cw);
            p.y = Math.min(p.y, ch);
        }
    });
}

function drawParticles() {
    ctx.clearRect(0, 0, cw, ch);
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,153,255,${p.opacity})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > cw) p.dx *= -1;
        if (p.y < 0 || p.y > ch) p.dy *= -1;
    });
    particleRaf = requestAnimationFrame(drawParticles);
}

function startParticles() {
    if (!ctx || particleRaf !== null) return;
    particleRaf = requestAnimationFrame(drawParticles);
}
function stopParticles() {
    if (particleRaf === null) return;
    cancelAnimationFrame(particleRaf);
    particleRaf = null;
}

if (ctx && !reducedMotion) {
    resizeCanvas();
    // Only burn CPU while the hero is actually visible
    new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) startParticles();
        else stopParticles();
    }).observe(canvas);
}

// ── TYPED TEXT ──
const words = ['Ambitious People', 'Builders', 'Entrepreneurs', 'Dreamers', 'Founders', 'The Future'];
const typedEl = document.getElementById('typedText');

if (reducedMotion) {
    typedEl.textContent = words[0];
} else {
    let wIndex = 0, cIndex = 0, deleting = false;
    (function type() {
        const word = words[wIndex];
        if (!deleting) {
            typedEl.textContent = word.slice(0, ++cIndex);
            if (cIndex === word.length) {
                deleting = true;
                setTimeout(type, 1800);
                return;
            }
        } else {
            typedEl.textContent = word.slice(0, --cIndex);
            if (cIndex === 0) {
                deleting = false;
                wIndex = (wIndex + 1) % words.length;
            }
        }
        setTimeout(type, deleting ? 55 : 85);
    })();
}

// ── SCROLL FADE ──
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 75);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.08 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ── COUNTER ANIMATION ──
function animateCounter(el) {
    const target = +el.dataset.target;
    if (reducedMotion) {
        el.textContent = target + '+';
        return;
    }
    let count = 0;
    const step = target / 40;
    const timer = setInterval(() => {
        count = Math.min(count + step, target);
        el.textContent = Math.floor(count) + '+';
        if (count >= target) clearInterval(timer);
    }, 40);
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

// ── UNIFIED SCROLL HANDLER (rAF-throttled) ──
const navbar = document.getElementById('navbar');
const backTop = document.getElementById('backTop');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
let scrollTicking = false;

function onScroll() {
    const y = window.scrollY;
    const wide = window.innerWidth > 900;

    navbar.style.padding = y > 60
        ? (wide ? '11px 48px' : '11px 20px')
        : (wide ? '16px 48px' : '13px 20px');

    backTop.classList.toggle('show', y > 400);

    let current = '';
    sections.forEach(section => {
        if (y >= section.offsetTop - 120) current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });

    scrollTicking = false;
}

window.addEventListener('scroll', () => {
    if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(onScroll);
    }
}, { passive: true });

// ── BACK TO TOP ──
backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
});

// ── MOBILE MENU ──
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

function setMenu(open) {
    mobileMenu.classList.toggle('open', open);
    menuBtn.textContent = open ? '✕' : '☰';
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

menuBtn.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));

mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenu(false));
});

// Close on outside click
document.addEventListener('click', (e) => {
    if (mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !menuBtn.contains(e.target)) {
        setMenu(false);
    }
});

// Close on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        setMenu(false);
        menuBtn.focus();
    }
});

// ── RESIZE (rAF-throttled, single listener) ──
let resizeTicking = false;
window.addEventListener('resize', () => {
    if (resizeTicking) return;
    resizeTicking = true;
    requestAnimationFrame(() => {
        resizeCanvas();
        if (window.innerWidth > 900 && mobileMenu.classList.contains('open')) setMenu(false);
        onScroll(); // refresh navbar padding + active link for the new width
        resizeTicking = false;
    });
});

// ── THEME TOGGLE (persisted, honors saved choice + system preference) ──
const themeBtn = document.getElementById('themeBtn');
const rootEl = document.documentElement;
let light = rootEl.classList.contains('light-mode'); // set pre-paint by the inline <head> script
themeBtn.textContent = light ? '☀️' : '🌙';
themeBtn.addEventListener('click', () => {
    light = !light;
    rootEl.classList.toggle('light-mode', light);
    themeBtn.textContent = light ? '☀️' : '🌙';
    try {
        localStorage.setItem('trl-theme', light ? 'light' : 'dark');
    } catch (e) { /* private mode etc. */ }
});

// ── FAQ ACCORDION (real buttons, aria-expanded) ──
document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(i => {
            i.classList.remove('open');
            i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            i.querySelector('.faq-answer').style.maxHeight = null;
        });
        if (!isOpen) {
            item.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
    });
});

// ── SMOOTH SCROLL (with focus sync for keyboard/screen-reader users) ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
    });
});

// ── CONTACT FORM (validates, then actually sends to the form action) ──
const form = document.getElementById('contactForm');
const messageInput = document.getElementById('message');
const charCount = document.getElementById('charCount');
const formSuccess = document.getElementById('formSuccess');

messageInput.addEventListener('input', () => {
    const len = Math.min(messageInput.value.length, 500);
    messageInput.value = messageInput.value.slice(0, 500);
    charCount.textContent = `${len} / 500`;
    charCount.style.color = len >= 450 ? '#EF4444' : 'var(--text-muted)';
});

function showError(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.classList.add('show');
}
function clearError(id) {
    document.getElementById(id).classList.remove('show');
}
function setInvalid(inputId, errorId, msg) {
    document.getElementById(inputId).setAttribute('aria-invalid', 'true');
    showError(errorId, msg);
}
function setValid(inputId, errorId) {
    document.getElementById(inputId).removeAttribute('aria-invalid');
    clearError(errorId);
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');
    let valid = true;

    setValid('name', 'nameError');
    setValid('email', 'emailError');
    setValid('message', 'messageError');

    if (!name.value.trim()) { setInvalid('name', 'nameError', 'Please enter your name.'); valid = false; }
    if (!email.value.trim() || !/^\S+@\S+\.\S+$/.test(email.value.trim())) { setInvalid('email', 'emailError', 'Please enter a valid email.'); valid = false; }
    if (!message.value.trim() || message.value.trim().length < 10) { setInvalid('message', 'messageError', 'Message must be at least 10 characters.'); valid = false; }
    if (!valid) return;

    if (form.action.includes('YOUR_FORM_ID')) {
        showError('messageError', 'Form not connected yet — replace YOUR_FORM_ID in index.html with your Formspree form ID.');
        return;
    }

    const btn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');

    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';

    try {
        const res = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error('Request failed');

        form.reset();
        charCount.textContent = '0 / 500';
        charCount.style.color = 'var(--text-muted)';
        formSuccess.classList.add('show');
        setTimeout(() => formSuccess.classList.remove('show'), 6000);
    } catch (err) {
        showError('messageError', 'Could not send right now — please email rashidmuhammadamir@gmail.com or use WhatsApp instead.');
    } finally {
        btn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
});

// ── CARD TILT EFFECT ──
if (!reducedMotion) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            if (!card.classList.contains('visible')) return; // don't fight the fade-in transform
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
            card.style.transform = `translateY(-5px) rotateX(${y}deg) rotateY(${x}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ── FOOTER YEAR ──
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
