/**
 * Aegis Cybersecurity Hub - Phishing URL Checker Module
 * Analyzes URLs using advanced local heuristics: typosquatting, raw IP addresses,
 * suspicious TLDs, subdomain density, deceptive keywords, and string entropy.
 */

const PhishingAnalyzer = {
    // DOM elements will be resolved during init() to avoid nulls
    input: null,
    scanBtn: null,
    resultsCard: null,
    emptyState: null,
    activeState: null,
    riskScoreVal: null,
    riskStatus: null,
    riskRing: null,
    warningsList: null,
    _initialized: false,

    // Known target brands for typosquatting checks
    brandKeywords: [
        'paypal', 'google', 'apple', 'facebook', 'microsoft', 'netflix', 
        'amazon', 'chase', 'bankofamerica', 'wellsfargo', 'steam', 'instagram', 
        'twitter', 'linkedin', 'yahoo', 'outlook', 'gmail', 'coinbase', 'binance'
    ],

    // High risk TLDs commonly used in phishing campaigns
    highRiskTLDs: [
        'xyz', 'club', 'top', 'info', 'work', 'click', 'gq', 'cf', 'tk', 
        'ml', 'fit', 'loan', 'support', 'online', 'vip', 'bid', 'country', 'gdn'
    ],

    // Deceptive keywords in URL
    deceptiveKeywords: [
        'login', 'signin', 'verify', 'billing', 'account', 'secure', 'banking', 
        'update', 'support', 'recovery', 'reset', 'password', 'claim', 'gift', 
        'prize', 'bonus', 'free', 'wallet', 'unlock', 'suspend', 'disabled'
    ],

    init() {
        if (this._initialized) return;

        // Resolve DOM elements when DOM is ready
        this.input = document.getElementById('url-input');
        this.scanBtn = document.getElementById('btn-scan-url');
        this.resultsCard = document.getElementById('url-results-card');
        this.emptyState = document.getElementById('url-empty-state');
        this.activeState = document.getElementById('url-active-state');
        this.riskScoreVal = document.getElementById('url-risk-score');
        this.riskStatus = document.getElementById('url-risk-status');
        this.riskRing = document.getElementById('url-risk-ring');
        this.warningsList = document.getElementById('url-warnings-list');

        if (!this.scanBtn) {
            console.warn('PhishingAnalyzer: scan button not found; module inactive.');
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
                this.scan(val);
            });
        }

        // Use keydown for reliable Enter handling
        if (this.input) {
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.scan(this.input.value.trim());
                }
            });
        }
    },

    // Calculate string entropy to spot random domain generation
    calculateEntropy(str) {
        const len = str.length;
        if (len === 0) return 0;
        const frequencies = {};
        for (let i = 0; i < len; i++) {
            const char = str[i];
            frequencies[char] = (frequencies[char] || 0) + 1;
        }
        let entropy = 0;
        for (const char in frequencies) {
            const p = frequencies[char] / len;
            entropy -= p * Math.log2(p);
        }
        return entropy;
    },

    scan(rawUrl) {
        if (!rawUrl) {
            if (typeof AegisNotification !== 'undefined' && AegisNotification.show) {
                AegisNotification.show('Input Required', 'Please enter a URL to inspect.', 'fa-solid fa-circle-exclamation');
            } else {
                console.warn('Input Required: Please enter a URL to inspect.');
            }
            return;
        }

        // Increment globally tracked metric if available
        if (typeof AegisState !== 'undefined' && typeof AegisState.incrementMetric === 'function') {
            AegisState.incrementMetric('urlsChecked');
        }

        // Normalizing URL for parsing. If no protocol, prefix it to allow URL parser to work
        let urlStringToParse = rawUrl;
        let protocolMissing = false;
        if (!/^https?:\/\//i.test(rawUrl)) {
            urlStringToParse = 'http://' + rawUrl;
            protocolMissing = true;
        }

        let urlObj;
        try {
            urlObj = new URL(urlStringToParse);
        } catch (e) {
            // URL parse failed, perform basic regex parsing fallback
            this.renderFailReport(rawUrl);
            return;
        }

        const hostname = urlObj.hostname.toLowerCase();
        const pathname = urlObj.pathname.toLowerCase();
        const search = urlObj.search.toLowerCase();
        const fullUrl = rawUrl.toLowerCase();

        const warnings = [];
        let score = 0;

        // --- Heuristic 1: Protocol SSL check ---
        if (protocolMissing) {
            score += 15;
            warnings.push({
                level: 'warning',
                title: 'No Explicit Protocol Defined',
                details: 'The URL was typed without http:// or https://. Phishing links often bypass showing protocols to hide unencrypted channels.'
            });
        } else if (urlObj.protocol === 'http:') {
            score += 30;
            warnings.push({
                level: 'danger',
                title: 'Unencrypted Protocol (HTTP)',
                details: 'This link uses raw HTTP. Data is sent in plain text, meaning anyone on your network can intercept credentials. Legitimate log-in pages always use HTTPS.'
            });
        }

        // --- Heuristic 2: Raw IP hosting ---
        const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
        if (ipRegex.test(hostname)) {
            score += 45;
            warnings.push({
                level: 'danger',
                title: 'Raw IP Address Hosting',
                details: `The URL targets a raw IP address (${hostname}) instead of a registered domain. Genuine companies do not host client-facing login portals directly on IP addresses.`
            });
        }

        // --- Heuristic 3: High Risk TLDs ---
        const tldMatch = hostname.match(/\.([a-z0-9\-]+)$/);
        if (tldMatch && tldMatch[1]) {
            const tld = tldMatch[1];
            if (this.highRiskTLDs.includes(tld)) {
                score += 25;
                warnings.push({
                    level: 'warning',
                    title: `Suspicious Top-Level Domain (.${tld})`,
                    details: `Commonly used for cheap registry options. Attackers purchase .${tld} domains in bulk for short-term phishing campaigns.`
                });
            }
        }

        // --- Heuristic 4: Subdomain count density ---
        const dotCount = (hostname.match(/\./g) || []).length;
        // e.g. login.paypal.com.verify.com (3 dots or more)
        if (dotCount >= 4) {
            score += 20;
            warnings.push({
                level: 'warning',
                title: 'High Subdomain Density',
                details: `Found ${dotCount} subdomains in host. Phishing links stack subdomains (like paypal.com.account-update.secure-login.net) to fool users into seeing a brand name early on.`
            });
        }

        // --- Heuristic 5: Typosquatting / Brand Mimicry ---
        let brandAbused = null;
        let exactMatch = false;

        for (const brand of this.brandKeywords) {
            // Check if brand is mentioned in hostname
            if (hostname.includes(brand)) {
                // Check if it's the official domain (e.g. brand.com, brand.co.uk)
                const officialRegex = new RegExp(`(^|\\.)${brand}\\.[a-z]{2,6}(\\.[a-z]{2})?$`, 'i');
                if (officialRegex.test(hostname)) {
                    exactMatch = true;
                } else {
                    brandAbused = brand;
                }
            } else {
                // Check for typo lookalikes (e.g. paypa1, faceb00k, goog1e)
                // Replace characters to look for mimicking
                const typos = [
                    brand.replace(/l/g, '1'),
                    brand.replace(/o/g, '0'),
                    brand.replace(/i/g, '1'),
                    brand.replace(/e/g, '3'),
                    brand.replace(/a/g, '4')
                ];
                
                for (const typo of typos) {
                    if (typo !== brand && hostname.includes(typo)) {
                        brandAbused = `${brand} (mimicked as "${typo}")`;
                        score += 20; // Extra penalty for visual tricks
                    }
                }
            }
        }

        if (brandAbused && !exactMatch) {
            score += 35;
            warnings.push({
                level: 'danger',
                title: `Potential Brand Impersonation (${brandAbused})`,
                details: `This site references a major brand keyword in its domain name but does not resolve to the brand's official server. This is a primary trademark of phishing.`
            });
        }

        // --- Heuristic 6: Deceptive keywords in URL string ---
        const matchedKeywords = [];
        this.deceptiveKeywords.forEach(kw => {
            const regex = new RegExp(`[\\.\\-\\/]${kw}[\\.\\-\\/]`, 'i');
            if (regex.test(fullUrl) || hostname.startsWith(`${kw}-`) || hostname.endsWith(`-${kw}`)) {
                matchedKeywords.push(kw);
            }
        });

        if (matchedKeywords.length > 0) {
            score += Math.min(matchedKeywords.length * 15, 35);
            warnings.push({
                level: 'warning',
                title: 'Security Coercion Keywords Detected',
                details: `Found deceptive keywords: ${matchedKeywords.map(k => `<strong>"${k}"</strong>`).join(', ')}. Scammers prefix domains with these words to build artificial credibility.`
            });
        }

        // --- Heuristic 7: Redirection indicators ---
        if (search.includes('http://') || search.includes('https://') || search.includes('redirect=') || search.includes('url=')) {
            score += 20;
            warnings.push({
                level: 'warning',
                title: 'Open Redirection Parameters',
                details: 'The link query string contains external web links or redirect parameters. Attackers leverage redirects to point users to safe targets first, then automatically bounce them to malicious screens.'
            });
        }

        // --- Heuristic 8: Domain String Randomness (Entropy) ---
        const domainNameOnly = hostname.split('.')[0];
        if (domainNameOnly.length > 10) {
            const entropy = this.calculateEntropy(domainNameOnly);
            if (entropy > 4.0) { // high complexity representing random generated names
                score += 15;
                warnings.push({
                    level: 'warning',
                    title: 'High Domain Randomness (Entropy)',
                    details: `The domain name string has high cryptographic entropy (${entropy.toFixed(2)}). This is characteristic of automatically generated domains (DGA) designed to escape firewall filters.`
                });
            }
        }

        // Ensure score caps
        score = Math.min(score, 100);

        // If no heuristics were triggered and it has HTTPS, it's clean
        if (score === 0) {
            warnings.push({
                level: 'safe',
                title: 'Clear Local Indicators',
                details: 'This URL passed our offline heuristics engine. No visual mimicry, raw IP hosting, high-risk TLD blocks, or coercive subdomains were observed.'
            });
        }

        this.renderReport(score, warnings);
    },

    renderReport(score, warnings) {
        if (this.emptyState && this.emptyState.classList) this.emptyState.classList.add('display-none');
        if (this.activeState && this.activeState.classList) this.activeState.classList.remove('display-none');

        // Color and status determinations
        let status = 'SAFE';
        let strokeColor = 'var(--emerald-glow)';
        let statusClass = 'text-success';

        if (score > 80) {
            status = 'PHISHING CRITICAL';
            strokeColor = 'var(--rose-glow)';
            statusClass = 'text-danger';
        } else if (score > 50) {
            status = 'SUSPICIOUS';
            strokeColor = 'var(--warning-glow)';
            statusClass = 'text-warning';
        } else if (score > 20) {
            status = 'LOW RISK';
            strokeColor = 'var(--cyan-glow)';
            statusClass = 'text-cyan';
        }

        // Render Gauge Info
        if (this.riskScoreVal) {
            this.riskScoreVal.textContent = `${score}%`;
            this.riskScoreVal.className = `risk-value ${statusClass}`;
        }
        if (this.riskStatus) {
            this.riskStatus.textContent = status;
            this.riskStatus.className = `risk-status ${statusClass}`;
        }

        // Render SVG circle offset
        // Radius of circle is 50, circumference is 2 * PI * 50 = 314.15
        const circumference = 314.15;
        const offset = circumference - (score / 100) * circumference;
        if (this.riskRing && this.riskRing.style) {
            this.riskRing.style.strokeDashoffset = offset;
            this.riskRing.style.stroke = strokeColor;
        }

        // Render Warnings list
        if (this.warningsList) {
            this.warningsList.innerHTML = '';
            warnings.forEach(w => {
                const item = document.createElement('div');
                item.className = `warning-log-item ${w.level}`;
                
                let iconClass = 'fa-solid fa-circle-check';
                if (w.level === 'danger') iconClass = 'fa-solid fa-skull-crossbones';
                if (w.level === 'warning') iconClass = 'fa-solid fa-triangle-exclamation';

                item.innerHTML = `
                    <i class="${iconClass}"></i>
                    <div class="warning-log-desc">
                        <span class="warning-log-title">${w.title}</span>
                        <span class="warning-log-details">${w.details}</span>
                    </div>
                `;
                this.warningsList.appendChild(item);
            });
        } else {
            // Fallback: log warnings to console if UI not present
            console.warn('PhishingAnalyzer warnings:', warnings);
        }
    },

    renderFailReport(rawUrl) {
        if (this.emptyState && this.emptyState.classList) this.emptyState.classList.add('display-none');
        if (this.activeState && this.activeState.classList) this.activeState.classList.remove('display-none');

        if (this.riskScoreVal) {
            this.riskScoreVal.textContent = 'ERROR';
            this.riskScoreVal.className = 'risk-value text-danger';
        }
        if (this.riskStatus) {
            this.riskStatus.textContent = 'INVALID SYNTAX';
            this.riskStatus.className = 'risk-status text-danger';
        }

        if (this.riskRing && this.riskRing.style) {
            this.riskRing.style.strokeDashoffset = 0;
            this.riskRing.style.stroke = 'var(--rose-glow)';
        }

        if (this.warningsList) {
            this.warningsList.innerHTML = `
                <div class="warning-log-item danger">
                    <i class="fa-solid fa-circle-xmark"></i>
                    <div class="warning-log-desc">
                        <span class="warning-log-title">Malformed Host Address</span>
                        <span class="warning-log-details">The character structure in <strong>"${rawUrl}"</strong> is invalid or has prohibited symbols. Confirm it contains no spaces or unsupported symbols.</span>
                    </div>
                </div>
            `;
        } else {
            console.warn('Malformed Host Address:', rawUrl);
        }
    }
};

// Expose globally
window.PhishingAnalyzer = PhishingAnalyzer;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    PhishingAnalyzer.init();
});
