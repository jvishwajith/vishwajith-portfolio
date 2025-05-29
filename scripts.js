// Security: Content integrity protection
(function() {
    'use strict';
    
    // Prevent script injection and content tampering
    const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    const originalOuterHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'outerHTML');
    
    // Monitor for unauthorized DOM modifications
    function validateContent(element) {
        const dangerousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /<iframe/i,
            /<object/i,
            /<embed/i
        ];
        
        const content = element.innerHTML || element.outerHTML || '';
        return !dangerousPatterns.some(pattern => pattern.test(content));
    }
    
    // Override innerHTML setter with security checks
    Object.defineProperty(Element.prototype, 'innerHTML', {
        set: function(value) {
            if (typeof value === 'string' && !validateContent({innerHTML: value})) {
                console.warn('Blocked potentially malicious content injection attempt');
                return;
            }
            return originalInnerHTML.set.call(this, value);
        },
        get: originalInnerHTML.get
    });
    
    // Disable eval and similar dangerous functions for unauthorized use
    const originalEval = window.eval;
    window.eval = function(code) {
        if (typeof code === 'string' && code.includes('malicious')) {
            throw new Error('Blocked potentially harmful eval usage');
        }
        return originalEval.call(this, code);
    };
    
    // Content integrity monitoring
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && !validateContent(node)) {
                        node.remove();
                        console.warn('Removed potentially malicious content');
                    }
                });
            }
        });
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
})();

document.addEventListener("DOMContentLoaded", function () {
    // Animation for section fade-in on scroll
    const observerOptions = {
        root: null, // viewport is the root
        rootMargin: "0px",
        threshold: 0.1, // 10% of the element visible
    };

    // Observer for sections
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            }
        });
    }, observerOptions);

    // Observe all sections with fade-in class
    document.querySelectorAll(".fade-in").forEach((section) => {
        sectionObserver.observe(section);
    });

    // Observer for animated cards
    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Add delay for staggered animation
                setTimeout(
                    () => {
                        entry.target.classList.add("active");
                    },
                    150 *
                        Array.from(entry.target.parentNode.children).indexOf(
                            entry.target,
                        ),
                );
            }
        });
    }, observerOptions);

    // Observe all sliding cards
    document.querySelectorAll(".sliding-card").forEach((card) => {
        cardObserver.observe(card);
    });

    // Timeline items now use achievement cards - no separate observer needed

    // Continuous animations for various elements
    function startContinuousAnimations() {
        // Profile picture animation
        const profilePic = document.querySelector(".profile-frame");
        if (profilePic) {
            setInterval(() => {
                profilePic.style.animation = "none";
                void profilePic.offsetWidth; // Trigger reflow
                profilePic.style.animation = "float 6s ease-in-out infinite";
            }, 6000);
        }

        // Skill bars animation on interval
        const skillBars = document.querySelectorAll(".skill-progress-bar");
        setInterval(() => {
            skillBars.forEach((bar) => {
                const width = bar.style.width;
                bar.style.width = "0";

                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
        }, 10000); // Reset and animate skill bars every 10 seconds

        // Subtle project card animations
        const projectCards = document.querySelectorAll(".project-card");
        projectCards.forEach((card, index) => {
            setInterval(
                () => {
                    card.style.transform = "translateY(-5px)";
                    setTimeout(() => {
                        card.style.transform = "translateY(0)";
                    }, 500);
                },
                5000 + index * 1000,
            ); // Staggered timing for each card
        });
    }

    // Start continuous animations after initial load
    setTimeout(startContinuousAnimations, 2000);

    // Hover animations are handled by CSS - no JavaScript needed

    // Combined scroll effects and navigation highlighting
    window.addEventListener("scroll", function () {
        const scrollPosition = window.scrollY;

        // Parallax for about section
        const aboutSection = document.querySelector("#about");
        if (aboutSection) {
            const aboutOffset = aboutSection.offsetTop;
            const aboutDistance = scrollPosition - aboutOffset;

            if (aboutDistance > -500 && aboutDistance < 500) {
                const profilePic = document.querySelector(".profile-frame");
                if (profilePic) {
                    profilePic.style.transform = `translateY(${aboutDistance * 0.05}px) rotate(${aboutDistance * 0.01}deg)`;
                }
            }
        }

        // Update active navigation links
        updateActiveNavlink();
    });

    // Mobile Navigation Toggle
    const hamburger = document.querySelector(".hamburger");
    const mobileNavLinks = document.querySelector(".nav-links");

    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        mobileNavLinks.classList.toggle("active");
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll(".nav-links a").forEach((link) => {
        link.addEventListener("click", () => {
            hamburger.classList.remove("active");
            mobileNavLinks.classList.remove("active");
        });
    });

    // Enhanced Notification System
    function showNotification(message, duration = 3000) {
        const notificationContainer = document.getElementById(
            "notification-container",
        );
        const notification = document.createElement("div");
        notification.className = "notification";
        notification.textContent = message;

        notificationContainer.appendChild(notification);

        // Trigger reflow for animation
        notification.offsetHeight;

        // Show notification
        notification.classList.add("show");

        // Add sound effect for notification
        const audio = new Audio();
        audio.src =
            "data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFzb25pY1N0dWRpb3MuY29tAFRYWFgAAAAhAAAFdGl0bGUAU21hbGwgQmVsbCBSaW5nIC0gU2luZ2xlAFRYWFgAAAAWAAAAZXhwZXJ0X21ldGFkYXRhX2R1bW15AFRYX1gAAA0wAACgADEJAMkMAAAEgAEJAQADAQAB";
        audio.volume = 0.3;
        audio.play().catch((e) => console.log("Audio play failed:", e));

        // Remove after duration
        setTimeout(() => {
            notification.classList.remove("show");
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, duration);
    }

    // Handle buttons without links - Enhanced with improved notifications
    const repoButtons = document.querySelectorAll(".repo-btn");
    const certButtons = document.querySelectorAll(".certificate-btn");
    const allCertBtn = document.querySelectorAll(".view-all-cert-btn");
    const viewAchievementBtn = document.querySelector(
        ".view-all-achievement-btn",
    );

    repoButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const repoName = this.getAttribute("data-name");
            const repoUrl = this.getAttribute("data-repo-url");
            
            if (repoUrl && repoUrl.trim() !== "") {
                window.open(repoUrl, "_blank");
            } else {
                showNotification(`${repoName} will be updated soon`, 3000);
            }
        });
    });

    certButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const certName = this.getAttribute("data-name");
            const certUrl = this.getAttribute("data-cert-url");
            
            if (certUrl && certUrl.trim() !== "") {
                window.open(certUrl, "_blank");
            } else {
                showNotification(`${certName} will be updated soon`, 3000);
            }
        });
    });

    allCertBtn.forEach((button) => {
        button.addEventListener("click", function () {
            const certName = this.getAttribute("data-name");
            const certUrl = this.getAttribute("data-cert-url");
            
            if (certUrl && certUrl.trim() !== "") {
                window.open(certUrl, "_blank");
            } else {
                showNotification(`${certName} will be updated soon`, 3000);
            }
        });
    });

    if (viewAchievementBtn) {
        viewAchievementBtn.addEventListener("click", function () {
            const achName = this.getAttribute("data-name");
            const certUrl = this.getAttribute("data-cert-url");
            
            if (certUrl && certUrl.trim() !== "") {
                window.open(certUrl, "_blank");
            } else {
                showNotification(`${achName} will be updated soon`, 3000);
            }
        });
    }

    // Resume download button
    document
        .getElementById("download-resume")
        .addEventListener("click", function () {
            const link = document.createElement("a");
            link.href = "Vishwajith_Resume.pdf";
            link.download = "Vishwajith_J_Resume.pdf";
            link.click();
            showNotification("Resume download started successfully!", 3000);
        });

    // GitHub & LinkedIn links are now functional - no need for placeholder handlers

    // Enhanced dynamic navigation highlighting based on visible section
    const sections = document.querySelectorAll("section");
    const navLinksForHighlighting = document.querySelectorAll(".nav-links a");

    function updateActiveNavlink() {
        // Get current scroll position
        const scrollPosition = window.scrollY + window.innerHeight / 3;

        // Find the section that is currently most visible in the viewport
        let currentSection = "";
        let maxVisibility = 0;

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const sectionBottom = sectionTop + sectionHeight;

            // Calculate how much of the section is visible
            const visiblePx =
                Math.min(scrollPosition, sectionBottom) -
                Math.max(window.scrollY, sectionTop);
            const visiblePercent = visiblePx / sectionHeight;

            if (visiblePercent > maxVisibility) {
                maxVisibility = visiblePercent;
                currentSection = section.getAttribute("id");
            }
        });

        // Update navigation links
        navLinksForHighlighting.forEach((link) => {
            // Remove active class from all links
            link.classList.remove("active");

            // Add active class to current section link
            if (link.getAttribute("href") === `#${currentSection}`) {
                link.classList.add("active");

                // Add subtle animation to active link
                link.style.transform = "translateY(-3px)";
                setTimeout(() => {
                    link.style.transform = "";
                }, 300);
            }
        });
    }

    // Initialize on page load
    window.addEventListener("load", updateActiveNavlink);

    // Initialize skill bars animation
    const skillBars = document.querySelectorAll(".skill-progress-bar");

    function setSkillBarWidth() {
        skillBars.forEach((bar) => {
            const width = bar.style.width;
            bar.style.setProperty("--percentage", width);
        });
    }

    setSkillBarWidth();
});
