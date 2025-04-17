/**
 * Jade Kite - Rapid Consumer Sentiment Analysis
 * Main JavaScript functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a.nav-link').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            window.scrollTo({
                top: targetElement.offsetTop - 72, // Adjust for navbar height
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse.classList.contains('show')) {
                navbarCollapse.classList.remove('show');
            }
        });
    });
    
    // Navbar background change on scroll
    const navbar = document.querySelector('#mainNav');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
    
    // Scroll animation for elements
    const animateElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
    
    function checkScroll() {
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight * 0.8) {
                element.classList.add('visible');
            }
        });
    }
    
    // Initial check on page load
    checkScroll();
    
    // Check on scroll
    window.addEventListener('scroll', checkScroll);
    
    // Form submission handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const company = document.getElementById('company').value;
            const message = document.getElementById('message').value;
            
            // In a real implementation, you would send this data to a server
            // For now, we'll just show a success message
            
            // Clear form
            contactForm.reset();
            
            // Show success message
            const formContainer = contactForm.parentElement;
            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success mt-3';
            successMessage.textContent = 'Thank you for your message! We will get back to you soon.';
            formContainer.appendChild(successMessage);
            
            // Remove success message after 5 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
        });
    }
    
    // Add animation classes to elements
    document.querySelectorAll('.card').forEach((card, index) => {
        card.classList.add('fade-in');
        // Stagger the animations
        card.style.transitionDelay = `${index * 0.1}s`;
    });
    
    document.querySelectorAll('.timeline-item:nth-child(odd) .timeline-content').forEach(item => {
        item.classList.add('slide-in-left');
    });
    
    document.querySelectorAll('.timeline-item:nth-child(even) .timeline-content').forEach(item => {
        item.classList.add('slide-in-right');
    });
    
    document.querySelectorAll('.phase').forEach((phase, index) => {
        phase.classList.add('fade-in');
        phase.style.transitionDelay = `${index * 0.1}s`;
    });
});
