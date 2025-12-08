// Contact Form Manager with Mobile Optimization
class ContactFormManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.injectStyles();
        this.setupMobileNavigation();
        this.setupMobileOptimizations();
        this.updateCopyrightYear();
    }

    setupMobileNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        const body = document.body;
        
        if (!hamburger || !navLinks) return;
        
        // Add click event for hamburger menu
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            hamburger.innerHTML = navLinks.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
            
            // Toggle body overflow
            if (navLinks.classList.contains('active')) {
                body.classList.add('menu-open');
                body.style.overflow = 'hidden';
            } else {
                body.classList.remove('menu-open');
                body.style.overflow = '';
            }
        });
        
        // Close menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    const href = link.getAttribute('href');
                    if (href && href.startsWith('#')) {
                        // Allow smooth scroll for anchor links
                        setTimeout(() => {
                            navLinks.classList.remove('active');
                            hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                            body.classList.remove('menu-open');
                            body.style.overflow = '';
                        }, 300);
                    } else {
                        navLinks.classList.remove('active');
                        hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                        body.classList.remove('menu-open');
                        body.style.overflow = '';
                    }
                }
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 &&
                navLinks.classList.contains('active') &&
                !navLinks.contains(e.target) &&
                !hamburger.contains(e.target)) {
                navLinks.classList.remove('active');
                hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                body.classList.remove('menu-open');
                body.style.overflow = '';
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                body.classList.remove('menu-open');
                body.style.overflow = '';
            }
        });
        
        // Update hamburger visibility on resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                    body.classList.remove('menu-open');
                    body.style.overflow = '';
                }
            }, 250);
        });
    }

    setupMobileOptimizations() {
        // Prevent double-tap zoom on mobile
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Prevent iOS zoom on form inputs
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                if (window.innerWidth <= 768) {
                    input.style.fontSize = '16px';
                }
            });
            
            input.addEventListener('blur', () => {
                if (window.innerWidth <= 768) {
                    input.style.fontSize = '';
                }
            });
        });
        
        // Smooth scroll for anchor links with mobile adjustments
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    if (window.innerWidth <= 768) {
                        const navLinks = document.querySelector('.nav-links');
                        const hamburger = document.querySelector('.hamburger');
                        const body = document.body;
                        if (navLinks && navLinks.classList.contains('active')) {
                            navLinks.classList.remove('active');
                            hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                            body.classList.remove('menu-open');
                            body.style.overflow = '';
                        }
                    }
                }
            });
        });
        
        // Add touch feedback for buttons
        if ('ontouchstart' in window) {
            document.documentElement.classList.add('touch-device');
            
            document.querySelectorAll('.btn').forEach(btn => {
                btn.addEventListener('touchstart', function() {
                    this.classList.add('touch-active');
                });
                
                btn.addEventListener('touchend', function() {
                    this.classList.remove('touch-active');
                });
                
                btn.addEventListener('touchcancel', function() {
                    this.classList.remove('touch-active');
                });
            });
        }
        
        // Lazy load images for better mobile performance
        this.setupLazyLoading();
    }

    setupLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });
            
            images.forEach(img => {
                if (img.dataset.src) {
                    imageObserver.observe(img);
                }
            });
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            images.forEach(img => {
                img.src = img.dataset.src || img.src;
            });
        }
    }

    setupEventListeners() {
        const runInit = () => {
            this.initializeForm();
            this.setupFormAnimations();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runInit, { once: true });
        } else {
            runInit();
        }
    }

    updateCopyrightYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    initializeForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) {
            console.warn('Contact form not found');
            return;
        }

        this.setupFormHandling(contactForm);
        this.setupFormValidation(contactForm);
    }

    setupFormHandling(form) {
        form.addEventListener('submit', this.handleFormSubmit.bind(this));

        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', this.handleInput.bind(this));
            input.addEventListener('blur', this.handleBlur.bind(this));
        });

        form.querySelectorAll('button:not([type])').forEach(btn => btn.setAttribute('type', 'button'));
    }

    setupFormValidation(form) {
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            const label = field.closest('.form-group')?.querySelector('label');
            if (label && !label.querySelector('.required')) {
                const star = document.createElement('span');
                star.className = 'required';
                star.textContent = '*';
                label.appendChild(star);
            }
        });
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');

        if (!this.validateForm(form)) {
            this.showNotification('Please fill in all required fields correctly.', 'error');
            return;
        }

        await this.submitForm(form, submitBtn);
    }

    async submitForm(form, submitBtn) {
        const originalText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            this.setLoadingState(submitBtn, true);
        }
        form.classList.add('form-loading');

        try {
            // Simulate form submission (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Success
            this.handleSuccess(form);
        } catch (error) {
            this.handleSubmissionError(error);
        } finally {
            if (submitBtn) {
                this.setLoadingState(submitBtn, false, originalText);
            }
            form.classList.remove('form-loading');
        }
    }

    setLoadingState(button, isLoading, originalText = '') {
        if (!button) return;
        if (isLoading) {
            button.dataset._originalText = button.dataset._originalText || button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending...';
            button.disabled = true;
        } else {
            const restore = originalText || button.dataset._originalText || button.innerHTML;
            button.innerHTML = restore;
            button.disabled = false;
            delete button.dataset._originalText;
        }
    }

    handleSuccess(form) {
        this.showNotification('Message sent successfully! I will get back to you soon.', 'success');
        try { form.reset(); } catch (err) { /* ignore */ }
        this.resetFormValidation(form);
    }

    handleSubmissionError(error) {
        console.error('Form submission failed:', error);
        this.showNotification(
            'Failed to send message. Please try again or email me directly at qdarwinrhey@gmail.com',
            'error'
        );
    }

    // Validation Methods
    handleInput(e) {
        this.clearFieldError(e.target);
    }

    handleBlur(e) {
        this.validateField(e.target);
    }

    validateField(field) {
        if (!field) return true;

        const value = (field.value || '').trim();
        const fieldName = field.getAttribute('name') || field.type || '';

        if (field.hasAttribute('required') && !value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }

        if (value) {
            return this.validateFieldType(field, value, fieldName);
        }

        this.markFieldValid(field);
        return true;
    }

    validateFieldType(field, value, fieldName) {
        const validators = {
            email: () => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value) || 'Please enter a valid email address';
            },
            text: () => {
                if (fieldName === 'name' && value.length < 2) {
                    return 'Name must be at least 2 characters long';
                }
                return true;
            },
            textarea: () => {
                if (fieldName === 'message' && value.length < 10) {
                    return 'Message must be at least 10 characters long';
                }
                return true;
            }
        };

        const validator = validators[field.type] || validators[fieldName] || (() => true);
        const result = validator();

        if (result !== true) {
            this.showFieldError(field, result);
            return false;
        }

        this.markFieldValid(field);
        return true;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        field.classList.remove('valid');

        const container = field.closest('.form-group') || field.parentNode;
        if (!container) return;

        let errorElement = container.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            container.appendChild(errorElement);
        }

        errorElement.textContent = message;
        if (field.id) {
            errorElement.setAttribute('aria-live', 'assertive');
            field.setAttribute('aria-describedby', `${field.id}-error`);
            errorElement.id = `${field.id}-error`;
        }
    }

    clearFieldError(field) {
        if (!field) return;
        const container = field.closest('.form-group') || field.parentNode;
        const errorElement = container ? container.querySelector('.field-error') : null;
        if (errorElement) {
            errorElement.remove();
        }
        field.classList.remove('error');
        if (field.id) {
            field.removeAttribute('aria-describedby');
        }
    }

    markFieldValid(field) {
        field.classList.add('valid');
        field.classList.remove('error');
        this.clearFieldError(field);
    }

    validateForm(form) {
        const fields = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    resetFormValidation(form) {
        const fields = form.querySelectorAll('input, textarea');
        fields.forEach(field => {
            field.classList.remove('error', 'valid');
            this.clearFieldError(field);
        });
    }

    // Animation Methods
    setupFormAnimations() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea, button');

        inputs.forEach((input, index) => {
            this.animateElement(input, index);
        });
    }

    animateElement(element, index) {
        element.style.opacity = element.style.opacity || '0';
        element.style.transform = element.style.transform || 'translateY(20px)';
        element.style.transition = `all 0.6s ease ${index * 100 + 300}ms`;

        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }

    // Notification System
    showNotification(message, type = 'info') {
        this.removeExistingNotifications();

        const notification = this.createNotificationElement(message, type);
        document.body.appendChild(notification);

        notification.offsetHeight;
        this.animateNotificationIn(notification);
        this.setupNotificationAutoRemove(notification);
    }

    createNotificationElement(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };

        const content = document.createElement('div');
        content.className = 'notification-content';

        const icon = document.createElement('i');
        icon.className = `fas ${icons[type] || icons.info}`;
        icon.setAttribute('aria-hidden', 'true');

        const span = document.createElement('span');
        span.textContent = message;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.setAttribute('type', 'button');
        closeBtn.setAttribute('aria-label', 'Close notification');
        closeBtn.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';

        content.appendChild(icon);
        content.appendChild(span);
        content.appendChild(closeBtn);

        notification.appendChild(content);

        this.setupNotificationClose(notification, closeBtn);
        return notification;
    }

    setupNotificationClose(notification, closeBtn) {
        const closeHandler = (evt) => {
            if (evt) {
                try { evt.preventDefault(); } catch (e) {}
                try { evt.stopPropagation(); } catch (e) {}
            }
            this.closeNotification(notification);
        };

        closeBtn.addEventListener('pointerdown', closeHandler);
        closeBtn.addEventListener('click', closeHandler);
    }

    animateNotificationIn(notification) {
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
    }

    setupNotificationAutoRemove(notification) {
        setTimeout(() => {
            if (notification.parentElement) {
                this.closeNotification(notification);
            }
        }, 5000);
    }

    closeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }

    removeExistingNotifications() {
        document.querySelectorAll('.notification').forEach(notification => {
            this.closeNotification(notification);
        });
    }

    // Styles Injection
    injectStyles() {
        if (document.getElementById('contact-form-styles')) return;

        const styles = `
            /* Additional mobile optimizations */
            .touch-active {
                opacity: 0.8;
                transform: scale(0.98);
                transition: transform 0.1s ease;
            }
            
            /* Loading animation for mobile */
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .form-loading * {
                animation: pulse 2s infinite;
            }
            
            /* Fix for button spacing on mobile */
            @media (max-width: 767px) {
                .hero-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    align-items: center;
                    width: 100%;
                }
                
                .hero-buttons .btn {
                    width: 100%;
                    max-width: 300px;
                    margin: 5px 0;
                }
                
                /* Fix for iOS input */
                input[type="text"],
                input[type="email"],
                input[type="tel"],
                textarea,
                select {
                    font-size: 16px !important;
                }
                
                /* Improve scrolling on iOS */
                .scroll-fix {
                    -webkit-overflow-scrolling: touch;
                }
            }
            
            /* Performance optimizations */
            img[loading="lazy"] {
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            img[loading="lazy"].loaded {
                opacity: 1;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'contact-form-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
}

// Initialize the contact form manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ContactFormManager();
    });
} else {
    new ContactFormManager();
}

// Error handling for the application
window.addEventListener('error', (event) => {
    console.error('Application Error:', event.error);
    
    // Show user-friendly error message
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
            <span>An unexpected error occurred. Please refresh the page.</span>
            <button class="notification-close" aria-label="Close notification">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
    
    event.preventDefault();
});

// Add performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`Page loaded in ${loadTime}ms`);
        
        // Log any performance issues
        if (loadTime > 3000) {
            console.warn('Page load time is high. Consider optimizing assets.');
        }
    });
}
// Add this method to your ContactFormManager class
setupHeaderScrollEffect() {
    const header = document.querySelector('header');
    const navbar = document.querySelector('.navbar');
    
    if (!header || !navbar) return;
    
    let lastScrollTop = 0;
    const scrollThreshold = 100;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add/remove scrolled class based on scroll position
        if (scrollTop > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Optional: Hide/show header on scroll (uncomment if needed)
        /*
        if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        */
        
        lastScrollTop = scrollTop;
    });
    
    // Initial check
    if (window.pageYOffset > scrollThreshold) {
        header.classList.add('scrolled');
    }
}

// Then add this to your init() method
init() {
    this.setupEventListeners();
    this.injectStyles();
    this.setupMobileNavigation();
    this.setupMobileOptimizations();
    this.updateCopyrightYear();
    this.setupHeaderScrollEffect(); // Add this line
    this.setupHeaderResponsive();   // Add this line too
}

// Add responsive header adjustment
setupHeaderResponsive() {
    const header = document.querySelector('header');
    
    if (!header) return;
    
    // Adjust header on window resize
    window.addEventListener('resize', () => {
        this.adjustHeaderHeight();
    });
    
    // Initial adjustment
    this.adjustHeaderHeight();
}

adjustHeaderHeight() {
    const header = document.querySelector('header');
    const navLinks = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');
    
    if (!header) return;
    
    const width = window.innerWidth;
    
    if (width >= 1200) {
        // Desktop large
        header.style.height = '75px';
        if (navLinks) navLinks.style.top = '75px';
    } else if (width >= 992) {
        // Desktop medium
        header.style.height = '65px';
        if (navLinks) navLinks.style.top = '65px';
    } else if (width >= 768) {
        // Tablet
        header.style.height = '65px';
        if (navLinks) navLinks.style.top = '65px';
    } else if (width >= 576) {
        // Mobile large
        header.style.height = '60px';
        if (navLinks) navLinks.style.top = '60px';
    } else {
        // Mobile small
        header.style.height = '55px';
        if (navLinks) navLinks.style.top = '55px';
    }
    
    // Adjust hero section padding
    const hero = document.querySelector('.hero');
    if (hero) {
        const headerHeight = header.offsetHeight;
        hero.style.paddingTop = `${headerHeight + 20}px`;
    }
}

