// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const body = document.body;

console.log('Hamburger:', hamburger);
console.log('Nav Menu:', navMenu);

if (hamburger && navMenu) {
    hamburger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Hamburger clicked!');
        
        const isActive = navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        
        console.log('Menu is now:', isActive ? 'open' : 'closed');
        
        // Prevent body scroll when menu is open
        if (isActive) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !hamburger.contains(e.target)) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            body.style.overflow = '';
        }
    });

    // Close menu when clicking a link
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            body.style.overflow = '';
        });
    });
} else {
    console.error('Hamburger or navMenu not found!');
}

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Only prevent default for internal anchors
        if (href !== '#' && href.length > 1) {
            e.preventDefault();

            const target = document.querySelector(href);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.offsetTop;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }

        // Close mobile menu after clicking a link
        if (navMenu) {
            navMenu.classList.remove('active');
        }
        if (hamburger) {
            hamburger.classList.remove('active');
        }
    });
});

// Navbar Background Change on Scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'white';
        navbar.style.backdropFilter = 'none';
    }
});

// Intersection Observer for Fade-in Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.service-card, .about-content, .contact-content').forEach(el => {
    observer.observe(el);
});

// Contact Form Handling
const contactForm = document.querySelector('.contact-form form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        // Basic validation
        if (!data.name || !data.email) {
            alert('Please fill in all required fields.');
            return;
        }

        // Simulate form submission (in a real application, this would send to a server)
        alert('Thank you for your message! We will get back to you soon.');

        // Reset form
        contactForm.reset();
    });
}

// Add loading animation class for CSS transitions
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
});

// Service Button Interactions
document.querySelectorAll('.service-btn').forEach(button => {
    // Skip buttons that are actually links (have href attribute)
    if (button.tagName === 'A') {
        return;
    }

    button.addEventListener('click', function() {
        const service = this.dataset.service;

        // Add click animation
        this.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);

        // For now, show an alert with service info
        // In a real application, this would navigate to a service page or open a modal
        const serviceNames = {
            'dielectric': 'Dielectric Testing & Inspections',
            'rubber-ppe': 'Rubber PPE Testing',
            'live-line': 'Live-Line Tool Testing',
            'protective-grounds': 'Protective Grounds Testing',
            'instrument': 'Instrument Calibration',
            'metering': 'Metering Device Calibration',
            'electronic': 'Electronic Test Equipment Calibration',
            'gas-detection': 'Gas Detection Calibration'
        };

        alert(`Learn more about our ${serviceNames[service]} service!\n\nThis service ensures compliance with industry standards and maximum safety. Contact us for detailed information and pricing.`);
    });

    // Enhanced hover effects
    button.addEventListener('mouseenter', function() {
        const arrow = this.querySelector('.btn-arrow');
        if (arrow) {
            arrow.style.transform = 'translateX(3px)';
        }
    });

    button.addEventListener('mouseleave', function() {
        const arrow = this.querySelector('.btn-arrow');
        if (arrow) {
            arrow.style.transform = 'translateX(0)';
        }
    });
});

// Stats Counter Animation
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');

    stats.forEach(stat => {
        const target = parseInt(stat.textContent);
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                stat.textContent = target + (stat.textContent.includes('%') ? '%' : '+');
                clearInterval(timer);
            } else {
                stat.textContent = Math.floor(current) + (stat.textContent.includes('%') ? '%' : '+');
            }
        }, 50);
    });
}

// Trigger stats animation when about section is visible
const aboutSection = document.querySelector('.about');
let statsAnimated = false;

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
            animateStats();
            statsAnimated = true;
        }
    });
}, { threshold: 0.5 });

if (aboutSection) {
    statsObserver.observe(aboutSection);
}
