// Contact Form Manager with Mobile Menu Support
class ContactFormManager {
    constructor() {
        this.init();
        this.setupMobileMenu();
    }

    init() {
        this.setupEventListeners();
        this.injectStyles();
    }
    
    setupMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        const navItems = document.querySelectorAll('.nav-links a');
        
        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                hamburger.innerHTML = navLinks.classList.contains('active') 
                    ? '<i class="fas fa-times"></i>' 
                    : '<i class="fas fa-bars"></i>';
            });
            
            // Close menu when clicking on a link
            navItems.forEach(item => {
                item.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                });
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                    navLinks.classList.remove('active');
                    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
            
            // Handle window resize
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    navLinks.classList.remove('active');
                    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                }
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
            // Add touch support for mobile
            input.addEventListener('touchstart', this.handleInput.bind(this));
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
            const formData = new FormData(form);

            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                this.handleSuccess(form);
            } else {
                await this.handleError(response);
            }
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

    async handleError(response) {
        try {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server responded with status: ${response.status}`);
        } catch (parseError) {
            throw new Error(`Form submission failed: ${response.status}`);
        }
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
            errorElement.setAttribute('aria-live', 'polite');
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
                evt.preventDefault();
                evt.stopPropagation();
            }
            this.closeNotification(notification);
        };

        closeBtn.addEventListener('click', closeHandler);
        closeBtn.addEventListener('touchstart', closeHandler);
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
            /* Form Loading State */
            .form-loading {
                opacity: 0.7;
                pointer-events: none;
            }
            
            .btn:disabled {
                opacity: 0.7;
                cursor: not-allowed;
            }
            
            /* Form Validation Styles */
            .form-group {
                position: relative;
            }
            
            .form-group input.error,
            .form-group textarea.error {
                border-color: #ef4444 !important;
                background-color: rgba(239, 68, 68, 0.05);
            }
            
            .form-group input.valid,
            .form-group textarea.valid {
                border-color: #22c55e !important;
            }
            
            .field-error {
                color: #ef4444;
                font-size: 0.875rem;
                margin-top: 0.25rem;
                display: block;
                animation: fadeInUp 0.3s ease;
            }
            
            .required {
                color: #ef4444;
                margin-left: 4px;
            }
            
            /* Notifications */
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: calc(100vw - 40px);
                width: 100%;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                font-family: inherit;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-content {
                background: rgba(34, 197, 94, 0.95);
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                backdrop-filter: blur(10px);
                border-left: 4px solid #16a34a;
                word-break: break-word;
            }
            
            .notification.error .notification-content {
                background: rgba(239, 68, 68, 0.95);
                border-left-color: #dc2626;
            }
            
            .notification.info .notification-content {
                background: rgba(59, 130, 246, 0.95);
                border-left-color: #2563eb;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 5px;
                margin-left: auto;
                transition: opacity 0.2s ease;
                border-radius: 4px;
                flex-shrink: 0;
            }
            
            .notification-close:hover {
                opacity: 0.8;
                background: rgba(255, 255, 255, 0.1);
            }
            
            /* Mobile Optimizations */
            @media (max-width: 768px) {
                .notification {
                    top: 80px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                    width: auto;
                }
                
                .notification-content {
                    padding: 12px 15px;
                    font-size: 0.9rem;
                }
            }
            
            /* Animations */
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .fa-spinner {
                animation: spin 1s linear infinite;
            }
            
            /* Form input animations */
            .form-group input,
            .form-group textarea,
            .form-group button {
                transition: all 0.3s ease;
            }
            
            .form-group input:focus,
            .form-group textarea:focus {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 255, 255, 0.2);
            }
            
            /* Accessibility & Touch Device Improvements */
            @media (hover: none) and (pointer: coarse) {
                .form-group input:focus,
                .form-group textarea:focus {
                    transform: none;
                }
                
                .btn,
                .notification-close {
                    min-height: 44px;
                    min-width: 44px;
                }
                
                input,
                textarea,
                button {
                    font-size: 16px !important; /* Prevents iOS zoom on focus */
                }
            }
            
            @media (prefers-reduced-motion: reduce) {
                .notification,
                .form-group input,
                .form-group textarea,
                .form-group button {
                    transition: none;
                    animation: none;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'contact-form-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
}

// Initialize the contact form manager
new ContactFormManager();
