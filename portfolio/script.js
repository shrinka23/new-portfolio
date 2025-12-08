// Main Application Controller
class PortfolioApp {
    constructor() {
        this.initializeApp();
    }

    initializeApp() {
        // Initialize all components
        this.navigation = new Navigation();
        this.contactForm = new ContactForm();
        this.backToTop = new BackToTop();
        this.notifications = new NotificationSystem();
        this.currentYear = new CurrentYear();

        // Initialize event listeners
        this.bindEvents();

        console.log('Portfolio App Initialized');
    }

    bindEvents() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open
                    if (this.navigation.navMenu.classList.contains('active')) {
                        this.navigation.toggleMenu();
                    }
                }
            });
        });

        // Prevent form submission on Enter key in textareas
        document.querySelectorAll('textarea').forEach(textarea => {
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    textarea.value += '\n';
                }
            });
        });

        // Add animation on scroll
        this.initializeScrollAnimations();
    }

    initializeScrollAnimations() {
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
        document.querySelectorAll('.project-card, .analysis-card').forEach(el => {
            observer.observe(el);
        });
    }
}

// Navigation Controller
class Navigation {
    constructor() {
        this.menuToggle = document.querySelector('.menu-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.init();
    }

    init() {
        if (!this.menuToggle) return;

        this.menuToggle.addEventListener('click', () => this.toggleMenu());

        // Close menu when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 &&
                this.navMenu.classList.contains('active') &&
                !this.navMenu.contains(e.target) &&
                !this.menuToggle.contains(e.target)) {
                this.toggleMenu();
            }
        });

        // Close menu when window is resized above mobile breakpoint
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.navMenu.classList.contains('active')) {
                this.toggleMenu();
            }
        });
    }

    toggleMenu() {
        this.menuToggle.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        document.body.style.overflow = this.navMenu.classList.contains('active') ? 'hidden' : '';
    }
}

// Contact Form Handler
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        if (!this.form) return;

        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.btnText = this.form.querySelector('.btn-text');
        this.btnLoader = this.form.querySelector('.btn-loader');
        this.init();
    }

    init() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Real-time validation
        this.form.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Validate all fields
        if (!this.validateForm()) {
            this.showNotification('Please fill in all required fields correctly.', 'error');
            return;
        }

        // Get form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);

        try {
            // Show loading state
            this.setLoadingState(true);

            // Send email using EmailJS
            const response = await emailjs.send(
                'service_your_service_id', // Replace with your service ID
                'template_your_template_id', // Replace with your template ID
                {
                    from_name: data.name,
                    from_email: data.email,
                    subject: data.subject,
                    message: data.message,
                    reply_to: data.email
                }
            );

            // Success
            this.handleSuccess();

        } catch (error) {
            console.error('EmailJS Error:', error);
            this.handleError(error);
        } finally {
            this.setLoadingState(false);
        }
    }

    validateForm() {
        let isValid = true;
        const requiredFields = this.form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const formGroup = field.closest('.form-group');

        // Clear previous states
        formGroup.classList.remove('error', 'success');

        // Required check
        if (field.hasAttribute('required') && !value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showFieldError(field, 'Please enter a valid email address');
                return false;
            }
        }

        // Min length validation
        if (field.hasAttribute('minlength')) {
            const minLength = parseInt(field.getAttribute('minlength'));
            if (value.length < minLength) {
                this.showFieldError(field, `Minimum ${minLength} characters required`);
                return false;
            }
        }

        // Mark as valid
        formGroup.classList.add('success');
        this.clearFieldError(field);
        return true;
    }

    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        formGroup.classList.add('error');
        formGroup.classList.remove('success');

        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        formGroup.classList.remove('error');
        
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    setLoadingState(isLoading) {
        if (isLoading) {
            this.submitButton.disabled = true;
            this.btnText.style.display = 'none';
            this.btnLoader.style.display = 'inline-flex';
            this.form.classList.add('loading');
        } else {
            this.submitButton.disabled = false;
            this.btnText.style.display = 'inline-flex';
            this.btnLoader.style.display = 'none';
            this.form.classList.remove('loading');
        }
    }

    handleSuccess() {
        this.showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
        this.form.reset();
        
        // Clear validation states
        this.form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('success', 'error');
            const errorElement = group.querySelector('.error-message');
            if (errorElement) errorElement.textContent = '';
        });
    }

    handleError(error) {
        console.error('Form submission error:', error);
        this.showNotification(
            'Failed to send message. Please try again or email me directly at qdarwinrhey@gmail.com',
            'error'
        );
    }

    showNotification(message, type) {
        const notificationSystem = new NotificationSystem();
        notificationSystem.show(message, type);
    }
}

// Back to Top Button
class BackToTop {
    constructor() {
        this.button = document.querySelector('.back-to-top');
        if (!this.button) return;

        this.init();
    }

    init() {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => this.toggleVisibility());

        // Scroll to top when clicked
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Initial check
        this.toggleVisibility();
    }

    toggleVisibility() {
        if (window.scrollY > 300) {
            this.button.classList.add('visible');
        } else {
            this.button.classList.remove('visible');
        }
    }
}

// Notification System
class NotificationSystem {
    constructor() {
        this.container = document.getElementById('notificationContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notificationContainer';
            document.body.appendChild(this.container);
        }
    }

    show(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'assertive');

        // Icons for different types
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };

        notification.innerHTML = `
            <i class="notification-icon ${icons[type] || icons.info}"></i>
            <div class="notification-content">
                ${message}
            </div>
            <button class="notification-close" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to container
        this.container.appendChild(notification);

        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.close(notification));

        // Show with animation
        setTimeout(() => notification.classList.add('show'), 10);

        // Auto-remove after 5 seconds
        const autoRemove = setTimeout(() => this.close(notification), 5000);

        // Clear timeout if user hovers
        notification.addEventListener('mouseenter', () => clearTimeout(autoRemove));
        notification.addEventListener('mouseleave', () => {
            setTimeout(() => this.close(notification), 5000);
        });
    }

    close(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }
}

// Current Year in Footer
class CurrentYear {
    constructor() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
}

// Image Lazy Loading Helper
class LazyLoader {
    constructor() {
        this.images = document.querySelectorAll('img[loading="lazy"]');
        if ('IntersectionObserver' in window) {
            this.initObserver();
        } else {
            this.loadAllImages();
        }
    }

    initObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        this.images.forEach(img => observer.observe(img));
    }

    loadAllImages() {
        this.images.forEach(img => {
            img.src = img.dataset.src || img.src;
        });
    }
}

// Touch Device Detection
class TouchDetector {
    constructor() {
        this.isTouchDevice = 'ontouchstart' in window || 
                           navigator.maxTouchPoints > 0 ||
                           navigator.msMaxTouchPoints > 0;
        
        if (this.isTouchDevice) {
            document.documentElement.classList.add('touch-device');
            this.optimizeForTouch();
        } else {
            document.documentElement.classList.add('no-touch');
        }
    }

    optimizeForTouch() {
        // Increase tap target sizes
        const tapElements = document.querySelectorAll('button, a, input[type="submit"]');
        tapElements.forEach(el => {
            el.style.minHeight = '44px';
            el.style.minWidth = '44px';
        });

        // Prevent :hover styles on touch devices
        const style = document.createElement('style');
        style.textContent = `
            @media (hover: none) and (pointer: coarse) {
                .project-card:hover,
                .analysis-card:hover,
                .skill-tag:hover {
                    transform: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Form Validation Patterns
class FormValidator {
    static patterns = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^[\+]?[1-9][\d]{0,15}$/,
        url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        name: /^[a-zA-Z\s]{2,50}$/
    };

    static validate(type, value) {
        if (!value.trim()) return { valid: false, message: 'This field is required' };
        
        switch (type) {
            case 'email':
                if (!this.patterns.email.test(value)) {
                    return { valid: false, message: 'Please enter a valid email address' };
                }
                break;
                
            case 'name':
                if (!this.patterns.name.test(value)) {
                    return { valid: false, message: 'Please enter a valid name (2-50 characters)' };
                }
                break;
                
            case 'message':
                if (value.length < 10) {
                    return { valid: false, message: 'Message must be at least 10 characters' };
                }
                break;
        }
        
        return { valid: true, message: '' };
    }
}

// Performance Optimizations
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        // Debounce scroll events
        this.debounceScroll();
        
        // Optimize images
        this.optimizeImages();
        
        // Preload critical resources
        this.preloadResources();
    }

    debounceScroll() {
        let ticking = false;
        const scrollEvents = ['scroll', 'resize'];

        scrollEvents.forEach(event => {
            window.addEventListener(event, () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        // Handle scroll-based operations here
                        ticking = false;
                    });
                    ticking = true;
                }
            });
        });
    }

    optimizeImages() {
        // Convert images to WebP if supported
        if (this.supportsWebP()) {
            document.querySelectorAll('img[data-webp]').forEach(img => {
                img.src = img.dataset.webp;
            });
        }
    }

    supportsWebP() {
        const elem = document.createElement('canvas');
        if (!!(elem.getContext && elem.getContext('2d'))) {
            return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        }
        return false;
    }

    preloadResources() {
        const links = [
            { rel: 'preload', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', as: 'style' },
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }
        ];

        links.forEach(link => {
            const el = document.createElement('link');
            Object.assign(el, link);
            document.head.appendChild(el);
        });
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize core application
    const app = new PortfolioApp();
    
    // Initialize additional utilities
    new LazyLoader();
    new TouchDetector();
    new PerformanceOptimizer();
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            animation: fadeInUp 0.6s ease forwards;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Loading spinner animation */
        .fa-spinner {
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Form focus animations */
        .form-group input:focus,
        .form-group textarea:focus {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
            50% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0); }
        }
        
        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        }
    `;
    document.head.appendChild(style);
});

// Handle service worker for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('Service Worker registration failed:', error);
        });
    });
}

// Error boundary for the application
window.addEventListener('error', (event) => {
    console.error('Application Error:', event.error);
    
    // Show user-friendly error message
    const notification = new NotificationSystem();
    notification.show(
        'An unexpected error occurred. Please refresh the page or try again later.',
        'error'
    );
    
    // Prevent error from bubbling up
    event.preventDefault();
});

// Export for testing (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PortfolioApp,
        ContactForm,
        Navigation,
        BackToTop,
        NotificationSystem,
        FormValidator
    };
}
