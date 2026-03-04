/* ==========================================
   C.M.D. - INTERACTIVE FEATURES
   JavaScript for slideshow, smooth scrolling, 
   and scroll animations
========================================== */

/* ==========================================
   HERO IMAGE SLIDESHOW
   Automatically cycles through hero images
========================================== */

let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;

// Function to show the next slide
function showNextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % totalSlides;  // Loop back to start
    slides[currentSlide].classList.add('active');
}

// Change slide every 5 seconds (5000ms)
setInterval(showNextSlide, 5000);

/* ==========================================
   SMOOTH SCROLLING FOR NAVIGATION
   Handles clicks on anchor links
========================================== */

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

/* ==========================================
   NAVBAR SCROLL EFFECT
   Changes navbar opacity on scroll
========================================== */

let lastScroll = 0;
const nav = document.querySelector('nav');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Make navbar more opaque when scrolled down
    if (currentScroll > 50) {
        nav.style.background = 'rgba(31, 41, 55, 0.95)';
    } else {
        nav.style.background = 'rgba(31, 41, 55, 0.8)';
    }
    
    lastScroll = currentScroll;
});

/* ==========================================
   INTERSECTION OBSERVER FOR ANIMATIONS
   Triggers fade-in animations when elements
   come into view
========================================== */

const observerOptions = {
    threshold: 0.1,  // Trigger when 10% of element is visible
    rootMargin: '0px 0px -50px 0px'  // Start animation slightly before entering viewport
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all animated elements (feature cards and steps)
document.querySelectorAll('.feature-card, .step').forEach(el => {
    observer.observe(el);
});
