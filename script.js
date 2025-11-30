// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const body = document.body;
let menuOriginalParent = null;
let menuNextSibling = null;

console.log('Hamburger:', hamburger);
console.log('Nav Menu:', navMenu);

if (hamburger && navMenu) {
    // Store original position
    menuOriginalParent = navMenu.parentElement;
    menuNextSibling = navMenu.nextElementSibling;
    
    hamburger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Hamburger clicked!');
        
        const isActive = navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        
        console.log('Menu is now:', isActive ? 'open' : 'closed');
        
        // Move menu to body when opening, back to original position when closing
        if (isActive) {
            // Move menu to body to escape stacking context
            body.appendChild(navMenu);
            body.style.overflow = 'hidden';
        } else {
            // Move menu back to original position
            if (menuNextSibling) {
                menuOriginalParent.insertBefore(navMenu, menuNextSibling);
            } else {
                menuOriginalParent.appendChild(navMenu);
            }
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
            // Move menu back to original position
            if (menuNextSibling) {
                menuOriginalParent.insertBefore(navMenu, menuNextSibling);
            } else {
                menuOriginalParent.appendChild(navMenu);
            }
            body.style.overflow = '';
        }
    });

    // Close menu when clicking a link
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            // Move menu back to original position
            if (menuNextSibling) {
                menuOriginalParent.insertBefore(navMenu, menuNextSibling);
            } else {
                menuOriginalParent.appendChild(navMenu);
            }
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
let lastWindowWidth = window.innerWidth;

function isMobileDevice() {
    // More robust mobile detection for Android and iOS
    return window.innerWidth <= 768 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    const isMobile = isMobileDevice();
    
    if (isMobile) {
        // On mobile, completely remove any inline styles that might override CSS
        navbar.removeAttribute('style');
    } else {
        // On desktop, apply scroll-based background change
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
            navbar.style.webkitBackdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'white';
            navbar.style.backdropFilter = 'none';
            navbar.style.webkitBackdropFilter = 'none';
        }
    }
}

// Watch for inline style changes on mobile and remove them
function setupMobileStyleProtection() {
    const navbar = document.querySelector('.navbar');
    if (!navbar || !isMobileDevice()) return;
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                if (isMobileDevice() && navbar.hasAttribute('style')) {
                    // Remove inline styles on mobile
                    navbar.removeAttribute('style');
                }
            }
        });
    });
    
    observer.observe(navbar, { 
        attributes: true, 
        attributeFilter: ['style'] 
    });
}

// Throttle scroll events for better performance
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
            handleNavbarScroll();
            scrollTimeout = null;
        }, 10);
    }
}, { passive: true });

// Handle window resize
window.addEventListener('resize', () => {
    const currentWidth = window.innerWidth;
    if (Math.abs(currentWidth - lastWindowWidth) > 50) {
        lastWindowWidth = currentWidth;
        handleNavbarScroll();
    }
});

// Run on load
window.addEventListener('load', () => {
    handleNavbarScroll();
    setupMobileStyleProtection();
});

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        handleNavbarScroll();
        setupMobileStyleProtection();
    });
} else {
    handleNavbarScroll();
    setupMobileStyleProtection();
}

// Hero Background Zoom Effect on Scroll (Homepage only)
const heroSection = document.querySelector('.hero');
if (heroSection) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroHeight = heroSection.offsetHeight;
        
        // Only apply effect while hero is visible
        if (scrolled < heroHeight) {
            // Calculate zoom: starts at 1, increases to 1.15 as you scroll
            const zoomFactor = 1 + (scrolled / heroHeight) * 0.15;
            
            // Calculate vertical movement (subtle upward shift)
            const moveY = scrolled * 0.3;
            
            // Apply transform
            heroSection.style.backgroundSize = `${zoomFactor * 100}%`;
            heroSection.style.backgroundPosition = `center calc(100% - ${moveY}px)`;
        }
    });
}

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

// Team Bio Modal Functionality
const bioModal = document.getElementById('bioModal');
const readMoreBtns = document.querySelectorAll('.read-more-btn');
const modalClose = document.querySelector('.bio-modal-close');
const modalOverlay = document.querySelector('.bio-modal-overlay');

if (readMoreBtns.length > 0) {
    readMoreBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-member');
            const memberCard = this.closest('.team-member');
            const memberName = memberCard.querySelector('h3').textContent;
            const memberRole = memberCard.querySelector('.team-role').textContent;
            const memberBio = document.getElementById(`bio-${memberId}`).innerHTML;
            
            // Set modal content
            document.getElementById('modalName').textContent = memberName;
            document.getElementById('modalRole').textContent = memberRole;
            document.getElementById('modalBio').innerHTML = memberBio;
            
            // Show modal
            bioModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
}

// Close modal functions
function closeBioModal() {
    if (bioModal) {
        bioModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

if (modalClose) {
    modalClose.addEventListener('click', closeBioModal);
}

if (modalOverlay) {
    modalOverlay.addEventListener('click', closeBioModal);
}

// Close modal with ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && bioModal && bioModal.classList.contains('active')) {
        closeBioModal();
    }
});

// Toggle Card Expand/Collapse Function
function toggleCard(button) {
    const card = button.closest('.collapsible-card');
    const content = card.querySelector('.card-content');
    const icon = button.querySelector('.expand-icon');
    const expandText = button.querySelector('.expand-text');
    
    if (card.classList.contains('expanded')) {
        card.classList.remove('expanded');
        content.style.maxHeight = null;
        icon.style.transform = 'rotate(0deg)';
        expandText.textContent = 'Learn More';
    } else {
        card.classList.add('expanded');
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.style.transform = 'rotate(180deg)';
        expandText.textContent = 'Show Less';
    }
}

// Collapsible intro text controls
const collapsibleToggles = document.querySelectorAll('[data-collapsible-toggle]');

collapsibleToggles.forEach(toggle => {
    const targetId = toggle.getAttribute('aria-controls');
    const target = document.getElementById(targetId);
    const label = toggle.querySelector('.collapsible-toggle-label');

    if (!target) {
        toggle.style.display = 'none';
        return;
    }

    const collapsedLabel = toggle.getAttribute('data-label-collapsed') || 'Show details';
    const expandedLabel = toggle.getAttribute('data-label-expanded') || 'Hide details';

    const updateLabel = (expanded) => {
        if (label) {
            label.textContent = expanded ? expandedLabel : collapsedLabel;
        }
    };

    const needsToggle = target.scrollHeight > target.clientHeight + 4;
    if (!needsToggle) {
        toggle.style.display = 'none';
        target.classList.add('expanded');
        target.setAttribute('aria-hidden', 'false');
        return;
    }

    toggle.style.display = '';
    target.classList.remove('expanded');
    target.setAttribute('aria-hidden', 'true');

    toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        const nextState = !isExpanded;

        toggle.setAttribute('aria-expanded', nextState.toString());
        target.classList.toggle('expanded', nextState);
        target.setAttribute('aria-hidden', (!nextState).toString());
        updateLabel(nextState);
    });

    // Ensure initial state label matches attribute
    updateLabel(false);
});

// ===================================
// IMAGE OPTIMIZATION & LAZY LOADING
// ===================================

/**
 * Optimized image loading to improve site performance
 * - Implements native lazy loading for non-critical images
 * - Uses Intersection Observer for progressive loading
 * - Handles decode errors gracefully
 */

// Initialize lazy loading for all images
function initImageOptimization() {
    // Select all images that should be lazy loaded
    const lazyImages = document.querySelectorAll('img:not([loading="eager"]):not([data-no-lazy])');
    
    // Add loading="lazy" attribute to non-critical images
    lazyImages.forEach(img => {
        // Skip if already has loading attribute
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
        
        // Add decoding hint for better performance
        if (!img.hasAttribute('decoding')) {
            img.setAttribute('decoding', 'async');
        }
    });

    // Use Intersection Observer for additional optimization
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Add fade-in animation
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.3s ease-in';
                    
                    // Preload the image
                    if (img.dataset.src && !img.src) {
                        img.src = img.dataset.src;
                    }
                    
                    // Show image when loaded
                    if (img.complete) {
                        img.style.opacity = '1';
                    } else {
                        img.addEventListener('load', () => {
                            img.style.opacity = '1';
                        }, { once: true });
                    }
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px', // Start loading 50px before entering viewport
            threshold: 0.01
        });

        // Observe images with data-src attribute (for more aggressive lazy loading)
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Preload critical images for better perceived performance
function preloadCriticalImages() {
    const criticalImages = [
        'logos/header2.svg',
        'hero.png',
        'fleet-hero.png'
    ];
    
    // Only preload if not already in document head
    criticalImages.forEach(src => {
        const existingPreload = document.querySelector(`link[rel="preload"][href*="${src}"]`);
        if (!existingPreload) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        }
    });
}

// Image error handling - fallback to placeholder or retry
function handleImageError(img) {
    if (!img.dataset.errorHandled) {
        img.dataset.errorHandled = 'true';
        
        // Try reloading once
        const originalSrc = img.src;
        img.src = '';
        setTimeout(() => {
            img.src = originalSrc;
        }, 100);
    }
}

// Add error handlers to all images
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', () => handleImageError(img), { once: true });
    });
});

// Initialize image optimization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initImageOptimization();
        preloadCriticalImages();
    });
} else {
    initImageOptimization();
    preloadCriticalImages();
}
