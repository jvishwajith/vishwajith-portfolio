document.addEventListener('DOMContentLoaded', () => {
    // Initialize animations
    initializeAnimations();
    
    // Initialize navigation for mobile
    initializeMobileNav();
    
    // Initialize skill and certification progress bars
    initializeProgressBars();
    
    // Set up smooth scrolling for navigation links
    setupSmoothScrolling();
    
    // Handle visibility of elements during scroll
    handleScrollVisibility();
  });
  
  // Initialize animations on the page
  function initializeAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    fadeElements.forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      observer.observe(element);
    });
  }
  
  // Initialize mobile navigation
  function initializeMobileNav() {
    const navLinks = document.querySelector('.nav-links');
    const navBrand = document.querySelector('.nav-brand');
    
    // Create mobile navigation toggle button
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-nav-toggle';
    mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
    mobileToggle.setAttribute('aria-label', 'Toggle navigation menu');
    
    // Append toggle button to header only on mobile
    if (window.innerWidth <= 768) {
      document.querySelector('nav').appendChild(mobileToggle);
      
      // Apply mobile styling
      navLinks.style.display = 'none';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '100%';
      navLinks.style.left = '0';
      navLinks.style.width = '100%';
      navLinks.style.background = 'var(--dark-bg)';
      navLinks.style.padding = '1rem';
      navLinks.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
      navLinks.style.zIndex = '1000';
      
      // Toggle mobile menu
      mobileToggle.addEventListener('click', () => {
        if (navLinks.style.display === 'none') {
          navLinks.style.display = 'flex';
          mobileToggle.innerHTML = '<i class="fas fa-times"></i>';
        } else {
          navLinks.style.display = 'none';
          mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
      });
      
      // Close menu when clicking a link
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.style.display = 'none';
          mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
        });
      });
    }
    
    // Handle window resize events
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        if (!document.querySelector('.mobile-nav-toggle')) {
          document.querySelector('nav').appendChild(mobileToggle);
        }
        navLinks.style.display = 'none';
      } else {
        if (document.querySelector('.mobile-nav-toggle')) {
          document.querySelector('.mobile-nav-toggle').remove();
        }
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'row';
        navLinks.style.position = 'static';
        navLinks.style.padding = '0';
        navLinks.style.boxShadow = 'none';
      }
    });
  }
  
  // Initialize skill and certification progress bars
  function initializeProgressBars() {
    const progressBars = document.querySelectorAll('.skill-progress, .cert-progress');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const progressBar = entry.target;
          const progress = progressBar.getAttribute('data-progress');
          progressBar.style.width = `${progress}%`;
          observer.unobserve(progressBar);
        }
      });
    }, { threshold: 0.2 });
    
    progressBars.forEach(progressBar => {
      progressBar.style.width = '0';
      observer.observe(progressBar);
    });
  }
  
  // Set up smooth scrolling for navigation links
  function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          const headerHeight = document.querySelector('header').offsetHeight;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }
  
  // Handle visibility of elements during scroll
  function handleScrollVisibility() {
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Add shadow to header on scroll
      if (scrollTop > 10) {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
      } else {
        header.style.boxShadow = 'none';
      }
      
      // Highlight active section in navigation
      const sections = document.querySelectorAll('section');
      const navLinks = document.querySelectorAll('.nav-links a');
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop - header.offsetHeight - 10;
        const sectionBottom = sectionTop + section.offsetHeight;
        const currentPosition = scrollTop;
        const sectionId = section.getAttribute('id');
        
        if (currentPosition >= sectionTop && currentPosition < sectionBottom) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
      
      lastScrollTop = scrollTop;
    });
  }
  
  // Add active class styling to navigation
  document.head.insertAdjacentHTML('beforeend', `
    <style>
      .nav-links a.active {
        color: var(--primary-green);
        font-weight: 600;
      }
      
      .mobile-nav-toggle {
        background: none;
        border: none;
        color: var(--text-light);
        font-size: 1.5rem;
        cursor: pointer;
        display: none;
      }
      
      @media (max-width: 768px) {
        .mobile-nav-toggle {
          display: block;
        }
      }
    </style>
  `);