// Custom cursor design
const cursor = document.createElement('div');
const cursorDot = document.createElement('div');
cursor.classList.add('cursor');
cursorDot.classList.add('cursor-dot');
document.body.appendChild(cursor);
document.body.appendChild(cursorDot);

// Cursor movement
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    // Dot follows with slight delay for smooth effect
    setTimeout(() => {
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
    }, 50);
});

// Cursor hover effects
document.querySelectorAll('a, button, .skill, .project-card, .hamburger').forEach(element => {
    element.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor-hover');
        cursorDot.classList.add('cursor-dot-hover');
    });
    
    element.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-hover');
        cursorDot.classList.remove('cursor-dot-hover');
    });
});

// Hide cursor when leaving window
document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorDot.style.opacity = '0';
});

document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    cursorDot.style.opacity = '1';
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Add scroll effect to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if(window.scrollY > 100) {
        header.style.background = 'rgba(10, 10, 26, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = 'rgba(10, 10, 26, 0.9)';
        header.style.backdropFilter = 'blur(10px)';
    }
});

// Form submission handling
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };
    
    // Here you would typically send the data to a server
    // For now, we'll just log it and show an alert
    console.log('Form submitted:', formData);
    
    // Show success message
    alert('Thank you for your message! I will get back to you soon.');
    
    // Reset form
    this.reset();
});

// Add typing effect to hero text
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
document.addEventListener('DOMContentLoaded', function() {
    const heroTitle = document.querySelector('.hero-content h1');
    const originalText = heroTitle.textContent;
    
    // Uncomment the line below to enable typing effect
    // typeWriter(heroTitle, originalText, 100);
    
    // Add animation to skill tags on scroll
    const skills = document.querySelectorAll('.skill');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    skills.forEach((skill, index) => {
        skill.style.opacity = '0';
        skill.style.transform = 'translateY(20px)';
        skill.style.animationDelay = `${index * 0.1}s`;
        observer.observe(skill);
    });
});

// Add CSS animations including cursor styles
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Custom Cursor Styles */
    .cursor {
        position: fixed;
        width: 20px;
        height: 20px;
        border: 2px solid #00ffff;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.2s ease, width 0.3s ease, height 0.3s ease;
        transform: translate(-50%, -50%);
        mix-blend-mode: difference;
    }
    
    .cursor-dot {
        position: fixed;
        width: 6px;
        height: 6px;
        background: #00ffff;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.1s ease, width 0.3s ease, height 0.3s ease;
        transform: translate(-50%, -50%);
        mix-blend-mode: difference;
    }
    
    .cursor-hover {
        transform: translate(-50%, -50%) scale(1.5);
        background: rgba(0, 255, 255, 0.1);
        border-color: #ff00ff;
    }
    
    .cursor-dot-hover {
        transform: translate(-50%, -50%) scale(0.5);
        background: #ff00ff;
    }
    
    /* Hide default cursor */
    * {
        cursor: none !important;
    }
    
    /* Show default cursor on touch devices */
    @media (hover: none) and (pointer: coarse) {
        .cursor, .cursor-dot {
            display: none;
        }
        * {
            cursor: auto !important;
        }
    }
`;
document.head.appendChild(style);
