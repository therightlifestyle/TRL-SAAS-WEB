'use strict';

// ── LOADER ──
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 1900);
});

// ── CUSTOM CURSOR ──
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');

if (window.innerWidth > 900) {
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        setTimeout(() => {
            follower.style.left = e.clientX + 'px';
            follower.style.top = e.clientY + 'px';
        }, 80);
    });

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

// ── PARTICLE CANVAS ──
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const particles = Array.from({ length: 55 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.3,
    dx: (Math.random() - 0.5) * 0.35,
    dy: (Math.random() - 0.5) * 0.35,
    opacity: Math.random() * 0.4 + 0.1
}));

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,153,255,${p.opacity})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });
    requestAnimationFrame(drawParticles);
}
drawParticles();

// ── TYPED TEXT ──
const words = ['Ambitious People', 'Builders', 'Entrepreneurs', 'Dreamers', 'Founders', 'The Future'];
let wIndex = 0, cIndex = 0, deleting = false;
const typedEl = document.getElementById('typedText');

function type() {
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
}
type();

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

// ── NAVBAR SCROLL ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.style.padding = window.scrollY > 60
        ? (window.innerWidth > 900 ? '11px 48px' : '11px 20px')
        : (window.innerWidth > 900 ? '16px 48px' : '13px 20px');

    document.getElementById('backTop').classList.toggle('show', window.scrollY > 400);
});

// ── BACK TO TOP ──
document.getElementById('backTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── MOBILE MENU ──
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

menuBtn.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuBtn.textContent = open ? '✕' : '☰';
});

mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        menuBtn.textContent = '☰';
    });
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
        mobileMenu.classList.remove('open');
        menuBtn.textContent = '☰';
    }
});

// ── THEME TOGGLE ──
const themeBtn = document.getElementById('themeBtn');
let light = false;
themeBtn.addEventListener('click', () => {
    light = !light;
    document.body.classList.toggle('light-mode', light);
    themeBtn.textContent = light ? '☀️' : '🌙';
});

// ── FAQ ACCORDION ──
document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-question').addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => {
            i.classList.remove('open');
            i.querySelector('.faq-answer').style.maxHeight = null;
        });
        if (!isOpen) {
            item.classList.add('open');
            const answer = item.querySelector('.faq-answer');
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
    });
});

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ── CONTACT FORM ──
const form = document.getElementById('contactForm');
const messageInput = document.getElementById('message');
const charCount = document.getElementById('charCount');

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

form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    clearError('nameError');
    clearError('emailError');
    clearError('messageError');

    if (!name) { showError('nameError', 'Please enter your name.'); valid = false; }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) { showError('emailError', 'Please enter a valid email.'); valid = false; }
    if (!message || message.length < 10) { showError('messageError', 'Message must be at least 10 characters.'); valid = false; }

    if (!valid) return;

    const btn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');

    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';

    setTimeout(() => {
        btn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        form.reset();
        charCount.textContent = '0 / 500';
        document.getElementById('formSuccess').classList.add('show');
        setTimeout(() => {
            document.getElementById('formSuccess').classList.remove('show');
        }, 5000);
    }, 1800);
});

// ── CARD TILT EFFECT ──
document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
        card.style.transform = `translateY(-5px) rotateX(${y}deg) rotateY(${x}deg)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// ── ACTIVE NAV HIGHLIGHT ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 120) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${current}`
            ? 'var(--text)'
            : '';
    });
});
