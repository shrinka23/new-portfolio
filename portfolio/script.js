// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeFormspree();
});

function initializeFormspree() {
    setupFormspreeHandling();
    setupFormAnimations();
}

// Form Handler for Formspree
function setupFormspreeHandling() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', handleFormspreeSubmit);
    
    // Add real-time validation
    setupFormValidation(contactForm);
}

async function handleFormspreeSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Validate form before submission
    if (!validateForm(form)) {
        showNotification('Please fill in all required fields correctly.', 'error');
        return;
    }
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    form.classList.add('form-loading');
    
    try {
        const formData = new FormData(form);
        
        // Send to Formspree
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            showNotification('Message sent successfully! I will get back to you soon.', 'success');
            form.reset();
            resetFormValidation(form);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Form submission failed');
        }
        
    } catch (error) {
        console.error('Form submission failed:', error);
        showNotification('Failed to send message. Please try again or email me directly at qdarwinrhey@gmail.com', 'error');
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        form.classList.remove('form-loading');
    }
}

// Form Validation
function setupFormValidation(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    
    inputs.forEach(input => {
        // Real-time validation
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldName = field.getAttribute('name');
    
    clearFieldError(e);
    
    if (!value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Email validation
    if (fieldName === 'email' || field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    // Name validation (minimum 2 characters)
    if (fieldName === 'name' && value.length < 2) {
        showFieldError(field, 'Name must be at least 2 characters long');
        return false;
    }
    
    // Message validation (minimum 10 characters)
    if (fieldName === 'message' && value.length < 10) {
        showFieldError(field, 'Message must be at least 10 characters long');
        return false;
    }
    
    // Mark field as valid
    field.classList.add('valid');
    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Create error message
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
    `;
    
    field.parentNode.appendChild(errorElement);
}

function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function validateForm(form) {
    const requiredFields = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        // Create a blur event to trigger validation
        const event = new Event('blur');
        field.dispatchEvent(event);
        
        if (field.classList.contains('error')) {
            isValid = false;
        }
    });
    
    return isValid;
}

function resetFormValidation(form) {
    const fields = form.querySelectorAll('input, textarea');
    fields.forEach(field => {
        field.classList.remove('error', 'valid');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    });
}

// Form Animations
function setupFormAnimations() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach((input, index) => {
        input.style.opacity = '0';
        input.style.transform = 'translateY(20px)';
        input.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            input.style.opacity = '1';
            input.style.transform = 'translateY(0)';
        }, index * 100 + 300);
    });
}

// Notification System
function showNotification(message, type) {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(notification => {
        notification.remove();
    });
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add close event
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            closeNotification(notification);
        }
    }, 5000);
}

function closeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 300);
}

// Add CSS styles for form enhancements
const formStyles = `
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
    
    /* Notifications */
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        transform: translateX(400px);
        transition: transform 0.3s ease;
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
    }
    
    .notification.error .notification-content {
        background: rgba(239, 68, 68, 0.95);
        border-left-color: #dc2626;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 5px;
        margin-left: auto;
        transition: opacity 0.2s ease;
    }
    
    .notification-close:hover {
        opacity: 0.8;
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
    .form-group textarea {
        transition: all 0.3s ease;
    }
    
    .form-group input:focus,
    .form-group textarea:focus {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 255, 255, 0.2);
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = formStyles;
document.head.appendChild(styleSheet);
