const menuBtn = document.getElementById("menuBtn");
const navLinksContainer = document.querySelector(".nav-links");

// Mobile menu toggle
if (menuBtn && navLinksContainer) {
    menuBtn.addEventListener("click", () => {
        navLinksContainer.classList.toggle("active");
    });
}

// SPA Routing and Panel Transitions
function navigateTo(hash) {
    const section = hash.replace("#", "") || "home";
    const panels = document.querySelectorAll(".panel");
    const links = document.querySelectorAll(".nav-link");

    // Toggle active classes on panels
    let found = false;
    panels.forEach(panel => {
        panel.classList.remove("active");
        if (panel.id === `${section}-panel`) {
            panel.classList.add("active");
            panel.scrollTop = 0; // scroll back to top on entry
            found = true;
        }
    });

    // If section not found, fallback to home
    if (!found) {
        const homePanel = document.getElementById("home-panel");
        if (homePanel) homePanel.classList.add("active");
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