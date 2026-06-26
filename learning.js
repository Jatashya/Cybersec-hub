/**
 * Aegis Cybersecurity Hub - Cyber Learning Hub Module
 * Redesigned for fluid animations, unified glassmorphism modals, and optimized state management.
 * * Update: Modules remain readable after completion via the "Review" button.
 */

// --- Robust Global Fallbacks ---
if (typeof AegisState === 'undefined') {
    window.AegisState = {
        stats: { lessonsCompleted: [], phishIndicatorsFound: [], quizHighScore: 0, passwordsChecked: 0, urlsChecked: 0, emailsChecked: 0 },
        completeLesson(id) {
            if (!this.stats.lessonsCompleted.includes(id)) {
                this.stats.lessonsCompleted.push(id);
                this.save();
            }
        },
        incrementMetric(metric) {
            this.stats[metric] = (this.stats[metric] || 0) + 1;
            this.save();
        },
        save() { try { localStorage.setItem('aegis_state', JSON.stringify(this.stats)); } catch (e) {} },
        load() {
            try { 
                const stored = JSON.parse(localStorage.getItem('aegis_state')); 
                if (stored) this.stats = { ...this.stats, ...stored };
            } catch (e) {}
        }
    };
    window.AegisState.load();
}

if (typeof AegisNotification === 'undefined') {
    window.AegisNotification = {
        show(title, msg, icon) { console.info(`[Aegis Notification] ${title}: ${msg}`); }
    };
}

const LearningController = {
    subTabs: [],
    subTabViews: [],

    // --- Core Data: Standardized Theory Modules ---
    lessons: [
        {
            id: 'passwords',
            title: 'Securing Passwords & Entropy',
            category: 'CRYPTOGRAPHY',
            readTime: '6 mins',
            description: 'Master Shannon Entropy, cryptographic hashing (bcrypt/Argon2), and the mathematics behind brute-force resistance.',
            content: `
                <p><strong>Shannon Entropy</strong> is a mathematical measure of unpredictability that serves as the foundation of cryptographic security. A password's true strength is determined not just by complexity, but by the sheer size of the character pool combined with its length, dictating the search space an attacker must compute.</p>
                <br>
                <p><strong style="color: var(--cyan-glow);">Cryptographic Defense Vectors:</strong></p>
                <ul class="cyber-bullets" style="margin-top: 8px;">
                    <li><i class="fa-solid fa-caret-right"></i> <strong>Hashing & Salting:</strong> Secure systems never store plaintext passwords. They use one-way hashes (like bcrypt) and append a unique "Salt" (random data) to defeat pre-computed Rainbow Tables.</li>
                    <li><i class="fa-solid fa-caret-right"></i> <strong>Length Over Complexity:</strong> Because length exponentially increases search-space size, a 25-character passphrase of random dictionary words (e.g., "correct-horse-battery-staple") mathematically defeats short, symbol-heavy strings (e.g., "P@ss!").</li>
                    <li><i class="fa-solid fa-caret-right"></i> <strong>Credential Partitioning:</strong> Reusing passwords allows attackers to use "Credential Stuffing" bots. Utilizing a zero-knowledge password manager ensures unique, high-entropy strings for every service.</li>
                </ul>
            `,
            image: 'learning-content/images/passwords.png',
            quiz: [
                { q: "What is the cryptographic purpose of a 'Salt'?", choices: ["To encrypt the password so the server can read it later.", "To add random data to a password before hashing, defeating Rainbow Tables.", "To make the password easier to type."], answer: 1 },
                { q: "Which characteristic contributes most to password entropy?", choices: ["Total character length", "Using special symbols like !@#"], answer: 0 }
            ]
        },
        {
            id: 'phishing',
            title: 'URL Anatomy & Deceptive Links',
            category: 'NETWORK SAFETY',
            readTime: '7 mins',
            description: 'Deconstruct DNS hierarchy, Punycode homograph attacks, and TLS/SSL misconceptions in modern phishing.',
            content: `
                <p><strong>The Domain Name System (DNS)</strong> resolves human-readable hostnames to IP addresses. Modern phishing bypasses technical filters by exploiting human visual parsing and trust assumptions. The fundamental rule of URL analysis is evaluating a link from right to left up to the first single forward slash.</p>
                <br>
                <p><strong style="color: var(--violet-glow);">Deceptive Anatomy & Vectors:</strong></p>
                <ul class="cyber-bullets" style="margin-top: 8px;">
                    <li><i class="fa-solid fa-caret-right"></i> <strong>Subdomain Stacking:</strong> Attackers place trusted brand names as subdomains to create a false sense of security (e.g., <em>paypal.secure-login.attacker.com</em>). The actual registered domain here is <em>attacker.com</em>.</li>
                    <li><i class="fa-solid fa-caret-right"></i> <strong>Punycode (Homograph Attacks):</strong> Attackers register domains using Cyrillic or Greek characters that look identical to Latin ones (e.g., a Cyrillic "а" instead of a Latin "a"), seamlessly tricking both the eye and the browser.</li>
                    <li><i class="fa-solid fa-caret-right"></i> <strong>The TLS Fallacy:</strong> The padlock icon (HTTPS) only guarantees that data is encrypted in transit between you and the server. It does not mean the server itself is legitimate.</li>
                </ul>
            `,
            image: 'learning-content/images/phishing.png',
            quiz: [
                { q: "In the URL 'login.microsoftonline.verify-update.com', what is the actual registered domain?", choices: ["microsoftonline.com", "verify-update.com", "login.microsoftonline"], answer: 1 },
                { q: "What does the HTTPS padlock icon guarantee?", choices: ["The website is not a phishing site.", "The connection between your browser and the server is encrypted."], answer: 1 }
            ]
        },
        {
            id: 'social',
            title: 'Social Engineering & Persuasion',
            category: 'HUMAN FACTORS',
            readTime: '5 mins',
            description: 'Analyze the psychology of human manipulation, leveraging Dr. Robert Cialdini’s principles of persuasion.',
            content: `
                <p><strong>Social Engineering</strong> bypasses technical firewalls by exploiting cognitive biases and human psychology. Technical defenses, encryption, and strict access controls are rendered entirely irrelevant if an authorized user is persuaded to willingly hand over the keys.</p>
                <br>
                <p><strong style="color: var(--rose-glow);">Psychological Exploitation Vectors:</strong></p>
                <ul class="cyber-bullets" style="margin-top: 8px;">
                    <li><i class="fa-solid fa-caret-right"></i> <strong>Authority & Compliance:</strong> Humans are conditioned to comply with perceived leaders, executives, or technical experts (e.g., "This is IT Support, we need your credentials to halt a network breach").</li>
                    <li><i class="fa-solid fa-caret-right"></i> <strong>Scarcity & Urgency:</strong> Inducing a time constraint forces the brain into an emotional, reactive state, bypassing logical evaluation (e.g., "Your account assets will be liquidated in 24 hours").</li>
                    <li><i class="fa-solid fa-caret-right"></i> <strong>Familiarity (Spear Phishing):</strong> By researching a target via OSINT, attackers craft highly personalized pretexts that reference real colleagues, ongoing projects, or recent purchases to artificially manufacture trust.</li>
                </ul>
            `,
            image: 'learning-content/images/social.png',
            quiz: [
                { q: "Why do social engineers rely heavily on 'Urgency' in their attacks?", choices: ["It gives them more time to hack the server.", "It forces the victim into emotional, reactive thinking, bypassing logical analysis."], answer: 1 }
            ]
        },
        {
            id: 'twofactor',
            title: 'Advanced Authentication Systems',
            category: 'ACCESS CONTROL',
            readTime: '6 mins',
            description: 'Dive into the protocols behind MFA: HOTP, TOTP, and the asymmetric cryptography powering FIDO2/WebAuthn.',
            content: `
                <p><strong>Multi-Factor Authentication (MFA)</strong> requires proving identity via multiple independent vectors: Something you know (password), something you have (hardware token/phone), or something you are (biometrics).</p>
                <br>
                <p><strong style="color: var(--emerald-glow);">Authentication Protocol Vectors:</strong></p>
                <ul class="cyber-bullets" style="margin-top: 8px;">
                    <li><i class="fa-solid fa-caret-right"></i> <strong>SMS (Weakest Tier):</strong> Vulnerable to SS7 protocol interception and SIM-swapping, where an attacker manipulates a telecom employee into porting your phone number to their device.</li>
                    <li><i class="fa-solid fa-caret-right"></i> <strong>TOTP (Time-Based One-Time Password):</strong> Uses a shared secret key and the current Unix time to generate a temporary code. While immune to SIM-swapping, it remains vulnerable to real-time reverse-proxy phishing (e.g., Evilginx).</li>
                    <li><i class="fa-solid fa-caret-right"></i> <strong>FIDO2 / WebAuthn (Strongest Tier):</strong> Hardware security keys (like YubiKeys) utilize asymmetric cryptography. They are mathematically immune to phishing because the hardware signature is strictly bound to the verified origin domain.</li>
                </ul>
            `,
            image: 'learning-content/images/2fa.png',
            quiz: [
                { q: "Why is FIDO2/WebAuthn considered resistant to phishing?", choices: ["It encrypts your password twice.", "The cryptographic signature is mathematically bound to the verified origin domain."], answer: 1 }
            ]
        },
        {
            id: 'osint',
            title: 'OSINT & Digital Footprints',
            category: 'THREAT INTEL',
            readTime: '4 mins',
            description: 'Understand Open-Source Intelligence and how metadata and public registries are weaponized for targeted attacks.',
            content: `
                <p><strong>Open-Source Intelligence (OSINT)</strong> refers to the collection and analysis of data gathered from publicly available sources. Threat actors heavily utilize OSINT during the reconnaissance phase of an attack to build profiles on individuals or corporate infrastructure.</p>
                <br>
                <p><strong style="color: var(--warning-glow);">Data Aggregation Vectors:</strong></p>
                <ul class="cyber-bullets" style="margin-top: 8px;">
                    <li><i class="fa-solid fa-caret-right"></i> <strong>Metadata:</strong> Documents and images uploaded online often contain EXIF data or author tags, inadvertently revealing software versions, GPS locations, and internal usernames.</li>
                    <li><i class="fa-solid fa-caret-right"></i> <strong>Data Brokers & Breaches:</strong> Attackers cross-reference public social media profiles with data dumps from HaveIBeenPwned or dark web forums to map out a target's historical passwords and associated email addresses.</li>
                    <li><i class="fa-solid fa-caret-right"></i> <strong>WHOIS & DNS Records:</strong> Querying domain registries and MX records allows attackers to map out a company's internal email security providers and cloud infrastructure without ever touching their servers.</li>
                </ul>
            `,
            quiz: [
                { q: "What does OSINT stand for?", choices: ["Open-Source Intelligence", "Operational Security Internet Network"], answer: 0 }
            ]
        }
    ],

    // --- Flashcards Data: Formalized Definitions ---
    flashcards: [
        { title: 'Pretexting', category: 'Social Engineering', text: 'Definition: A manipulation technique where an attacker fabricates a false narrative or scenario (the pretext) to establish trust and trick a victim into disclosing sensitive information or bypassing security protocols.' },
        { title: 'Spear Phishing', category: 'Targeted Attack', text: 'Definition: A highly targeted cyberattack directed at a specific individual or organization, leveraging rigorous OSINT research to customize the email and legitimize the trap.' },
        { title: 'Cryptographic Salting', category: 'Cryptography', text: 'Definition: The process of appending a unique, random string of characters to a password before it is processed by a hashing algorithm, effectively rendering pre-computed Rainbow Tables useless.' },
        { title: 'Shannon Entropy', category: 'Cryptography', text: 'Definition: A mathematical measure of unpredictability and information density. In cybersecurity, it determines the exact bit-size of the search space an attacker must compute to brute-force a password.' },
        { title: 'Typosquatting', category: 'Domain Hijack', text: 'Definition: The malicious registration of domain names that are visual mimics or common keyboard misspellings of legitimate, popular domains (e.g., "amaz0n.com") to intercept traffic.' },
        { title: 'FIDO2 / WebAuthn', category: 'Authentication', text: 'Definition: An open authentication standard utilizing asymmetric public-key cryptography. It relies on physical hardware tokens and is inherently phishing-resistant because it mathematically verifies the origin domain.' },
        { title: 'Punycode', category: 'DNS Protocol', text: 'Definition: An encoding scheme used to convert Unicode characters (like Cyrillic or Greek) into the limited ASCII character set supported by DNS, frequently weaponized by attackers for Homograph attacks.' },
        { title: 'Rainbow Tables', category: 'Password Cracking', text: 'Definition: Massive, pre-computed databases containing millions of plaintext passwords and their corresponding cryptographic hashes, used to instantly reverse-engineer compromised, unsalted password hashes.' },
        { title: 'Zero Trust Architecture', category: 'Network Security', text: 'Definition: A security framework operating on the principle of "never trust, always verify." It assumes threats exist both inside and outside the network, requiring strict identity verification for every access request.' },
        { title: 'OSINT', category: 'Threat Intel', text: 'Definition: Open-Source Intelligence. The practice of collecting, evaluating, and analyzing publicly available information (social media, public records, metadata) to build intelligence on a target.' }
    ],

    phishIndicators: {
        sender: { title: 'Suspicious Sender', desc: 'The sender address uses a forged or misspelled domain to impersonate a trusted service.' },
        subject: { title: 'Alarmist Subject', desc: 'The subject line relies on urgency and fear to force a quick, unthinking response.' },
        greeting: { title: 'Generic Greeting', desc: 'A vague salutation like "Dear Customer" shows the message was not crafted for a real account holder.' },
        urgency: { title: 'Urgency Trap', desc: 'Attackers pressure you with a tight deadline and threats to bypass careful review.' },
        link: { title: 'Phishing Link', desc: 'The link text may look legitimate, but the destination URL is fraudulent and not owned by the real brand.' },
        signoff: { title: 'Fake Signature', desc: 'The closing line uses an unofficial name or title to appear authoritative without legitimacy.' },
        url: { title: 'Suspicious URL', desc: 'The address shown in the browser bar belongs to a fake domain, not the official service.' }
    },

    currentFlashcardIndex: 0,
    isAnimatingFlashcard: false,
    foundIndicators: [],

    _initialized: false,

    init() {
        if (this._initialized) return;
        this.subTabs = Array.from(document.querySelectorAll('.learning-nav-tabs .sub-tab') || []);
        this.subTabViews = Array.from(document.querySelectorAll('#view-learning .subtab-view') || []);
        
        this._initialized = true;
        this.bindEvents();
        setTimeout(() => this.render(), 50); 
    },

    bindEvents() {
        this.subTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchSubTab(tab.getAttribute('data-subtab')));
        });

        document.querySelectorAll('.phish-trigger').forEach(trig => {
            trig.addEventListener('click', (e) => {
                e.preventDefault();
                this.detectIndicator(trig.getAttribute('data-id'), trig);
            });
        });

        const urlField = document.getElementById('sim-browser-url');
        if (urlField) urlField.addEventListener('click', () => this.detectIndicator('url', urlField));

        const resetSimBtn = document.getElementById('btn-reset-simulator');
        if (resetSimBtn) resetSimBtn.addEventListener('click', () => this.resetSimulator());

        const flashcard = document.getElementById('active-flashcard');
        if (flashcard) flashcard.addEventListener('click', () => flashcard.classList.toggle('flipped'));

        const prevCard = document.getElementById('btn-flashcard-prev');
        const nextCard = document.getElementById('btn-flashcard-next');
        if (prevCard) prevCard.addEventListener('click', () => this.navigateFlashcard(-1));
        if (nextCard) nextCard.addEventListener('click', () => this.navigateFlashcard(1));
    },

    switchSubTab(subtab) {
        this.subTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-subtab') === subtab));
        this.subTabViews.forEach(v => {
            const isActive = v.getAttribute('id') === `subtab-view-${subtab}`;
            v.classList.toggle('active', isActive);
            if (isActive) {
                v.style.animation = 'none';
                void v.offsetWidth; 
                v.style.animation = 'fadeIn 0.3s ease-out forwards';
            }
        });

        if (subtab === 'flashcards') {
            this.currentFlashcardIndex = 0;
            this.renderFlashcard();
        }
    },

    // --- UI Utilities: Unified Animated Modal System ---
    createModal(contentHtml, maxWidth = '780px') {
        const modal = document.createElement('div');
        modal.className = 'aegis-modal-overlay';
        Object.assign(modal.style, {
            position: 'fixed', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(7, 10, 19, 0.7)', backdropFilter: 'blur(10px)', zIndex: '9999', 
            opacity: '0', transition: 'opacity 0.3s ease'
        });

        const box = document.createElement('div');
        box.className = 'glass-card aegis-modal-box'; 
        Object.assign(box.style, {
            width: '100%', maxWidth: maxWidth, maxHeight: '85vh', overflowY: 'auto',
            transform: 'scale(0.95) translateY(20px)', opacity: '0',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        });
        
        box.innerHTML = contentHtml;
        modal.appendChild(box);
        document.body.appendChild(modal);

        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            box.style.transform = 'scale(1) translateY(0)';
            box.style.opacity = '1';
        });

        const closeModal = () => {
            modal.style.opacity = '0';
            box.style.transform = 'scale(0.95) translateY(20px)';
            setTimeout(() => { if (document.body.contains(modal)) document.body.removeChild(modal); }, 300);
        };

        const closeBtns = box.querySelectorAll('.btn-modal-close');
        closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

        return { box, closeModal };
    },

    // --- Flashcards Engine ---
    renderFlashcard() {
        const title = document.getElementById('flashcard-front-title');
        const text = document.getElementById('flashcard-back-text');
        const categoryLabels = document.querySelectorAll('.card-category') || [];
        const current = this.flashcards[this.currentFlashcardIndex];

        if (!title || !text || !current) return;

        categoryLabels.forEach(lbl => lbl.textContent = current.category);
        title.textContent = current.title;
        text.textContent = current.text;

        const indicator = document.getElementById('flashcard-indicator');
        if (indicator) {
            indicator.textContent = `${this.currentFlashcardIndex + 1} / ${this.flashcards.length}`;
        }
    },

    navigateFlashcard(direction) {
        if (this.isAnimatingFlashcard) return;
        this.isAnimatingFlashcard = true;

        const cardContainer = document.querySelector('.flashcard-deck');
        const flashcardElement = document.getElementById('active-flashcard');

        if (flashcardElement?.classList.contains('flipped')) {
            flashcardElement.classList.remove('flipped');
        }

        if (cardContainer) {
            cardContainer.style.transition = 'all 0.2s ease-in';
            cardContainer.style.transform = `translateX(${direction * 30}px) scale(0.95)`;
            cardContainer.style.opacity = '0';
        }

        setTimeout(() => {
            this.currentFlashcardIndex = (this.currentFlashcardIndex + direction + this.flashcards.length) % this.flashcards.length;
            this.renderFlashcard();

            if (cardContainer) {
                cardContainer.style.transition = 'none';
                cardContainer.style.transform = `translateX(${-direction * 30}px) scale(0.95)`;
                void cardContainer.offsetWidth;
                cardContainer.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                cardContainer.style.transform = 'translateX(0) scale(1)';
                cardContainer.style.opacity = '1';
            }

            setTimeout(() => this.isAnimatingFlashcard = false, 300);
        }, 200);
    },

    // --- Lessons Engine ---
    renderLessons() {
        const grid = document.querySelector('.lessons-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const stats = window.AegisState?.stats || { lessonsCompleted: [] };

        this.lessons.forEach((l, index) => {
            const isCompleted = stats?.lessonsCompleted?.includes?.(l.id) || false;
            const fillWidth = isCompleted ? '100%' : '0%';
            
            const card = document.createElement('div');
            card.className = 'glass-card lesson-card';
            card.style.animation = `fadeSlideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) backwards ${index * 0.1}s`;
            
            card.innerHTML = `
                <div class="lesson-meta">
                    <span class="badge" style="color: var(--cyan-glow); background: rgba(0, 242, 254, 0.1); border: 1px solid rgba(0, 242, 254, 0.2);">${l.category}</span>
                    <span class="badge ${isCompleted ? 'badge-pulse' : ''}">${isCompleted ? 'Completed' : 'Unread'}</span>
                </div>
                <h4>${l.title}</h4>
                <p style="opacity: 0.8">${l.description}</p>
                <div class="lesson-footer">
                    <div class="lesson-progress-container">
                        <div class="mini-progress-bar">
                            <div class="fill" style="width: ${fillWidth}; background: linear-gradient(to right, var(--violet-glow), var(--cyan-glow)); transition: width 1s cubic-bezier(0.4, 0, 0.2, 1)"></div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        ${isCompleted ? `<i class="fa-solid fa-circle-check text-success" title="Mastered" style="font-size: 1.1rem; margin-right: 2px;"></i>` : ''}
                        ${isCompleted && l.quiz ? `<button class="btn btn-outline btn-take-quiz" data-id="${l.id}" style="padding: 6px 12px; font-size: 0.8rem; border-color: var(--violet-glow); color: var(--violet-glow)">Quiz</button>` : ''}
                        <button class="btn ${isCompleted ? 'btn-outline' : 'btn-primary'} btn-read-lesson" data-id="${l.id}" style="padding: 6px 12px; font-size: 0.8rem; ${isCompleted ? 'border-color: var(--cyan-glow); color: var(--cyan-glow);' : ''}">${isCompleted ? 'Review' : 'Read'}</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);

            const readBtn = card.querySelector('.btn-read-lesson');
            if (readBtn) readBtn.addEventListener('click', () => this.showLesson(l.id));

            const quizBtn = card.querySelector('.btn-take-quiz');
            if (quizBtn) quizBtn.addEventListener('click', () => this.startQuiz(l.id));
        });
    },

    showLesson(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        // Automatically mark complete upon opening to remove manual button requirement
        if (window.AegisState?.completeLesson) {
            AegisState.completeLesson(lessonId);
            this.renderLessons(); // Update dashboard cards behind the modal
        }

        let imgHtml = lesson.image ? `<div style="text-align:center; margin-bottom: 20px;"><img src="${lesson.image}" alt="Visual" style="max-width:100%; border-radius:12px; box-shadow: var(--neon-shadow-cyan); border: 1px solid var(--card-border);"/></div>` : '';

        const html = `
            <div class="card-header border-bottom">
                <h3>${lesson.title}</h3>
                <span class="badge badge-pulse">${lesson.readTime}</span>
            </div>
            <div class="lesson-body" style="font-size: 0.95rem; line-height: 1.6; color: var(--text-primary); margin-bottom: 24px;">
                ${imgHtml}
                ${lesson.content}
            </div>
            <div style="display:flex; gap:12px; justify-content:flex-end; border-top: 1px solid var(--card-border); padding-top: 16px;">
                <button class="btn btn-outline btn-modal-close">Close</button>
                ${lesson.quiz ? `<button class="btn btn-primary btn-take-quiz-modal" style="background: var(--violet-glow); border: none; color: #fff; box-shadow: 0 0 15px rgba(168, 85, 247, 0.4);">Take Quiz</button>` : ''}
            </div>
        `;

        const { box, closeModal } = this.createModal(html, '700px');
        
        const quizBtn = box.querySelector('.btn-take-quiz-modal');
        if (quizBtn) {
            quizBtn.addEventListener('click', () => {
                closeModal();
                setTimeout(() => this.startQuiz(lessonId), 300); // Wait for close animation before opening quiz
            });
        }
    },

    startQuiz(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson || !lesson.quiz) return AegisNotification.show('Notice', 'No quiz for this module.', 'fa-solid fa-info');

        const html = `
            <div class="card-header border-bottom">
                <h3>Knowledge Check: ${lesson.title}</h3>
            </div>
            <div class="quiz-body" style="min-height: 200px; padding: 20px 0;"></div>
            <div style="display:flex; gap:12px; justify-content:space-between; border-top: 1px solid var(--card-border); padding-top: 16px;">
                <button class="btn btn-outline btn-modal-close">Exit</button>
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-outline btn-quiz-prev" disabled>Prev</button>
                    <button class="btn btn-primary btn-quiz-next">Next</button>
                    <button class="btn btn-primary btn-quiz-submit" style="display:none; background: var(--emerald-glow); color: #000;">Submit</button>
                </div>
            </div>
        `;

        const { box } = this.createModal(html, '600px');
        
        const state = { idx: 0, answers: [] };
        const body = box.querySelector('.quiz-body');
        const prevBtn = box.querySelector('.btn-quiz-prev');
        const nextBtn = box.querySelector('.btn-quiz-next');
        const submitBtn = box.querySelector('.btn-quiz-submit');

        const renderQuestion = () => {
            const q = lesson.quiz[state.idx];
            body.style.opacity = '0';
            body.style.transform = 'translateX(10px)';
            
            setTimeout(() => {
                let qHtml = `<h4 style="margin-bottom: 16px; font-size: 1.1rem;">Q${state.idx+1}. ${q.q}</h4><div class="quiz-options-list">`;
                q.choices.forEach((c, i) => {
                    const checked = state.answers[state.idx] === i ? 'checked' : '';
                    const borderStyle = checked ? 'border-color: var(--cyan-glow); background: rgba(0, 242, 254, 0.1);' : '';
                    qHtml += `
                        <label class="quiz-option-btn" style="cursor:pointer; display:flex; gap:12px; align-items:center; ${borderStyle}">
                            <input type="radio" name="choice" value="${i}" ${checked} style="width:auto; accent-color: var(--cyan-glow);"/> 
                            ${c}
                        </label>`;
                });
                qHtml += '</div>';
                body.innerHTML = qHtml;

                body.style.transition = 'all 0.3s ease';
                body.style.opacity = '1';
                body.style.transform = 'translateX(0)';

                prevBtn.disabled = state.idx === 0;
                nextBtn.style.display = state.idx === lesson.quiz.length - 1 ? 'none' : '';
                submitBtn.style.display = state.idx === lesson.quiz.length - 1 ? '' : 'none';
            }, 150);
        };

        body.addEventListener('change', (e) => {
            if (e.target.name === 'choice') {
                state.answers[state.idx] = Number(e.target.value);
                renderQuestion(); 
            }
        });

        prevBtn.addEventListener('click', () => { state.idx--; renderQuestion(); });
        nextBtn.addEventListener('click', () => { state.idx++; renderQuestion(); });
        
        submitBtn.addEventListener('click', () => {
            let score = lesson.quiz.reduce((tot, q, i) => tot + (state.answers[i] === q.answer ? 1 : 0), 0);
            body.style.opacity = '0';
            
            setTimeout(() => {
                body.innerHTML = `
                    <div style="text-align:center; padding: 20px;">
                        <i class="fa-solid fa-trophy" style="font-size: 3rem; color: var(--warning-glow); margin-bottom: 16px; text-shadow: 0 0 15px rgba(245,158,11,0.5);"></i>
                        <h3 style="font-size: 1.5rem; margin-bottom: 8px;">Score: ${score} / ${lesson.quiz.length}</h3>
                        <p class="text-secondary">Quiz completed successfully.</p>
                    </div>`;
                body.style.opacity = '1';
                prevBtn.style.display = 'none';
                submitBtn.style.display = 'none';
            }, 150);
        });

        renderQuestion();
    },

    // --- Spot the Phish Simulator ---
    detectIndicator(indicatorId, element) {
        if (!indicatorId || this.foundIndicators.includes(indicatorId)) return;

        const info = this.phishIndicators[indicatorId];
        if (!info) return;

        this.foundIndicators.push(indicatorId);

        if (element?.classList) {
            element.classList.add('highlight-detected');
            element.style.transform = 'scale(1.05)';
            setTimeout(() => element.style.transform = 'scale(1)', 150);
        }

        const expCard = document.getElementById('sim-explanation-card');
        const expText = document.getElementById('sim-explanation-text');
        
        if (expCard && expText) {
            expCard.classList.remove('display-none');
            expCard.style.animation = 'none';
            void expCard.offsetWidth;
            expCard.style.animation = 'slideInDown 0.3s ease-out forwards';
            expText.innerHTML = `<strong class="text-cyan">${info.title}:</strong> ${info.desc}`;
        }

        const current = this.foundIndicators.length;
        const total = Object.keys(this.phishIndicators).length;

        document.getElementById('sim-found-count').textContent = current;
        document.getElementById('sim-total-count').textContent = total;
        
        const progressBar = document.getElementById('sim-progress-bar');
        if (progressBar) {
            progressBar.style.transition = 'width 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
            progressBar.style.width = `${(current / total) * 100}%`;
        }

        if (current === total) {
            const stats = window.AegisState?.stats || { phishIndicatorsFound: [] };
            if (!stats.phishIndicatorsFound?.includes?.('completed')) {
                if (Array.isArray(stats.phishIndicatorsFound)) stats.phishIndicatorsFound.push('completed');
                if (window.AegisState?.save) AegisState.save();
                if (window.AegisNotification) AegisNotification.show('Threat Mastered', 'All deception items unmasked.', 'fa-solid fa-trophy text-glow-yellow');
            }
            if (expCard) expCard.innerHTML = `<h4 class="text-success"><i class="fa-solid fa-shield-halved"></i> Simulation Cleared!</h4><p>You unmasked all ${total} hazards.</p>`;
        }
    },

    resetSimulator() {
        this.foundIndicators = [];
        document.querySelectorAll('.phish-trigger').forEach(trig => trig.classList.remove('highlight-detected'));
        const urlField = document.getElementById('sim-browser-url');
        if (urlField) urlField.classList.remove('highlight-detected');

        document.getElementById('sim-found-count').textContent = '0';
        const pb = document.getElementById('sim-progress-bar');
        if (pb) pb.style.width = '0%';
        
        const expCard = document.getElementById('sim-explanation-card');
        if (expCard) {
            expCard.classList.add('display-none');
            expCard.innerHTML = `<h4 class="text-success"><i class="fa-solid fa-circle-check"></i> Threat Detected!</h4><p id="sim-explanation-text"></p>`;
        }
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