// Contact Form Manager
class ContactFormManager {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.injectStyles();
        this.setupResizeHandler();
    }

    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.isMobile = window.innerWidth <= 768;
                this.adjustForMobile();
            }, 250);
        });
    }

    adjustForMobile() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        // Adjust form spacing on mobile
        const formGroups = form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            if (this.isMobile) {
                group.style.marginBottom = '1.2rem';
            } else {
                group.style.marginBottom = '';
            }
        });

        // Adjust button size on mobile
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            if (this.isMobile) {
                submitBtn.style.padding = '0.8rem 1.5rem';
                submitBtn.style.fontSize = '1rem';
                submitBtn.style.width = '100%';
            } else {
                submitBtn.style.padding = '';
                submitBtn.style.fontSize = '';
                submitBtn.style.width = '';
            }
        }

        // Adjust input font sizes for better mobile readability
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (this.isMobile) {
                input.style.fontSize = '16px'; // Prevents iOS zoom on focus
                input.style.padding = '0.8rem';
            } else {
                input.style.fontSize = '';
                input.style.padding = '';
            }
        });
    }

    setupEventListeners() {
        const runInit = () => {
            this.initializeForm();
            this.setupFormAnimations();
            this.adjustForMobile();
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
        this.setupTouchEvents(contactForm);
    }

    setupTouchEvents(form) {
        // Add touch-specific interactions for mobile
        const inputs = form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            // Prevent double-tap zoom on mobile
            input.addEventListener('touchstart', (e) => {
                if (this.isMobile) {
                    e.target.style.fontSize = '16px';
                }
            });

            // Improve mobile keyboard experience
            if (input.tagName === 'TEXTAREA') {
                input.addEventListener('focus', () => {
                    if (this.isMobile) {
                        setTimeout(() => {
                            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 300);
                    }
                });
            }
        });

        // Better submit button touch feedback
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.addEventListener('touchstart', () => {
                if (this.isMobile) {
                    submitBtn.style.transform = 'scale(0.98)';
                }
            });

            submitBtn.addEventListener('touchend', () => {
                if (this.isMobile) {
                    submitBtn.style.transform = '';
                }
            });
        }
    }

    setupFormHandling(form) {
        // Use event delegation for submit to ensure proper target
        form.addEventListener('submit', this.handleFormSubmit.bind(this));

        // Add input event listeners for real-time validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', this.handleInput.bind(this));
            input.addEventListener('blur', this.handleBlur.bind(this));
            
            // Add focus styles for better mobile UX
            input.addEventListener('focus', () => {
                if (this.isMobile) {
                    input.style.outline = 'none';
                    input.style.borderWidth = '2px';
                }
            });
            
            input.addEventListener('blur', () => {
                if (this.isMobile) {
                    input.style.borderWidth = '';
                }
            });
        });

        // Prevent form submission on enter key in textareas (mobile keyboards)
        form.querySelectorAll('textarea').forEach(textarea => {
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey && this.isMobile) {
                    e.stopPropagation(); // Don't submit, allow new line
                }
            });
        });

        // Ensure any buttons inside forms that are not meant to submit explicitly have type="button"
        form.querySelectorAll('button:not([type])').forEach(btn => btn.setAttribute('type', 'button'));
    }

    setupFormValidation(form) {
        // Add required field indicators to labels within .form-group
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            const label = field.closest('.form-group')?.querySelector('label');
            if (label && !label.querySelector('.required')) {
                const star = document.createElement('span');
                star.className = 'required';
                star.textContent = '*';
                star.style.fontSize = this.isMobile ? '1.2em' : '1em';
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

        // Hide mobile keyboard after submission attempt
        if (this.isMobile) {
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                activeElement.blur();
            }
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

            // When sending FormData, do not set Content-Type header manually.
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
            button.innerHTML = this.isMobile 
                ? '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i>'
                : '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending...';
            button.disabled = true;
            button.style.opacity = '0.8';
        } else {
            const restore = originalText || button.dataset._originalText || button.innerHTML;
            button.innerHTML = restore;
            button.disabled = false;
            button.style.opacity = '';
            delete button.dataset._originalText;
        }
    }

    handleSuccess(form) {
        this.showNotification('Message sent successfully! I will get back to you soon.', 'success');
        try { form.reset(); } catch (err) { /* ignore */ }
        this.resetFormValidation(form);
        
        // Scroll to top of form on mobile for better UX
        if (this.isMobile && form.scrollIntoView) {
            setTimeout(() => {
                form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }
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

        // Required check
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
        errorElement.style.fontSize = this.isMobile ? '0.8rem' : '0.875rem';
        
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
        // Reduce animation delay on mobile for faster perceived performance
        const delay = this.isMobile ? index * 50 + 100 : index * 100 + 300;
        
        element.style.opacity = element.style.opacity || '0';
        element.style.transform = element.style.transform || 'translateY(20px)';
        element.style.transition = `all 0.4s ease ${delay}ms`;

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

        // Force reflow then show
        // eslint-disable-next-line no-unused-expressions
        notification.offsetHeight;
        this.animateNotificationIn(notification);
        this.setupNotificationAutoRemove(notification);
    }

    createNotificationElement(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Mobile-specific positioning
        if (this.isMobile) {
            notification.style.top = '10px';
            notification.style.right = '10px';
            notification.style.left = '10px';
            notification.style.maxWidth = 'calc(100vw - 20px)';
        }

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
        icon.style.fontSize = this.isMobile ? '1.2rem' : '1rem';

        const span = document.createElement('span');
        span.textContent = message;
        span.style.fontSize = this.isMobile ? '0.9rem' : '1rem';
        span.style.lineHeight = '1.4';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.setAttribute('type', 'button');
        closeBtn.setAttribute('aria-label', 'Close notification');
        closeBtn.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';
        closeBtn.style.padding = this.isMobile ? '8px' : '5px';
        closeBtn.style.minWidth = this.isMobile ? '44px' : 'auto'; // Better touch target
        closeBtn.style.minHeight = this.isMobile ? '44px' : 'auto';

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

        // Use pointer events for better mobile support
        closeBtn.addEventListener('pointerdown', closeHandler);
        closeBtn.addEventListener('click', closeHandler);
        
        // Also allow swipe to dismiss on mobile
        if (this.isMobile) {
            let touchStartX = 0;
            notification.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
            }, { passive: true });
            
            notification.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                if (Math.abs(touchEndX - touchStartX) > 50) {
                    this.closeNotification(notification);
                }
            }, { passive: true });
        }
    }

    animateNotificationIn(notification) {
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
    }

    setupNotificationAutoRemove(notification) {
        // Shorter timeout on mobile
        const timeout = this.isMobile ? 4000 : 5000;
        setTimeout(() => {
            if (notification.parentElement) {
                this.closeNotification(notification);
            }
        }, timeout);
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
            /* Base Form Styles */
            #contactForm {
                width: 100%;
                box-sizing: border-box;
            }
            
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
                margin-bottom: 1.5rem;
            }
            
            @media (max-width: 768px) {
                .form-group {
                    margin-bottom: 1.2rem;
                }
            }
            
            .form-group input,
            .form-group textarea {
                width: 100%;
                box-sizing: border-box;
                -webkit-appearance: none;
                border-radius: 8px;
            }
            
            @media (max-width: 768px) {
                .form-group input,
                .form-group textarea {
                    font-size: 16px !important; /* Prevents iOS zoom */
                    padding: 0.8rem;
                    min-height: 44px; /* Better touch target */
                }
                
                .form-group textarea {
                    min-height: 120px;
                }
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
            
            @media (max-width: 768px) {
                .field-error {
                    font-size: 0.8rem;
                    margin-top: 0.2rem;
                }
            }
            
            .required {
                color: #ef4444;
                margin-left: 4px;
            }
            
            @media (max-width: 768px) {
                .required {
                    font-size: 1.2em;
                }
            }
            
            /* Submit Button */
            button[type="submit"] {
                transition: all 0.3s ease;
                min-height: 44px; /* Minimum touch target size */
            }
            
            @media (max-width: 768px) {
                button[type="submit"] {
                    width: 100% !important;
                    padding: 0.8rem 1.5rem !important;
                    font-size: 1rem !important;
                    margin-top: 1rem;
                }
            }
            
            /* Notifications - Mobile Responsive */
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                font-family: inherit;
                pointer-events: auto;
            }
            
            @media (max-width: 768px) {
                .notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: calc(100vw - 20px);
                    transform: translateY(-100px);
                }
                
                .notification.show {
                    transform: translateY(0);
                }
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
                min-height: 60px;
            }
            
            @media (max-width: 768px) {
                .notification-content {
                    padding: 12px 15px;
                    gap: 8px;
                    min-height: 56px;
                }
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
                min-width: 32px;
                min-height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            @media (max-width: 768px) {
                .notification-close {
                    padding: 8px;
                    min-width: 44px;
                    min-height: 44px;
                }
            }
            
            .notification-close:hover,
            .notification-close:active {
                opacity: 0.8;
                background: rgba(255, 255, 255, 0.1);
            }
            
            .notification-content i {
                flex-shrink: 0;
            }
            
            .notification-content span {
                flex: 1;
                word-wrap: break-word;
                overflow-wrap: break-word;
                hyphens: auto;
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
            
            @media (max-width: 768px) {
                .form-group input:focus,
                .form-group textarea:focus {
                    transform: translateY(-1px);
                    box-shadow: 0 3px 10px rgba(0, 255, 255, 0.2);
                }
            }
            
            /* Touch Feedback */
            @media (max-width: 768px) {
                button[type="submit"]:active {
                    transform: scale(0.98);
                }
                
                input:focus,
                textarea:focus {
                    outline: none;
                    border-width: 2px !important;
                }
            }
            
            /* Accessibility and Reduced Motion */
            @media (prefers-reduced-motion: reduce) {
                .notification,
                .form-group input,
                .form-group textarea,
                .form-group button,
                .fa-spinner {
                    transition: none;
                    animation: none;
                }
            }
            
            /* Hide spin buttons on number inputs */
            input[type="number"]::-webkit-inner-spin-button,
            input[type="number"]::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            
            input[type="number"] {
                -moz-appearance: textfield;
            }
            
            /* Prevent text resize on mobile */
            textarea {
                resize: vertical;
                min-height: 100px;
            }
            
            @media (max-width: 768px) {
                textarea {
                    resize: vertical;
                    min-height: 120px;
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
