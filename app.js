/**
 * Aegis Cybersecurity Hub - Core Application controller
 * Manages routing, global state, live events, security restrictions, and alerts.
 */

// Global App State
const AegisState = {
    stats: {
        passwordsChecked: 0,
        urlsChecked: 0,
        emailsChecked: 0,
        quizHighScore: 0,
        lessonsCompleted: [], // Lesson ids: 'passwords', 'phishing', 'social', '2fa'
        phishIndicatorsFound: [] // Spot the phish scenario state
    },

    // Load state from local storage
    load() {
        const stored = localStorage.getItem('aegis_secure_state');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                this.stats = { ...this.stats, ...parsed };
            } catch (e) {
                console.error("Failed parsing Aegis state from localStorage", e);
            }
        }
    },

    // Save state to local storage
    save() {
        localStorage.setItem('aegis_secure_state', JSON.stringify(this.stats));
        // Trigger dashboard updates if active
        if (window.DashboardController) {
            window.DashboardController.render();
        }
    },

    // Utilities to increment metrics
    incrementMetric(metricName) {
        if (this.stats[metricName] !== undefined) {
            this.stats[metricName]++;
            this.save();
        }
    },

    completeLesson(lessonId) {
        if (!this.stats.lessonsCompleted.includes(lessonId)) {
            this.stats.lessonsCompleted.push(lessonId);
            this.save();
        }
    },

    setQuizHighScore(score) {
        if (score > this.stats.quizHighScore) {
            this.stats.quizHighScore = score;
            this.save();
        }
    }
};

// Toast Notifications System
const AegisNotification = {
    container: document.getElementById('toast-container'),

    show(title, message, iconClass = 'fa-solid fa-triangle-exclamation') {
        const toast = document.createElement('div');
        toast.className = 'sec-toast';
        toast.innerHTML = `
            <div class="sec-toast-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="sec-toast-body">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;
        
        this.container.appendChild(toast);

        // Auto remove after 3.5s
        setTimeout(() => {
            toast.classList.add('fade-out');
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, 3500);
    }
};

// Security Guard Module (Blocks Right click, copy, paste, select, and dev tools keys)
const AegisSecurityGuard = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        // 1. Block Context Menu (Right Click)
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            AegisNotification.show(
                'Access Restricted', 
                'Directory inspection and context menus are disabled for safety.',
                'fa-solid fa-shield-halved'
            );
        });

        // 2. Block Copy, Cut, Paste, Drag-drop
        document.addEventListener('copy', (e) => {
            e.preventDefault();
            AegisNotification.show(
                'Encryption Shield Active', 
                'Data copying is disabled to prevent credential extraction.',
                'fa-solid fa-lock'
            );
        });

        document.addEventListener('cut', (e) => {
            e.preventDefault();
            AegisNotification.show(
                'Data Modification Guard', 
                'Clipboard extraction is blocked by administrative policies.',
                'fa-solid fa-lock'
            );
        });

        document.addEventListener('paste', (e) => {
            e.preventDefault();
            AegisNotification.show(
                'Injection Prevention Active', 
                'Dynamic clipboard insertion is disabled to block script payloads.',
                'fa-solid fa-microchip'
            );
        });

        document.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });

        // 3. Block Developer Tools & Common shortcuts
        document.addEventListener('keydown', (e) => {
            const keys = {
                // F12 key
                123: true,
                // U (View Source)
                85: e.ctrlKey || e.metaKey,
                // I (Inspect Elements)
                73: (e.ctrlKey && e.shiftKey) || (e.metaKey && e.altKey),
                // J (Console)
                74: (e.ctrlKey && e.shiftKey) || (e.metaKey && e.altKey),
                // C (Inspect tool shortcut)
                67: (e.ctrlKey && e.shiftKey) || (e.metaKey && e.altKey),
                // S (Save page)
                83: e.ctrlKey || e.metaKey
            };

            const keyCode = e.keyCode || e.which;
            if (keys[keyCode]) {
                e.preventDefault();
                AegisNotification.show(
                    'Sandbox Isolation Triggered', 
                    'Keyboard inspectors and source viewing keys are disabled.',
                    'fa-solid fa-bug-slash'
                );
            }
        });
    }
};

// Navigation / Route Manager
const AegisNavigation = {
    tabs: document.querySelectorAll('.nav-menu .nav-item'),
    views: document.querySelectorAll('.content-scroll-container .content-view'),
    titleElement: document.getElementById('current-section-title'),
    subtitleElement: document.getElementById('current-section-subtitle'),

    titles: {
        dashboard: { title: "Security Dashboard", subtitle: "Real-time threat analytics, safety indexes, and logs" },
        password: { title: "Password Cryptographer", subtitle: "Evaluate structural strength, entropy levels, and crack simulations" },
        phishing: { title: "Phishing Link Analyzer", subtitle: "Heuristics-based deep URL security inspection engine" },
        email: { title: "Email Scam Scanner", subtitle: "Scans text templates for psychological triggers and spoof marks" },
        learning: { title: "Cyber Learning Academy", subtitle: "Interactive core safety chapters, simulators, and decks" },
        quiz: { title: "Readiness Assessment", subtitle: "Test your cybersecurity capabilities and earn rank badges" }
    },

    init() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetView = tab.getAttribute('data-tab');
                this.switchTo(targetView);
            });
        });
        
        // Initial setup based on active item
        const activeTab = document.querySelector('.nav-item.active');
        if (activeTab) {
            this.switchTo(activeTab.getAttribute('data-tab'));
        }
    },

    switchTo(viewId) {
        // Toggle tabs
        this.tabs.forEach(t => {
            if (t.getAttribute('data-tab') === viewId) {
                t.classList.add('active');
            } else {
                t.classList.remove('active');
            }
        });

        // Toggle Views
        this.views.forEach(v => {
            if (v.getAttribute('id') === `view-${viewId}`) {
                v.classList.add('active');
            } else {
                v.classList.remove('active');
            }
        });

        // Update headers
        if (this.titles[viewId]) {
            this.titleElement.textContent = this.titles[viewId].title;
            this.subtitleElement.textContent = this.titles[viewId].subtitle;
        }

        // Fire lifecycle hooks for subcontrollers
        if (viewId === 'dashboard' && window.DashboardController) {
            window.DashboardController.render();
        } else if (viewId === 'quiz' && window.QuizController) {
            window.QuizController.resetQuiz();
        } else if (viewId === 'learning' && window.LearningController) {
            window.LearningController.render();
        }
    }
};

// System Timer Helper
const AegisClock = {
    element: document.getElementById('live-timer'),
    init() {
        this.tick();
        setInterval(() => this.tick(), 1000);
    },
    tick() {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        this.element.textContent = `${hrs}:${mins}:${secs}`;
    }
};

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Load local storage states
    AegisState.load();
    
    // Start Clock
    AegisClock.init();
    
    // Initialize Navigation routing
    AegisNavigation.init();
    
    // Bind security layers
    AegisSecurityGuard.init();

    // Log startup
    AegisNotification.show(
        'Aegis System Online', 
        'Sandbox security shields loaded. All features initialized in offline mode.', 
        'fa-solid fa-circle-check text-success'
    );
});
