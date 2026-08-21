/**
 * UI/UX Designer Portfolio - Main JavaScript
 * Modular, production-quality script handling all interactive features.
 * Vanilla JavaScript only - no external libraries.
 */

(function () {
    'use strict';

    // ─────────────────────────────────────────────
    // 1. Loading Screen
    // ─────────────────────────────────────────────
    window.addEventListener('load', () => {
        const loader = document.getElementById('loadingScreen');
        if (loader) {
            setTimeout(() => {
                loader.classList.add('hidden');
                document.body.classList.add('loaded');
            }, 1500);
        }
    });

    // ─────────────────────────────────────────────
    // 2. Navbar
    // ─────────────────────────────────────────────
    function initNavbar() {
        const navbar = document.querySelector('.navbar');
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('section[id]');

        if (!navbar) return;

        // Sticky navbar on scroll
        function handleScroll() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        // Mobile hamburger toggle
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                const isOpen = navMenu.classList.toggle('active');
                navToggle.classList.toggle('open', isOpen);
                navToggle.setAttribute('aria-expanded', String(isOpen));
            });

            // Close mobile menu when a nav link is clicked
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('open');
                    navToggle.setAttribute('aria-expanded', 'false');
                });
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (
                    navMenu.classList.contains('active') &&
                    !navMenu.contains(e.target) &&
                    !navToggle.contains(e.target)
                ) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('open');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Active navigation link based on scroll position. Only enable this for
        // menus that actually contain section-anchor links; the main site menu
        // uses page links and should keep its current-page state.
        const hasSectionLinks = Array.from(navLinks).some(link =>
            (link.getAttribute('href') || '').startsWith('#')
        );

        if (sections.length > 0 && hasSectionLinks) {
            const observerOptions = {
                threshold: 0,
                rootMargin: '-70px 0px -60% 0px'
            };

            const sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        const matchingLink = Array.from(navLinks).find(
                            link => link.getAttribute('href') === `#${id}`
                        );

                        // Page-level navigation (for example Home -> index.html)
                        // should remain active when the page has unrelated sections.
                        if (!matchingLink) return;

                        navLinks.forEach(link => {
                            link.classList.remove('active');
                            if (link.getAttribute('href') === `#${id}`) {
                                link.classList.add('active');
                            }
                        });
                    }
                });
            }, observerOptions);

            sections.forEach(section => sectionObserver.observe(section));
        }
    }

    // ─────────────────────────────────────────────
    // 3. Theme Toggle (Dark/Light Mode)
    // ─────────────────────────────────────────────
    function initTheme() {
        const themeToggle = document.querySelector('.theme-toggle');
        const root = document.documentElement;

        // Apply saved theme on load
        const savedTheme = localStorage.getItem('theme') || 'dark';
        root.setAttribute('data-theme', savedTheme);

        if (!themeToggle) return;

        themeToggle.addEventListener('click', () => {
            const currentTheme = root.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            // Update toggle icon if present
            const icon = themeToggle.querySelector('i, .theme-icon');
            if (icon) {
                icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        });
    }

    // ─────────────────────────────────────────────
    // 4. Scroll Reveal Animations
    // ─────────────────────────────────────────────
    function initScrollReveal() {
        const revealElements = document.querySelectorAll(
            '.reveal, .reveal-left, .reveal-right, .reveal-scale'
        );

        if (revealElements.length === 0) return;

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = parseInt(el.getAttribute('data-delay')) || 0;

                    setTimeout(() => {
                        el.classList.add('active');
                    }, delay);

                    revealObserver.unobserve(el);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // ─────────────────────────────────────────────
    // 5. Animated Counters
    // ─────────────────────────────────────────────
    function initCounters() {
        const counters = document.querySelectorAll('[data-count]');

        if (counters.length === 0) return;

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        counters.forEach(counter => counterObserver.observe(counter));

        function animateCounter(element) {
            const target = parseInt(element.getAttribute('data-count'), 10);
            const originalText = element.textContent;
            const hasPlus = originalText.includes('+');
            const duration = 2000;
            const startTime = performance.now();

            function easeOutCubic(t) {
                return 1 - Math.pow(1 - t, 3);
            }

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeOutCubic(progress);
                const currentValue = Math.floor(easedProgress * target);

                element.textContent = currentValue.toLocaleString() + (hasPlus ? '+' : '');

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    element.textContent = target.toLocaleString() + (hasPlus ? '+' : '');
                }
            }

            element.textContent = '0' + (hasPlus ? '+' : '');
            requestAnimationFrame(update);
        }
    }

    // ─────────────────────────────────────────────
    // 6. Progress Bars (Skills)
    // ─────────────────────────────────────────────
    function initProgressBars() {
        const progressBars = document.querySelectorAll('[data-width]');

        if (progressBars.length === 0) return;

        const barObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const targetWidth = bar.getAttribute('data-width');
                    const fill = bar.querySelector('.progress-fill, .progress-bar-fill');

                    if (fill) {
                        fill.style.setProperty('--progress', targetWidth);
                        fill.style.width = '0%';
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                fill.style.width = targetWidth + '%';
                            });
                        });
                    } else {
                        bar.style.setProperty('--progress', targetWidth);
                        bar.style.width = '0%';
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                bar.style.width = targetWidth + '%';
                            });
                        });
                    }

                    barObserver.unobserve(bar);
                }
            });
        }, { threshold: 0.3 });

        progressBars.forEach(bar => barObserver.observe(bar));
    }

    // ─────────────────────────────────────────────
    // 7. Project Filtering
    // ─────────────────────────────────────────────
    function initProjectFilter() {
        const filterButtons = document.querySelectorAll(
            '.project-filters [data-filter], .projects-filter-inner [data-filter]'
        );
        const projectCards = document.querySelectorAll(
            '.projects-grid .project-card[data-category], .projects-page-grid .project-card[data-category]'
        );

        if (filterButtons.length === 0 || projectCards.length === 0) return;

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');

                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Filter cards
                projectCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    const shouldShow = filter === 'all' || category === filter;

                    if (shouldShow) {
                        card.classList.remove('hide');
                        card.classList.add('show');
                        card.style.display = '';
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';

                    } else {
                        card.classList.remove('show');
                        card.classList.add('hide');
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // ─────────────────────────────────────────────
    // 8. Project Search
    // ─────────────────────────────────────────────
    function initProjectSearch() {
        const searchInput = document.querySelector('.project-search-input, #projectSearch');
        const projectCards = document.querySelectorAll('[data-category]');

        if (!searchInput || projectCards.length === 0) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            projectCards.forEach(card => {
                const title = (card.querySelector('.project-title, .card-title, h3, h4') || {}).textContent || '';
                const description = (card.querySelector('.project-description, .card-text, p') || {}).textContent || '';
                const combined = (title + ' ' + description).toLowerCase();

                if (query === '' || combined.includes(query)) {
                    card.style.display = '';
                    card.classList.remove('hide');
                    card.classList.add('show');
                } else {
                    card.style.display = 'none';
                    card.classList.remove('show');
                    card.classList.add('hide');
                }
            });
        });
    }

    // ─────────────────────────────────────────────
    // 9. Testimonials Slider
    // ─────────────────────────────────────────────
    function initTestimonialsSlider() {
        const sliderTrack = document.querySelector('.testimonial-track, .testimonials-track');
        const slides = document.querySelectorAll('.testimonial-slide, .testimonial-item');
        const prevBtn = document.querySelector('.testimonial-prev, .slider-prev');
        const nextBtn = document.querySelector('.testimonial-next, .slider-next');
        const dotsContainer = document.querySelector('.testimonial-dots, .slider-dots');

        if (!sliderTrack || slides.length === 0) return;

        let currentIndex = 0;
        let autoSlideInterval = null;
        let touchStartX = 0;
        let touchEndX = 0;

        // Build dots if container exists
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            });
        }

        function goToSlide(index) {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            currentIndex = index;

            sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`;

            // Update dots
            const dots = dotsContainer ? dotsContainer.querySelectorAll('.testimonial-dot') : [];
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });

            // Update slides active state
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === currentIndex);
            });
        }

        function nextSlide() {
            goToSlide(currentIndex + 1);
        }

        function prevSlide() {
            goToSlide(currentIndex - 1);
        }

        function startAutoSlide() {
            stopAutoSlide();
            autoSlideInterval = setInterval(nextSlide, 5000);
        }

        function stopAutoSlide() {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
                autoSlideInterval = null;
            }
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                startAutoSlide();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                startAutoSlide();
            });
        }

        // Pause on hover
        sliderTrack.addEventListener('mouseenter', stopAutoSlide);
        sliderTrack.addEventListener('mouseleave', startAutoSlide);

        // Touch / swipe support
        sliderTrack.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoSlide();
        }, { passive: true });

        sliderTrack.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }

            startAutoSlide();
        }, { passive: true });

        // Initialize
        goToSlide(0);
        startAutoSlide();
    }

    // ─────────────────────────────────────────────
    // 10. Contact Form Validation
    // ─────────────────────────────────────────────
    function initContactForm() {
        const form = document.querySelector('#contactForm, .contact-form');

        if (!form) return;

        const fields = {
            name: form.querySelector('[name="name"], #name'),
            email: form.querySelector('[name="email"], #email'),
            phone: form.querySelector('[name="phone"], #phone'),
            message: form.querySelector('[name="message"], #message')
        };

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;

        function showError(fieldName, message) {
            const field = fields[fieldName];
            if (!field) return;

            clearError(fieldName);

            const errorEl = document.createElement('span');
            errorEl.className = 'field-error';
            errorEl.textContent = message;
            errorEl.style.color = '#e74c3c';
            errorEl.style.fontSize = '0.85rem';
            errorEl.style.marginTop = '4px';
            errorEl.style.display = 'block';

            field.style.borderColor = '#e74c3c';
            field.parentNode.appendChild(errorEl);
        }

        function clearError(fieldName) {
            const field = fields[fieldName];
            if (!field) return;

            field.style.borderColor = '';
            const existingError = field.parentNode.querySelector('.field-error');
            if (existingError) existingError.remove();
        }

        function validateField(fieldName) {
            const field = fields[fieldName];
            if (!field) return true;

            const value = field.value.trim();

            switch (fieldName) {
                case 'name':
                    if (!value) {
                        showError(fieldName, 'Name is required.');
                        return false;
                    }
                    if (value.length < 2) {
                        showError(fieldName, 'Name must be at least 2 characters.');
                        return false;
                    }
                    clearError(fieldName);
                    return true;

                case 'email':
                    if (!value) {
                        showError(fieldName, 'Email is required.');
                        return false;
                    }
                    if (!emailRegex.test(value)) {
                        showError(fieldName, 'Please enter a valid email address.');
                        return false;
                    }
                    clearError(fieldName);
                    return true;

                case 'phone':
                    if (value && !phoneRegex.test(value)) {
                        showError(fieldName, 'Please enter a valid phone number.');
                        return false;
                    }
                    clearError(fieldName);
                    return true;

                case 'message':
                    if (!value) {
                        showError(fieldName, 'Message is required.');
                        return false;
                    }
                    if (value.length < 10) {
                        showError(fieldName, 'Message must be at least 10 characters.');
                        return false;
                    }
                    clearError(fieldName);
                    return true;

                default:
                    return true;
            }
        }

        // Real-time validation on blur
        Object.keys(fields).forEach(fieldName => {
            const field = fields[fieldName];
            if (field) {
                field.addEventListener('blur', () => validateField(fieldName));
                field.addEventListener('input', () => clearError(fieldName));
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            let isValid = true;

            Object.keys(fields).forEach(fieldName => {
                if (!validateField(fieldName)) {
                    isValid = false;
                }
            });

            if (!isValid) return;

            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"], .submit-btn');
            const originalText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
                submitBtn.classList.add('loading');
            }

            // Simulate sending
            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    submitBtn.classList.remove('loading');
                }

                form.reset();
                Object.keys(fields).forEach(clearError);

                showToast('Message sent successfully! I\'ll get back to you soon.', 'success');
            }, 2000);
        });
    }

    // ─────────────────────────────────────────────
    // 11. Smooth Scroll for All Anchor Links
    // ─────────────────────────────────────────────
    function initSmoothScroll() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href || href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 70;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Update URL without jump
            history.pushState(null, '', href);
        });
    }

    // ─────────────────────────────────────────────
    // 12. Page Transitions
    // ─────────────────────────────────────────────
    function initPageTransitions() {
        const overlay = document.querySelector('.page-transition, .page-loader');

        // Remove active class on page load
        if (overlay) {
            overlay.classList.remove('active');
        }

        // Intercept internal link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (!link) return;

            const href = link.getAttribute('href');

            // Skip anchors, external links, and javascript:void links
            if (
                !href ||
                href.startsWith('#') ||
                href.startsWith('javascript:') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                link.target === '_blank'
            ) return;

            // Only handle .html links (internal pages)
            if (!href.endsWith('.html') && !href.match(/^\.\.?\/|^\/[^.]+$/)) return;

            // Skip if same page
            const currentPath = window.location.pathname;
            const targetPath = new URL(href, window.location.origin).pathname;
            if (currentPath === targetPath) return;

            e.preventDefault();

            if (overlay) {
                overlay.classList.add('active');
                setTimeout(() => {
                    window.location.href = href;
                }, 600);
            } else {
                window.location.href = href;
            }
        });
    }

    // ─────────────────────────────────────────────
    // 13. Toast Notifications
    // ─────────────────────────────────────────────
    function showToast(message, type) {
        type = type || 'success';
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.innerHTML =
            '<span>' + message + '</span>' +
            '<button class="toast-close">&times;</button>';

        container.appendChild(toast);

        // Trigger show animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        });

        // Auto remove after 4 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentNode) toast.remove();
                }, 300);
            }
        }, 4000);
    }

    // Expose globally so other scripts can call it
    window.showToast = showToast;

    // ─────────────────────────────────────────────
    // 14. Modal System
    // ─────────────────────────────────────────────
    function initModalSystem() {
        const modalTriggers = document.querySelectorAll('[data-modal]');
        const modals = document.querySelectorAll('.modal-overlay, .modal');
        let activeModal = null;

        function openModal(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) return;

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            activeModal = modal;

            // Focus trap: focus first focusable element
            const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable) focusable.focus();
        }

        function closeModal(modal) {
            if (!modal) modal = activeModal;
            if (!modal) return;

            modal.classList.remove('active');
            document.body.style.overflow = '';
            activeModal = null;
        }

        // Open triggers
        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = trigger.getAttribute('data-modal');
                openModal(modalId);
            });
        });

        // Close buttons inside modals
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.modal-close, .close-btn, [data-close]');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => closeModal(modal));
            }

            // Close on overlay background click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && activeModal) {
                closeModal(activeModal);
            }
        });

        // Also support direct modal open/close via class toggling
        window.openModal = openModal;
        window.closeModal = closeModal;
    }

    // ─────────────────────────────────────────────
    // 15. Mouse Parallax on Hero
    // ─────────────────────────────────────────────
    function initParallax() {
        const hero = document.querySelector('.hero, .hero-section, .home-hero');
        if (!hero) return;

        const floatingElements = hero.querySelectorAll(
            '.floating-card, .hero-floating, .parallax-element, [data-speed]'
        );

        if (floatingElements.length === 0) return;

        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            floatingElements.forEach(el => {
                const speed = parseFloat(el.getAttribute('data-speed')) || 0.02;
                const moveX = (mouseX - centerX) * speed;
                const moveY = (mouseY - centerY) * speed;

                el.style.transform = 'translate(' + moveX + 'px, ' + moveY + 'px)';
                el.style.transition = 'transform 0.1s ease-out';
            });
        });

        hero.addEventListener('mouseleave', () => {
            floatingElements.forEach(el => {
                el.style.transform = 'translate(0, 0)';
                el.style.transition = 'transform 0.5s ease-out';
            });
        });
    }

    // ─────────────────────────────────────────────
    // 16. Back to Top Button
    // ─────────────────────────────────────────────
    function initBackToTop() {
        const backToTopBtn = document.querySelector('.back-to-top, #backToTop');
        if (!backToTopBtn) return;

        function toggleBackToTop() {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }

        window.addEventListener('scroll', toggleBackToTop, { passive: true });
        toggleBackToTop();

        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ─────────────────────────────────────────────
    // 17. Typing Effect (Bonus)
    // ─────────────────────────────────────────────
    function initTypingEffect() {
        const typedElement = document.querySelector('.typed-text, .typing');
        if (!typedElement) return;

        const texts = typedElement.getAttribute('data-texts');
        if (!texts) return;

        const textArray = texts.split('|');
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = 100;

        function type() {
            const currentText = textArray[textIndex];

            if (isDeleting) {
                typedElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                typeSpeed = 50;
            } else {
                typedElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                typeSpeed = 100;
            }

            if (!isDeleting && charIndex === currentText.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % textArray.length;
                typeSpeed = 500;
            }

            setTimeout(type, typeSpeed);
        }

        type();
    }

    // ─────────────────────────────────────────────
    // 18. Scroll Progress Indicator
    // ─────────────────────────────────────────────
    function initScrollProgress() {
        const progressBar = document.querySelector('.scroll-progress, #scrollProgress');
        if (!progressBar) return;

        function updateProgress() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = progress + '%';
        }

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }

    // ─────────────────────────────────────────────
    // 19. Magnetic Buttons (Bonus)
    // ─────────────────────────────────────────────
    function initMagneticButtons() {
        const magneticBtns = document.querySelectorAll('.magnetic, .magnetic-btn');

        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                btn.style.transform = 'translate(' + (x * 0.3) + 'px, ' + (y * 0.3) + 'px)';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
                btn.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            });

            btn.addEventListener('mouseenter', () => {
                btn.style.transition = 'transform 0.1s ease-out';
            });
        });
    }

    // ─────────────────────────────────────────────
    // 20. Custom Cursor (Bonus)
    // ─────────────────────────────────────────────
    function initCustomCursor() {
        const cursor = document.querySelector('.custom-cursor, .cursor');
        const cursorFollower = document.querySelector('.cursor-follower, .cursor-dot');

        if (!cursor) return;

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';

            if (cursorFollower) {
                setTimeout(() => {
                    cursorFollower.style.left = e.clientX + 'px';
                    cursorFollower.style.top = e.clientY + 'px';
                }, 80);
            }
        });

        // Scale cursor on hover of interactive elements
        const hoverTargets = document.querySelectorAll('a, button, .btn, [data-cursor="pointer"]');
        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
                if (cursorFollower) cursorFollower.classList.add('hover');
            });
            target.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
                if (cursorFollower) cursorFollower.classList.remove('hover');
            });
        });

        // Hide default cursor
        document.body.style.cursor = 'none';
        const style = document.createElement('style');
        style.textContent = 'a, button, .btn, [data-cursor="pointer"] { cursor: none !important; }';
        document.head.appendChild(style);
    }

    // ─────────────────────────────────────────────
    // 21. Tilt Card Effect (Bonus)
    // ─────────────────────────────────────────────
    function initTiltCards() {
        const tiltCards = document.querySelectorAll('.tilt-card, .card-tilt');

        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;

                card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.02, 1.02, 1.02)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
                card.style.transition = 'transform 0.5s ease';
            });

            card.addEventListener('mouseenter', () => {
                card.style.transition = 'transform 0.1s ease';
            });
        });
    }

    // ─────────────────────────────────────────────
    // 22. Active Filter URL State (Bonus)
    // ─────────────────────────────────────────────
    function initFilterFromURL() {
        const params = new URLSearchParams(window.location.search);
        const filterParam = params.get('filter');
        if (!filterParam) return;

        const targetBtn = document.querySelector('[data-filter="' + filterParam + '"]');
        if (targetBtn) {
            targetBtn.click();
        }
    }

    // ─────────────────────────────────────────────
    // 23. Sticky Elements (Bonus)
    // ─────────────────────────────────────────────
    function initStickyElements() {
        const stickyElements = document.querySelectorAll('[data-sticky]');

        stickyElements.forEach(el => {
            const offset = parseInt(el.getAttribute('data-sticky')) || 0;

            function checkSticky() {
                const rect = el.getBoundingClientRect();
                if (rect.top <= offset) {
                    el.classList.add('stuck');
                } else {
                    el.classList.remove('stuck');
                }
            }

            window.addEventListener('scroll', checkSticky, { passive: true });
        });
    }

    // ─────────────────────────────────────────────
    // 24. Lazy Load Images (Bonus)
    // ─────────────────────────────────────────────
    function initLazyLoad() {
        const lazyImages = document.querySelectorAll('img[data-src]');

        if (lazyImages.length === 0) return;

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '200px 0px'
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // ─────────────────────────────────────────────
    // 25. Newsletter / Email Capture (Bonus)
    // ─────────────────────────────────────────────
    function initNewsletter() {
        const form = document.querySelector('.newsletter-form, #newsletterForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailInput = form.querySelector('input[type="email"]');
            if (!emailInput) return;

            const email = emailInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!email || !emailRegex.test(email)) {
                showToast('Please enter a valid email address.', 'error');
                return;
            }

            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn ? btn.textContent : '';
            if (btn) {
                btn.disabled = true;
                btn.textContent = 'Subscribing...';
            }

            setTimeout(() => {
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = originalText;
                }
                form.reset();
                showToast('Thanks for subscribing!', 'success');
            }, 1500);
        });
    }

    // ─────────────────────────────────────────────
    // 26. Image Lightbox (Bonus)
    // ─────────────────────────────────────────────
    function initLightbox() {
        const lightboxTriggers = document.querySelectorAll('[data-lightbox]');

        if (lightboxTriggers.length === 0) return;

        // Create lightbox container
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox-overlay';
        lightbox.innerHTML =
            '<div class="lightbox-content">' +
                '<button class="lightbox-close" aria-label="Close">&times;</button>' +
                '<img class="lightbox-image" src="" alt="">' +
            '</div>';
        document.body.appendChild(lightbox);

        const lightboxImage = lightbox.querySelector('.lightbox-image');
        const lightboxClose = lightbox.querySelector('.lightbox-close');

        function openLightbox(src, alt) {
            lightboxImage.src = src;
            lightboxImage.alt = alt || '';
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }

        lightboxTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const src = trigger.getAttribute('data-lightbox');
                const alt = trigger.getAttribute('alt') || trigger.getAttribute('data-alt') || '';
                openLightbox(src, alt);
            });
        });

        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    // ─────────────────────────────────────────────
    // 27. Accordion / FAQ (Bonus)
    // ─────────────────────────────────────────────
    function initAccordion() {
        const accordionItems = document.querySelectorAll('.accordion-item, .faq-item');

        if (accordionItems.length === 0) return;

        accordionItems.forEach(item => {
            const header = item.querySelector('.accordion-header, .faq-header, .accordion-toggle');
            if (!header) return;

            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Close all others
                accordionItems.forEach(other => {
                    if (other !== item) {
                        other.classList.remove('active');
                        const otherContent = other.querySelector('.accordion-content, .faq-content');
                        if (otherContent) otherContent.style.maxHeight = '0';
                    }
                });

                // Toggle current
                item.classList.toggle('active');
                const content = item.querySelector('.accordion-content, .faq-content');
                if (content) {
                    content.style.maxHeight = item.classList.contains('active')
                        ? content.scrollHeight + 'px'
                        : '0';
                }
            });
        });
    }

    // ─────────────────────────────────────────────
    // 28. Scroll-linked Navbar Highlight (Bonus)
    // ─────────────────────────────────────────────
    function initNavHighlight() {
        const navIndicator = document.querySelector('.nav-indicator');
        const navLinks = document.querySelectorAll('.nav-link');

        if (!navIndicator || navLinks.length === 0) return;

        function updateIndicator() {
            const activeLink = document.querySelector('.nav-link.active');
            if (!activeLink) {
                navIndicator.style.opacity = '0';
                return;
            }

            const linkRect = activeLink.getBoundingClientRect();
            const navRect = activeLink.closest('nav, .navbar').getBoundingClientRect();

            navIndicator.style.left = (linkRect.left - navRect.left) + 'px';
            navIndicator.style.width = linkRect.width + 'px';
            navIndicator.style.opacity = '1';
        }

        // Use MutationObserver to watch for active class changes
        const classObserver = new MutationObserver(updateIndicator);
        navLinks.forEach(link => {
            classObserver.observe(link, { attributes: true, attributeFilter: ['class'] });
        });

        updateIndicator();
        window.addEventListener('resize', updateIndicator);
    }

    function initCurrentPageActive() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link[href]');

        navLinks.forEach((link) => {
            const linkPath = new URL(link.href, window.location.href).pathname;
            const linkPage = linkPath.split('/').pop() || 'index.html';
            const isCurrentPage = linkPage === currentPage;

            link.classList.toggle('active', isCurrentPage);
            if (isCurrentPage) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
    }

    // ─────────────────────────────────────────────
    // 29. Smooth Anchor Highlight on Scroll (Bonus)
    // ─────────────────────────────────────────────
    function initSmoothHighlight() {
        const highlightElements = document.querySelectorAll('.highlight-on-scroll');

        if (highlightElements.length === 0) return;

        const highlightObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('highlighted');
                }
            });
        }, { threshold: 0.5 });

        highlightElements.forEach(el => highlightObserver.observe(el));
    }

    // ─────────────────────────────────────────────
    // 30. Copy to Clipboard (Bonus)
    // ─────────────────────────────────────────────
    function initCopyToClipboard() {
        document.addEventListener('click', (e) => {
            const copyBtn = e.target.closest('[data-copy]');
            if (!copyBtn) return;

            const targetSelector = copyBtn.getAttribute('data-copy');
            const targetEl = document.querySelector(targetSelector);
            if (!targetEl) return;

            const text = targetEl.textContent || targetEl.value || '';

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    showToast('Copied to clipboard!', 'success');
                }).catch(() => {
                    fallbackCopy(text);
                });
            } else {
                fallbackCopy(text);
            }
        });

        function fallbackCopy(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                showToast('Copied to clipboard!', 'success');
            } catch (err) {
                showToast('Failed to copy.', 'error');
            }
            document.body.removeChild(textarea);
        }
    }

    // ─────────────────────────────────────────────
    // Initialize Everything
    // ─────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.footer-social a, .footer-social-link, .social-link').forEach((socialLink) => {
            socialLink.addEventListener('click', (event) => {
                event.preventDefault();
                window.location.href = '404.html';
            });
        });
        // Core modules
        initCurrentPageActive();
        initNavbar();
        initTheme();
        initScrollReveal();
        initCounters();
        initProgressBars();
        initProjectFilter();
        initProjectSearch();
        initTestimonialsSlider();
        initContactForm();
        initSmoothScroll();
        initPageTransitions();
        initModalSystem();
        initParallax();
        initBackToTop();

        // Bonus modules
        initTypingEffect();
        initScrollProgress();
        initMagneticButtons();
        initTiltCards();
        initFilterFromURL();
        initStickyElements();
        initLazyLoad();
        initNewsletter();
        initLightbox();
        initAccordion();
        initNavHighlight();
        initSmoothHighlight();
        initCopyToClipboard();

        // Only init custom cursor on non-touch devices
        if (window.matchMedia('(pointer: fine)').matches) {
            initCustomCursor();
        }

        console.log('[Portfolio] All modules initialized successfully.');
    });

})();
