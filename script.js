// ===================================
// PAGE LOADER - Instant show
// ===================================
(function() {
    // Immediately show page and remove loader
    document.body.classList.add('page-loaded');
    var loader = document.getElementById('pageLoader');
    if (loader) loader.style.display = 'none';
})();

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const body = document.body;
let menuOriginalParent = null;
let menuNextSibling = null;

// Check if we're on mobile
function isMobileWidth() {
    return window.innerWidth <= 768;
}

// Setup mobile dropdown toggles
function setupMobileDropdowns() {
    const dropdownItems = document.querySelectorAll('.nav-menu > li.has-dropdown');
    
    dropdownItems.forEach(item => {
        const mainLink = item.querySelector(':scope > a');
        
        if (!mainLink) return;
        
        // On mobile, clicking the main link toggles the dropdown instead of navigating
        mainLink.addEventListener('click', (e) => {
            if (isMobileWidth() && navMenu.classList.contains('active')) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close other open dropdowns
                dropdownItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('dropdown-open')) {
                        otherItem.classList.remove('dropdown-open');
                    }
                });
                
                // Toggle current dropdown
                item.classList.toggle('dropdown-open');
            }
        });
    });
}

// Close all mobile dropdowns
function closeAllMobileDropdowns() {
    document.querySelectorAll('.nav-menu > li.has-dropdown.dropdown-open').forEach(item => {
        item.classList.remove('dropdown-open');
    });
}

if (hamburger && navMenu) {
    // Store original position
    menuOriginalParent = navMenu.parentElement;
    menuNextSibling = navMenu.nextElementSibling;
    
    // Setup mobile dropdowns
    setupMobileDropdowns();
    
    hamburger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isActive = navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        
        // Move menu to body when opening, back to original position when closing
        if (isActive) {
            // Move menu to body to escape stacking context
            body.appendChild(navMenu);
            body.style.overflow = 'hidden';
        } else {
            // Close all dropdowns when closing menu
            closeAllMobileDropdowns();
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
            closeAllMobileDropdowns();
            // Move menu back to original position
            if (menuNextSibling) {
                menuOriginalParent.insertBefore(navMenu, menuNextSibling);
            } else {
                menuOriginalParent.appendChild(navMenu);
            }
            body.style.overflow = '';
        }
    });

    // Close menu when clicking a nav-dropdown link (but not the main category link)
    navMenu.querySelectorAll('.nav-dropdown a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            closeAllMobileDropdowns();
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

// Hero scroll effect removed for performance
// The hero now uses a CSS animation on load which is GPU-accelerated
// Scroll-based parallax effects on backgrounds cause significant jank
// and have been disabled in favor of smooth scrolling performance

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

// Contact Form Handling - Submits to Supabase and sends email notification
async function handleContactFormSubmit(form, sourcePage) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Basic validation
    if (!data.name || !data.email || !data.message) {
        showFormMessage(form, 'Please fill in all required fields.', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showFormMessage(form, 'Please enter a valid email address.', 'error');
        return;
    }
    
    // Get submit button and show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Prepare submission data
    const submission = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone ? data.phone.trim() : null,
        service: data.service || null,
        message: data.message.trim(),
        source_page: sourcePage
    };
    
    let supabaseSuccess = false;
    let emailSuccess = false;
    
    try {
        // 1. Submit to Supabase (if available)
        if (typeof window.supabaseClient !== 'undefined') {
            const { error } = await window.supabaseClient
                .from('contact_submissions')
                .insert([submission]);
            
            if (error) {
                console.error('Supabase error:', error);
            } else {
                supabaseSuccess = true;
            }
        }
        
        // 2. Send email notification via Web3Forms
        emailSuccess = await sendEmailNotification(submission);
        
        // Success if either method worked
        if (supabaseSuccess || emailSuccess) {
            showFormMessage(form, 'Thank you for your message! We\'ll get back to you soon.', 'success');
            form.reset();
        } else {
            throw new Error('Both submission methods failed');
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        showFormMessage(form, 'Sorry, there was an error sending your message. Please try calling us or emailing directly at sales@copperheadlabs.com', 'error');
    } finally {
        // Restore button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Send email notification via Web3Forms
async function sendEmailNotification(submission) {
    // Web3Forms access key - get yours free at https://web3forms.com
    const WEB3FORMS_KEY = window.WEB3FORMS_KEY || 'YOUR_ACCESS_KEY_HERE';
    
    // Skip if no valid key configured
    if (WEB3FORMS_KEY === 'YOUR_ACCESS_KEY_HERE') {
        console.log('Web3Forms not configured - skipping email notification');
        return false;
    }
    
    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                access_key: WEB3FORMS_KEY,
                subject: `New Contact: ${submission.name} - ${submission.service || 'General Inquiry'}`,
                from_name: 'Copperhead Labs Website',
                to: 'sales@copperheadlabs.com',
                // Form data
                Name: submission.name,
                Email: submission.email,
                Phone: submission.phone || 'Not provided',
                'Service Interest': submission.service || 'Not specified',
                Message: submission.message,
                'Source Page': submission.source_page,
                'Submitted At': new Date().toLocaleString(),
                // Reply-to for easy response
                replyto: submission.email,
            }),
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('Email notification sent successfully');
            return true;
        } else {
            console.error('Web3Forms error:', result);
            return false;
        }
    } catch (error) {
        console.error('Email notification error:', error);
        return false;
    }
}

// Show form message (success or error)
function showFormMessage(form, message, type) {
    // Remove any existing message
    const existingMsg = form.querySelector('.form-message');
    if (existingMsg) {
        existingMsg.remove();
    }
    
    // Create message element
    const msgDiv = document.createElement('div');
    msgDiv.className = `form-message form-message-${type}`;
    msgDiv.textContent = message;
    msgDiv.style.cssText = `
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 8px;
        font-weight: 500;
        ${type === 'success' 
            ? 'background: rgba(34, 197, 94, 0.1); color: #16a34a; border: 1px solid rgba(34, 197, 94, 0.3);' 
            : 'background: rgba(239, 68, 68, 0.1); color: #dc2626; border: 1px solid rgba(239, 68, 68, 0.3);'}
    `;
    
    // Insert before submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.parentNode.insertBefore(msgDiv, submitBtn);
    } else {
        form.appendChild(msgDiv);
    }
    
    // Auto-remove message after 10 seconds for success, 15 for error
    setTimeout(() => {
        if (msgDiv.parentNode) {
            msgDiv.remove();
        }
    }, type === 'success' ? 10000 : 15000);
}

// Initialize contact forms
const indexContactForm = document.querySelector('.contact-form form');
const pageContactForm = document.querySelector('.contact-page-form');

if (indexContactForm) {
    indexContactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleContactFormSubmit(indexContactForm, 'homepage');
    });
}

if (pageContactForm) {
    pageContactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleContactFormSubmit(pageContactForm, 'contact-page');
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
 * - Avoids transitions during scroll for smooth performance
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
        
        // Add fetchpriority="low" to below-the-fold images
        if (!img.hasAttribute('fetchpriority') && !isInViewport(img)) {
            img.setAttribute('fetchpriority', 'low');
        }
    });

    // Use Intersection Observer for additional optimization
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Preload the image
                    if (img.dataset.src && !img.src) {
                        img.src = img.dataset.src;
                    }
                    
                    // Show image immediately when loaded - no transition during scroll for performance
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
            rootMargin: '200px 0px', // Start loading 200px before entering viewport
            threshold: 0.01
        });

        // Observe images with data-src attribute (for more aggressive lazy loading)
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.top <= (window.innerHeight || document.documentElement.clientHeight)
    );
}

// Preload critical images - now handled via HTML preload hints in each page's <head>
// This function is deprecated but kept for backwards compatibility
function preloadCriticalImages() {
    // Preloads are now defined in HTML for better performance
    // (processed earlier in page lifecycle)
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

