/**
 * Aegis Cybersecurity Hub - Cyber Learning Hub Module
 * Interactive Defense Modules, MotionSites 3D Depth-Carousel Flashcards,
 * and "Spot the Phish" Email Attack Simulator.
 */

const LearningController = {
    subTabs: [],
    subTabViews: [],

    lessons: [
        {
            id: 'passwords',
            title: 'Securing Passwords & Entropy',
            category: 'CRYPTOGRAPHY',
            readTime: '5 mins',
            description: 'Master Shannon Entropy, cryptographic hashing (bcrypt/Argon2), and the mathematics behind brute-force resistance.',
            content: `
                <p><strong>Shannon Entropy</strong> is a mathematical measure of unpredictability that serves as the foundation of cryptographic security. A password's true strength is determined not just by arbitrary symbol complexity, but by character pool diversity multiplied across its length, defining the mathematical search space an adversary must compute.</p>
                <br>
                <p><strong class="text-cyan">Core Defense Principles:</strong></p>
                <ul class="cyber-bullets" style="margin-top: 8px;">
                    <li><i class="fa-solid fa-caret-right text-cyan"></i> <strong>Cryptographic Salted Hashing:</strong> Modern backend architectures never store plaintext credentials. They execute adaptive, memory-hard key derivation functions (Argon2id, bcrypt) with high work factors to defeat precomputed Rainbow Tables.</li>
                    <li><i class="fa-solid fa-caret-right text-cyan"></i> <strong>Passphrase Length Over Symbolic Complexity:</strong> Because keyspace scales exponentially with length ($R^L$), a 24-character four-word passphrase (e.g., <code>correct-horse-battery-staple</code>) provides exponentially higher crack resistance than an 8-character string like <code>P@ssw0rd!</code>.</li>
                    <li><i class="fa-solid fa-caret-right text-cyan"></i> <strong>Zero-Knowledge Password Managers:</strong> Credential stuffing attacks succeed because users reuse passwords across secondary services. Zero-knowledge vaults generate unique, 20+ character cryptographic strings for every distinct domain.</li>
                </ul>
            `
        },
        {
            id: 'phishing',
            title: 'Social Engineering & Heuristic Analysis',
            category: 'THREAT VECTORS',
            readTime: '6 mins',
            description: 'Learn to dissect deceptive subdomains, IDN homograph punycode tricks, and psychological coercion triggers.',
            content: `
                <p>Over 80% of enterprise security breaches originate from social engineering. Rather than attempting to break cryptographic algorithms, threat actors exploit human cognitive shortcuts through urgency, authority coercion, and visual deception.</p>
                <br>
                <p><strong class="text-cyan">Primary Heuristic Indicators:</strong></p>
                <ul class="cyber-bullets" style="margin-top: 8px;">
                    <li><i class="fa-solid fa-caret-right text-cyan"></i> <strong>IDN Homograph Spoofing:</strong> Attackers use Unicode lookalikes (such as Cyrillic 'а' replacing Latin 'a') to register <code>xn--pypal-4ve.com</code>, which visually mimics legitimate trademarks in vulnerable browser address bars.</li>
                    <li><i class="fa-solid fa-caret-right text-cyan"></i> <strong>Subdomain Masquerading:</strong> Stacking legitimate trademarks in host prefixes (e.g., <code>paypal.com.account-update.auth-service.net</code>) to fool hurried users into glancing only at the first word.</li>
                    <li><i class="fa-solid fa-caret-right text-cyan"></i> <strong>Artificial Urgency Scenarios:</strong> Creating synthetic 24-hour countdowns ("Account Suspended within 24 Hours") to provoke panic and bypass normal verification hygiene.</li>
                </ul>
            `
        },
        {
            id: 'twofactor',
            title: 'Multi-Factor & Hardware Authentication',
            category: 'AUTHENTICATION',
            readTime: '4 mins',
            description: 'Compare SMS, TOTP authenticator apps, and FIDO2 WebAuthn hardware security keys against modern AitM proxy attacks.',
            content: `
                <p>Multi-Factor Authentication (MFA) requires two or more independent factors: something you know (password), something you have (hardware key/authenticator), or something you are (biometrics).</p>
                <br>
                <p><strong class="text-cyan">Authentication Hierarchy of Resilience:</strong></p>
                <ul class="cyber-bullets" style="margin-top: 8px;">
                    <li><i class="fa-solid fa-triangle-exclamation text-danger"></i> <strong>SMS / Voice (Vulnerable):</strong> Unencrypted transmission susceptible to SS7 routing interception, SIM swapping, and social engineering of cellular carriers.</li>
                    <li><i class="fa-solid fa-shield-halved text-warning"></i> <strong>TOTP Authenticator Apps (Good):</strong> RFC 6238 time-based 6-digit codes. Immune to SIM swapping, but vulnerable to Adversary-in-the-Middle (AitM) reverse-proxy phishing (Evilginx).</li>
                    <li><i class="fa-solid fa-circle-check text-success"></i> <strong>FIDO2 / WebAuthn Passkeys (Phishing-Resistant):</strong> Cryptographic public-key challenge-response tied to the origin domain (e.g. YubiKey, Apple Touch ID). Mathematically impossible to relay to fraudulent phishing proxy domains.</li>
                </ul>
            `
        },
        {
            id: 'social',
            title: 'Defense in Depth & Operational Security',
            category: 'OPSEC',
            readTime: '5 mins',
            description: 'Establish principle of least privilege, zero-trust network architectures, and digital footprint minimization.',
            content: `
                <p><strong>Defense in Depth</strong> posits that no single defensive perimeter is impenetrable. A resilient security posture assumes breach and constructs layered security boundaries.</p>
                <br>
                <p><strong class="text-cyan">Operational Security Practices:</strong></p>
                <ul class="cyber-bullets" style="margin-top: 8px;">
                    <li><i class="fa-solid fa-caret-right text-cyan"></i> <strong>Principle of Least Privilege (PoLP):</strong> Users and applications are granted strictly the minimal permissions required to complete specific operational tasks.</li>
                    <li><i class="fa-solid fa-caret-right text-cyan"></i> <strong>OSINT Exposure Reduction:</strong> Eliminating work-related infrastructure disclosures, personal identifiers, and travel schedules from public social profiles.</li>
                    <li><i class="fa-solid fa-caret-right text-cyan"></i> <strong>Automated Patch Hygiene:</strong> Over 60% of network breaches exploit known CVE vulnerabilities for which security patches had been published months prior.</li>
                </ul>
            `
        }
    ],

    flashcards: [
        {
            category: 'CRYPTOGRAPHY',
            concept: 'Shannon Entropy',
            definition: 'A mathematical measure of information density and unpredictability, calculated as H(X) = -sum(p * log2(p)). In cybersecurity, it quantifies how many bits of search space an adversary must brute-force.'
        },
        {
            category: 'ATTACK VECTORS',
            concept: 'IDN Homograph Attack',
            definition: 'A visual spoofing technique where an attacker registers domain names with international Unicode characters (Punycode xn--) that look identical to legitimate Latin alphabetic trademarks (e.g. Cyrillic "а" for Latin "a").'
        },
        {
            category: 'AUTHENTICATION',
            concept: 'Adversary-in-the-Middle (AitM)',
            definition: 'A modern proxy attack (such as Evilginx) that sits between the victim and legitimate server, transparently intercepting entered passwords and session authentication cookies, bypassing standard TOTP 2FA.'
        },
        {
            category: 'DEFENSE PROTOCOLS',
            concept: 'FIDO2 / WebAuthn',
            definition: 'An open authentication standard utilizing asymmetric public-key cryptography. Because the private key never leaves the client hardware and signs only the verified browser domain, it is fully immune to phishing proxies.'
        },
        {
            category: 'CRYPTOGRAPHY',
            concept: 'Salt & Key Stretching',
            definition: 'Appending unique random bits (salt) to a password before hashing, combined with computationally demanding iteration algorithms (Argon2id, bcrypt), rendering precomputed Rainbow Tables completely ineffective.'
        },
        {
            category: 'NETWORK SECURITY',
            concept: 'Zero Trust Architecture (ZTA)',
            definition: 'A security paradigm built on "Never trust, always verify". It requires strict identity verification and continuous authorization for every user and device attempting to access resources on private networks.'
        },
        {
            category: 'SOCIAL ENGINEERING',
            concept: 'Spear Phishing & Whaling',
            definition: 'Highly customized social engineering attacks crafted against specific high-value individuals (executives, finance leads) using OSINT recon to maximize coercive credibility.'
        },
        {
            category: 'SYSTEM RESILIENCE',
            concept: 'SIM Swapping',
            definition: 'A social engineering attack targeting cellular carriers where the attacker convinces support agents to transfer a victim\'s phone number to a rogue SIM, capturing incoming SMS 2FA verification codes.'
        }
    ],

    activeCardIndex: 0,
    phishIndicators: {
        sender: false,
        subject: false,
        greeting: false,
        urgency: false,
        link: false,
        signoff: false
    },

    activeLessonId: 'passwords',

    init() {
        this.subTabs = document.querySelectorAll('.learning-nav-tabs .sub-tab');
        this.subTabViews = document.querySelectorAll('.subtab-view');

        this.bindSubTabs();
        this.initSyllabus();
        this.renderLessons();
        this.initFlashcards();
        this.initPhishSimulator();
    },

    render() {
        this.renderLessons();
        this.renderCurriculumProgress();
        this.loadLesson(this.activeLessonId);
    },

    initSyllabus() {
        const syllabusBtns = document.querySelectorAll('.syllabus-item-btn');
        syllabusBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.getAttribute('data-academy-target');
                syllabusBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Hide all sections
                document.querySelectorAll('.academy-pane-section').forEach(s => s.classList.remove('active'));

                if (target === 'lesson') {
                    const lessonId = btn.getAttribute('data-lesson-id');
                    this.loadLesson(lessonId);
                    const lessonPane = document.getElementById('pane-section-lesson');
                    if (lessonPane) lessonPane.classList.add('active');
                } else if (target === 'phishspotter') {
                    const pPane = document.getElementById('pane-section-phishspotter');
                    if (pPane) pPane.classList.add('active');
                } else if (target === 'flashcards') {
                    const fPane = document.getElementById('pane-section-flashcards');
                    if (fPane) fPane.classList.add('active');
                    this.updateFlashcardView();
                } else if (target === 'quiz') {
                    const qPane = document.getElementById('pane-section-quiz');
                    if (qPane) qPane.classList.add('active');
                    if (window.QuizController) {
                        if (typeof window.QuizController.updateHighScoreView === 'function') window.QuizController.updateHighScoreView();
                        else if (typeof window.QuizController.renderHighScore === 'function') window.QuizController.renderHighScore();
                    }
                }
            });
        });

        // Bind Mark Module Mastered button
        const completeBtn = document.getElementById('btn-complete-active-lesson');
        if (completeBtn) {
            completeBtn.addEventListener('click', () => {
                if (window.AegisState && typeof window.AegisState.completeLesson === 'function') {
                    window.AegisState.completeLesson(this.activeLessonId);
                }
                this.renderCurriculumProgress();
                this.loadLesson(this.activeLessonId);
                if (window.AegisNotification) {
                    window.AegisNotification.show(
                        'Module Mastered',
                        'Defensive security posture score elevated.',
                        'fa-solid fa-circle-check text-success'
                    );
                }
            });
        }

        // Initial load
        this.loadLesson('passwords');
        this.renderCurriculumProgress();
    },

    loadLesson(lessonId) {
        if (!lessonId) lessonId = 'passwords';
        this.activeLessonId = lessonId;
        const lesson = this.lessons.find(l => l.id === lessonId) || this.lessons[0];
        const categoryBadge = document.getElementById('lesson-category-badge');
        const heroTitle = document.getElementById('lesson-hero-title');
        const readTime = document.getElementById('lesson-read-time');
        const contentBody = document.getElementById('lesson-content-body');
        const compStatus = document.getElementById('lesson-completion-status');
        const completeBtn = document.getElementById('btn-complete-active-lesson');

        if (categoryBadge) categoryBadge.textContent = lesson.category;
        if (heroTitle) heroTitle.textContent = lesson.title;
        if (readTime) readTime.innerHTML = `<i class="fa-regular fa-clock"></i> ${lesson.readTime}`;
        if (contentBody) contentBody.innerHTML = lesson.content;

        const isCompleted = (window.AegisState && window.AegisState.stats && window.AegisState.stats.lessonsCompleted && window.AegisState.stats.lessonsCompleted.includes(lesson.id));
        if (compStatus) {
            compStatus.innerHTML = isCompleted 
                ? `<i class="fa-solid fa-circle-check text-success"></i> <span class="text-success font-semibold">Status: Mastered &amp; Certified</span>`
                : `<i class="fa-solid fa-circle-notch text-dim"></i> <span class="text-dim">Status: Incomplete</span>`;
        }
        if (completeBtn) {
            completeBtn.innerHTML = isCompleted
                ? `<i class="fa-solid fa-rotate-right"></i> <span>Re-Verify Module</span>`
                : `<i class="fa-solid fa-circle-check"></i> <span>Mark Module Mastered</span>`;
        }
    },

    renderCurriculumProgress() {
        const completed = (window.AegisState && window.AegisState.stats && window.AegisState.stats.lessonsCompleted) 
            ? window.AegisState.stats.lessonsCompleted 
            : [];

        // Checkmarks
        ['passwords', 'phishing', 'twofactor', 'social'].forEach(id => {
            const icon = document.getElementById(`status-icon-${id}`);
            if (icon) {
                const done = completed.includes(id);
                icon.className = `fa-solid fa-circle-check syllabus-status-icon ${done ? 'completed' : 'pending'}`;
            }
        });

        // High score badge
        const highScoreEl = document.getElementById('syllabus-high-score');
        const quizScore = (window.AegisState && window.AegisState.stats) ? (window.AegisState.stats.quizHighScore || 0) : 0;
        if (highScoreEl) highScoreEl.textContent = `${quizScore}%`;

        // Phish counter
        const found = Object.values(this.phishIndicators).filter(Boolean).length;
        const phishCountEl = document.getElementById('syllabus-phish-counter');
        if (phishCountEl) phishCountEl.textContent = `${found}/6`;

        // Total Curriculum Mastery: 4 lessons (15% each = 60%), phish (15%), quiz (25%)
        const lessonScore = Math.round((completed.length / 4) * 60);
        const drillScore = Math.round((found / 6) * 15);
        const qWeight = Math.round((quizScore / 100) * 25);
        const totalMastery = Math.min(lessonScore + drillScore + qWeight, 100);

        const masteryPercentEl = document.getElementById('academy-mastery-percent');
        const masteryBarEl = document.getElementById('academy-mastery-bar');
        const masteryTrackEl = document.getElementById('academy-mastery-track');
        const masteryBadgeEl = document.getElementById('academy-mastery-badge');
        const modulesCompletedEl = document.getElementById('academy-modules-completed');
        const masteryStatusEl = document.getElementById('academy-mastery-status');

        if (masteryPercentEl) masteryPercentEl.textContent = `${totalMastery}%`;
        if (masteryBarEl) masteryBarEl.style.width = `${totalMastery}%`;
        if (masteryTrackEl) masteryTrackEl.setAttribute('aria-valuenow', totalMastery);

        if (masteryBadgeEl) {
            if (totalMastery >= 85) {
                masteryBadgeEl.textContent = 'CERTIFIED';
                masteryBadgeEl.className = 'badge badge-xs badge-success';
            } else if (totalMastery >= 50) {
                masteryBadgeEl.textContent = 'INTERMEDIATE';
                masteryBadgeEl.className = 'badge badge-xs badge-warning';
            } else if (totalMastery > 0) {
                masteryBadgeEl.textContent = 'IN PROGRESS';
                masteryBadgeEl.className = 'badge badge-xs badge-cyan';
            } else {
                masteryBadgeEl.textContent = 'STANDBY';
                masteryBadgeEl.className = 'badge badge-xs badge-neutral';
            }
        }

        if (modulesCompletedEl) {
            modulesCompletedEl.innerHTML = `<i class="fa-solid fa-shield-halved text-cyan"></i> ${completed.length} / 4 MODULES`;
        }

        if (masteryStatusEl) {
            masteryStatusEl.innerHTML = totalMastery >= 85
                ? `<i class="fa-solid fa-award text-success"></i> DEFCON-1 DEFENDER`
                : `<i class="fa-solid fa-circle-check text-cyan"></i> AIR-GAPPED`;
        }
    },

    bindSubTabs() {
        this.subTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const subtab = tab.getAttribute('data-subtab');
                this.switchSubTab(subtab);
            });
        });
    },

    switchSubTab(subtabId) {
        this.subTabs.forEach(t => {
            const isTarget = t.getAttribute('data-subtab') === subtabId;
            t.classList.toggle('active', isTarget);
            t.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        });

        this.subTabViews.forEach(v => {
            const isTarget = v.getAttribute('id') === `subtab-view-${subtabId}`;
            v.classList.toggle('active', isTarget);
        });

        if (subtabId === 'flashcards') {
            this.updateFlashcardView();
        }
    },

    renderLessons() {
        const grid = document.querySelector('.lessons-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const completed = (window.AegisState && window.AegisState.stats && window.AegisState.stats.lessonsCompleted) 
            ? window.AegisState.stats.lessonsCompleted 
            : [];

        this.lessons.forEach(lesson => {
            const isDone = completed.includes(lesson.id);
            const card = document.createElement('div');
            card.className = `lesson-card liquid-glass-card ${isDone ? 'lesson-completed' : ''}`;
            
            card.innerHTML = `
                <div class="lesson-meta-bar">
                    <span class="badge ${isDone ? 'badge-success' : 'badge-cyan'}">${lesson.category}</span>
                    <span class="read-time"><i class="fa-regular fa-clock"></i> ${lesson.readTime}</span>
                </div>
                <h3 class="lesson-title">${lesson.title}</h3>
                <p class="lesson-desc">${lesson.description}</p>
                <div class="lesson-footer">
                    <span class="status-indicator ${isDone ? 'text-success' : 'text-dim'}">
                        <i class="fa-solid ${isDone ? 'fa-circle-check' : 'fa-circle-dot'}"></i>
                        ${isDone ? 'Mastered' : 'Not Started'}
                    </span>
                    <button class="btn ${isDone ? 'btn-outline' : 'btn-primary'} btn-open-lesson" data-id="${lesson.id}">
                        ${isDone ? 'Review Module' : 'Study Module'}
                    </button>
                </div>
            `;

            card.querySelector('.btn-open-lesson').addEventListener('click', () => {
                this.openLessonModal(lesson);
            });

            grid.appendChild(card);
        });
    },

    openLessonModal(lesson) {
        // Modal overlay
        let modal = document.getElementById('lesson-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'lesson-modal';
            modal.className = 'lesson-modal-overlay';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="lesson-modal-dialog liquid-glass-card" role="dialog" aria-modal="true" aria-labelledby="modal-lesson-title">
                <div class="modal-header">
                    <div>
                        <span class="badge badge-cyan">${lesson.category}</span>
                        <h2 id="modal-lesson-title">${lesson.title}</h2>
                    </div>
                    <button class="modal-close-btn" id="btn-close-modal" aria-label="Close modal">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${lesson.content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="btn-complete-lesson">
                        <i class="fa-solid fa-check"></i> Mark Complete & Earn CDP Score
                    </button>
                </div>
            </div>
        `;

        modal.classList.add('active');

        document.getElementById('btn-close-modal').addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });

        document.getElementById('btn-complete-lesson').addEventListener('click', () => {
            if (window.AegisState && typeof window.AegisState.completeLesson === 'function') {
                window.AegisState.completeLesson(lesson.id);
            }
            modal.classList.remove('active');
            this.renderLessons();
            if (window.AegisNotification) {
                window.AegisNotification.show(
                    'Module Completed',
                    `You earned points toward your Personal Cyber Safety Index.`,
                    'fa-solid fa-award text-cyan'
                );
            }
        });
    },

    // MotionSites 3D Depth Carousel for Flashcards
    initFlashcards() {
        const nextBtn = document.getElementById('btn-flashcard-next');
        const prevBtn = document.getElementById('btn-flashcard-prev');
        const cardEl = document.getElementById('active-flashcard');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.activeCardIndex = (this.activeCardIndex + 1) % this.flashcards.length;
                this.updateFlashcardView();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.activeCardIndex = (this.activeCardIndex - 1 + this.flashcards.length) % this.flashcards.length;
                this.updateFlashcardView();
            });
        }

        if (cardEl) {
            cardEl.addEventListener('click', () => {
                cardEl.classList.toggle('flipped');
            });

            cardEl.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    cardEl.classList.toggle('flipped');
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    if (nextBtn) nextBtn.click();
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    if (prevBtn) prevBtn.click();
                }
            });
        }

        this.updateFlashcardView();
    },

    updateFlashcardView() {
        const cardEl = document.getElementById('active-flashcard');
        const titleEl = document.getElementById('flashcard-front-title');
        const defEl = document.getElementById('flashcard-back-text');
        const indicator = document.getElementById('flashcard-indicator');
        const categoryBadge = document.querySelector('.card-category');

        if (!cardEl || !this.flashcards.length) return;

        // Reset flip state on change
        cardEl.classList.remove('flipped');

        // Apply MotionSites depth slide
        cardEl.classList.add('card-depth-enter');
        setTimeout(() => cardEl.classList.remove('card-depth-enter'), 450);

        const current = this.flashcards[this.activeCardIndex];
        if (titleEl) titleEl.textContent = current.concept;
        if (defEl) defEl.textContent = current.definition;
        if (categoryBadge) categoryBadge.textContent = current.category;
        if (indicator) indicator.textContent = `${this.activeCardIndex + 1} / ${this.flashcards.length}`;
    },

    // Spot The Phish Simulator
    initPhishSimulator() {
        const triggers = document.querySelectorAll('.phish-trigger');
        const resetBtn = document.getElementById('btn-reset-simulator');
        const explanationBox = document.getElementById('sim-explanation-card');
        const explanationText = document.getElementById('sim-explanation-text');
        const foundCountEl = document.getElementById('sim-found-count');
        const totalCountEl = document.getElementById('sim-total-count');
        const progressBar = document.getElementById('sim-progress-bar');

        const explanations = {
            sender: 'Spoofed display name and suspicious domain zone: "PaypaI" replaces Latin "l" with capital "I", originating from an unofficial ".net" domain.',
            subject: 'Fabricated urgency alarmism: Capitalized urgent warnings create artificial panic to suppress critical judgment.',
            greeting: 'Impersonal generic greeting: Legitimate institutions address account holders by registered legal name, not "Dear Customer".',
            urgency: 'Threat of immediate punitive action: Legitimate compliance teams never threaten asset liquidation within 24 hours via email.',
            link: 'Unverified action anchor: The button directs victims to credential-harvesting proxy infrastructure rather than the verified portal.',
            signoff: 'Pompous fabricated department title: Overly elaborate official-sounding committee names are classic scam markers.'
        };

        const totalIndicators = 6;
        if (totalCountEl) totalCountEl.textContent = totalIndicators;

        triggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const triggerId = trigger.getAttribute('data-id');
                if (!triggerId) return;

                if (!this.phishIndicators[triggerId]) {
                    this.phishIndicators[triggerId] = true;
                    trigger.classList.add('spotted');

                    // Calculate found
                    const foundCount = Object.values(this.phishIndicators).filter(Boolean).length;
                    if (foundCountEl) foundCountEl.textContent = foundCount;
                    if (progressBar) progressBar.style.width = `${Math.round((foundCount / totalIndicators) * 100)}%`;

                    if (explanationBox && explanationText) {
                        explanationBox.classList.remove('display-none');
                        explanationText.textContent = explanations[triggerId] || 'Suspicious phishing vector identified.';
                    }

                    if (foundCount === totalIndicators && window.AegisNotification) {
                        window.AegisNotification.show(
                            'Phish Spotter Mastered',
                            'You identified all 6 covert indicators in the simulated phishing attack!',
                            'fa-solid fa-trophy text-cyan',
                            5000
                        );
                    }
                }
            });
        });

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                for (const key in this.phishIndicators) {
                    this.phishIndicators[key] = false;
                }
                triggers.forEach(t => t.classList.remove('spotted'));
                if (foundCountEl) foundCountEl.textContent = '0';
                if (progressBar) progressBar.style.width = '0%';
                if (explanationBox) explanationBox.classList.add('display-none');
            });
        }
    }
};

window.LearningController = LearningController;
document.addEventListener('DOMContentLoaded', () => {
    LearningController.init();
});
