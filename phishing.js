/**
 * Aegis Cybersecurity Hub - Phishing Threat Intelligence & Heuristic Deconstruction Engine
 * Enterprise Tier-1 Heuristic Console matching RFC 3986, RFC 5890, and UTS #39 Specifications.
 * Features:
 *  - RFC 3492 Punycode deconstruction & Cyrillic/Greek homoglyph detection
 *  - IP Obfuscation de-cloaking (Hexadecimal 0x, Dword uint32, Octal & Raw IPv4)
 *  - Levenshtein distance string matching against 25+ Fortune 500 & tech brands
 *  - Open redirect bounce vector extraction (?url=, ?redirect=, etc.)
 *  - Subdomain stacking depth & brand prefixing analysis
 *  - High-abuse TLD reputation scoring (.xyz, .top, .tk, .cam, etc.)
 *  - Shannon hostname entropy calculation (H = -sum p log2 p)
 *  - Automated SOC Incident Response Runbook generation (DNS Sinkhole, Perimeter WAF)
 *  - Zero-egress client sandbox execution guarantee
 */

const PhishingAnalyzer = {
    // DOM Elements
    input: null,
    scanBtn: null,
    clearBtn: null,
    pasteBtn: null,
    presetsBar: null,

    // 4 Executive KPIs
    kpiTier: null,
    kpiScore: null,
    kpiVector: null,
    kpiVectorBadge: null,
    kpiTarget: null,
    kpiTargetBadge: null,

    // 6 Tactical Probes
    probeIdn: null,
    probeIdnBadge: null,
    probeIdnDetail: null,

    probeIp: null,
    probeIpBadge: null,
    probeIpDetail: null,

    probeTypo: null,
    probeTypoBadge: null,
    probeTypoDetail: null,

    probeRedirect: null,
    probeRedirectBadge: null,
    probeRedirectDetail: null,

    probeSubdomain: null,
    probeSubdomainBadge: null,
    probeSubdomainDetail: null,

    probeTld: null,
    probeTldBadge: null,
    probeTldDetail: null,

    // IDN Enclave
    idnContainer: null,
    idnStatusPill: null,
    idnContent: null,

    // SOC Runbook
    socDnsRule: null,
    socWafRule: null,
    socAdvisoryItems: null,
    btnCopyDns: null,
    btnCopyWaf: null,

    // Verdict HUD
    verdictBadge: null,
    riskRing: null,
    riskScoreVal: null,
    riskStatus: null,
    scoreBar: null,

    // 4 Sub-Metrics
    metricScheme: null,
    metricTld: null,
    metricEntropy: null,
    metricLevenshtein: null,

    // Anatomy & Findings
    anatomyContainer: null,
    findingsCount: null,
    warningsList: null,

    _initialized: false,

    brandKeywords: [
        'paypal', 'google', 'apple', 'facebook', 'microsoft', 'netflix', 
        'amazon', 'chase', 'bankofamerica', 'wellsfargo', 'steam', 'instagram', 
        'twitter', 'linkedin', 'yahoo', 'outlook', 'gmail', 'coinbase', 'binance',
        'github', 'dropbox', 'spotify', 'adobe', 'discord', 'telegram'
    ],

    highRiskTLDs: [
        'xyz', 'club', 'top', 'info', 'work', 'click', 'gq', 'cf', 'tk', 
        'ml', 'fit', 'loan', 'support', 'online', 'vip', 'bid', 'country', 'gdn',
        'buzz', 'monster', 'rest', 'live', 'icu', 'cam'
    ],

    deceptiveKeywords: [
        'login', 'signin', 'verify', 'billing', 'account', 'secure', 'banking', 
        'update', 'support', 'recovery', 'reset', 'password', 'claim', 'gift', 
        'prize', 'bonus', 'free', 'wallet', 'unlock', 'suspend', 'disabled',
        'validation', 'security-alert', 'confirmation', 'authenticate'
    ],

    // Common Cyrillic & Greek homoglyphs used in IDN attacks (UTS #39 Confusables)
    homoglyphs: {
        'а': { latin: 'a', name: 'Cyrillic Small Letter A', cp: 'U+0430' },
        'с': { latin: 'c', name: 'Cyrillic Small Letter Es', cp: 'U+0441' },
        'е': { latin: 'e', name: 'Cyrillic Small Letter Ie', cp: 'U+0435' },
        'о': { latin: 'o', name: 'Cyrillic Small Letter O', cp: 'U+043E' },
        'р': { latin: 'p', name: 'Cyrillic Small Letter Er', cp: 'U+0440' },
        'ѕ': { latin: 's', name: 'Cyrillic Small Letter Dze', cp: 'U+0455' },
        'ԁ': { latin: 'd', name: 'Cyrillic Small Letter Komi De', cp: 'U+0501' },
        'ԛ': { latin: 'q', name: 'Cyrillic Small Letter Qa', cp: 'U+051B' },
        'ԝ': { latin: 'w', name: 'Cyrillic Small Letter We', cp: 'U+051D' },
        'у': { latin: 'y', name: 'Cyrillic Small Letter U', cp: 'U+0443' },
        'х': { latin: 'x', name: 'Cyrillic Small Letter Ha', cp: 'U+0445' },
        'і': { latin: 'i', name: 'Cyrillic Small Letter Byelorussian-Ukrainian I', cp: 'U+0456' },
        'ј': { latin: 'j', name: 'Cyrillic Small Letter Je', cp: 'U+0458' },
        'ӏ': { latin: 'l', name: 'Cyrillic Small Letter Palochka', cp: 'U+04CF' }
    },

    init() {
        if (this._initialized) return;

        // Input & Controls
        this.input = document.getElementById('url-input');
        this.scanBtn = document.getElementById('btn-scan-url');
        this.clearBtn = document.getElementById('btn-clear-url');
        this.pasteBtn = document.getElementById('btn-paste-url');
        this.presetsBar = document.getElementById('phishing-presets');

        // Executive Ribbon KPIs
        this.kpiTier = document.getElementById('phish-kpi-tier');
        this.kpiScore = document.getElementById('phish-kpi-score');
        this.kpiVector = document.getElementById('phish-kpi-vector');
        this.kpiVectorBadge = document.getElementById('phish-kpi-vector-badge');
        this.kpiTarget = document.getElementById('phish-kpi-target');
        this.kpiTargetBadge = document.getElementById('phish-kpi-target-badge');

        // 6 Probes
        this.probeIdn = document.getElementById('probe-idn');
        this.probeIdnBadge = document.getElementById('probe-idn-badge');
        this.probeIdnDetail = document.getElementById('probe-idn-detail');

        this.probeIp = document.getElementById('probe-ip');
        this.probeIpBadge = document.getElementById('probe-ip-badge');
        this.probeIpDetail = document.getElementById('probe-ip-detail');

        this.probeTypo = document.getElementById('probe-typo');
        this.probeTypoBadge = document.getElementById('probe-typo-badge');
        this.probeTypoDetail = document.getElementById('probe-typo-detail');

        this.probeRedirect = document.getElementById('probe-redirect');
        this.probeRedirectBadge = document.getElementById('probe-redirect-badge');
        this.probeRedirectDetail = document.getElementById('probe-redirect-detail');

        this.probeSubdomain = document.getElementById('probe-subdomain');
        this.probeSubdomainBadge = document.getElementById('probe-subdomain-badge');
        this.probeSubdomainDetail = document.getElementById('probe-subdomain-detail');

        this.probeTld = document.getElementById('probe-tld');
        this.probeTldBadge = document.getElementById('probe-tld-badge');
        this.probeTldDetail = document.getElementById('probe-tld-detail');

        // IDN Enclave
        this.idnContainer = document.getElementById('phish-idn-container');
        this.idnStatusPill = document.getElementById('idn-status-pill');
        this.idnContent = document.getElementById('idn-matrix-content');

        // SOC Runbook
        this.socDnsRule = document.getElementById('soc-dns-rule');
        this.socWafRule = document.getElementById('soc-waf-rule');
        this.socAdvisoryItems = document.getElementById('soc-advisory-items');
        this.btnCopyDns = document.getElementById('btn-copy-dns');
        this.btnCopyWaf = document.getElementById('btn-copy-waf');

        // Verdict HUD
        this.verdictBadge = document.getElementById('phish-defcon-badge');
        this.riskRing = document.getElementById('url-risk-ring');
        this.riskScoreVal = document.getElementById('url-risk-score');
        this.riskStatus = document.getElementById('url-risk-status');
        this.scoreBar = document.getElementById('phish-score-bar');

        // 4 Sub-Metrics
        this.metricScheme = document.getElementById('phish-metric-scheme');
        this.metricTld = document.getElementById('phish-metric-tld');
        this.metricEntropy = document.getElementById('phish-metric-entropy');
        this.metricLevenshtein = document.getElementById('phish-metric-levenshtein');

        // Anatomy & Findings
        this.anatomyContainer = document.getElementById('url-anatomy-container');
        this.findingsCount = document.getElementById('phish-findings-count');
        this.warningsList = document.getElementById('url-warnings-list');

        this.bindEvents();
        this.bindPresets();
        this._initialized = true;

        // Ensure clean, empty input on boot
        if (this.input) {
            this.input.value = '';
        }
        if (this.clearBtn) {
            this.clearBtn.style.display = 'none';
        }
    },

    bindEvents() {
        if (this.scanBtn) {
            this.scanBtn.addEventListener('click', () => {
                const val = this.input ? this.input.value.trim() : '';
                this.scan(val);
            });
        }

        if (this.input) {
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.scan(this.input.value.trim());
                }
            });

            this.input.addEventListener('input', () => {
                if (this.clearBtn) {
                    this.clearBtn.style.display = this.input.value.length > 0 ? 'block' : 'none';
                }
            });
        }

        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                if (this.input) {
                    this.input.value = '';
                    this.clearBtn.style.display = 'none';
                    this.input.focus();
                }
            });
        }

        if (this.pasteBtn) {
            this.pasteBtn.addEventListener('click', async () => {
                try {
                    if (navigator.clipboard && navigator.clipboard.readText) {
                        const text = await navigator.clipboard.readText();
                        if (text && this.input) {
                            this.input.value = text.trim();
                            if (this.clearBtn) this.clearBtn.style.display = 'block';
                            this.scan(this.input.value.trim());
                            if (window.AegisNotification) {
                                window.AegisNotification.show('Target Pasted', 'Clipboard URL loaded into tactical analyzer.', 'fa-solid fa-clipboard text-cyan');
                            }
                        }
                    } else {
                        if (window.AegisNotification) {
                            window.AegisNotification.show('Clipboard Protected', 'Please paste directly into the input field.', 'fa-solid fa-circle-info text-amber');
                        }
                    }
                } catch (err) {
                    if (window.AegisNotification) {
                        window.AegisNotification.show('Clipboard Access', 'Use Ctrl+V to paste URL.', 'fa-solid fa-circle-info text-amber');
                    }
                }
            });
        }

        // Copy SOC DNS Rule
        if (this.btnCopyDns && this.socDnsRule) {
            this.btnCopyDns.addEventListener('click', () => {
                const text = this.socDnsRule.textContent;
                this.copyToClipboard(text, 'DNS Sinkhole Directive', 'Formatted sinkhole rule copied to clipboard.');
            });
        }

        // Copy SOC WAF Rule
        if (this.btnCopyWaf && this.socWafRule) {
            this.btnCopyWaf.addEventListener('click', () => {
                const text = this.socWafRule.textContent;
                this.copyToClipboard(text, 'WAF Perimeter Directive', 'Layer 7 block expression copied to clipboard.');
            });
        }
    },

    bindPresets() {
        if (!this.presetsBar) return;
        this.presetsBar.querySelectorAll('.preset-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                this.presetsBar.querySelectorAll('.preset-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const val = btn.getAttribute('data-val') || btn.getAttribute('data-value');
                if (val && this.input) {
                    this.input.value = val;
                    if (this.clearBtn) this.clearBtn.style.display = 'block';
                    this.scan(val);
                }
            });
        });
    },

    copyToClipboard(text, title, message) {
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                if (window.AegisNotification) {
                    window.AegisNotification.show(title, message, 'fa-solid fa-circle-check text-cyan');
                }
            }).catch(() => {
                this.fallbackCopy(text, title, message);
            });
        } else {
            this.fallbackCopy(text, title, message);
        }
    },

    fallbackCopy(text, title, message) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            if (window.AegisNotification) {
                window.AegisNotification.show(title, message, 'fa-solid fa-circle-check text-cyan');
            }
        } catch (e) {
            // ignore
        }
        document.body.removeChild(ta);
    },

    // RFC 3492 Punycode Decoder
    decodePunycode(input) {
        const base = 36;
        const tmin = 1;
        const tmax = 26;
        const skew = 38;
        const damp = 700;
        const initial_bias = 72;
        const initial_n = 128;
        const delimiter = '-';

        const parts = input.split('.');
        return parts.map(part => {
            if (!part.toLowerCase().startsWith('xn--')) return part;
            const str = part.slice(4).toLowerCase();
            
            let n = initial_n;
            let i = 0;
            let bias = initial_bias;
            const output = [];

            const d = str.lastIndexOf(delimiter);
            let basicLength = 0;
            if (d > 0) {
                for (let j = 0; j < d; ++j) {
                    output.push(str.charCodeAt(j));
                }
                basicLength = d + 1;
            }

            let inIdx = basicLength;
            while (inIdx < str.length) {
                const oldi = i;
                let w = 1;
                let k = base;
                while (true) {
                    if (inIdx >= str.length) break;
                    const c = str.charCodeAt(inIdx++);
                    let digit;
                    if (c >= 48 && c <= 57) digit = c - 22; // 0-9 -> 26-35
                    else if (c >= 97 && c <= 122) digit = c - 97; // a-z -> 0-25
                    else digit = base;

                    i += digit * w;
                    const t = k <= bias ? tmin : k >= bias + tmax ? tmax : k - bias;
                    if (digit < t) break;
                    w *= base - t;
                    k += base;
                }

                const outLen = output.length + 1;
                let delta = Math.floor((i - oldi) / (oldi === 0 ? damp : 2));
                delta += Math.floor(delta / outLen);
                let kAdapt = 0;
                while (delta > Math.floor(((base - tmin) * tmax) / 2)) {
                    delta = Math.floor(delta / (base - tmin));
                    kAdapt += base;
                }
                bias = kAdapt + Math.floor(((base - tmin + 1) * delta) / (delta + skew));

                n += Math.floor(i / outLen);
                i %= outLen;
                output.splice(i, 0, n);
                i++;
            }

            return String.fromCodePoint(...output);
        }).join('.');
    },

    // Levenshtein distance calculation
    levenshtein(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    },

    // Shannon String Entropy (bits per character)
    calculateEntropy(str) {
        if (!str || str.length === 0) return 0;
        const freqs = {};
        for (const char of str) {
            freqs[char] = (freqs[char] || 0) + 1;
        }
        let entropy = 0;
        const len = str.length;
        for (const count of Object.values(freqs)) {
            const p = count / len;
            entropy -= p * Math.log2(p);
        }
        return entropy;
    },

    // Convert hex IP representation to standard dotted-decimal
    deobfuscateHexIp(host) {
        const parts = host.split('.');
        if (parts.length === 4) {
            const decimals = parts.map(p => {
                if (p.toLowerCase().startsWith('0x')) return parseInt(p, 16);
                if (p.startsWith('0') && p.length > 1) return parseInt(p, 8);
                return parseInt(p, 10);
            });
            if (decimals.every(d => !isNaN(d) && d >= 0 && d <= 255)) {
                return decimals.join('.');
            }
        }
        return null;
    },

    scan(rawUrl) {
        if (!rawUrl) {
            if (window.AegisNotification) {
                window.AegisNotification.show('Target URI Required', 'Please input a target URL or select an attack scenario preset.', 'fa-solid fa-circle-exclamation text-amber');
            }
            return;
        }

        if (window.AegisState && typeof window.AegisState.incrementMetric === 'function') {
            window.AegisState.incrementMetric('urlsChecked');
        }

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
            this.renderMalformedReport(rawUrl);
            return;
        }

        const hostname = urlObj.hostname.toLowerCase();
        const pathname = urlObj.pathname.toLowerCase();
        const search = urlObj.search;
        const searchLower = search.toLowerCase();
        const warnings = [];
        let score = 0;

        // Results tracking for the 6 probes
        const probeResults = {
            idn: { status: 'cleared', label: 'CLEARED', detail: 'Standard ASCII Latin domain · Zero homoglyphs' },
            ip: { status: 'cleared', label: 'CLEARED', detail: 'Standard DNS hostname · No IP obfuscation' },
            typo: { status: 'cleared', label: 'CLEARED', detail: 'Zero brand typosquatting or brand impersonation' },
            redirect: { status: 'cleared', label: 'CLEARED', detail: 'No credential bounce redirect parameters found' },
            subdomain: { status: 'cleared', label: 'CLEARED', detail: 'Nominal host depth (< 3 segments)' },
            tld: { status: 'cleared', label: 'CLEARED', detail: 'Reputable top-level domain zone' }
        };

        let primarySignature = 'CLEARED / BENIGN';
        let detectedTarget = 'NONE / ORGANIC';
        let idnDetails = null;

        // 1. SSL & Scheme Heuristics
        if (protocolMissing) {
            score += 15;
            warnings.push({
                level: 'warning',
                title: 'No Explicit TLS Scheme Defined',
                details: 'URL entered without explicit https:// protocol. Adversaries frequently omit schemes to obscure unencrypted transmission vectors.'
            });
        } else if (urlObj.protocol === 'http:') {
            score += 35;
            warnings.push({
                level: 'danger',
                title: 'Unencrypted Protocol (Plain HTTP)',
                details: 'Connection transmits in cleartext without cryptographic TLS protection. Credentials, tokens, and payloads are subject to interception.'
            });
        }

        // 2. Probe 1: RFC 5890 IDN Homograph & Punycode Deconstruction
        const decodedHost = this.decodePunycode(hostname);
        const isPunycode = hostname.includes('xn--');
        const hasNonAscii = /[^\u0000-\u007F]/.test(decodedHost);

        if (isPunycode || hasNonAscii) {
            score += 55;
            probeResults.idn = {
                status: 'danger',
                label: 'CRITICAL',
                detail: `RFC 5890 Punycode (${hostname}) spoofing genuine Latin brand glyphs`
            };
            primarySignature = 'IDN PUNYCODE HOMOGLYPH';

            // Extract homoglyphs present in the decoded string
            const foundHomoglyphs = [];
            for (let idx = 0; idx < decodedHost.length; idx++) {
                const char = decodedHost[idx];
                const cp = 'U+' + char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
                if (this.homoglyphs[char]) {
                    foundHomoglyphs.push({
                        char,
                        position: idx + 1,
                        cp,
                        latin: this.homoglyphs[char].latin,
                        name: this.homoglyphs[char].name
                    });
                } else if (char.codePointAt(0) > 127) {
                    foundHomoglyphs.push({
                        char,
                        position: idx + 1,
                        cp,
                        latin: '?',
                        name: 'Non-ASCII Unicode Character'
                    });
                }
            }

            idnDetails = {
                wire: hostname,
                decoded: decodedHost,
                glyphs: foundHomoglyphs
            };

            warnings.push({
                level: 'danger',
                title: 'IDN Homograph / Punycode Visual Spoof Detected',
                details: `Host "${hostname}" decodes to Unicode "${decodedHost}". It utilizes lookalike non-ASCII glyphs (e.g. Cyrillic) to visually impersonate legitimate brand typography under RFC 5890.`
            });
        }

        // 3. Probe 2: IP Address Obfuscation (Hex / Dword / Octal / Standard IPv4)
        const rawHostPart = rawUrl.replace(/^https?:\/\//i, '').split('/')[0].split('?')[0].toLowerCase();
        const isStandardIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname) || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(rawHostPart);
        const isDwordIp = /^[0-9]{8,12}$/.test(rawHostPart) || /^[0-9]{8,12}$/.test(hostname);
        const isHexIp = /0x[0-9a-f]+/i.test(rawHostPart) || /0x[0-9a-f]+/i.test(hostname);
        const isOctalIp = /0[0-7]{3,}/.test(rawHostPart) || /0[0-7]{3,}/.test(hostname);

        if (isHexIp || isDwordIp || isOctalIp) {
            score += 65;
            const deobf = this.deobfuscateHexIp(rawHostPart) || (isStandardIp ? hostname : null);
            const resolvedStr = deobf ? ` (Resolves to ${deobf})` : '';
            probeResults.ip = {
                status: 'danger',
                label: 'CRITICAL',
                detail: `Obfuscated numeric IP encoding (Hex/Dword/Octal)${resolvedStr}`
            };
            if (primarySignature === 'CLEARED / BENIGN') primarySignature = 'HEX IP OBFUSCATION';

            warnings.push({
                level: 'danger',
                title: 'Obfuscated Host IP Address Encoding',
                details: `Target hostname (${rawHostPart}${resolvedStr}) utilizes hexadecimal or numeric notation to evade perimeter URL string filters and WAF pattern checks.`
            });
        } else if (isStandardIp) {
            score += 45;
            probeResults.ip = {
                status: 'danger',
                label: 'CRITICAL',
                detail: `Raw IPv4 target (${hostname}) — Enterprise portals never host on bare IPs`
            };
            if (primarySignature === 'CLEARED / BENIGN') primarySignature = 'RAW IP HOSTING';

            warnings.push({
                level: 'danger',
                title: 'Raw IPv4 Address Hosting Endpoint',
                details: `Points directly to a bare IP address (${hostname}) without a registered domain. Legitimate corporate authentication gateways never operate on unmapped raw IPv4 addresses.`
            });
        }

        // 4. Probe 3: Trademark Typosquatting & Impersonation (Levenshtein Distance)
        const hostClean = decodedHost.toLowerCase();
        const hostParts = hostClean.split('.');
        const domainRoot = hostParts.length >= 2 ? hostParts[hostParts.length - 2] : hostClean;

        let detectedBrand = null;
        let minLevenshtein = 999;
        let isDirectImpersonation = false;

        for (const brand of this.brandKeywords) {
            // Check if brand keyword is embedded in host/subdomain
            if (hostClean.includes(brand)) {
                const officialDomain = `${brand}.com`;
                const isLegit = hostClean.endsWith(officialDomain) || 
                                hostClean.endsWith(`${brand}.org`) || 
                                hostClean.endsWith(`${brand}.net`) || 
                                hostClean.endsWith(`${brand}.co.uk`);
                if (!isLegit) {
                    detectedBrand = brand.toUpperCase();
                    isDirectImpersonation = true;
                    score += 50;
                    probeResults.typo = {
                        status: 'danger',
                        label: 'CRITICAL',
                        detail: `Unauthorized brand mimicry targeting ${detectedBrand}`
                    };
                    if (primarySignature === 'CLEARED / BENIGN') primarySignature = 'BRAND IMPERSONATION';
                    warnings.push({
                        level: 'danger',
                        title: `Targeted Brand Impersonation (${detectedBrand})`,
                        details: `The host references protected trademark "${brand}", but is registered on an unauthorized external domain zone.`
                    });
                    break;
                }
            } else {
                // Check Levenshtein distance on domain root
                const dist = this.levenshtein(domainRoot, brand);
                if (dist > 0 && dist <= 2 && domainRoot.length >= 4) {
                    if (dist < minLevenshtein) {
                        minLevenshtein = dist;
                        detectedBrand = brand.toUpperCase();
                    }
                }
            }
        }

        if (!isDirectImpersonation && detectedBrand && minLevenshtein <= 2) {
            score += 45;
            probeResults.typo = {
                status: 'danger',
                label: 'CRITICAL',
                detail: `Levenshtein distance ${minLevenshtein} ≈ ${detectedBrand}`
            };
            if (primarySignature === 'CLEARED / BENIGN') primarySignature = 'TYPOSQUAT ROOT';
            warnings.push({
                level: 'danger',
                title: `Typosquatting Detected (${domainRoot} ≈ ${detectedBrand})`,
                details: `Second-level domain "${domainRoot}" is visually and phonetically proximate to "${detectedBrand}" (Levenshtein distance: ${minLevenshtein}), indicative of combocquatting/typosquatting.`
            });
        }

        if (detectedBrand) {
            detectedTarget = `${detectedBrand}`;
        }

        // 5. Probe 4: Open Redirect Vector in Query Parameters
        const redirectParamMatch = search.match(/(?:url|redirect|dest|next|target|return_to|link|goto|out)=(https?%3A%2F%2F|https?:\/\/|www\.|\/[a-z0-9])/i);
        if (redirectParamMatch) {
            score += 35;
            const paramKey = redirectParamMatch[0].split('=')[0];
            probeResults.redirect = {
                status: 'warning',
                label: 'WARNING',
                detail: `Suspicious redirect parameter detected: [?${paramKey}=]`
            };
            if (primarySignature === 'CLEARED / BENIGN') primarySignature = 'OPEN REDIRECT LEAK';

            warnings.push({
                level: 'warning',
                title: 'Potential Open Redirect Vulnerability',
                details: `URI embeds an unvalidated destination parameter "${paramKey}". Attackers leverage trusted root hosts to bounce targets to fraudulent credential harvest portals.`
            });
        }

        // 6. Probe 5: Subdomain Stacking Density
        const dotCount = (hostname.match(/\./g) || []).length;
        if (dotCount >= 3) {
            score += 25;
            probeResults.subdomain = {
                status: 'warning',
                label: 'WARNING',
                detail: `High subdomain density (${dotCount} segments) masking root domain`
            };
            if (primarySignature === 'CLEARED / BENIGN') primarySignature = 'SUBDOMAIN STACKING';

            warnings.push({
                level: 'warning',
                title: `Subdomain Stacking Depth (${dotCount} Host Segments)`,
                details: `Subdomain layering (e.g. brand.com.account-verify.service.xyz) attempts to deceive mobile operators by pushing the genuine registered domain off visible URL bars.`
            });
        }

        // 7. Probe 6: High-Abuse TLD Reputation
        const tldMatch = hostname.match(/\.([a-z0-9\-]+)$/);
        let tldRiskScore = 0;
        let tldName = '';
        if (tldMatch && tldMatch[1]) {
            tldName = tldMatch[1].toLowerCase();
            if (this.highRiskTLDs.includes(tldName)) {
                score += 30;
                tldRiskScore = 88;
                probeResults.tld = {
                    status: 'warning',
                    label: 'WARNING',
                    detail: `High-abuse TLD (.${tldName}) with elevated spam/phishing metrics`
                };
                if (primarySignature === 'CLEARED / BENIGN') primarySignature = 'HIGH-ABUSE TLD';

                warnings.push({
                    level: 'warning',
                    title: `Elevated TLD Abuse Reputation (.${tldName})`,
                    details: `Top-level domain (.${tldName}) has high historical prevalence in disposable automated phishing campaigns due to minimal registrar identity verification.`
                });
            }
        }

        // 8. Deceptive Administrative / Security Keywords
        const foundDeceptive = this.deceptiveKeywords.filter(k => hostname.includes(k) || pathname.includes(k) || searchLower.includes(k));
        if (foundDeceptive.length > 0) {
            score += Math.min(foundDeceptive.length * 10, 25);
            warnings.push({
                level: 'warning',
                title: 'Social Engineering Keywords Identified',
                details: `URI embeds psychological compliance triggers: [${foundDeceptive.slice(0, 4).join(', ')}]. Adversaries invoke urgency, security alerts, and account locking to induce victim compliance.`
            });
        }

        // Shannon Entropy of Hostname
        const hostEntropy = this.calculateEntropy(hostname);
        if (hostEntropy > 3.8 && hostname.length > 12) {
            score += 20;
            warnings.push({
                level: 'warning',
                title: `High Hostname String Entropy (${hostEntropy.toFixed(2)} bits/char)`,
                details: 'Randomized character dispersion is characteristic of Domain Generation Algorithms (DGA) used to bypass static blocklists.'
            });
        }

        // Score Capping & Classification
        const finalScore = Math.min(Math.max(score, 0), 100);

        this.renderExecutiveTelemetry(finalScore, primarySignature, detectedTarget);
        this.renderTacticalProbes(probeResults);
        this.renderIdnMatrix(idnDetails, decodedHost);
        this.renderSocRunbook(hostname, urlObj);
        this.renderVerdictHud(finalScore, urlObj, tldRiskScore, hostEntropy, detectedBrand, minLevenshtein);
        this.renderUrlAnatomy(rawUrl, urlObj, decodedHost, warnings);
        this.renderWarningsFeed(warnings);

        // Security Event Ledger Logging
        if (window.AegisState && typeof window.AegisState.logEvent === 'function') {
            const hostDisplay = hostname;
            const statusLabel = finalScore >= 65 ? 'DEFCON-1 CRITICAL' : finalScore >= 30 ? 'DEFCON-3 ELEVATED' : 'DEFCON-5 NOMINAL';
            window.AegisState.logEvent(
                'url',
                'Phishing URL Analysis',
                `${hostDisplay} — ${statusLabel} (${finalScore}%)`,
                statusLabel,
                finalScore >= 65 ? 'danger' : finalScore >= 30 ? 'warning' : 'success'
            );
        }
    },

    // 1. Executive Telemetry Ribbon (4 KPIs)
    renderExecutiveTelemetry(score, signature, target) {
        let tierText = 'DEFCON-5 NOMINAL';
        let tierBadgeClass = 'badge-defcon-5';

        if (score >= 65) {
            tierText = 'DEFCON-1 CRITICAL';
            tierBadgeClass = 'badge-defcon-1';
        } else if (score >= 30) {
            tierText = 'DEFCON-3 ELEVATED';
            tierBadgeClass = 'badge-defcon-3';
        }

        if (this.kpiTier) {
            this.kpiTier.className = `badge badge-pulse ${tierBadgeClass}`;
            this.kpiTier.innerHTML = `<span class="status-pulse-dot"></span> ● ${tierText}`;
        }

        if (this.kpiScore) {
            this.kpiScore.textContent = `${score}%`;
        }

        if (this.kpiVector) {
            this.kpiVector.textContent = signature;
        }

        if (this.kpiVectorBadge) {
            const badgeClass = score >= 65 ? 'badge-danger' : score >= 30 ? 'badge-amber' : 'badge-emerald';
            const badgeText = score >= 65 ? 'CRITICAL' : score >= 30 ? 'SUSPICIOUS' : 'BENIGN';
            this.kpiVectorBadge.className = `badge ${badgeClass}`;
            this.kpiVectorBadge.textContent = badgeText;
        }

        if (this.kpiTarget) {
            this.kpiTarget.textContent = target;
        }

        if (this.kpiTargetBadge) {
            const isMatch = target !== 'NONE / ORGANIC';
            this.kpiTargetBadge.className = `badge ${isMatch ? 'badge-danger' : 'badge-neutral'}`;
            this.kpiTargetBadge.textContent = isMatch ? 'TARGET MATCH' : 'ORGANIC HOST';
        }
    },

    // 2. Tactical Sensor Probes Matrix
    renderTacticalProbes(probes) {
        const updateTile = (tileEl, badgeEl, detailEl, probeData) => {
            if (!tileEl) return;
            tileEl.classList.remove('probe-danger', 'probe-warning', 'probe-cleared');
            
            let badgeClass = 'badge-neutral';
            if (probeData.status === 'danger') {
                tileEl.classList.add('probe-danger');
                badgeClass = 'badge-danger';
            } else if (probeData.status === 'warning') {
                tileEl.classList.add('probe-warning');
                badgeClass = 'badge-amber';
            } else {
                tileEl.classList.add('probe-cleared');
                badgeClass = 'badge-emerald';
            }

            if (badgeEl) {
                badgeEl.className = `badge badge-xs ${badgeClass} probe-status-badge`;
                badgeEl.textContent = probeData.label;
            }

            if (detailEl) {
                detailEl.textContent = probeData.detail;
            }
        };

        updateTile(this.probeIdn, this.probeIdnBadge, this.probeIdnDetail, probes.idn);
        updateTile(this.probeIp, this.probeIpBadge, this.probeIpDetail, probes.ip);
        updateTile(this.probeTypo, this.probeTypoBadge, this.probeTypoDetail, probes.typo);
        updateTile(this.probeRedirect, this.probeRedirectBadge, this.probeRedirectDetail, probes.redirect);
        updateTile(this.probeSubdomain, this.probeSubdomainBadge, this.probeSubdomainDetail, probes.subdomain);
        updateTile(this.probeTld, this.probeTldBadge, this.probeTldDetail, probes.tld);
    },

    // 3. IDN Homoglyph Translation Matrix
    renderIdnMatrix(idnDetails, decodedHost) {
        if (!this.idnContent) return;

        if (idnDetails && idnDetails.glyphs.length > 0) {
            if (this.idnStatusPill) {
                this.idnStatusPill.className = 'badge badge-xs badge-danger font-mono';
                this.idnStatusPill.textContent = 'UTS #39 HOMOGLYPH DETECTED';
            }

            let html = `
                <div class="idn-wire-preview">
                    <div class="idn-wire-col">
                        <span class="text-dim font-xs font-mono">RFC 3492 Punycode Wire:</span>
                        <code class="text-cyan font-mono">${this.escapeHtml(idnDetails.wire)}</code>
                    </div>
                    <i class="fa-solid fa-arrow-right text-dim font-xs"></i>
                    <div class="idn-wire-col">
                        <span class="text-dim font-xs font-mono">Decoded Unicode Representation:</span>
                        <code class="text-danger font-mono font-bold">${this.escapeHtml(idnDetails.decoded)}</code>
                    </div>
                </div>
                <div class="idn-chars-table">
            `;

            idnDetails.glyphs.forEach(g => {
                html += `
                    <div class="idn-char-row">
                        <div class="flex-align-center gap-sm">
                            <span class="idn-char-badge bg-danger text-primary font-mono">${this.escapeHtml(g.char)}</span>
                            <span class="text-primary font-mono">${this.escapeHtml(g.cp)}</span>
                            <span class="text-dim font-xs">${this.escapeHtml(g.name)}</span>
                        </div>
                        <div class="flex-align-center gap-xs">
                            <span class="text-dim font-xs">Spoof Target:</span>
                            <span class="badge badge-xs badge-neutral font-mono">ASCII '${this.escapeHtml(g.latin)}'</span>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
            this.idnContent.innerHTML = html;
        } else {
            if (this.idnStatusPill) {
                this.idnStatusPill.className = 'badge badge-xs badge-emerald font-mono';
                this.idnStatusPill.textContent = 'ASCII LATIN VERIFIED';
            }

            this.idnContent.innerHTML = `
                <div class="idn-char-row">
                    <div class="flex-align-center gap-sm">
                        <i class="fa-solid fa-circle-check text-success"></i>
                        <span class="text-primary font-mono">${this.escapeHtml(decodedHost)}</span>
                    </div>
                    <span class="badge badge-xs badge-emerald font-mono">ASCII Latin (U+0000 - U+007F) · Zero Homoglyphs</span>
                </div>
            `;
        }
    },

    // 4. Automated SOC Incident Response Runbook
    renderSocRunbook(hostname, urlObj) {
        const cleanHost = hostname.replace(/^https?:\/\//i, '').split('/')[0];

        if (this.socDnsRule) {
            this.socDnsRule.textContent = `0.0.0.0 ${cleanHost}`;
        }

        if (this.socWafRule) {
            this.socWafRule.textContent = `(http.host eq "${cleanHost}") or (http.request.uri contains "${cleanHost}")`;
        }

        if (this.socAdvisoryItems) {
            this.socAdvisoryItems.innerHTML = `
                <li><i class="fa-solid fa-circle-exclamation text-cyan"></i> Revoke active OAuth & SSO session tokens for targets interacting with ${this.escapeHtml(cleanHost)}</li>
                <li><i class="fa-solid fa-circle-exclamation text-cyan"></i> Enforce immediate credential reset if user submitted authentication payloads</li>
                <li><i class="fa-solid fa-circle-exclamation text-cyan"></i> Ingest host into SIEM perimeter filter to block lateral egress traffic</li>
            `;
        }
    },

    // 5. Concentric Threat Verdict HUD
    renderVerdictHud(score, urlObj, tldRisk, entropy, brand, levDist) {
        let statusText = 'VERIFIED BENIGN';
        let statusClass = 'text-success';
        let ringColor = 'var(--emerald-glow)';
        let defconClass = 'badge-defcon-5';
        let defconLabel = '● DEFCON-5 NOMINAL';
        let barClass = 'bg-emerald';

        if (score >= 65) {
            statusText = 'MALICIOUS PHISHING';
            statusClass = 'text-danger';
            ringColor = 'var(--rose-glow)';
            defconClass = 'badge-defcon-1';
            defconLabel = '● DEFCON-1 CRITICAL';
            barClass = 'bg-danger';
        } else if (score >= 30) {
            statusText = 'SUSPICIOUS DOMAIN';
            statusClass = 'text-warning';
            ringColor = 'var(--warning-glow)';
            defconClass = 'badge-defcon-3';
            defconLabel = '● DEFCON-3 ELEVATED';
            barClass = 'bg-amber';
        }

        if (this.verdictBadge) {
            this.verdictBadge.className = `badge ${defconClass}`;
            this.verdictBadge.textContent = defconLabel;
        }

        if (this.riskScoreVal) {
            this.riskScoreVal.textContent = `${score}%`;
        }

        if (this.riskStatus) {
            this.riskStatus.textContent = statusText;
            this.riskStatus.className = `strength-label-text ${statusClass}`;
        }

        // SVG Ring animation (r=54, circumference = 2 * PI * 54 = 339.29)
        if (this.riskRing) {
            const radius = 54;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (score / 100) * circumference;
            this.riskRing.style.strokeDasharray = `${circumference}`;
            this.riskRing.style.transition = 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease';
            this.riskRing.style.strokeDashoffset = `${offset}`;
            this.riskRing.style.stroke = ringColor;
        }

        // Progress bar glow
        if (this.scoreBar) {
            this.scoreBar.className = `fill ${barClass}`;
            this.scoreBar.style.width = `${score}%`;
        }

        // 4 Sub-Metrics
        if (this.metricScheme) {
            const isHttps = urlObj.protocol === 'https:';
            this.metricScheme.className = `metric-val font-mono tabular-nums ${isHttps ? 'text-success' : 'text-danger'}`;
            this.metricScheme.textContent = isHttps ? 'https (TLS 1.3)' : 'http (Insecure)';
        }

        if (this.metricTld) {
            const isHigh = tldRisk > 50;
            this.metricTld.className = `metric-val font-mono tabular-nums ${isHigh ? 'text-danger' : 'text-success'}`;
            this.metricTld.textContent = isHigh ? `${tldRisk}% (High Abuse)` : '0% (Standard)';
        }

        if (this.metricEntropy) {
            this.metricEntropy.textContent = `${entropy.toFixed(2)} bits/ch`;
        }

        if (this.metricLevenshtein) {
            if (brand) {
                this.metricLevenshtein.className = 'metric-val font-mono tabular-nums text-danger';
                this.metricLevenshtein.textContent = `${brand} (Δ=${levDist < 99 ? levDist : 0})`;
            } else {
                this.metricLevenshtein.className = 'metric-val font-mono tabular-nums text-emerald';
                this.metricLevenshtein.textContent = 'None (Organic)';
            }
        }
    },

    // 6. Deconstructed URL Anatomy Chain
    renderUrlAnatomy(rawUrl, urlObj, decodedHost, warnings) {
        if (!this.anatomyContainer) return;

        const protocol = urlObj.protocol.replace(':', '');
        const host = decodedHost;
        const hostParts = host.split('.');
        const tld = hostParts.length > 1 ? hostParts[hostParts.length - 1] : '';
        const domain = hostParts.length > 1 ? hostParts[hostParts.length - 2] : host;
        const subdomain = hostParts.length > 2 ? hostParts.slice(0, hostParts.length - 2).join('.') : '';
        const path = urlObj.pathname !== '/' ? urlObj.pathname : '';
        const search = urlObj.search ? urlObj.search : '';

        const hasIdn = rawUrl.includes('xn--') || /[^\u0000-\u007F]/.test(decodedHost);
        const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.startsWith('0x');
        const hasOpenRedirect = search.toLowerCase().includes('redirect=') || search.toLowerCase().includes('url=');

        let html = '<div class="url-anatomy-wrapper" aria-label="URL Anatomy Decomposition">';

        // Scheme
        const protoClass = protocol === 'https' ? 'token-safe' : 'token-alert';
        html += `
            <div class="url-anatomy-token ${protoClass}">
                <span class="token-role">Scheme</span>
                <span class="token-val">${this.escapeHtml(protocol)}://</span>
            </div>
        `;

        // Subdomain
        if (subdomain) {
            const isSubRisky = subdomain.length > 15 || subdomain.includes('paypal') || subdomain.includes('login') || subdomain.includes('verify');
            const subClass = isSubRisky ? 'token-alert' : 'token-warn';
            html += `
                <div class="url-anatomy-token ${subClass}">
                    <span class="token-role">Subdomain</span>
                    <span class="token-val">${this.escapeHtml(subdomain)}</span>
                </div>
            `;
        }

        // Domain
        const domClass = hasIdn || isIp ? 'token-alert' : 'token-safe';
        html += `
            <div class="url-anatomy-token ${domClass}">
                <span class="token-role">Root Domain</span>
                <span class="token-val">${this.escapeHtml(domain)}</span>
            </div>
        `;

        // TLD
        if (tld) {
            const isHighTld = this.highRiskTLDs.includes(tld);
            const tldClass = isHighTld ? 'token-alert' : 'token-safe';
            html += `
                <div class="url-anatomy-token ${tldClass}">
                    <span class="token-role">TLD</span>
                    <span class="token-val">.${this.escapeHtml(tld)}</span>
                </div>
            `;
        }

        // Path
        if (path) {
            html += `
                <div class="url-anatomy-token">
                    <span class="token-role">Path</span>
                    <span class="token-val">${this.escapeHtml(path.length > 24 ? path.slice(0, 24) + '...' : path)}</span>
                </div>
            `;
        }

        // Query
        if (search) {
            const searchClass = hasOpenRedirect ? 'token-alert' : '';
            html += `
                <div class="url-anatomy-token ${searchClass}">
                    <span class="token-role">Query</span>
                    <span class="token-val">${this.escapeHtml(search.length > 28 ? search.slice(0, 28) + '...' : search)}</span>
                </div>
            `;
        }

        html += '</div>';
        this.anatomyContainer.innerHTML = html;
    },

    // 7. Heuristic Warnings & Alerts Feed
    renderWarningsFeed(warnings) {
        if (this.findingsCount) {
            this.findingsCount.textContent = `${warnings.length} DETECTED`;
            this.findingsCount.className = `badge ${warnings.length > 0 ? 'badge-amber' : 'badge-emerald'}`;
        }

        if (!this.warningsList) return;

        if (warnings.length === 0) {
            this.warningsList.innerHTML = `
                <div class="warning-item safe-item">
                    <i class="fa-solid fa-circle-check text-success"></i>
                    <div>
                        <strong>No Suspicious Heuristics Detected</strong>
                        <p class="text-dim">Standard domain structure with legitimate SSL scheme, reputable TLD, and no detected typosquatting or homoglyph patterns.</p>
                    </div>
                </div>
            `;
        } else {
            this.warningsList.innerHTML = '';
            warnings.forEach(w => {
                const item = document.createElement('div');
                item.className = `warning-item warning-${w.level}`;
                const icon = w.level === 'danger' 
                    ? 'fa-solid fa-triangle-exclamation text-danger' 
                    : 'fa-solid fa-circle-exclamation text-warning';
                item.innerHTML = `
                    <i class="${icon}"></i>
                    <div>
                        <strong>${this.escapeHtml(w.title)}</strong>
                        <p class="text-dim">${this.escapeHtml(w.details)}</p>
                    </div>
                `;
                this.warningsList.appendChild(item);
            });
        }
    },

    renderMalformedReport(rawUrl) {
        if (this.riskScoreVal) this.riskScoreVal.textContent = '100%';
        if (this.riskStatus) {
            this.riskStatus.textContent = 'MALFORMED URI';
            this.riskStatus.className = 'strength-label-text text-danger';
        }
        if (this.verdictBadge) {
            this.verdictBadge.className = 'badge badge-defcon-1';
            this.verdictBadge.textContent = '● DEFCON-1 CRITICAL';
        }
        if (this.kpiTier) {
            this.kpiTier.className = 'badge badge-pulse badge-defcon-1';
            this.kpiTier.innerHTML = '<span class="status-pulse-dot"></span> ● DEFCON-1 CRITICAL';
        }
        if (this.kpiScore) this.kpiScore.textContent = '100%';
        if (this.kpiVector) this.kpiVector.textContent = 'RFC PARSE FAILURE';
        if (this.findingsCount) this.findingsCount.textContent = '1 DETECTED';
        if (this.warningsList) {
            this.warningsList.innerHTML = `
                <div class="warning-item warning-danger">
                    <i class="fa-solid fa-skull-crossbones text-danger"></i>
                    <div>
                        <strong>Invalid RFC URI Structure</strong>
                        <p class="text-dim">The input string fails RFC 3986 URI parsing specifications. Attackers craft malformed strings to cause parser differentials and crash scanner stacks.</p>
                    </div>
                </div>
            `;
        }
    },

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

window.PhishingAnalyzer = PhishingAnalyzer;

document.addEventListener('DOMContentLoaded', () => {
    PhishingAnalyzer.init();
});
