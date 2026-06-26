/**
 * Aegis Cybersecurity Hub - Security Dashboard Module
 * Aggregates statistics, calculates Cyber Defense Posture (CDP),
 * controls SVG progress rings, and displays dynamic security feeds.
 * UI/UX Enhanced with fluid animations and count-ups.
 */

const DashboardController = {
    // DOM refs
    scoreRing: null,
    scoreValText: null,
    statusLabel: null,
    statusDesc: null,

    barQuizProf: null,
    barLearnMast: null,
    valQuizProf: null,
    valLearnMast: null,

    countPasswords: null,
    countUrls: null,
    countEmails: null,

    threatMapContainer: null,
    threatPointsContainer: null,
    threatLegendContainer: null,

    _initialized: false,

    init() {
        if (this._initialized) return;

        // Resolve DOM elements
        this.scoreRing = document.getElementById('safety-score-ring');
        this.scoreValText = document.getElementById('safety-score-val');
        this.statusLabel = document.getElementById('safety-status-label');
        this.statusDesc = document.getElementById('safety-status-desc');

        this.barQuizProf = document.getElementById('bar-quiz-prof');
        this.barLearnMast = document.getElementById('bar-learn-mast');
        this.valQuizProf = document.getElementById('val-quiz-prof');
        this.valLearnMast = document.getElementById('val-learn-mast');

        this.countPasswords = document.getElementById('stat-passwords-checked');
        this.countUrls = document.getElementById('stat-urls-checked');
        this.countEmails = document.getElementById('stat-emails-checked');

        this.threatMapContainer = document.getElementById('dashboard-threat-map');
        this.threatPointsContainer = document.getElementById('threat-points');
        this.threatLegendContainer = document.getElementById('threat-legend');

        // AegisFeed fallback
        if (typeof AegisFeed === 'undefined') {
            window.AegisFeed = (function () {
                const KEY = 'aegis_feed';
                function load() {
                    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
                }
                function save(items) {
                    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
                }
                function getRecent() { return load(); }
                function push(item) {
                    const items = load();
                    items.unshift({ time: (new Date()).toLocaleTimeString(), msg: item.msg || item });
                    if (items.length > 20) items.pop();
                    save(items);
                }
                
                (function seed() {
                    const items = load();
                    if (!items || items.length === 0) {
                        push({ msg: 'Welcome to Aegis Feed — no alerts yet.' });
                    }
                })();

                return { getRecent, push };
            })();
        }

        this._initialized = true;
        
        // Slight delay before initial render to allow CSS to paint, ensuring animations trigger
        setTimeout(() => this.render(), 50);
    },

    // --- Animation Utilities ---
    animateNumber(element, start, end, duration, suffix = '') {
        if (!element) return;
        // cancel any existing animation on this element
        if (element._animFrame) {
            cancelAnimationFrame(element._animFrame);
            element._animFrame = null;
        }

        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
        const startVal = Number(start) || 0;
        const endVal = Number(end) || 0;
        const totalDelta = endVal - startVal;

        let startTimestamp = null;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const rawProgress = Math.min((timestamp - startTimestamp) / Math.max(duration, 1), 1);
            const eased = easeOutCubic(rawProgress);
            const current = Math.round(eased * totalDelta + startVal);

            element.textContent = current + suffix;

            if (rawProgress < 1) {
                element._animFrame = window.requestAnimationFrame(step);
            } else {
                element.textContent = endVal + suffix;
                element._animFrame = null;
            }
        };

        element._animFrame = window.requestAnimationFrame(step);
    },

    render() {
        this.calculateAndRenderScores();
        this.renderActivityCounters();
        this.renderLiveThreatMap();
    },

    renderLiveThreatMap() {
        if (!this.threatPointsContainer || !this.threatLegendContainer) return;
        this.threatPointsContainer.innerHTML = '';
        this.threatLegendContainer.innerHTML = '';

        const stats = (typeof AegisState !== 'undefined' && AegisState.stats) ? AegisState.stats : {};

        // Define threat categories and their risk levels
        const threatCategories = [
            {
                category: 'Malware & Viruses',
                icon: 'fa-solid fa-virus',
                color: '#ef4444',
                riskLevel: (Number(stats.passwordsChecked) || 0) === 0 ? 'high' : 'low',
                incidents: Math.floor(Math.random() * 15) + 3
            },
            {
                category: 'Phishing Attacks',
                icon: 'fa-solid fa-envelope-open-text',
                color: '#f59e0b',
                riskLevel: (Number(stats.emailsChecked) || 0) === 0 ? 'high' : 'medium',
                incidents: Math.floor(Math.random() * 20) + 5
            },
            {
                category: 'Social Engineering',
                icon: 'fa-solid fa-people-arrows',
                color: '#a855f7',
                riskLevel: (Number(stats.quizHighScore) || 0) < 70 ? 'high' : 'medium',
                incidents: Math.floor(Math.random() * 12) + 2
            },
            {
                category: 'Credential Stuffing',
                icon: 'fa-solid fa-key',
                color: '#00f2fe',
                riskLevel: (Number(stats.passwordsChecked) || 0) > 5 ? 'low' : 'high',
                incidents: Math.floor(Math.random() * 25) + 8
            },
            {
                category: 'Data Breaches',
                icon: 'fa-solid fa-shield-halved',
                color: '#10b981',
                riskLevel: (Number(stats.urlsChecked) || 0) > 3 ? 'low' : 'medium',
                incidents: Math.floor(Math.random() * 8) + 1
            },
            {
                category: 'Zero-Day Exploits',
                icon: 'fa-solid fa-bomb',
                color: '#ff6b9d',
                riskLevel: Math.random() > 0.7 ? 'high' : 'low',
                incidents: Math.floor(Math.random() * 4)
            }
        ];

        // Render threat points on the map
        threatCategories.forEach((threat, index) => {
            const threatPoint = document.createElement('div');
            threatPoint.className = `threat-point threat-${threat.riskLevel}`;
            
            // Random positioning on the map
            const top = Math.random() * 70 + 10;
            const left = Math.random() * 85 + 5;
            
            threatPoint.style.top = `${top}%`;
            threatPoint.style.left = `${left}%`;
            threatPoint.style.backgroundColor = threat.color;
            threatPoint.style.animation = `pulseGlow ${1.5 + Math.random() * 1}s ease-in-out infinite`;
            threatPoint.style.animationDelay = `${index * 0.15}s`;
            
            threatPoint.innerHTML = `<i class="${threat.icon}"></i>`;
            threatPoint.title = `${threat.category}: ${threat.incidents} incidents`;
            
            this.threatPointsContainer.appendChild(threatPoint);
        });

        // Render threat legend
        threatCategories.forEach((threat, index) => {
            const legendItem = document.createElement('div');
            legendItem.className = 'threat-legend-item';
            legendItem.style.animation = `fadeSlideLeft 0.5s ease backwards ${index * 0.1}s`;
            
            const riskBadgeClass = threat.riskLevel === 'high' ? 'risk-critical' : threat.riskLevel === 'medium' ? 'risk-elevated' : 'risk-low';
            
            legendItem.innerHTML = `
                <div class="legend-color-dot" style="background-color: ${threat.color};"></div>
                <div class="legend-info">
                    <div class="legend-name">${threat.category}</div>
                    <div class="legend-incidents">${threat.incidents} detected</div>
                </div>
                <div class="legend-risk-badge ${riskBadgeClass}">
                    ${threat.riskLevel.toUpperCase()}
                </div>
            `;
            
            this.threatLegendContainer.appendChild(legendItem);
        });
    },

    calculateAndRenderScores() {
        const stats = (typeof AegisState !== 'undefined' && AegisState.stats) ? AegisState.stats : {};

        const passwordsChecked = Number(stats.passwordsChecked) || 0;
        const passwordHygiene = Math.min(passwordsChecked * 20, 100); 

        let quizProficiency = 0;
        try {
            const stored = localStorage.getItem('quizHighScore');
            if (stored !== null) {
                quizProficiency = Number(stored) || 0;
            } else if (stats.quizHighScore !== undefined && stats.quizHighScore !== null) {
                quizProficiency = Number(stats.quizHighScore) || 0;
            }
        } catch (e) {
            if (stats.quizHighScore !== undefined && stats.quizHighScore !== null) {
                quizProficiency = Number(stats.quizHighScore) || 0;
            }
        }
        quizProficiency = Math.min(Math.max(quizProficiency, 0), 100);

        const totalLessons = Math.max((this.lessons && this.lessons.length) ? this.lessons.length : 4, 1);
        const completedCount = (stats.lessonsCompleted && stats.lessonsCompleted.length) ? stats.lessonsCompleted.length : 0;
        const trainingProgress = Math.min(Math.round((completedCount / totalLessons) * 100), 100);

        const totalScans = passwordsChecked + (Number(stats.urlsChecked) || 0) + (Number(stats.emailsChecked) || 0);
        const scanCoverage = Math.min(totalScans * 10, 100);

        // UI Updates with fluid CSS transitions injected dynamically
        if (this.barQuizProf?.style) {
            this.barQuizProf.style.transition = 'width 1.5s cubic-bezier(0.25, 1, 0.5, 1)';
            this.barQuizProf.style.width = `${quizProficiency}%`;
        }
        if (this.barLearnMast?.style) {
            this.barLearnMast.style.transition = 'width 1.5s cubic-bezier(0.25, 1, 0.5, 1) 0.2s'; // Slight delay
            this.barLearnMast.style.width = `${trainingProgress}%`;
        }

        // Animate numbers from 0
        this.animateNumber(this.valQuizProf, 0, quizProficiency, 1500, '%');
        this.animateNumber(this.valLearnMast, 0, trainingProgress, 1500, '%');

        // Evaluate Cyber Defense Posture (CDP) Matrix
        const cdpScore = Math.round((passwordHygiene + trainingProgress + scanCoverage) / 3);
        
        let statusText = '';
        let statusClass = '';
        let statusDescText = '';
        let ringColor = '';

        if (cdpScore < 40) {
            statusText = 'CRITICAL RISK';
            statusClass = 'text-danger';
            statusDescText = 'Defense posture is severely compromised. Immediate credential audits and training required.';
            ringColor = 'var(--rose-glow, #ff4d4d)';
        } else if (cdpScore < 75) {
            statusText = 'ELEVATED RISK';
            statusClass = 'text-warning';
            statusDescText = 'Defenses are partially active. Vulnerable to social engineering and unverified links.';
            ringColor = 'var(--warning-glow, #ffb84d)';
        } else if (cdpScore < 95) {
            statusText = 'SECURE';
            statusClass = 'text-success';
            statusDescText = 'Defenses are stabilized. Continue routine threat scanning to maintain readiness.';
            ringColor = 'var(--emerald-glow, #00e676)';
        } else {
            statusText = 'FORTIFIED';
            statusClass = 'text-success'; 
            statusDescText = 'Aegis Active: Maximum threat resistance achieved. Excellent operational security.';
            ringColor = 'var(--cyan-glow, #00e5ff)';
        }

        if (this.scoreValText) {
            this.scoreValText.className = `risk-value ${statusClass}`;
            this.animateNumber(this.scoreValText, 0, cdpScore, 2000, '%');
        }
        
        if (this.statusLabel) {
            this.statusLabel.style.animation = 'fadeSlideUp 0.5s ease forwards 0.3s';
            this.statusLabel.style.opacity = '0'; // Starts invisible for animation
            this.statusLabel.textContent = `Posture: ${statusText}`;
            this.statusLabel.className = `risk-status ${statusClass}`;
        }
        
        if (this.statusDesc) {
            this.statusDesc.style.animation = 'fadeSlideUp 0.5s ease forwards 0.4s';
            this.statusDesc.style.opacity = '0';
            this.statusDesc.textContent = statusDescText;
        }

        // Smooth SVG Ring draw animation
        const radius = Number(this.scoreRing?.getAttribute('r')) || 70;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (cdpScore / 100) * circumference;
        if (this.scoreRing?.style) {
            this.scoreRing.style.strokeDasharray = `${circumference}`;
            this.scoreRing.style.strokeDashoffset = `${circumference}`;
            // Force reflow so the animation runs from full circle
            void this.scoreRing.offsetWidth;
            this.scoreRing.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1), stroke 1s ease';
            this.scoreRing.style.strokeDashoffset = `${offset}`;
            this.scoreRing.style.stroke = ringColor;
        }
    },

    renderActivityCounters() {
        const stats = (typeof AegisState !== 'undefined' && AegisState.stats) ? AegisState.stats : {};
        
        this.animateNumber(this.countPasswords, 0, Number(stats.passwordsChecked) || 0, 1200);
        this.animateNumber(this.countUrls, 0, Number(stats.urlsChecked) || 0, 1400);
        this.animateNumber(this.countEmails, 0, Number(stats.emailsChecked) || 0, 1600);
    },

    renderCriticalAlerts() {
        if (!this.alertsContainer) return;
        this.alertsContainer.innerHTML = '';

        const alerts = [];
        const stats = (typeof AegisState !== 'undefined' && AegisState.stats) ? AegisState.stats : {};

        // Critical alerts based on security posture
        if ((Number(stats.quizHighScore) || 0) < 50) {
            alerts.push({ 
                severity: 'critical', 
                icon: 'fa-solid fa-triangle-exclamation', 
                title: 'Low Quiz Performance', 
                message: 'Your cybersecurity awareness score is below 50%. Immediate training recommended.',
                timestamp: new Date().toLocaleTimeString()
            });
        }
        
        if ((Number(stats.passwordsChecked) || 0) === 0) {
            alerts.push({ 
                severity: 'high', 
                icon: 'fa-solid fa-lock-open', 
                title: 'No Password Audits Performed', 
                message: 'You have not evaluated any passwords. Run a credential entropy check now.',
                timestamp: new Date().toLocaleTimeString()
            });
        }

        if ((Number(stats.urlsChecked) || 0) === 0) {
            alerts.push({ 
                severity: 'high', 
                icon: 'fa-solid fa-link', 
                title: 'Phishing Detection Inactive', 
                message: 'No URLs have been scanned for phishing threats. Activate URL inspection.',
                timestamp: new Date().toLocaleTimeString()
            });
        }

        if ((Number(stats.emailsChecked) || 0) === 0) {
            alerts.push({ 
                severity: 'high', 
                icon: 'fa-solid fa-envelope-open-text', 
                title: 'Email Threat Scanning Disabled', 
                message: 'Email analysis has not been activated. Begin scanning emails for scam patterns.',
                timestamp: new Date().toLocaleTimeString()
            });
        }

        if (!stats.lessonsCompleted || stats.lessonsCompleted.length === 0) {
            alerts.push({ 
                severity: 'medium', 
                icon: 'fa-solid fa-book', 
                title: 'Training Program Not Started', 
                message: 'Complete cybersecurity learning modules to build defensive knowledge.',
                timestamp: new Date().toLocaleTimeString()
            });
        }

        if ((Number(stats.passwordsChecked) || 0) > 0 && (Number(stats.urlsChecked) || 0) === 0) {
            alerts.push({ 
                severity: 'medium', 
                icon: 'fa-solid fa-shield-virus', 
                title: 'Incomplete Threat Coverage', 
                message: 'You are monitoring passwords but not phishing links. Extend your threat detection.',
                timestamp: new Date().toLocaleTimeString()
            });
        }

        // Show all-clear if no critical issues
        if (alerts.length === 0) {
            alerts.push({ 
                severity: 'info', 
                icon: 'fa-solid fa-circle-check', 
                title: 'All Systems Secure', 
                message: 'All security monitoring systems are active and functioning normally. Threat posture: OPTIMAL',
                timestamp: new Date().toLocaleTimeString()
            });
        }

        alerts.forEach((alert, index) => {
            const alertItem = document.createElement('div');
            alertItem.className = `alert-item alert-${alert.severity}`;
            alertItem.style.animation = `fadeSlideLeft 0.5s ease backwards ${index * 0.1}s`;
            
            const severityIcon = {
                critical: 'fa-solid fa-circle-xmark',
                high: 'fa-solid fa-exclamation-circle',
                medium: 'fa-solid fa-info',
                info: 'fa-solid fa-check-circle'
            }[alert.severity] || 'fa-solid fa-info-circle';

            alertItem.innerHTML = `
                <div class="alert-severity-indicator"></div>
                <div class="alert-icon">
                    <i class="${alert.icon}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-time" style="opacity: 0.6; font-size: 0.85em; margin-top: 0.3rem;">${alert.timestamp}</div>
                </div>
                <div class="alert-close-btn" style="cursor: pointer; opacity: 0.5; transition: opacity 0.2s ease;">
                    <i class="fa-solid fa-xmark"></i>
                </div>
            `;

            // Add close functionality
            const closeBtn = alertItem.querySelector('.alert-close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    alertItem.style.animation = 'fadeSlideRight 0.3s ease forwards';
                    setTimeout(() => alertItem.remove(), 300);
                });
                closeBtn.addEventListener('mouseenter', () => closeBtn.style.opacity = '1');
                closeBtn.addEventListener('mouseleave', () => closeBtn.style.opacity = '0.5');
            }

            this.alertsContainer.appendChild(alertItem);
        });
    }
};

window.DashboardController = DashboardController;

if (document.readyState !== 'loading') {
    DashboardController.init();
} else {
    document.addEventListener('DOMContentLoaded', () => DashboardController.init());
}