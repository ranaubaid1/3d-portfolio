const menuBtn = document.getElementById("menuBtn");
const navLinksContainer = document.querySelector(".nav-links");

// Mobile menu toggle
if (menuBtn && navLinksContainer) {
    menuBtn.addEventListener("click", () => {
        navLinksContainer.classList.toggle("active");
    });
}

// SPA Routing and Panel Transitions (GSAP Powered)
function navigateTo(hash) {
    const section = hash.replace("#", "") || "home";
    const panels = document.querySelectorAll(".panel");
    const links = document.querySelectorAll(".nav-link");

    let found = false;
    let activePanel = null;

    // Toggle active classes and reset inactive positions
    panels.forEach(panel => {
        if (panel.id === `${section}-panel`) {
            panel.classList.add("active");
            panel.scrollTop = 0;
            activePanel = panel;
            found = true;
        } else {
            panel.classList.remove("active");
            gsap.set(panel, { opacity: 0, y: 20, pointerEvents: "none" });
        }
    });

    if (!found) {
        const homePanel = document.getElementById("home-panel");
        if (homePanel) {
            homePanel.classList.add("active");
            activePanel = homePanel;
        }
    }

    // GSAP smooth slide-fade animation for active panel
    if (activePanel) {
        gsap.killTweensOf(activePanel);
        gsap.fromTo(activePanel, 
            { opacity: 0, y: 40, pointerEvents: "none" },
            { opacity: 1, y: 0, pointerEvents: "all", duration: 0.65, ease: "power2.out" }
        );

        // Stagger animations inside specific active panels
        if (section === "skills") {
            gsap.fromTo("#skills-panel .skill-item",
                { opacity: 0, scale: 0.85, y: 15 },
                { opacity: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "back.out(1.5)", delay: 0.15 }
            );
        } else if (section === "projects") {
            gsap.fromTo("#projects-panel .project-item",
                { opacity: 0, y: 35 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power2.out", delay: 0.15 }
            );
        } else if (section === "services") {
            gsap.fromTo("#services-panel .service-item",
                { opacity: 0, scale: 0.9, y: 20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.55, stagger: 0.08, ease: "power2.out", delay: 0.15 }
            );
        } else if (section === "about") {
            gsap.fromTo("#about-panel .glass-card",
                { opacity: 0, x: (i) => i === 0 ? -40 : 40 },
                { opacity: 1, x: 0, duration: 0.7, ease: "power3.out", delay: 0.1 }
            );
        }
    }

    // Toggle active links in navbar
    links.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("data-section") === (found ? section : "home")) {
            link.classList.add("active");
        }
    });

    // Close mobile menu overlay
    if (navLinksContainer) {
        navLinksContainer.classList.remove("active");
    }

    // Auto-read panel text content on section fly-in (Text-to-Speech Autoplay)
    autoReadPanelContent(found ? section : "home");

    // Dispatch custom event to notify robot.js engine of camera fly target
    window.dispatchEvent(new CustomEvent("section-changed", { detail: found ? section : "home" }));
}

// Wire links clicking events
document.addEventListener("click", (event) => {
    const targetLink = event.target.closest(".nav-link, .nav-btn");
    if (targetLink) {
        const href = targetLink.getAttribute("href");
        if (href && href.startsWith("#")) {
            event.preventDefault();
            window.location.hash = href;
        }
    }
});

// Watch hash change
window.addEventListener("hashchange", () => {
    navigateTo(window.location.hash);
});

// Initial router resolution
window.addEventListener("DOMContentLoaded", () => {
    navigateTo(window.location.hash);
});

// Interactive 3D Card Tilt Effect
function initCardTilt() {
    const cards = document.querySelectorAll(".glass-card, .project-item, .service-item");
    
    cards.forEach(card => {
        card.style.transition = "transform 0.1s ease, box-shadow 0.3s ease, border-color 0.3s ease";
        card.style.transformStyle = "preserve-3d";
        
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Calculate tilt degrees (max 8 degrees tilt)
            const tiltX = -(y / (rect.height / 2)) * 8;
            const tiltY = (x / (rect.width / 2)) * 8;
            
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener("mouseleave", () => {
            card.style.transition = "transform 0.5s ease, box-shadow 0.3s ease, border-color 0.3s ease";
            card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
        });
        
        card.addEventListener("mouseenter", () => {
            card.style.transition = "transform 0.1s ease, box-shadow 0.3s ease, border-color 0.3s ease";
        });
    });
}

// Wire tilt effect after DOM content loaded
window.addEventListener("DOMContentLoaded", () => {
    initCardTilt();
});

// Text-to-Speech (TTS) Card Reader Handler
let currentUtterance = null;
let activeSpeakerButton = null;

function readCardContent(button) {
    // Prevent event bubbling
    if (window.event) window.event.stopPropagation();
    
    if ('speechSynthesis' in window) {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            
            if (activeSpeakerButton === button) {
                button.textContent = "🔊";
                activeSpeakerButton = null;
                return;
            }
        }
        
        if (activeSpeakerButton) {
            activeSpeakerButton.textContent = "🔊";
        }
        
        const card = button.closest(".glass-card");
        if (!card) return;
        
        // Extract paragraph texts, headers, and bullet points
        const textElements = card.querySelectorAll("p, li, h3:not(.panel-title), h5");
        let textToRead = "";
        textElements.forEach(el => {
            textToRead += el.textContent + ". ";
        });
        
        // Filter out emojis for clear reading
        textToRead = textToRead.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "");
        
        if (textToRead.trim().length > 0) {
            button.textContent = "⏹️";
            activeSpeakerButton = button;
            
            currentUtterance = new SpeechSynthesisUtterance(textToRead);
            currentUtterance.rate = 1.05;
            currentUtterance.pitch = 1.0;
            
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang.includes("en-US") || v.lang.includes("en-GB"));
            if (preferredVoice) currentUtterance.voice = preferredVoice;
            
            currentUtterance.onend = () => {
                button.textContent = "🔊";
                if (activeSpeakerButton === button) activeSpeakerButton = null;
            };
            
            currentUtterance.onerror = () => {
                button.textContent = "🔊";
                if (activeSpeakerButton === button) activeSpeakerButton = null;
            };
            
            window.speechSynthesis.speak(currentUtterance);
        }
    }
}

// Expose to window global scope for HTML inline calls
window.readCardContent = readCardContent;

// Autoplay Voice-Over Card Reader when navigating
function autoReadPanelContent(section) {
    if ('speechSynthesis' in window) {
        // Stop any currently active speech
        window.speechSynthesis.cancel();
        
        // Reset all speaker icons back to play state
        document.querySelectorAll(".speaker-btn").forEach(btn => {
            btn.textContent = "🔊";
        });
        
        // Do not autoplay text read on the homepage panel (let robot's bubble speak)
        if (section === "home") return;
        
        const targetPanel = document.getElementById(`${section}-panel`);
        if (!targetPanel) return;
        
        // Gather readable text blocks
        const textElements = targetPanel.querySelectorAll("p, li, h3:not(.panel-title), h5");
        let textToRead = "";
        textElements.forEach(el => {
            textToRead += el.textContent + ". ";
        });
        
        // Filter out emojis
        textToRead = textToRead.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "");
        
        if (textToRead.trim().length > 0) {
            // Find the active card's speaker icon to toggle it to stop state
            const speakerBtn = targetPanel.querySelector(".speaker-btn");
            if (speakerBtn) {
                speakerBtn.textContent = "⏹️";
                activeSpeakerButton = speakerBtn;
            }
            
            currentUtterance = new SpeechSynthesisUtterance(textToRead);
            currentUtterance.rate = 1.05;
            currentUtterance.pitch = 1.0;
            
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang.includes("en-US") || v.lang.includes("en-GB"));
            if (preferredVoice) currentUtterance.voice = preferredVoice;
            
            currentUtterance.onend = () => {
                if (speakerBtn) speakerBtn.textContent = "🔊";
                if (activeSpeakerButton === speakerBtn) activeSpeakerButton = null;
            };
            
            currentUtterance.onerror = () => {
                if (speakerBtn) speakerBtn.textContent = "🔊";
                if (activeSpeakerButton === speakerBtn) activeSpeakerButton = null;
            };
            
            window.speechSynthesis.speak(currentUtterance);
        }
    }
}