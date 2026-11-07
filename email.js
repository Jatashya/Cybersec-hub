/**
 * Aegis Cybersecurity Hub - Email Scam & Phishing Analyzer Module
 * Inspects unstructured email text for psychological manipulation vectors,
 * financial urgency, spoofed authority, and deceptive calls-to-action.
 * Uses safe range-based token highlighting (no HTML attribute corruption).
 */

const EmailScamAnalyzer = {
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

    scamCategories: {
        urgency: {
            title: 'Urgency & Coercive Pressure',
            class: 'hl-urgency',
            icon: 'fa-solid fa-clock-six',
            scoreWeight: 20,
            cap: 35,
            keywords: [
                'immediately', 'urgent', 'asap', 'within 24 hours', 'within 48 hours', 'within 12 hours',
                'suspended', 'suspension', 'placed on hold', 'compromised', 'assets liquidated',
                'account closure', 'terminate account', 'permanent deletion', 'deactivated', 
                'action required', 'unauthorized login', 'final warning', 'final notice', 'critical security',
                'act now', 'limited time', 'expires today'
            ],
            details: 'Forces high-speed decision making by threat of immediate penalty, suppressing critical reasoning.'
        },
        finance: {
            title: 'Financial & Asset Extraction',
            class: 'hl-finance',
            icon: 'fa-solid fa-sack-dollar',
            scoreWeight: 25,
            cap: 40,
            keywords: [
                'wire transfer', 'gift card', 'itunes card', 'amazon card', 'steam card', 'western union',
                'moneygram', 'bitcoin', 'crypto', 'blockchain', 'inheritance', 'lottery', 'millions',
                'cash prize', 'winner', 'unclaimed funds', 'grant money', 'bank transfer', 'bank details',
                'credit card number', 'account pin', 'social security number', 'ssn', 'tax refund',
                'payment required', 'overdue invoice', 'remittance'
            ],
            details: 'Requests wire transfers, crypto, gift cards, or credentials. Legitimate institutions never request financial transactions via unsolicited emails.'
        },
        authority: {
            title: 'Executive & Government Impersonation',
            class: 'hl-authority',
            icon: 'fa-solid fa-building-columns',
            scoreWeight: 20,
            cap: 30,
            keywords: [
                'ceo', 'president', 'executive board', 'director of safety', 'irs', 'internal revenue',
                'fbi', 'federal agent', 'treasury department', 'customs border', 'security operations',
                'support desk team', 'billing department', 'fraud control', 'operations manager',
                'administrator', 'system administrator', 'human resources', 'legal counsel'
            ],
            details: 'Impersonates company executives or legal authorities to exploit organizational deference and fear of insubordination.'
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
                'verify account', 'log in to secure', 'restore access', 'attachment below', 'scan qr code',
                'open attached file', 'download form'
            ],
            details: 'Employs impersonal greetings and ambiguous redirect anchors designed to funnel victims to credential-harvesting pages.'
        }
    },

    presets: {
        urgent: `URGENT SECURITY ALERT: Unauthorized login attempt detected from Moscow, Russia.
Your account has been placed on hold immediately. You must click link below to verify account within 24 hours. Failure to update credentials will result in permanent deletion and assets liquidated.
Please verify now to restore access immediately.
- Fraud Control Team`,

        wire: `From: CEO / Executive Board
To: Accounting Department
I am currently in an all-day confidential acquisition meeting and need an urgent wire transfer processed immediately. Please do not call my office line. Send $24,500 via bank transfer to the supplier details attached below. This invoice payment is critical for today's deadline.
Sincerely,
Chief Executive Officer`,

        lottery: `CONGRATULATIONS VALUABLE CUSTOMER!
You have been officially selected as the winner of the 2026 International Blockchain Grant. Unclaimed funds of $1,500,000 are ready for remittance. To claim your cash prize, submit your bank details, credit card number, and social security number to our agent. You must pay a $250 verification fee via iTunes gift card or bitcoin.`,

        clean: `Hi Team,
Just a reminder that our bi-weekly sprint planning meeting is scheduled for tomorrow at 10:00 AM UTC. Please review the backlog items beforehand and update your task statuses on the board.
Looking forward to our discussion!
Best regards,
Sarah Jenkins`
    },

    init() {
        if (this._initialized) return;

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

        if (!this.scanBtn) return;
        this.bindEvents();
        this.bindPresets();
        this._initialized = true;
    },

    bindEvents() {
        this.scanBtn.addEventListener('click', () => {
            const val = this.input ? this.input.value.trim() : '';
            this.analyze(val);
        });

        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.reset());
        }
    },

    bindPresets() {
        const presetsContainer = document.getElementById('email-presets');
        if (presetsContainer) {
            presetsContainer.querySelectorAll('.preset-pill').forEach(btn => {
                btn.addEventListener('click', () => {
                    const presetType = btn.getAttribute('data-preset');
                    if (this.presets[presetType] && this.input) {
                        this.input.value = this.presets[presetType];
                        this.analyze(this.presets[presetType]);
                    }
                });
            });
        }
    },

    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    analyze(text) {
        if (!text) {
            if (window.AegisNotification) {
                window.AegisNotification.show('Content Required', 'Please paste or select sample email text to evaluate.', 'fa-solid fa-circle-exclamation');
            }
            return;
        }

        if (window.AegisState && typeof window.AegisState.incrementMetric === 'function') {
            window.AegisState.incrementMetric('emailsChecked');
        }

        // Safe Range-based Token Matching (prevents HTML tag corruption)
        const matchRanges = [];
        const categoryCounts = { urgency: 0, finance: 0, authority: 0, generic: 0 };

        for (const catKey in this.scamCategories) {
            const category = this.scamCategories[catKey];
            const escapedKeywords = category.keywords.map(k => this.escapeRegex(k));
            const regex = new RegExp(`\\b(${escapedKeywords.join('|')})\\b`, 'gi');

            let match;
            while ((match = regex.exec(text)) !== null) {
                categoryCounts[catKey]++;
                matchRanges.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    matchedText: match[0],
                    category: catKey,
                    class: category.class,
                    title: category.title
                });
            }
        }

        // Sort ranges by start index and filter overlaps
        matchRanges.sort((a, b) => a.start - b.start);
        const nonOverlapping = [];
        let lastEnd = -1;
        for (const r of matchRanges) {
            if (r.start >= lastEnd) {
                nonOverlapping.push(r);
                lastEnd = r.end;
            }
        }

        // Build safe highlighted HTML from plain text slices
        let highlightedHtml = '';
        let currentIndex = 0;
        for (const r of nonOverlapping) {
            if (r.start > currentIndex) {
                highlightedHtml += this.escapeHtml(text.slice(currentIndex, r.start));
            }
            highlightedHtml += `<mark class="scam-mark ${r.class}" title="${this.escapeHtml(r.title)}">${this.escapeHtml(r.matchedText)}</mark>`;
            currentIndex = r.end;
        }
        if (currentIndex < text.length) {
            highlightedHtml += this.escapeHtml(text.slice(currentIndex));
        }

        // Calculate Weighted Threat Score
        let totalScore = 0;
        for (const catKey in this.scamCategories) {
            const cat = this.scamCategories[catKey];
            const count = categoryCounts[catKey];
            if (count > 0) {
                const added = Math.min(count * cat.scoreWeight, cat.cap);
                totalScore += added;
            }
        }

        const finalScore = Math.min(totalScore, 100);
        this.renderResults(finalScore, categoryCounts, highlightedHtml);
    },

    renderResults(score, counts, highlightedHtml) {
        if (this.emptyState) this.emptyState.classList.add('display-none');
        if (this.activeState) {
            this.activeState.classList.remove('display-none');
            this.activeState.setAttribute('aria-live', 'polite');
        }

        let threatLabel = 'CLEAN / BENIGN';
        let threatColorClass = 'text-success';

        if (score >= 65) {
            threatLabel = 'CRITICAL PHISHING THREAT';
            threatColorClass = 'text-danger';
        } else if (score >= 35) {
            threatLabel = 'SUSPICIOUS / ELEVATED RISK';
            threatColorClass = 'text-warning';
        } else if (score > 10) {
            threatLabel = 'LOW RISK';
            threatColorClass = 'text-cyan';
        }

        if (this.riskPercentage) {
            if (window.scrambleDecode) {
                window.scrambleDecode(this.riskPercentage, `${score}%`, 350);
            } else {
                this.riskPercentage.textContent = `${score}%`;
            }
            this.riskPercentage.className = `stat-box-value text-glow ${threatColorClass}`;
        }

        if (this.threatLevel) {
            this.threatLevel.textContent = threatLabel;
            this.threatLevel.className = `stat-box-value ${threatColorClass}`;
        }

        // Update Dynamic Threat Badge in Header
        const threatBadge = document.getElementById('email-threat-badge');
        if (threatBadge) {
            threatBadge.textContent = score >= 65 ? 'CRITICAL THREAT' : score >= 35 ? 'ELEVATED RISK' : 'BENIGN / CLEAN';
            threatBadge.className = `badge ${score >= 65 ? 'badge-danger' : score >= 35 ? 'badge-warning' : 'badge-success'}`;
        }

        // Update Urgency Breakdown 4-Sub-Meters
        const urgencyPct = Math.min((counts.urgency || 0) * 30, 100);
        const financePct = Math.min((counts.finance || 0) * 35, 100);
        const authorityPct = Math.min((counts.authority || 0) * 35, 100);
        const genericPct = Math.min((counts.generic || 0) * 25, 100);

        const mUrgency = document.getElementById('meter-urgency');
        const mUrgencyVal = document.getElementById('meter-urgency-val');
        if (mUrgency) mUrgency.style.width = `${urgencyPct}%`;
        if (mUrgencyVal) mUrgencyVal.textContent = `${urgencyPct}%`;

        const mFinance = document.getElementById('meter-finance');
        const mFinanceVal = document.getElementById('meter-finance-val');
        if (mFinance) mFinance.style.width = `${financePct}%`;
        if (mFinanceVal) mFinanceVal.textContent = `${financePct}%`;

        const mAuthority = document.getElementById('meter-authority');
        const mAuthorityVal = document.getElementById('meter-authority-val');
        if (mAuthority) mAuthority.style.width = `${authorityPct}%`;
        if (mAuthorityVal) mAuthorityVal.textContent = `${authorityPct}%`;

        const mGeneric = document.getElementById('meter-generic');
        const mGenericVal = document.getElementById('meter-generic-val');
        if (mGeneric) mGeneric.style.width = `${genericPct}%`;
        if (mGenericVal) mGenericVal.textContent = `${genericPct}%`;

        // Update Simulated Security Headers Validation (SPF, DKIM, DMARC)
        const hdrSpf = document.getElementById('hdr-spf');
        const hdrDkim = document.getElementById('hdr-dkim');
        const hdrDmarc = document.getElementById('hdr-dmarc');

        if (score >= 65) {
            if (hdrSpf) hdrSpf.innerHTML = `<i class="fa-solid fa-circle-xmark text-danger"></i> FAIL (UNALIGNED SENDER IP)`;
            if (hdrSpf) hdrSpf.className = 'email-header-status text-danger';
            if (hdrDkim) hdrDkim.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-warning"></i> INVALID (SIGNATURE MISMATCH)`;
            if (hdrDkim) hdrDkim.className = 'email-header-status text-warning';
            if (hdrDmarc) hdrDmarc.innerHTML = `<i class="fa-solid fa-shield-virus text-danger"></i> REJECT TRIGGERED`;
            if (hdrDmarc) hdrDmarc.className = 'email-header-status text-danger';
        } else if (score >= 35) {
            if (hdrSpf) hdrSpf.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-warning"></i> SOFTFAIL (~ALL)`;
            if (hdrSpf) hdrSpf.className = 'email-header-status text-warning';
            if (hdrDkim) hdrDkim.innerHTML = `<i class="fa-solid fa-circle-check text-success"></i> PASS (VALID DKIM)`;
            if (hdrDkim) hdrDkim.className = 'email-header-status text-success';
            if (hdrDmarc) hdrDmarc.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-warning"></i> QUARANTINE`;
            if (hdrDmarc) hdrDmarc.className = 'email-header-status text-warning';
        } else {
            if (hdrSpf) hdrSpf.innerHTML = `<i class="fa-solid fa-circle-check text-success"></i> PASS (SPF1)`;
            if (hdrSpf) hdrSpf.className = 'email-header-status text-success';
            if (hdrDkim) hdrDkim.innerHTML = `<i class="fa-solid fa-circle-check text-success"></i> VALID (1024-RSA)`;
            if (hdrDkim) hdrDkim.className = 'email-header-status text-success';
            if (hdrDmarc) hdrDmarc.innerHTML = `<i class="fa-solid fa-circle-check text-success"></i> ALIGNED (P=REJECT)`;
            if (hdrDmarc) hdrDmarc.className = 'email-header-status text-success';
        }

        // Append to Live Security Health Ledger
        if (window.AegisState && typeof window.AegisState.logEvent === 'function') {
            window.AegisState.logEvent('email', 'Email Payload Scan', `${threatLabel} (Coercion Index: ${score}%)`, threatLabel.split(' ')[0], score >= 65 ? 'danger' : score >= 35 ? 'warning' : 'success');
        }

        if (this.highlightedText) {
            this.highlightedText.innerHTML = highlightedHtml || '<p class="text-dim">No text content provided.</p>';
        }

        if (this.vectorsList) {
            this.vectorsList.innerHTML = '';
            let activeVectors = 0;
            for (const catKey in this.scamCategories) {
                const count = counts[catKey];
                if (count > 0) {
                    activeVectors++;
                    const cat = this.scamCategories[catKey];
                    const item = document.createElement('div');
                    item.className = 'warning-item warning-danger';
                    item.innerHTML = `
                        <i class="${cat.icon} text-warning"></i>
                        <div>
                            <strong>${cat.title} (${count} matches found)</strong>
                            <p>${cat.details}</p>
                        </div>
                    `;
                    this.vectorsList.appendChild(item);
                }
            }

            if (activeVectors === 0) {
                this.vectorsList.innerHTML = `
                    <div class="warning-item safe-item">
                        <i class="fa-solid fa-circle-check text-success"></i>
                        <div>
                            <strong>No Psychological Coercion Triggers Found</strong>
                            <p>Text does not exhibit overt social engineering manipulation, artificial deadlines, or credential solicitations.</p>
                        </div>
                    </div>
                `;
            }
        }
    },

    reset() {
        if (this.input) this.input.value = '';
        if (this.emptyState) this.emptyState.classList.remove('display-none');
        if (this.activeState) this.activeState.classList.add('display-none');

        const threatBadge = document.getElementById('email-threat-badge');
        if (threatBadge) {
            threatBadge.textContent = 'READY';
            threatBadge.className = 'badge badge-pulse';
        }

        const mUrgency = document.getElementById('meter-urgency');
        const mFinance = document.getElementById('meter-finance');
        const mAuthority = document.getElementById('meter-authority');
        const mGeneric = document.getElementById('meter-generic');
        if (mUrgency) mUrgency.style.width = '0%';
        if (mFinance) mFinance.style.width = '0%';
        if (mAuthority) mAuthority.style.width = '0%';
        if (mGeneric) mGeneric.style.width = '0%';

        const uVal = document.getElementById('meter-urgency-val');
        const fVal = document.getElementById('meter-finance-val');
        const aVal = document.getElementById('meter-authority-val');
        const gVal = document.getElementById('meter-generic-val');
        if (uVal) uVal.textContent = '0%';
        if (fVal) fVal.textContent = '0%';
        if (aVal) aVal.textContent = '0%';
        if (gVal) gVal.textContent = '0%';

        if (this.riskPercentage) this.riskPercentage.textContent = '0%';
        if (this.threatLevel) {
            this.threatLevel.textContent = 'CLEAN / BENIGN';
            this.threatLevel.className = 'stat-box-value font-mono text-success';
        }
        if (this.highlightedText) {
            this.highlightedText.innerHTML = '<p class="text-dim font-xs">Enter or load a test vector payload to highlight psychological coercion triggers.</p>';
        }
        if (this.vectorsList) {
            this.vectorsList.innerHTML = `
                <div class="warning-item safe-item">
                    <i class="fa-solid fa-circle-check text-success"></i>
                    <div>
                        <strong>Payload Verification Standby</strong>
                        <p>Load a sample payload or paste a message to inspect for social engineering vectors.</p>
                    </div>
                </div>
            `;
        }
    }
};

window.EmailScamAnalyzer = EmailScamAnalyzer;
window.EmailScanner = EmailScamAnalyzer;
document.addEventListener('DOMContentLoaded', () => {
    EmailScamAnalyzer.init();
});
