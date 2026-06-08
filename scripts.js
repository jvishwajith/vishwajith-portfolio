// Version 2
(function() {
    'use strict';
    
    const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    
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
    
    const originalEval = window.eval;
    window.eval = function(code) {
        if (typeof code === 'string' && code.includes('malicious')) {
            throw new Error('Blocked potentially harmful eval usage');
        }
        return originalEval.call(this, code);
    };
    
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
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
})();

document.addEventListener("DOMContentLoaded", function () {
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            }
        });
    }, observerOptions);

    document.querySelectorAll(".fade-in").forEach((section) => {
        sectionObserver.observe(section);
    });

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                setTimeout(
                    () => {
                        entry.target.classList.add("active");
                        
                        // Handle skill bar animation deferral
                        if (entry.target.classList.contains("skill-item")) {
                            const bar = entry.target.querySelector(".skill-progress-bar");
                            if (bar) bar.style.animation = "skillBarFill 1.5s forwards ease-out";
                        }
                    },
                    150 *
                        Array.from(entry.target.parentNode.children).indexOf(
                            entry.target,
                        ),
                );
            }
        });
    }, observerOptions);

    document.querySelectorAll(".sliding-card, .skill-item").forEach((card) => {
        cardObserver.observe(card);
    });

    setTimeout(() => {
        const skillBarsAnim = document.querySelectorAll(".skill-progress-bar");
        setInterval(() => {
            skillBarsAnim.forEach((bar) => {
                const width = bar.style.width;
                bar.style.width = "0";

                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
        }, 10000);
    }, 2000);

    const aboutSection = document.querySelector("#about");
    const profilePic = document.querySelector(".profile-rings");
    let scrollTicking = false;

    window.addEventListener("scroll", function () {
        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                const scrollPosition = window.scrollY;

                if (aboutSection && profilePic) {
                    const aboutOffset = aboutSection.offsetTop;
                    const aboutDistance = scrollPosition - aboutOffset;

                    if (aboutDistance > -500 && aboutDistance < 500) {
                        profilePic.style.transform = `translateY(${aboutDistance * 0.05}px) rotate(${aboutDistance * 0.01}deg)`;
                    }
                }

                updateActiveNavlink();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });

    const hamburger = document.querySelector(".hamburger");
    const mobileNavLinks = document.querySelector(".nav-links");

    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        mobileNavLinks.classList.toggle("active");
    });

    function scrollToSection(targetId) {
        const targetSection = document.querySelector(targetId);
        const header = document.querySelector("header");

        if (!targetSection || !header) {
            return;
        }

        const headerHeight = header.offsetHeight;
        const targetPosition =
            targetSection.getBoundingClientRect().top +
            window.pageYOffset -
            headerHeight;

        window.scrollTo({
            top: Math.max(targetPosition, 0),
            behavior: "smooth",
        });
    }

    document.querySelectorAll(".nav-links a").forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");

            if (targetId && targetId.startsWith("#")) {
                event.preventDefault();
                scrollToSection(targetId);
                history.pushState(null, "", targetId);
            }

            hamburger.classList.remove("active");
            mobileNavLinks.classList.remove("active");
        });
    });

    if (window.location.hash) {
        setTimeout(() => {
            scrollToSection(window.location.hash);
        }, 100);
    }

    function showNotification(message, duration = 3000) {
        const notificationContainer = document.getElementById(
            "notification-container",
        );
        const notification = document.createElement("div");
        notification.className = "notification";
        notification.textContent = message;

        notificationContainer.appendChild(notification);

        notification.offsetHeight;

        notification.classList.add("show");

        const audio = new Audio();
        audio.src =
            "data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFzb25pY1N0dWRpb3MuY29tAFRYWFgAAAAhAAAFdGl0bGUAU21hbGwgQmVsbCBSaW5nIC0gU2luZ2xlAFRYWFgAAAAWAAAAZXhwZXJ0X21ldGFkYXRhX2R1bW15AFRYX1gAAA0wAACgADEJAMkMAAAEgAEJAQADAQAB";
        audio.volume = 0.3;
        audio.play().catch((e) => console.log("Audio play failed:", e));

        setTimeout(() => {
            notification.classList.remove("show");
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, duration);
    }

    document.addEventListener("click", function (event) {
        const button = event.target.closest(".repo-btn, .certificate-btn, .view-all-cert-btn, .view-all-achievement-btn");
        
        if (!button) return;

        const name = button.getAttribute("data-name");
        const url = button.getAttribute("data-repo-url") || button.getAttribute("data-cert-url");
        
        if (url && url.trim() !== "") {
            window.open(url, "_blank");
        } else {
            showNotification(`${name} will be updated soon`, 3000);
        }
    });

    document
        .getElementById("download-resume")
        .addEventListener("click", function () {
            const link = document.createElement("a");
            link.href = "Vishwajith_Resume.pdf";
            link.download = "Vishwajith_J_Resume.pdf";
            link.click();
            showNotification("Resume download started successfully!", 3000);
        });

    const sections = document.querySelectorAll("section");
    const navLinksForHighlighting = document.querySelectorAll(".nav-links a");

    function updateActiveNavlink() {
        const scrollPosition = window.scrollY + window.innerHeight / 3;

        let currentSection = "";
        let maxVisibility = 0;

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const sectionBottom = sectionTop + sectionHeight;

            const visiblePx =
                Math.min(scrollPosition, sectionBottom) -
                Math.max(window.scrollY, sectionTop);
            const visiblePercent = visiblePx / sectionHeight;

            if (visiblePercent > maxVisibility) {
                maxVisibility = visiblePercent;
                currentSection = section.getAttribute("id");
            }
        });

        navLinksForHighlighting.forEach((link) => {
            link.classList.remove("active");

            if (link.getAttribute("href") === `#${currentSection}`) {
                link.classList.add("active");
            }
        });
    }

    window.addEventListener("load", updateActiveNavlink);

    const skillBars = document.querySelectorAll(".skill-progress-bar");

    function setSkillBarWidth() {
        skillBars.forEach((bar) => {
            const width = bar.style.width;
            bar.style.setProperty("--percentage", width);
        });
    }

    setSkillBarWidth();
});
