/**
 * Aegis Cybersecurity Hub - Security Dashboard Module
 * Aggregates statistics, calculates Cyber Defense Posture (CDP),
 * controls SVG progress rings, and displays dynamic security feeds.
 */

const DashboardController = {
    // DOM refs (resolved in init)
    scoreRing: null,
    scoreValText: null,
    statusLabel: null,
    statusDesc: null,

    // Bar metrics
    barQuizProf: null,
    barLearnMast: null,
    valQuizProf: null,
    valLearnMast: null,

    // Activity counts
    countPasswords: null,
    countUrls: null,
    countEmails: null,

    // Layout Containers
    recsContainer: null,
    feedContainer: null,

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

        this.recsContainer = document.getElementById('dashboard-recs');
        this.feedContainer = document.getElementById('dashboard-feed');

        // Provide a minimal AegisFeed fallback if no provider is present
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
                
                // Seed a sample alert if empty
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
        this.render();
    },

    render() {
        this.calculateAndRenderScores();
        this.renderActivityCounters();
        this.renderFeed();
        this.renderRecommendations();
    },

    renderFeed() {
        if (!this.feedContainer) return;
        this.feedContainer.innerHTML = '';
        
        try {
            if (typeof AegisFeed !== 'undefined' && typeof AegisFeed.getRecent === 'function') {
                const items = AegisFeed.getRecent() || [];
                if (items.length === 0) {
                    this.feedContainer.innerHTML = '<div class="feed-placeholder">No recent alerts</div>';
                } else {
                    items.forEach(it => {
                        const f = document.createElement('div');
                        f.className = 'feed-item';
                        f.innerHTML = `<div class="feed-item-time">${it.time || ''}</div><div class="feed-item-msg">${it.msg || ''}</div>`;
                        this.feedContainer.appendChild(f);
                    });
                }
            } else {
                this.feedContainer.innerHTML = '<div class="feed-placeholder">Feed disabled. Enable AegisFeed for live alerts.</div>';
            }
        } catch (e) {
            this.feedContainer.innerHTML = '<div class="feed-placeholder">Feed error</div>';
        }
    },

    calculateAndRenderScores() {
        const stats = (typeof AegisState !== 'undefined' && AegisState.stats) ? AegisState.stats : {};

        // Credential Hardening Strategy
        const passwordsChecked = Number(stats.passwordsChecked) || 0;
        const passwordHygiene = Math.min(passwordsChecked * 20, 100); 

        // Quiz Proficiency Heuristics
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

        // Academy Mastery Computation
        const totalLessons = (this.lessons && this.lessons.length) ? this.lessons.length : 4; 
        const completedCount = (stats.lessonsCompleted && stats.lessonsCompleted.length) ? stats.lessonsCompleted.length : 0;
        const trainingProgress = Math.round((completedCount / totalLessons) * 100);

        // Scan Coverage Optimization
        const totalScans = (Number(stats.passwordsChecked) || 0) + (Number(stats.urlsChecked) || 0) + (Number(stats.emailsChecked) || 0);
        const scanCoverage = Math.min(totalScans * 10, 100);

        // Synchronize UI Progress Metrics
        if (this.barQuizProf?.style) this.barQuizProf.style.width = `${quizProficiency}%`;
        if (this.valQuizProf) this.valQuizProf.textContent = `${quizProficiency}%`;
        if (this.barLearnMast?.style) this.barLearnMast.style.width = `${trainingProgress}%`;
        if (this.valLearnMast) this.valLearnMast.textContent = `${trainingProgress}%`;

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
            this.scoreValText.textContent = `${cdpScore}%`;
            this.scoreValText.className = `risk-value ${statusClass}`;
        }
        if (this.statusLabel) {
            this.statusLabel.textContent = `Posture: ${statusText}`;
            this.statusLabel.className = `risk-status ${statusClass}`;
        }
        if (this.statusDesc) this.statusDesc.textContent = statusDescText;

        const circumference = 439.82;
        const offset = circumference - (cdpScore / 100) * circumference;
        if (this.scoreRing?.style) {
            this.scoreRing.style.strokeDashoffset = offset;
            this.scoreRing.style.stroke = ringColor;
        }
    },

    renderActivityCounters() {
        const stats = (typeof AegisState !== 'undefined' && AegisState.stats) ? AegisState.stats : {};
        if (this.countPasswords) this.countPasswords.textContent = Number(stats.passwordsChecked) || 0;
        if (this.countUrls) this.countUrls.textContent = Number(stats.urlsChecked) || 0;
        if (this.countEmails) this.countEmails.textContent = Number(stats.emailsChecked) || 0;
    },

    renderRecommendations() {
        if (!this.recsContainer) return;
        this.recsContainer.innerHTML = '';

        const recs = [];
        const stats = (typeof AegisState !== 'undefined' && AegisState.stats) ? AegisState.stats : {};

        // Evaluation Node 1: Quizzes
        if ((Number(stats.quizHighScore) || 0) < 70) {
            recs.push({
                icon: 'fa-solid fa-brain bg-violet',
                title: 'Evaluate Cognitive Awareness',
                desc: 'Take the Cybersecurity quiz to challenge your social engineering detection. Target a score of 70%+ to fortify your defense posture.',
                actionText: 'Take Quiz',
                action() { if (typeof AegisNavigation !== 'undefined') AegisNavigation.switchTo('quiz'); }
            });
        }

        // Evaluation Node 2: Curriculum Progression
        if (!stats.lessonsCompleted || stats.lessonsCompleted.length < 4) {
            recs.push({
                icon: 'fa-solid fa-book-shield bg-cyan',
                title: 'Review Cybersecurity Chapters',
                desc: 'Complete all interactive modules in the Academy to build your core defensive capabilities.',
                actionText: 'Study Hub',
                action() { if (typeof AegisNavigation !== 'undefined') AegisNavigation.switchTo('learning'); }
            });
        }

        // Evaluation Node 3: Phishing Simulations
        if (!stats.phishIndicatorsFound?.includes?.('completed')) {
            recs.push({
                icon: 'fa-solid fa-radar bg-warning',
                title: 'Run Phishing Simulator',
                desc: 'Execute the email simulation drill to train your eye against urgency threats and visual mimicry.',
                actionText: 'Start Sim',
                action() {
                    if (typeof AegisNavigation !== 'undefined') AegisNavigation.switchTo('learning');
                    setTimeout(() => {
                        if (window.LearningController && typeof window.LearningController.switchSubTab === 'function') window.LearningController.switchSubTab('phishspotter');
                    }, 50);
                }
            });
        }

        // Evaluation Node 4: Credentials Check Counter
        if ((Number(stats.passwordsChecked) || 0) === 0) {
            recs.push({
                icon: 'fa-solid fa-key bg-cyan',
                title: 'Audit Credential Entropy',
                desc: 'Verify if your primary passwords can withstand dictionary and brute-force attacks.',
                actionText: 'Analyze',
                action() { if (typeof AegisNavigation !== 'undefined') AegisNavigation.switchTo('password'); }
            });
        }

        // Evaluation Node 5: Network URL Scans
        if ((Number(stats.urlsChecked) || 0) === 0) {
            recs.push({
                icon: 'fa-solid fa-link bg-violet',
                title: 'Scan Suspicious Links',
                desc: 'Prevent credential harvesting. Sandbox and inspect raw HTTP addresses before clicking.',
                actionText: 'Inspect URL',
                action() { if (typeof AegisNavigation !== 'undefined') AegisNavigation.switchTo('phishing'); }
            });
        }

        // Evaluation Node 6: Semantic Email Verification
        if ((Number(stats.emailsChecked) || 0) === 0) {
            recs.push({
                icon: 'fa-solid fa-envelope-circle-check bg-emerald',
                title: 'Inspect Deceptive Emails',
                desc: 'Scan raw email text to detect hidden authority pressure patterns and malicious headers.',
                actionText: 'Scan Text',
                action() { if (typeof AegisNavigation !== 'undefined') AegisNavigation.switchTo('email'); }
            });
        }

        // Default Optimization State
        if (recs.length === 0) {
            recs.push({
                icon: 'fa-solid fa-shield-check bg-emerald',
                title: 'Aegis System Shields Fully Maximized',
                desc: 'Excellent operational posture. You have cleared all defensive drills and executed all system scans.',
                actionText: 'Run Diagnostics',
                action() { 
                    if (typeof AegisNotification?.show === 'function') {
                        AegisNotification.show('Diagnostics Complete', 'Shields operating at 100%. No vulnerabilities observed in local session.', 'fa-solid fa-shield-halved text-success');
                    } else {
                        console.info('Diagnostics Complete: Shields operating at 100%.');
                    }
                }
            });
        }

        // Inject Dynamic Recommendation Interfaces
        recs.forEach(rec => {
            const div = document.createElement('div');
            div.className = 'rec-item';
            div.innerHTML = `
                <div class="rec-item-icon">
                    <i class="${rec.icon}"></i>
                </div>
                <div class="rec-item-content">
                    <h4>${rec.title}</h4>
                    <p>${rec.desc}</p>
                </div>
                <div class="rec-item-action">${rec.actionText}</div>
            `;
            
            const actionBtn = div.querySelector('.rec-item-action');
            if (actionBtn) {
                actionBtn.style.cursor = 'pointer';
                actionBtn.tabIndex = 0;
                actionBtn.setAttribute('role', 'button');

                const invokeAction = (ev) => {
                    try {
                        if (typeof rec.action === 'function') {
                            rec.action();
                            return;
                        }
                    } catch (err) {
                        console.error('Recommendation action failed', err);
                    }

                    // Strict Routing Fallback Engine
                    let targetHash = null;
                    switch ((rec.actionText || '').toString()) {
                        case 'Take Quiz': targetHash = '#quiz'; break;
                        case 'Study Hub': targetHash = '#learning'; break;
                        case 'Start Sim': targetHash = '#learning'; break;
                        case 'Analyze': targetHash = '#password'; break;
                        case 'Inspect URL': targetHash = '#phishing'; break;
                        case 'Scan Text': targetHash = '#email'; break;
                        case 'Run Diagnostics': targetHash = '#diagnostics'; break;
                    }
                    try { if (targetHash) window.location.hash = targetHash; } catch (e) {}
                };

                actionBtn.addEventListener('click', invokeAction);
                actionBtn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        invokeAction(e);
                    }
                });
            }

            this.recsContainer.appendChild(div);
        });
    }
};

// Global expose
window.DashboardController = DashboardController;

if (document.readyState !== 'loading') {
    DashboardController.init();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        DashboardController.init();
    });
}