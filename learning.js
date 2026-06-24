// Provide small fallbacks for AegisState and AegisNotification when not present
if (typeof AegisState === 'undefined') {
    const _aegisFallback = {
        stats: {
            lessonsCompleted: [],
            phishIndicatorsFound: [],
            quizHighScore: 0,
            passwordsChecked: 0,
            urlsChecked: 0,
            emailsChecked: 0
        },
        completeLesson(id) {
            if (!this.stats.lessonsCompleted.includes(id)) {
                this.stats.lessonsCompleted.push(id);
            }
            this.save();
        },
        incrementMetric(metric) {
            if (typeof this.stats[metric] === 'number') {
                this.stats[metric] += 1;
            } else {
                this.stats[metric] = 1;
            }
            this.save();
        },
        save() {
            try { 
                localStorage.setItem('aegis_state', JSON.stringify(this.stats)); 
            } catch (e) {
                console.warn('[AegisState] Failed to save state', e);
            }
        },
        load() {
            try { 
                const stored = JSON.parse(localStorage.getItem('aegis_state')); 
                if (stored && typeof stored === 'object') {
                    this.stats = { ...this.stats, ...stored };
                }
            } catch (e) {
                console.warn('[AegisState] Failed to load state', e);
            }
        }
    };
    _aegisFallback.load();
    window.AegisState = _aegisFallback;
}

if (typeof AegisNotification === 'undefined') {
    window.AegisNotification = {
        show(title, msg, icon) { 
            console.info('[AegisNotification]', title, msg, icon); 
        }
    };
}

/**
 * Aegis Cybersecurity Hub - Cyber Learning Hub Module
 * Manages Lesson modules, interactive "Spot the Phish" simulator, and Flashcard decks.
 */
const LearningController = {
    // Sub-tab Navigation (resolved in init)
    subTabs: [],
    subTabViews: [],

    // Lesson Data
    lessons: [
        {
            id: 'passwords',
            title: 'Securing Passwords & Entropy',
            category: 'CRYPTOGRAPHY',
            readTime: '4 mins',
            description: 'Learn how bits of entropy dictate password safety, why character length beats complexity, and how to protect against dictionary and offline cracking rigs.',
            content: 'Cryptographic security relies on entropy. Short passwords with symbol substitution (e.g. "P@ssw0rd1!") are still vulnerable to modern hybrid dictionary attacks and GPU-accelerated cracking. Prefer long passphrases (20+ characters) that are easy to remember but have high search-space size; for example, "correct horse battery staple" is stronger than short complex strings. Use a reputable password manager, unique passwords per service, and enable 2FA (TOTP or hardware keys) wherever possible. Regularly audit exposed credentials using breach notification services and rotate passwords on high-value accounts.',
            image: 'learning-content/images/passwords.png'
        },
        {
            id: 'phishing',
            title: 'URL Anatomy & Deceptive Links',
            category: 'NETWORK SAFETY',
            readTime: '5 mins',
            description: 'Understand how phishing URLs mimic legitimate domains. Parse TLD parameters, inspect subdomains, identify typosquatting tricks, and audit protocols.',
            content: 'Phishing domains often rely on visual similarity (homograph attacks), typosquatting, and subdomain tricks (e.g., paypal.example-login.com). Inspect the full hostname (from the right-most registered domain) rather than only the left-most labels. Check certificate details by clicking the padlock, avoid following shortened links without previewing, and use offline heuristics like the Aegis analyzer to flag raw IPs, suspicious TLDs, and high-entropy hostnames. When uncertain, open the site in an isolated environment or use a dedicated link scanner.',
            image: 'learning-content/images/phishing.png'
        },
        {
            id: 'social',
            title: 'Social Engineering & Email Fraud',
            category: 'Linguistic Audit',
            readTime: '5 mins',
            description: 'Identify emotional manipulation, urgency coercion, fake authority hooks, and security warnings scammers use to trigger submissive panic.',
            content: 'Social engineering leverages cognitive biases: scarcity (limited-time offers), authority (impersonated executives or agencies), and urgency (deadlines) to short-circuit critical thinking. Verify sender domain and headers, avoid replying with sensitive information, and treat unexpected requests for money or credentials as high risk. Train to ask: "Is this request verifiable via official channels?" and to escalate to security teams before acting on financial or credential requests.',
            image: 'learning-content/images/social.png'
        },
        {
            id: 'twofactor',
            title: 'Dual Layer Authentication (2FA)',
            category: 'Access Control',
            readTime: '3 mins',
            description: 'Explore the difference between SMS 2FA, TOTP authentication apps, and hardware security keys to establish secondary defense boundaries.',
            content: 'Not all second factors are equal. SMS-based 2FA is susceptible to SIM-swapping and interception; TOTP apps (e.g., Authenticator, Authy) are stronger but still phishable if users paste codes into malicious sites. Hardware security keys (FIDO2/WebAuthn) provide the highest assurance by requiring a physical device and resisting remote phishing. Enforce backup codes safely and avoid providing codes via phone or email to unknown callers.',
            image: 'learning-content/images/2fa.png'
        }
    ],

    // Flashcard Data
    flashcards: [
        { title: 'Pretexting', category: 'Social Engineering', text: 'A form of social engineering where an attacker creates an invented scenario (pretext) to persuade a targeted victim to release information or perform an action.' },
        { title: 'Spear Phishing', category: 'Targeted Attack', text: 'A highly targeted phishing campaign directed at a specific individual or organization, leveraging private research to customize and legitimize the trap.' },
        { title: 'Typosquatting', category: 'Domain Hijack', text: 'Registering domain names that are visual mimics or common misspellings of popular domains (e.g. "goog1e.com") to intercept traffic and credentials.' },
        { title: 'Entropy', category: 'Cryptography', text: 'A measure of the randomness or unpredictability of a password string, representing the bit size of the mathematical search space hackers must check.' },
        { title: 'TOTP', category: 'Authentication', text: 'Time-Based One-Time Password. A temporary code generated by authentication apps (like Google Authenticator) that cycles every 30 seconds.' },
        { title: 'Rainbow Tables', category: 'Password Crack', text: 'Pre-computed databases of hashed passwords used by hackers to instantly crack common passwords by cross-referencing values without brute-force computation.' },
        { title: 'Shoulder Surfing', category: 'Physical Threat', text: 'Observing a target\'s keyboard entries or phone screens in public environments to steal pin numbers, patterns, or passcodes.' },
        { title: 'Ransomware', category: 'Malicious Software', text: 'Malware that encrypts a victim\'s local files, demanding a cryptocurrency payment in exchange for the decryption key.' },
        { title: 'SIM Swapping', category: 'Account Takeover', text: 'An attacker convinces a carrier to transfer a victim\'s phone number to a new SIM, intercepting SMS 2FA and recovery messages.' },
        { title: 'Credential Stuffing', category: 'Automation Attack', text: 'Using breached username/password pairs to attempt logins at scale against many services; reuse of passwords makes this effective.' },
        { title: 'Homograph Attack', category: 'Domain Spoofing', text: 'Registering domains that use visually-similar characters (unicode) to impersonate legitimate domains in the browser address bar.' },
        { title: 'Open Redirect', category: 'Web Vulnerability', text: 'A vulnerability where a site redirects users to attacker-controlled domains via parameterized URLs (e.g., ?redirect=). Attackers use these to chain to malicious payloads.' },
        { title: 'Man-in-the-Middle', category: 'Network Attack', text: 'An attacker intercepts and possibly alters communications between two parties; protects against this by using end-to-end encryption and secure channels.' }
    ],
    currentFlashcardIndex: 0,

    // Spot the Phish Simulator Data
    phishIndicators: {
        sender: {
            title: 'Spoofed Sender Email',
            desc: 'The sender address reads "security@paypaI-updates-support.net" and is spelled "PaypaI" (with a capital "I" instead of "l"). Attackers register lookalike domains to mimic corporate channels.'
        },
        subject: {
            title: 'Urgency / Fear Coercion in Subject',
            desc: 'Subject matches scam keywords ("URGENT", "Immediate Action"). Scammers use intense psychological pressure to force actions without logical verification.'
        },
        url: {
            title: 'Deceptive Browser Link',
            desc: 'The browser URL displays "paypal-billing-verify.com". Phishing domains stack subdomains to place authentic brand tags on the left side while referencing malicious servers on the right.'
        },
        urgency: {
            title: 'Threat of Severe Penalty',
            desc: 'The email body claims your account will be "permanently deleted" and "assets liquidated" within 24 hours. Genuine corporations give warnings and formal support channels.'
        },
        link: {
            title: 'Generic Unverified Button Link',
            desc: 'The action button forces immediate interaction. Scammers mask links beneath generic buttons to direct victims to credential-harvesting clones.'
        },
        signoff: {
            title: 'Generic Impersonal Corporate Signature',
            desc: 'Signed off by "Paypal Executive Operations and Fraud Control Team Inc.". Scammers fabricate generic department names to sound official because they lack recipient-specific details.'
        }
    },
    foundIndicators: [],

    _initialized: false,

    // UI Modals
    showLesson(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        const modal = document.createElement('div');
        modal.className = 'aegis-modal';
        modal.style = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);z-index:9999;padding:20px;';

        const box = document.createElement('div');
        box.className = 'aegis-modal-box';
        box.style = 'width:780px;max-width:100%;background:#fff;padding:20px;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.2);max-height:80vh;overflow:auto;';

        let imgHtml = '';
        if (lesson.image) {
            imgHtml = `<div style="text-align:center;margin-bottom:12px"><img src="${lesson.image}" alt="${lesson.title}" style="max-width:100%;height:auto;border-radius:6px;"/></div>`;
        }

        box.innerHTML = `
            <h3 style="margin-top:0">${lesson.title}</h3>
            <div class="lesson-body">${imgHtml}<p>${lesson.content}</p></div>
            <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">
                <button class="btn btn-outline btn-lesson-close">Close</button>
                <button class="btn btn-ghost btn-lesson-download">Download</button>
                <button class="btn btn-primary btn-lesson-complete">Mark Complete</button>
            </div>
        `;

        modal.appendChild(box);
        document.body.appendChild(modal);

        // Safe DOM cleanup handlers
        const closeModal = () => { if (document.body.contains(modal)) document.body.removeChild(modal); };
        
        box.querySelector('.btn-lesson-close').addEventListener('click', closeModal);
        box.querySelector('.btn-lesson-download').addEventListener('click', () => this.downloadLessonMd(lessonId));
        box.querySelector('.btn-lesson-complete').addEventListener('click', () => { 
            this.completeLesson(lessonId); 
            closeModal(); 
        });
    },

    init() {
        if (this._initialized) return;

        // Use Array.from to safely guarantee .forEach availability later
        this.subTabs = Array.from(document.querySelectorAll('.learning-nav-tabs .sub-tab') || []);
        this.subTabViews = Array.from(document.querySelectorAll('#view-learning .subtab-view') || []);

        this._initialized = true;

        this.bindEvents();
        this.render();
    },

    bindEvents() {
        // Sub-tabs switching
        this.subTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const subtab = tab.getAttribute('data-subtab');
                this.switchSubTab(subtab);
            });
        });

        // Spot the Phish Simulator Interactivity
        const triggers = document.querySelectorAll('.phish-trigger') || [];
        triggers.forEach(trig => {
            trig.addEventListener('click', (e) => {
                e.preventDefault();
                const indicatorId = trig.getAttribute('data-id');
                this.detectIndicator(indicatorId, trig);
            });
        });

        const urlField = document.getElementById('sim-browser-url');
        if (urlField) {
            urlField.addEventListener('click', () => {
                this.detectIndicator('url', urlField);
            });
        }

        const resetSimBtn = document.getElementById('btn-reset-simulator');
        if (resetSimBtn) {
            resetSimBtn.addEventListener('click', () => this.resetSimulator());
        }

        // Flashcards handling
        const flashcard = document.getElementById('active-flashcard');
        if (flashcard) {
            flashcard.addEventListener('click', () => {
                flashcard.classList.toggle('flipped');
            });
        }

        const prevCard = document.getElementById('btn-flashcard-prev');
        const nextCard = document.getElementById('btn-flashcard-next');

        if (prevCard) prevCard.addEventListener('click', () => this.navigateFlashcard(-1));
        if (nextCard) nextCard.addEventListener('click', () => this.navigateFlashcard(1));
    },

    switchSubTab(subtab) {
        this.subTabs.forEach(t => {
            if (t.getAttribute('data-subtab') === subtab) {
                t.classList.add('active');
            } else {
                t.classList.remove('active');
            }
        });

        this.subTabViews.forEach(v => {
            if (v.getAttribute('id') === `subtab-view-${subtab}`) {
                v.classList.add('active');
            } else {
                v.classList.remove('active');
            }
        });

        if (subtab === 'flashcards') {
            this.currentFlashcardIndex = 0;
            this.renderFlashcard();
        }
    },

    // LESSONS ENGINE
    renderLessons() {
        const grid = document.querySelector('.lessons-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const stats = window.AegisState?.stats || { lessonsCompleted: [] };

        this.lessons.forEach(l => {
            // Safe optional chaining to prevent undefined array crashes
            const isCompleted = stats?.lessonsCompleted?.includes?.(l.id) || false;
            
            const statusLabel = isCompleted ? 'Completed' : 'Unread';
            const statusClass = isCompleted ? 'badge-pulse' : '';
            const fillWidth = isCompleted ? '100%' : '0%';
            
            const card = document.createElement('div');
            card.className = 'glass-card lesson-card';
            card.innerHTML = `
                <div class="lesson-meta">
                    <span class="badge">${l.category}</span>
                    <span class="badge ${statusClass}">${statusLabel}</span>
                </div>
                <h4>${l.title}</h4>
                <p>${l.description}</p>
                <div class="lesson-footer">
                    <div class="lesson-progress-container">
                        <div class="mini-progress-bar"><div class="fill bg-violet" style="width: ${fillWidth}"></div></div>
                        <span class="text-dim" style="font-size: 0.75rem">${fillWidth}</span>
                    </div>
                    ${isCompleted ? 
                        `<span class="text-success" style="font-size: 0.85rem; font-weight: 600;"><i class="fa-solid fa-circle-check"></i> Mastered</span>` : 
                        `<button class="btn btn-outline btn-read-lesson" data-lesson-id="${l.id}" style="padding: 6px 12px; font-size: 0.8rem;">Read Lesson</button>`
                    }
                    <button class="btn btn-ghost btn-download-md" data-lesson-id="${l.id}" style="margin-left:8px; padding:6px 10px;">Download</button>
                </div>
            `;
            grid.appendChild(card);

            const readBtn = card.querySelector('.btn-read-lesson');
            if (readBtn) readBtn.addEventListener('click', () => this.showLesson(l.id));

            const dlBtn = card.querySelector('.btn-download-md');
            if (dlBtn) dlBtn.addEventListener('click', () => this.downloadLessonMd(l.id));
        });
    },

    startQuiz(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson || !lesson.quiz || !lesson.quiz.length) {
            if (window.AegisNotification) AegisNotification.show('No Quiz', 'This lesson has no quiz available.', 'fa-solid fa-circle-info');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'aegis-modal';
        modal.style = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);z-index:9999;padding:20px;';

        const box = document.createElement('div');
        box.className = 'aegis-modal-box';
        box.style = 'width:720px;max-width:100%;background:#fff;padding:20px;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.2);';

        box.innerHTML = `
            <h3 style="margin-top:0">Quiz — ${lesson.title}</h3>
            <div class="quiz-body"></div>
            <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">
                <button class="btn btn-outline btn-quiz-cancel">Cancel</button>
                <button class="btn btn-primary btn-quiz-prev" disabled>Prev</button>
                <button class="btn btn-primary btn-quiz-next">Next</button>
                <button class="btn btn-success btn-quiz-submit" style="display:none">Submit</button>
            </div>
        `;

        modal.appendChild(box);
        document.body.appendChild(modal);

        const state = { idx: 0, answers: Array(lesson.quiz.length).fill(null) };
        const body = box.querySelector('.quiz-body');
        const prevBtn = box.querySelector('.btn-quiz-prev');
        const nextBtn = box.querySelector('.btn-quiz-next');
        const submitBtn = box.querySelector('.btn-quiz-submit');
        const cancelBtn = box.querySelector('.btn-quiz-cancel');

        const renderQuestion = () => {
            const q = lesson.quiz[state.idx];
            let html = `<p style="font-weight:600">Q${state.idx+1}. ${q.q}</p>`;
            html += '<div class="quiz-choices">';
            q.choices.forEach((c, i) => {
                const checked = state.answers[state.idx] === i ? 'checked' : '';
                html += `<label style="display:block;margin:6px 0"><input type="radio" name="choice" value="${i}" ${checked}/> ${c}</label>`;
            });
            html += '</div>';
            body.innerHTML = html;

            prevBtn.disabled = state.idx === 0;
            nextBtn.style.display = state.idx === lesson.quiz.length - 1 ? 'none' : '';
            submitBtn.style.display = state.idx === lesson.quiz.length - 1 ? '' : 'none';
        };

        body.addEventListener('change', (e) => {
            const v = e.target?.value;
            if (typeof v !== 'undefined') state.answers[state.idx] = Number(v);
        });

        prevBtn.addEventListener('click', () => { state.idx = Math.max(0, state.idx - 1); renderQuestion(); });
        nextBtn.addEventListener('click', () => { state.idx = Math.min(lesson.quiz.length - 1, state.idx + 1); renderQuestion(); });
        cancelBtn.addEventListener('click', () => { if (document.body.contains(modal)) document.body.removeChild(modal); });

        submitBtn.addEventListener('click', () => {
            submitBtn.disabled = true; // Prevent double-submission visual bug
            
            let score = 0;
            lesson.quiz.forEach((q, i) => {
                if (state.answers[i] === q.answer) score++;
            });

            const pct = Math.round((score / lesson.quiz.length) * 100);
            let resultHtml = `<h4>Score: ${score} / ${lesson.quiz.length} (${pct}%)</h4>`;
            
            lesson.quiz.forEach((q, i) => {
                const chosenIdx = state.answers[i];
                const chosenText = (typeof chosenIdx === 'number' && q.choices[chosenIdx]) ? q.choices[chosenIdx] : 'No answer';
                const correctText = (typeof q.answer === 'number' && q.choices[q.answer]) ? q.choices[q.answer] : 'Unknown';
                
                resultHtml += `
                    <div style="margin-top:8px">
                        <strong>Q${i+1}: ${q.q}</strong>
                        <div><strong>Your answer:</strong> ${chosenText}</div>
                        <div><strong>Correct:</strong> ${correctText}</div>
                        <div style="color:#666">${q.explanation || ''}</div>
                    </div>`;
            });
            
            body.innerHTML = resultHtml;
            setTimeout(() => { if (document.body.contains(modal)) document.body.removeChild(modal); }, 4000);
        });

        renderQuestion();
    },

    async downloadLessonMd(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson) return;
        
        const mdPath = `learning-content/${lessonId}.md`;
        
        try {
            const res = await fetch(mdPath);
            if (res.ok) {
                const txt = await res.text();
                this._triggerFileDownload(txt, `${lessonId}.md`);
                return;
            }
        } catch (e) {
            console.warn(`Failed to fetch markdown file for ${lessonId}, using fallback content.`);
        }

        // Construct fallback markdown if fetch fails
        const md = `# ${lesson.title}\n\n**Category:** ${lesson.category}\n\n${lesson.content}\n`;
        this._triggerFileDownload(md, `${lessonId}.md`);
    },

    _triggerFileDownload(content, filename) {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    },

    completeLesson(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        if (window.AegisState?.completeLesson) {
            AegisState.completeLesson(lessonId);
        }
        if (window.AegisNotification?.show) {
            AegisNotification.show(
                'Module Completed', 
                `You have completed the "${lesson.title}" lesson. Safety score updated!`, 
                'fa-solid fa-circle-check text-success'
            );
        }
        this.renderLessons();
    },

    // SPOT THE PHISH ENGINE
    detectIndicator(indicatorId, element) {
        if (!indicatorId || this.foundIndicators.includes(indicatorId)) return;

        const info = this.phishIndicators[indicatorId];
        if (!info) return;

        this.foundIndicators.push(indicatorId);

        if (element?.classList) element.classList.add('highlight-detected');

        const expCard = document.getElementById('sim-explanation-card');
        const expText = document.getElementById('sim-explanation-text');
        
        if (expCard && expText) {
            expCard.classList.remove('display-none');
            expText.innerHTML = `<strong>${info.title}:</strong> ${info.desc}`;
        }

        const foundCount = document.getElementById('sim-found-count');
        const totalCount = document.getElementById('sim-total-count');
        const progressBar = document.getElementById('sim-progress-bar');
        
        const total = Object.keys(this.phishIndicators).length;
        const current = this.foundIndicators.length;

        if (foundCount) foundCount.textContent = current;
        if (totalCount) totalCount.textContent = total;
        if (progressBar?.style) progressBar.style.width = `${(current / total) * 100}%`;

        if (current === total) {
            const stats = window.AegisState?.stats || { phishIndicatorsFound: [] };
            
            if (!stats.phishIndicatorsFound?.includes?.('completed')) {
                if (Array.isArray(stats.phishIndicatorsFound)) {
                    stats.phishIndicatorsFound.push('completed');
                }
                if (window.AegisState?.save) AegisState.save();

                if (window.AegisNotification?.show) {
                    AegisNotification.show(
                        'Phishing Threat Mastered', 
                        'Outstanding! You have successfully unmasked all structural deception items in the email simulator.', 
                        'fa-solid fa-trophy text-glow-yellow'
                    );
                }
            }
            
            if (expCard) {
                expCard.innerHTML = `
                    <h4 class="text-success"><i class="fa-solid fa-shield-halved"></i> Simulation Cleared!</h4>
                    <p>Congratulations, you unmasked all ${total} phishing hazards. You are now equipped with core email analysis credentials. Your Dashboard Safety Score is fully updated.</p>
                `;
            }
        }
    },

    resetSimulator() {
        this.foundIndicators = [];

        const triggers = document.querySelectorAll('.phish-trigger') || [];
        triggers.forEach(trig => trig?.classList?.remove('highlight-detected'));
        
        const urlField = document.getElementById('sim-browser-url');
        if (urlField?.classList) urlField.classList.remove('highlight-detected');

        const foundCount = document.getElementById('sim-found-count');
        const progressBar = document.getElementById('sim-progress-bar');
        const expCard = document.getElementById('sim-explanation-card');

        if (foundCount) foundCount.textContent = '0';
        if (progressBar?.style) progressBar.style.width = '0%';
        
        if (expCard) {
            expCard.classList.add('display-none');
            // Restore default DOM structure in case of completed state rewrites
            expCard.innerHTML = `
                <h4 class="text-success"><i class="fa-solid fa-circle-check"></i> Threat Detected!</h4>
                <p id="sim-explanation-text">Explanation goes here...</p>
            `;
        }
    },

    // FLASHCARDS ENGINE
    renderFlashcard() {
        const cardTitle = document.getElementById('flashcard-front-title');
        const cardText = document.getElementById('flashcard-back-text');
        const cardIndicator = document.getElementById('flashcard-indicator');
        const flashcardElement = document.getElementById('active-flashcard');
        
        if (!cardTitle || !cardText) return;

        if (flashcardElement?.classList) {
            flashcardElement.classList.remove('flipped');
        }

        const current = this.flashcards[this.currentFlashcardIndex];
        const categoryLabels = document.querySelectorAll('.card-category') || [];

        categoryLabels.forEach(lbl => {
            if (lbl) lbl.textContent = current.category;
        });

        cardTitle.textContent = current.title;
        cardText.textContent = current.text;
        
        if (cardIndicator) {
            cardIndicator.textContent = `${this.currentFlashcardIndex + 1} / ${this.flashcards.length}`;
        }
    },

    navigateFlashcard(direction) {
        this.currentFlashcardIndex += direction;
        
        if (this.currentFlashcardIndex < 0) {
            this.currentFlashcardIndex = this.flashcards.length - 1;
        } else if (this.currentFlashcardIndex >= this.flashcards.length) {
            this.currentFlashcardIndex = 0;
        }

        this.renderFlashcard();
    },

    render() {
        this.renderLessons();
    }
};

window.LearningController = LearningController;

if (document.readyState !== 'loading') {
    LearningController.init();
} else {
    document.addEventListener('DOMContentLoaded', () => LearningController.init());
}