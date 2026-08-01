/**
 * TRL V2 — The Right Lifestyle
 * Premium Foundation Website JavaScript
 */

'use strict';

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Mobile Menu Toggle ──
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

function toggleMenu(open) {
    mobileMenu.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    
    // Animate hamburger to X
    const spans = menuBtn.querySelectorAll('span');
    if (open) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    }
}

menuBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    toggleMenu(!isOpen);
});

// Close menu when clicking a link
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
});

// Close menu on outside click
document.addEventListener('click', (e) => {
    if (mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !menuBtn.contains(e.target)) {
        toggleMenu(false);
    }
});

// Close menu on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        toggleMenu(false);
        menuBtn.focus();
    }
});

// ── Scroll Animations ──
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Stagger the animations slightly
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 75);
            fadeObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    fadeObserver.observe(el);
});

// ── Smooth Scroll for Anchor Links ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (!target) return;
        
        e.preventDefault();
        
        const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        target.scrollIntoView({
            behavior: isReducedMotion ? 'auto' : 'smooth',
            block: 'start'
        });
        
        // Update focus for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        
        // Close mobile menu if open
        if (mobileMenu.classList.contains('open')) {
            toggleMenu(false);
        }
    });
});

// ── Navbar Scroll Effect ──
const navbar = document.getElementById('navbar');
let lastScroll = 0;

function handleNavbarScroll() {
    const currentScroll = window.scrollY;
    
    if (currentScroll > 60) {
        navbar.style.padding = '12px 48px';
        navbar.style.background = 'rgba(5, 5, 5, 0.95)';
    } else {
        navbar.style.padding = '16px 48px';
        navbar.style.background = 'rgba(5, 5, 5, 0.8)';
    }
    
    lastScroll = currentScroll;
}

window.addEventListener('scroll', () => {
    requestAnimationFrame(handleNavbarScroll);
}, { passive: true });

// ── Form Handling ──
const accessForm = document.getElementById('accessForm');
const formSuccess = document.getElementById('formSuccess');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');

if (accessForm) {
    accessForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = accessForm.querySelector('.submit-btn');
        const formData = new FormData(accessForm);
        
        // Get form values
        const name = formData.get('name');
        const email = formData.get('email');
        
        // Basic validation
        if (!name || !email) {
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
        
        try {
            const response = await fetch(accessForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Show success
                accessForm.reset();
                formSuccess.classList.add('show');
                
                // Hide success after 6 seconds
                setTimeout(() => {
                    formSuccess.classList.remove('show');
                }, 6000);
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            // Show error (could add error UI here)
            console.log('Form submission failed, please try again or contact via email.');
        } finally {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });
}

// ── Progress Bar Animation ──
const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progressFill = entry.target.querySelector('.progress-fill');
            if (progressFill) {
                const width = progressFill.style.width;
                progressFill.style.width = '0%';
                
                setTimeout(() => {
                    progressFill.style.width = width;
                }, 100);
            }
            progressObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.today-card').forEach(card => {
    progressObserver.observe(card);
});

// ── Footer Year ──
const yearEl = document.getElementById('year');
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

// ── Pillar Card Hover Effect ──
if (!prefersReducedMotion) {
    document.querySelectorAll('.pillar-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ── Initialize on Load ──
document.addEventListener('DOMContentLoaded', () => {
    // Trigger initial navbar state
    handleNavbarScroll();
});
