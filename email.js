/**
 * Aegis Cybersecurity Hub - Email Scam Analyzer Module
 * Analyzes copy-pasted email drafts for linguistic coercion and social engineering triggers.
 * Automatically highlights urgency, financial requests, authority impersonations, and generic links.
 */

const EmailScamAnalyzer = {
    // DOM refs (resolved in init)
    input: null,
    scanBtn: null,
    clearBtn: null,
    resultsCard: null,
    emptyState: null,
    activeState: null,
    riskPercentage: null,
    threatLevel: null,
    highlightedText: null,
    vectorsList: null,
    _initialized: false,

    // Trigger categories with regex patterns (using word boundaries and case insensitivity)
    scamCategories: {
        urgency: {
            title: 'Urgency & Fear Coercion',
            class: 'hl-urgency',
            icon: 'fa-solid fa-clock-six',
            scoreWeight: 20,
            cap: 35,
            keywords: [
                'immediately', 'urgent', 'asap', 'within 24 hours', 'within 48 hours', 'within 12 hours',
                'suspended', 'suspension', 'placed on hold', 'compromised', 'assets liquidated',
                'account closure', 'terminate account', 'permanent deletion', 'deactivated', 
                'action required', 'unauthorized login', 'final warning', 'final notice', 'critical security'
            ],
            details: 'Forces high-speed decision making by threat of penalty, preventing the victim from conducting independent checks.'
        },
        finance: {
            title: 'Financial & Asset Solicitation',
            class: 'hl-finance',
            icon: 'fa-solid fa-sack-dollar',
            scoreWeight: 25,
            cap: 40,
            keywords: [
                'wire transfer', 'gift card', 'itunes card', 'amazon card', 'steam card', 'western union',
                'moneygram', 'bitcoin', 'crypto', 'blockchain', 'inheritance', 'lottery', 'millions',
                'cash prize', 'winner', 'unclaimed funds', 'grant money', 'bank transfer', 'bank details',
                'credit card number', 'account pin', 'social security number', 'ssn'
            ],
            details: 'Requests wire transfers, crypto payments, gift cards, or credentials. Legitimate institutions never request payouts or passwords via email.'
        },
        authority: {
            title: 'Executive & Authority Impersonation',
            class: 'hl-authority',
            icon: 'fa-solid fa-building-columns',
            scoreWeight: 20,
            cap: 30,
            keywords: [
                'ceo', 'president', 'executive board', 'director of safety', 'irs', 'internal revenue',
                'fbi', 'federal agent', 'treasury department', 'customs border', 'security operations',
                'support desk team', 'billing department', 'fraud control', 'operations manager',
                'administrator', 'system administrator'
            ],
            details: 'Scammers claim to be government officials or company leaders to exploit submissive behavioral patterns.'
        },
        generic: {
            title: 'Generic Greeting or Deceptive Call-to-Action',
            class: 'hl-generic',
            icon: 'fa-solid fa-link-slash',
            scoreWeight: 15,
            cap: 25,
            keywords: [
                'dear customer', 'dear client', 'valuable customer', 'dear user', 'hello user',
                'click here', 'verify now', 'log in here', 'click link below', 'update credentials',
                'verify account', 'log in to secure', 'restore access', 'attachment below', 'scan code'
            ],
            details: 'Employs generic non-personalized greetings and forces actions through unverified external anchors.'
        }
    },

    init() {
        if (this._initialized) return;

        // Resolve DOM elements
        this.input = document.getElementById('email-content-input');
        this.scanBtn = document.getElementById('btn-scan-email');
        this.clearBtn = document.getElementById('btn-clear-email');
        this.resultsCard = document.getElementById('email-results-card');
        this.emptyState = document.getElementById('email-empty-state');
        this.activeState = document.getElementById('email-active-state');
        this.riskPercentage = document.getElementById('email-risk-percentage');
        this.threatLevel = document.getElementById('email-threat-level');
        this.highlightedText = document.getElementById('email-highlighted-text');
        this.vectorsList = document.getElementById('email-vectors-list');

        if (!this.scanBtn) {
            console.warn('EmailScamAnalyzer: scan button not found; module inactive.');
            this._initialized = true;
            return;
        }

        this.bindEvents();
        this._initialized = true;
    },

    bindEvents() {
        if (this.scanBtn) {
            this.scanBtn.addEventListener('click', () => {
                const val = this.input ? this.input.value.trim() : '';
                this.analyze(val);
            });
        }

        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                this.reset();
            });
        }

        // Enable reliable paste and drop behavior for different input types
        if (this.input) {
            // Paste: sanitize and insert at caret for inputs/textarea
            this.input.addEventListener('paste', (e) => {
                try {
                    const clipboard = (e.clipboardData || window.clipboardData);
                    const pasted = clipboard ? clipboard.getData('text') : '';
                    if (!pasted) return; // let browser handle if empty
                    e.preventDefault();
                    if (typeof this.input.selectionStart === 'number') {
                        const start = this.input.selectionStart;
                        const end = this.input.selectionEnd;
                        const val = this.input.value || '';
                        const newVal = val.slice(0, start) + pasted + val.slice(end);
                        this.input.value = newVal;
                        const caret = start + pasted.length;
                        this.input.setSelectionRange(caret, caret);
                    } else if (this.input.isContentEditable) {
                        document.execCommand('insertText', false, pasted);
                    } else {
                        // fallback: append
                        this.input.value = (this.input.value || '') + pasted;
                    }
                } catch (err) {
                    // Fail silently but allow default
                    console.warn('Paste handling failed', err);
                }
            });

            // Drag & drop text
            this.input.addEventListener('dragover', (e) => e.preventDefault());
            this.input.addEventListener('drop', (e) => {
                e.preventDefault();
                try {
                    const data = (e.dataTransfer && e.dataTransfer.getData) ? e.dataTransfer.getData('text') : '';
                    if (!data) return;
                    if (typeof this.input.selectionStart === 'number') {
                        const start = this.input.selectionStart;
                        const end = this.input.selectionEnd;
                        const val = this.input.value || '';
                        const newVal = val.slice(0, start) + data + val.slice(end);
                        this.input.value = newVal;
                        const caret = start + data.length;
                        this.input.setSelectionRange(caret, caret);
                    } else if (this.input.isContentEditable) {
                        document.execCommand('insertText', false, data);
                    } else {
                        this.input.value = (this.input.value || '') + data;
                    }
                } catch (err) {
                    console.warn('Drop handling failed', err);
                }
            });
        }
    },

    analyze(text) {
        if (!text) {
            if (typeof AegisNotification !== 'undefined' && AegisNotification.show) {
                AegisNotification.show('Content Required', 'Please paste email content to evaluate.', 'fa-solid fa-circle-exclamation');
            } else {
                console.warn('Content Required: Please paste email content to evaluate.');
            }
            return;
        }

        // Increment globally tracked metric if available
        if (typeof AegisState !== 'undefined' && typeof AegisState.incrementMetric === 'function') {
            AegisState.incrementMetric('emailsChecked');
        }

        // Score tracker and counts per category
        let totalScore = 0;
        const matchedPhrases = [];
        const categoryCounts = { urgency: 0, finance: 0, authority: 0, generic: 0 };

        // We copy the text to create a highlighted HTML structure
        let highlightedHtml = this.escapeHtml(text);

        // Scan categories and find matches
        for (const catKey in this.scamCategories) {
            const category = this.scamCategories[catKey];
            
            // Build a single regex pattern matching any keyword in this category
            // We escape special regex characters and map to match whole words/phrases
            const escapedKeywords = category.keywords.map(k => this.escapeRegex(k));
            const regexPattern = new RegExp(`\\b(${escapedKeywords.join('|')})\\b`, 'gi');
            
            // Search occurrences in original text
            const matches = text.match(regexPattern);
            if (matches) {
                categoryCounts[catKey] = matches.length;
                
                // Highlight occurrences in html text
                // Since replace can hit pre-existing span tags, we need to do this carefully.
                // A simple word-based replacement works for clean text inputs.
                // We use global replace with a replacement callback that protects markup.
                highlightedHtml = highlightedHtml.replace(regexPattern, (matched) => {
                    matchedPhrases.push({ phrase: matched.toLowerCase(), category: catKey });
                    return `<span class="${category.class}" title="${category.title}">${matched}</span>`;
                });
            }

            // Calculate score for category and apply caps
            const scoreAddition = categoryCounts[catKey] * category.scoreWeight;
            totalScore += Math.min(scoreAddition, category.cap);
        }

        // Cap total safety score
        totalScore = Math.min(totalScore, 100);

        // Determine Threat Level Label
        let classification = 'SAFE / INFORMATIONAL';
        let ratingColorClass = 'text-success';

        if (totalScore > 75) {
            classification = 'CRITICAL FRAUD VECTORS';
            ratingColorClass = 'text-danger text-glow';
        } else if (totalScore > 45) {
            classification = 'HIGH RISK PHISHING DRAFT';
            ratingColorClass = 'text-warning';
        } else if (totalScore > 15) {
            classification = 'SUSPICIOUS / MARKETING';
            ratingColorClass = 'text-cyan';
        }

        // Update UI (guard DOM nodes)
        if (this.emptyState && this.emptyState.classList) this.emptyState.classList.add('display-none');
        if (this.activeState && this.activeState.classList) this.activeState.classList.remove('display-none');

        if (this.riskPercentage) {
            this.riskPercentage.textContent = `${totalScore}%`;
            this.riskPercentage.className = `stat-box-value ${ratingColorClass}`;
        }
        if (this.threatLevel) {
            this.threatLevel.textContent = classification;
            this.threatLevel.className = `stat-box-value ${ratingColorClass}`;
        }

        // Insert highlighted HTML structure
        if (this.highlightedText) this.highlightedText.innerHTML = highlightedHtml;

        // Render matched vectors checklist
        if (this.vectorsList) this.vectorsList.innerHTML = '';
        
        let categoriesTriggered = 0;
        for (const catKey in this.scamCategories) {
            if (categoryCounts[catKey] > 0) {
                categoriesTriggered++;
                const category = this.scamCategories[catKey];
                const count = categoryCounts[catKey];

                const item = document.createElement('div');
                item.className = 'warning-log-item danger';
                item.innerHTML = `
                    <i class="${category.icon}"></i>
                    <div class="warning-log-desc">
                        <span class="warning-log-title">${category.title} (${count} matches)</span>
                        <span class="warning-log-details">${category.details}</span>
                    </div>
                `;
                if (this.vectorsList) this.vectorsList.appendChild(item);
            }
        }

        if (categoriesTriggered === 0) {
            const cleanItem = document.createElement('div');
            cleanItem.className = 'warning-log-item safe';
            cleanItem.innerHTML = `
                <i class="fa-solid fa-circle-check"></i>
                <div class="warning-log-desc">
                    <span class="warning-log-title">No Common Scam Triggers Identified</span>
                    <span class="warning-log-details">The linguistic composition does not carry standard markers of urgency coercion, wire request templates, or generic customer credentials phishing.</span>
                </div>
            `;
            if (this.vectorsList) this.vectorsList.appendChild(cleanItem);
        }
    },

    reset() {
        if (this.input) this.input.value = '';
        if (this.emptyState && this.emptyState.classList) this.emptyState.classList.remove('display-none');
        if (this.activeState && this.activeState.classList) this.activeState.classList.add('display-none');
        if (this.riskPercentage) this.riskPercentage.textContent = '0%';
        if (this.threatLevel) this.threatLevel.textContent = 'UNKNOWN';
        if (this.highlightedText) this.highlightedText.innerHTML = '';
        if (this.vectorsList) this.vectorsList.innerHTML = '';
    },

    // Helper functions
    escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    escapeRegex(string) {
        return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
};

// Expose globally
window.EmailScamAnalyzer = EmailScamAnalyzer;

// Initialize immediately if DOM already parsed, otherwise wait for DOMContentLoaded
if (document.readyState !== 'loading') {
    EmailScamAnalyzer.init();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        EmailScamAnalyzer.init();
    });
}
