/**
 * Aegis Cybersecurity Hub - Cybersecurity Quiz Module
 * Manages question databases, answering state machines, countdown clocks,
 * correct/wrong option formatting, and badge achievements.
 */

const QuizController = {
    // Panel Elements
    startPanel: document.getElementById('quiz-start-panel'),
    activePanel: document.getElementById('quiz-active-panel'),
    resultsPanel: document.getElementById('quiz-results-panel'),

    // Active Controls
    currentNumText: document.getElementById('quiz-current-num'),
    totalNumText: document.getElementById('quiz-total-num'),
    progressBar: document.getElementById('quiz-progress-bar'),
    timeLeftText: document.getElementById('quiz-time-left'),
    questionText: document.getElementById('quiz-question-text'),
    optionsContainer: document.getElementById('quiz-options-container'),
    
    // Explanation Controls
    explanationPanel: document.getElementById('quiz-explanation-panel'),
    explanationIcon: document.getElementById('quiz-explanation-icon'),
    explanationTitle: document.getElementById('quiz-explanation-title'),
    explanationBody: document.getElementById('quiz-explanation-body'),

    // Buttons
    startBtn: document.getElementById('btn-start-quiz'),
    nextBtn: document.getElementById('btn-next-question'),
    restartBtn: document.getElementById('btn-restart-quiz'),
    goDashboardBtn: document.getElementById('btn-quiz-go-dashboard'),

    // High Score Elements
    highScoreLabel: document.getElementById('quiz-high-score'),
    
    // Results Elements
    medalIcon: document.getElementById('quiz-medal-icon'),
    resultsTitle: document.getElementById('quiz-results-title'),
    resultsSubtitle: document.getElementById('quiz-results-subtitle'),
    statAccuracy: document.getElementById('quiz-stat-accuracy'),
    statTime: document.getElementById('quiz-stat-time'),
    statBadge: document.getElementById('quiz-stat-badge'),

    // Question Repository
    questions: [
        {
            q: "What is the primary vulnerability of SMS-based Multi-Factor Authentication (2FA)?",
            options: [
                "SMS messages are unencrypted and vulnerable to network-level SIM-swapping intercept.",
                "SMS codes expire too slowly, allowing reuse.",
                "It requires cellular internet access to retrieve standard token codes.",
                "SMS codes are cryptographically weak (only 4 digits)."
            ],
            correct: 0,
            explanation: "SMS relies on cellular routing networks, which are vulnerable to SIM swapping. Attacking agencies trick cell providers into redirecting target phone numbers to their hardware, receiving authentication SMS texts directly."
        },
        {
            q: "If you land on a domain like 'chasebank-security-alert.net', what represents the strongest threat indicator?",
            options: [
                "The site has no padlock icon in the browser bar.",
                "It has a .net top-level domain extension.",
                "The primary registered domain name is 'chasebank-security-alert.net' instead of 'chase.com'.",
                "The domain contains hyphens which are blocked by official banks."
            ],
            correct: 2,
            explanation: "Phishers register domains incorporating authentic brand tags (like chasebank) combined with terms like security/alert on external networks to mislead users. Legitimate platforms resolve to their official trademark (chase.com)."
        },
        {
            q: "What is the role of Shannon Entropy in passcode architecture?",
            options: [
                "It computes data download speeds during local encryption audits.",
                "It calculates the bit size of the search space, representing password unpredictability.",
                "It measures security breach percentages on common databases.",
                "It hashes character inputs into standard MD5 formatting."
            ],
            correct: 1,
            explanation: "Shannon entropy measures information unpredictability. Higher entropy increases search space sizes exponentially, raising time durations for brute-force rigs."
        },
        {
            q: "An email from your CEO requests an immediate wire transfer for client acquisition. What is the safest first action?",
            options: [
                "Authorize the transfer immediately to avoid CEO insubordination penalties.",
                "Reply to the email requesting confirmation of the banking details.",
                "Verify the request directly with the CEO via a secondary secure channel (e.g. phone call).",
                "Delete the email and ignore it, assuming it is automated spam."
            ],
            correct: 2,
            explanation: "Authority coercion is a standard social engineering tactic. Scammers spoof CEO names to bypass corporate validations. Authenticate requests using a phone call or secondary official system."
        },
        {
            q: "What does the term 'Typosquatting' refer to in web security?",
            options: [
                "Registering lookalike domains using letters visually resembling target brands (e.g., paypa1.com).",
                "Encrypting user passwords in local databases using dictionary matches.",
                "Injecting malicious SQL scripts into form input boxes.",
                "Capturing clipboard copying functions to steal logins."
            ],
            correct: 0,
            explanation: "Typosquatting targets typos and optical resemblance. Scammers register domains like paypa1.com (replacing l with 1) to deceive users."
        },
        {
            q: "Which of the following is the most cryptographically secure password configuration?",
            options: [
                "P@ssw0rd123! (12 characters)",
                "correcthorsebatterystaple (25 characters, no symbols)",
                "ChaseBank2026! (14 characters)",
                "AbCdEfGhIj1! (12 characters)"
            ],
            correct: 1,
            explanation: "Length beats custom character substitutions. High length increases search spaces exponentially, rendering dictionary-based attacks ineffective."
        },
        {
            q: "How does a standard Password Manager safeguard users against typosquatted phishing portals?",
            options: [
                "It alerts you when a domain is registered under a high-risk TLD.",
                "It refuses to autofill credentials because the phishing domain does not match the stored site URL.",
                "It automatically encrypts local files upon site navigation.",
                "It prevents users from using copy-paste features on suspicious sites."
            ],
            correct: 1,
            explanation: "Password managers map stored credentials to exact domain URIs. When landing on typosquatted domains (e.g. paypa1.com), managers refuse to auto-fill since domain identifiers fail matching."
        },
        {
            q: "Why are raw IP address URLs (e.g., http://104.24.1.2/verify) considered highly suspicious?",
            options: [
                "IP addresses do not support HTTPS secure layers.",
                "They only connect to outdated server configurations.",
                "Legitimate portals bind services to official trademark domains instead of exposing raw server IPs.",
                "IP networks bypass firewalls, leaving browsers vulnerable."
            ],
            correct: 2,
            explanation: "Legitimate portals use DNS records to resolve trademark domains. Scammers spin up short-lived servers hosting directly on raw IP addresses to avoid registration tracking."
        },
        {
            q: "What is the primary security goal of disabling clipboard copy/paste operations on financial applications?",
            options: [
                "It prevents keyloggers and malicious background scripts from capturing or injecting credentials.",
                "It optimizes server-side data processing and input validation.",
                "It reduces network transmission sizes during active login sessions.",
                "It protects the user's local operating system from browser crashes."
            ],
            correct: 0,
            explanation: "Restricting clipboard triggers protects users. It blocks scripts from capturing credentials from system memories or injecting payloads into browser entries."
        },
        {
            q: "What distinguishes a 'Spear Phishing' attack from standard phishing?",
            options: [
                "It exploits zero-day desktop vulnerabilities to download scripts.",
                "It targets a specific individual or organization, customizing lures based on prior research.",
                "It scans networks for open ports to hijack connected routers.",
                "It relies purely on sending millions of random templates to random directories."
            ],
            correct: 1,
            explanation: "Spear phishing relies on prior reconnaissance. Scammers research targets (on networks like LinkedIn) to construct convincing, highly targeted emails."
        }
    ],

    // Active State vars
    currentQuestionIndex: 0,
    score: 0,
    timer: null,
    timeLeft: 30,
    startTime: null,
    timeSpent: 0,
    isAnswered: false,

    init() {
        // Re-resolve DOM elements in case script ran before DOMContentLoaded
        this.startPanel = document.getElementById('quiz-start-panel');
        this.activePanel = document.getElementById('quiz-active-panel');
        this.resultsPanel = document.getElementById('quiz-results-panel');

        this.currentNumText = document.getElementById('quiz-current-num');
        this.totalNumText = document.getElementById('quiz-total-num');
        this.progressBar = document.getElementById('quiz-progress-bar');
        this.timeLeftText = document.getElementById('quiz-time-left');
        this.questionText = document.getElementById('quiz-question-text');
        this.optionsContainer = document.getElementById('quiz-options-container');

        this.explanationPanel = document.getElementById('quiz-explanation-panel');
        this.explanationIcon = document.getElementById('quiz-explanation-icon');
        this.explanationTitle = document.getElementById('quiz-explanation-title');
        this.explanationBody = document.getElementById('quiz-explanation-body');

        this.startBtn = document.getElementById('btn-start-quiz');
        this.nextBtn = document.getElementById('btn-next-question');
        this.restartBtn = document.getElementById('btn-restart-quiz');
        this.goDashboardBtn = document.getElementById('btn-quiz-go-dashboard');

        this.highScoreLabel = document.getElementById('quiz-high-score');

        this.medalIcon = document.getElementById('quiz-medal-icon');
        this.resultsTitle = document.getElementById('quiz-results-title');
        this.resultsSubtitle = document.getElementById('quiz-results-subtitle');
        this.statAccuracy = document.getElementById('quiz-stat-accuracy');
        this.statTime = document.getElementById('quiz-stat-time');
        this.statBadge = document.getElementById('quiz-stat-badge');

        // Bind events and render high score if possible. Do not early-return
        // when `startBtn` is absent so other buttons (like dashboard) still bind.
        this.bindEvents();
        this.renderHighScore();
    },

    bindEvents() {
        if (this.startBtn) this.startBtn.addEventListener('click', () => this.startQuiz());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextQuestion());
        if (this.restartBtn) this.restartBtn.addEventListener('click', () => this.startQuiz());

        if (this.goDashboardBtn) {
            this.goDashboardBtn.addEventListener('click', () => {
                if (typeof AegisNavigation !== 'undefined' && typeof AegisNavigation.switchTo === 'function') {
                    AegisNavigation.switchTo('dashboard');
                } else {
                    try { window.location.hash = '#dashboard'; } catch (e) {}
                    if (typeof this.resetQuiz === 'function') this.resetQuiz();
                }
            });
        }
    },

    renderHighScore() {
        if (!this.highScoreLabel) return;
        let score = 0;
        try {
            const stored = localStorage.getItem('quizHighScore');
            if (stored !== null) {
                score = Number(stored) || 0;
            } else if (typeof AegisState !== 'undefined' && AegisState.stats && typeof AegisState.stats.quizHighScore === 'number') {
                score = AegisState.stats.quizHighScore;
            }
        } catch (e) {
            if (typeof AegisState !== 'undefined' && AegisState.stats && typeof AegisState.stats.quizHighScore === 'number') {
                score = AegisState.stats.quizHighScore;
            }
        }
        this.highScoreLabel.textContent = `${score}%`;
    },

    startQuiz() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.isAnswered = false;
        this.startTime = new Date();
        
        this.startPanel.classList.add('display-none');
        this.resultsPanel.classList.add('display-none');
        this.activePanel.classList.remove('display-none');

        this.renderQuestion();
    },

    renderQuestion() {
        this.isAnswered = false;
        this.timeLeft = 30;
        if (this.timeLeftText) {
            this.timeLeftText.textContent = `${this.timeLeft}s`;
            this.timeLeftText.className = 'text-warning';
        }

        // Hide explanation
        if (this.explanationPanel) this.explanationPanel.classList.add('display-none');

        // Set Progress Trackers
        const total = this.questions.length;
        const current = this.currentQuestionIndex + 1;
        if (this.currentNumText) this.currentNumText.textContent = current;
        if (this.totalNumText) this.totalNumText.textContent = total;
        if (this.progressBar && this.progressBar.style) this.progressBar.style.width = `${(current / total) * 100}%`;

        // Render Text
        const activeQ = this.questions[this.currentQuestionIndex];
        if (this.questionText) this.questionText.textContent = activeQ.q;

        // Render Options
        if (!this.optionsContainer) return;
        this.optionsContainer.innerHTML = '';
        activeQ.options.forEach((opt, idx) => {
            const prefix = String.fromCharCode(65 + idx); // A, B, C, D
            const button = document.createElement('button');
            button.className = 'quiz-option-btn';
            button.innerHTML = `
                <span class="option-prefix">${prefix}</span>
                <span>${opt}</span>
            `;
            button.addEventListener('click', () => this.handleAnswerSelection(idx, button));
            this.optionsContainer.appendChild(button);
        });

        // Start Question Timer
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => this.tickTimer(), 1000);
    },

    tickTimer() {
        this.timeLeft--;
        if (this.timeLeftText) this.timeLeftText.textContent = `${this.timeLeft}s`;

        if (this.timeLeft <= 10 && this.timeLeftText) {
            this.timeLeftText.className = 'text-danger text-glow';
        }

        if (this.timeLeft <= 0) {
            clearInterval(this.timer);
            this.revealExplanation(false, "Time Out! You ran out of time. Review the solution details below.");
            this.highlightCorrectAnswer();
            this.disableOptions();
        }
    },

    handleAnswerSelection(selectedIndex, clickedBtn) {
        if (this.isAnswered) return;
        this.isAnswered = true;
        clearInterval(this.timer);

        const activeQ = this.questions[this.currentQuestionIndex];
        const isCorrect = selectedIndex === activeQ.correct;

        if (isCorrect) {
            this.score += 10;
            clickedBtn.classList.add('correct');
            this.revealExplanation(true, activeQ.explanation);
        } else {
            clickedBtn.classList.add('wrong');
            this.revealExplanation(false, activeQ.explanation);
            this.highlightCorrectAnswer();
        }

        this.disableOptions();
    },

    highlightCorrectAnswer() {
        const correctIdx = this.questions[this.currentQuestionIndex].correct;
        if (!this.optionsContainer) return;
        const buttons = this.optionsContainer.querySelectorAll('.quiz-option-btn');
        if (buttons && buttons[correctIdx]) {
            buttons[correctIdx].classList.add('correct');
        }
    },

    disableOptions() {
        if (!this.optionsContainer) return;
        const buttons = this.optionsContainer.querySelectorAll('.quiz-option-btn');
        buttons.forEach(btn => {
            btn.style.cursor = 'default';
        });
    },

    revealExplanation(isCorrect, text) {
        if (this.explanationPanel) this.explanationPanel.classList.remove('display-none');

        if (isCorrect) {
            if (this.explanationIcon) this.explanationIcon.innerHTML = '<i class="fa-solid fa-circle-check text-success"></i>';
            if (this.explanationTitle) {
                this.explanationTitle.textContent = 'Correct Answer';
                this.explanationTitle.className = 'text-success';
            }
        } else {
            if (this.explanationIcon) this.explanationIcon.innerHTML = '<i class="fa-solid fa-circle-xmark text-danger"></i>';
            if (this.explanationTitle) {
                this.explanationTitle.textContent = 'Incorrect Answer';
                this.explanationTitle.className = 'text-danger';
            }
        }

        if (this.explanationBody) this.explanationBody.textContent = text;
    },

    nextQuestion() {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.questions.length) {
            this.renderQuestion();
        } else {
            this.completeQuiz();
        }
    },

    completeQuiz() {
        if (this.timer) clearInterval(this.timer);

        const durationSec = Math.round((new Date() - this.startTime) / 1000);
        const mins = String(Math.floor(durationSec / 60)).padStart(2, '0');
        const secs = String(durationSec % 60).padStart(2, '0');
        
        const accuracy = Math.round((this.score / (this.questions.length * 10)) * 100);
        // Preserve previous high score: only update if current accuracy is higher
        let prevHigh = 0;
        try {
            if (typeof AegisState !== 'undefined' && AegisState.stats && typeof AegisState.stats.quizHighScore === 'number') {
                prevHigh = AegisState.stats.quizHighScore;
            } else {
                const stored = localStorage.getItem('quizHighScore');
                if (stored !== null) prevHigh = Number(stored) || 0;
            }
        } catch (e) { prevHigh = 0; }

        const isNewHigh = accuracy > prevHigh;
        if (isNewHigh) {
            if (typeof AegisState !== 'undefined' && typeof AegisState.setQuizHighScore === 'function') {
                AegisState.setQuizHighScore(accuracy);
            } else if (typeof AegisState !== 'undefined' && AegisState.stats) {
                AegisState.stats.quizHighScore = accuracy;
            }
            try { localStorage.setItem('quizHighScore', String(accuracy)); } catch (e) {}
        }

        // Determine Rank & Icon Color (granular tiers)
        let rank = 'Novice Scout';
        let medalColor = 'var(--text-dim)';
        let rankTier = 'muted';

        if (accuracy >= 95) {
            rank = 'Grand Sentinel';
            medalColor = '#ffd700'; // premium gold
            rankTier = 'gold';
        } else if (accuracy >= 85) {
            rank = 'Shield Commander';
            medalColor = '#f59e0b';
            rankTier = 'gold';
        } else if (accuracy >= 70) {
            rank = 'Cyber Guard';
            medalColor = '#c0c0c0';
            rankTier = 'silver';
        } else if (accuracy >= 50) {
            rank = 'Security Apprentice';
            medalColor = '#cd7f32';
            rankTier = 'bronze';
        } else if (accuracy >= 30) {
            rank = 'Rising Defender';
            medalColor = '#6b7280';
            rankTier = 'gray';
        }

        // Apply Results
        if (this.statAccuracy) this.statAccuracy.textContent = `${accuracy}%`;
        if (this.statTime) this.statTime.textContent = `${mins}:${secs}`;
        if (this.statBadge) this.statBadge.textContent = rank;

        if (this.medalIcon) {
            this.medalIcon.style.color = medalColor;
            this.medalIcon.style.filter = `drop-shadow(0 0 10px ${medalColor})`;
        }

        if (this.resultsTitle) this.resultsTitle.textContent = accuracy >= 70 ? 'Readiness Assessment Passed!' : 'Assessment Incomplete';
        if (this.resultsSubtitle) this.resultsSubtitle.textContent = `You scored ${this.score / 10} out of ${this.questions.length} questions correctly.`;

        // Switch Panels
        if (this.activePanel) this.activePanel.classList.add('display-none');
        if (this.resultsPanel) this.resultsPanel.classList.remove('display-none');

        // Update score indicators on startup page
        this.renderHighScore();

        if (typeof AegisNotification !== 'undefined' && typeof AegisNotification.show === 'function') {
            AegisNotification.show(
                'Exam Completed',
                `Quiz finished with ${accuracy}% accuracy. Rank: ${rank}.`,
                'fa-solid fa-trophy text-glow-yellow'
            );
        }
    },

    resetQuiz() {
        if (this.timer) clearInterval(this.timer);
        if (this.startPanel) this.startPanel.classList.remove('display-none');
        if (this.activePanel) this.activePanel.classList.add('display-none');
        if (this.resultsPanel) this.resultsPanel.classList.add('display-none');
        this.renderHighScore();
    }
};

// Global expose
window.QuizController = QuizController;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    QuizController.init();
});
