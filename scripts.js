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
                    },
                    150 *
                        Array.from(entry.target.parentNode.children).indexOf(
                            entry.target,
                        ),
                );
            }
        });
    }, observerOptions);

    document.querySelectorAll(".sliding-card").forEach((card) => {
        cardObserver.observe(card);
    });

    function startContinuousAnimations() {
        const profilePic = document.querySelector(".profile-rings");
        if (profilePic) {
            setInterval(() => {
                profilePic.style.animation = "none";
                void profilePic.offsetWidth;
                profilePic.style.animation = "float 6s ease-in-out infinite";
            }, 6000);
        }

        const skillBars = document.querySelectorAll(".skill-progress-bar");
        setInterval(() => {
            skillBars.forEach((bar) => {
                const width = bar.style.width;
                bar.style.width = "0";

                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
        }, 10000);

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
            );
        });
    }

    setTimeout(startContinuousAnimations, 2000);

    window.addEventListener("scroll", function () {
        const scrollPosition = window.scrollY;

        const aboutSection = document.querySelector("#about");
        if (aboutSection) {
            const aboutOffset = aboutSection.offsetTop;
            const aboutDistance = scrollPosition - aboutOffset;

            if (aboutDistance > -500 && aboutDistance < 500) {
                const profilePic = document.querySelector(".profile-rings");
                if (profilePic) {
                    profilePic.style.transform = `translateY(${aboutDistance * 0.05}px) rotate(${aboutDistance * 0.01}deg)`;
                }
            }
        }

        updateActiveNavlink();
    });

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

                link.style.transform = "translateY(-3px)";
                setTimeout(() => {
                    link.style.transform = "";
                }, 300);
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
