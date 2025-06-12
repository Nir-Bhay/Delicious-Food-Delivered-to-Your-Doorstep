// Loader
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.classList.add('hidden');
    }, 1500);
});

// Navigation
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const navLinks = document.querySelectorAll('.nav-link');
const mobileLinks = document.querySelectorAll('.mobile-link');

// Sticky navbar on scroll
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Hide/show navbar on scroll
    if (window.scrollY > lastScrollY && window.scrollY > 100) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }
    lastScrollY = window.scrollY;
});

// Mobile menu toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
});

// Close mobile menu on link click
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');
    });
});

// Active navigation link on scroll
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Menu tabs functionality
const menuTabs = document.querySelectorAll('.menu-tab');
const menuCategories = document.querySelectorAll('.menu-category');

menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetCategory = tab.getAttribute('data-tab');

        // Remove active class from all tabs and categories
        menuTabs.forEach(t => t.classList.remove('active'));
        menuCategories.forEach(c => c.classList.remove('active'));

        // Add active class to clicked tab and corresponding category
        tab.classList.add('active');
        document.getElementById(targetCategory).classList.add('active');
    });
});

// Add to cart animation
const addToCartButtons = document.querySelectorAll('.btn-add-cart');
addToCartButtons.forEach(button => {
    button.addEventListener('click', function (e) {
        e.preventDefault();

        // Create cart animation
        const cart = document.querySelector('.btn-order-now');
        const buttonRect = this.getBoundingClientRect();
        const cartRect = cart.getBoundingClientRect();

        // Create flying item
        const flyingItem = document.createElement('div');
        flyingItem.className = 'flying-item';
        flyingItem.innerHTML = '<i class="fas fa-shopping-bag"></i>';
        flyingItem.style.position = 'fixed';
        flyingItem.style.left = buttonRect.left + 'px';
        flyingItem.style.top = buttonRect.top + 'px';
        flyingItem.style.zIndex = '9999';
        document.body.appendChild(flyingItem);

        // Animate to cart
        setTimeout(() => {
            flyingItem.style.transition = 'all 0.8s cubic-bezier(0.2, 1, 0.3, 1)';
            flyingItem.style.left = cartRect.left + 'px';
            flyingItem.style.top = cartRect.top + 'px';
            flyingItem.style.transform = 'scale(0)';
            flyingItem.style.opacity = '0';
        }, 100);

        // Remove flying item
        setTimeout(() => {
            flyingItem.remove();

            // Cart bounce animation
            cart.style.transform = 'scale(1.2)';
            setTimeout(() => {
                cart.style.transform = 'scale(1)';
            }, 200);
        }, 900);

        // Button feedback
        this.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-plus"></i>';
        }, 2000);
    });
});

// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Initialize Swiper for testimonials
const testimonialSwiper = new Swiper('.testimonials-slider', {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    breakpoints: {
        768: {
            slidesPerView: 2,
        },
        1024: {
            slidesPerView: 3,
        }
    }
});

// Pricing card hover effect
const pricingCards = document.querySelectorAll('.pricing-card');
pricingCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        pricingCards.forEach(c => c.classList.remove('featured'));
        card.classList.add('featured');
    });
});

// Form validation for future forms
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }

        // Email validation
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                input.classList.add('error');
                isValid = false;
            }
        }
    });

    return isValid;
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-shape-1, .hero-shape-2');

    parallaxElements.forEach(element => {
        const speed = element.classList.contains('hero-shape-1') ? 0.5 : 0.3;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Counter animation for stats
function animateCounters() {
    const counters = document.querySelectorAll('.stat h3');

    counters.forEach(counter => {
        const target = parseInt(counter.innerText);
        const increment = target / 100;
        let current = 0;

        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.innerText = Math.ceil(current) + '+';
                setTimeout(updateCounter, 20);
            } else {
                counter.innerText = target + '+';
            }
        };

        updateCounter();
    });
}

// Trigger counter animation when in viewport
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

const statsSection = document.querySelector('.hero-stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// Typing effect for hero title
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

// Optional: Add typing effect to hero title
// const heroTitle = document.querySelector('.hero-title');
// if (heroTitle) {
//     const originalText = heroTitle.innerHTML;
//     typeWriter(heroTitle, originalText);
// }

// Add custom cursor (optional)
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

document.addEventListener('mousedown', () => cursor.classList.add('active'));
document.addEventListener('mouseup', () => cursor.classList.remove('active'));

// Style for custom cursor (add to CSS)
const cursorStyle = document.createElement('style');
cursorStyle.textContent = `
    .custom-cursor {
        width: 20px;
        height: 20px;
        border: 2px solid var(--primary-color);
        border-radius: 50%;
        position: fixed;
        pointer-events: none;
        transition: transform 0.1s;
        z-index: 9999;
        mix-blend-mode: difference;
    }
    
    .custom-cursor.active {
        transform: scale(0.8);
    }
    
    @media (max-width: 768px) {
        .custom-cursor {
            display: none;
        }
    }
    
    .flying-item {
        width: 30px;
        height: 30px;
        background: var(--primary-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }
    
    body.no-scroll {
        overflow: hidden;
    }
    
    input.error, textarea.error {
        border-color: var(--danger-color) !important;
    }
`;
document.head.appendChild(cursorStyle);

// Preload images for better performance
function preloadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageOptions = {
        threshold: 0,
        rootMargin: '50px'
    };

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, imageOptions);

    images.forEach(img => imageObserver.observe(img));
}

// Call preload images on load
preloadImages();

// Service Worker for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(err => console.log('SW registration failed'));
    });
}

// Console message
console.log('%c Welcome to Cloud Kitchen! 🍔 ', 'background: #ff6347; color: white; font-size: 20px; padding: 10px; border-radius: 5px;');