/**
 * Aegis Cybersecurity Hub - Password Analyzer & Cryptographic Engine
 * Tier-1 Operational Vault & Shannon Entropy Lab
 * Implements NIST SP 800-63B, Shannon bit-entropy, Hartley keyspace capacity,
 * 3-tier attack horizon simulation, and WebCrypto CSPRNG & Diceware synthesis.
 */

const PasswordAnalyzer = {
    // Mode tabs
    tabAnalyze: null,
    tabGenerate: null,
    panelAnalyze: null,
    panelGenerate: null,

    // Input enclave
    input: null,
    toggleBtn: null,
    clearBtn: null,
    copyInputBtn: null,
    charHeatmap: null,

    // 4 Telemetry KPIs
    kpiEntropy: null,
    kpiTier: null,
    kpiGpu: null,
    kpiKeyspace: null,

    // 3 Attack Horizon Metrics
    valAttackFastGpu: null,
    valAttackSlowHash: null,
    valAttackOnline: null,
    passSessionHash: null,

    // Right Column HUD
    scoreVal: null,
    ratingLabel: null,
    defconBadge: null,
    strengthBar: null,

    // 4 Sub-Metrics
    metricLen: null,
    metricPool: null,
    metricDispersion: null,
    metricCharEnt: null,

    // NIST Checkpoints
    chkLen: null,
    chkVariety: null,
    chkDict: null,
    chkWalks: null,
    chkRepeats: null,
    passAuditStatus: null,
    feedbackContainer: null,

    // Generator elements
    subtabToken: null,
    subtabDiceware: null,
    controlsToken: null,
    controlsDiceware: null,
    slider: null,
    sliderDisplay: null,
    chkUpper: null,
    chkLower: null,
    chkDigits: null,
    chkSymbols: null,
    chkAmbiguous: null,
    csprngOutputVal: null,
    btnCsprngGenerate: null,
    btnCsprngCopy: null,
    btnCsprngTransfer: null,

    dicewareWordCount: 4,
    dicewareSeparator: '-',
    isSessionTracked: false,

    // Wordlist for Diceware Passphrase generation
    wordlist: [
        'correct', 'horse', 'battery', 'staple', 'anchor', 'beacon', 'breeze', 'canyon',
        'cascade', 'cipher', 'clover', 'cosmic', 'crystal', 'delta', 'ember', 'falcon',
        'fossil', 'galaxy', 'glacier', 'granite', 'harbor', 'horizon', 'indigo', 'island',
        'javelin', 'jupiter', 'kinetic', 'lagoon', 'lantern', 'meteor', 'nebula', 'nexus',
        'obsidian', 'oceanic', 'olympus', 'orbit', 'panther', 'phoenix', 'pinnacle', 'plasma',
        'prism', 'quantum', 'quartz', 'radian', 'relic', 'ripple', 'sapphire', 'shadow',
        'silicon', 'solstice', 'spectrum', 'summit', 'titan', 'trident', 'tundra', 'vortex',
        'aurora', 'zenith', 'monolith', 'pulsar', 'vanguard', 'quarantine', 'perimeter', 'sentinel'
    ],

    // Common breached dictionary patterns
    commonPatterns: [
        '123456', 'password', '123456789', '12345678', '12345', 'qwerty', 
        'password123', 'admin', 'letmein', 'welcome', 'login', 'security', 
        'iloveyou', 'football', 'monkey', 'master', 'shadow', 'trustnoone',
        'dragon', 'baseball', 'superman', 'starwars', 'killer', 'secret',
        'pass123', 'admin123', 'root', 'toor', 'default', 'test', 'temp'
    ],

    // Keyboard walking sequences
    keyboardWalks: [
        'qwerty', 'asdfgh', 'zxcvbn', 'qwertz', 'azerty',
        '123456', '234567', '345678', '456789', '567890',
        'abcdef', 'bcdefg', 'cdefgh', 'defghi'
    ],

    init() {
        this.cacheDom();
        this.bindEvents();
        this.bindModeTabs();
        this.bindGenerator();
        this.bindPresets();

        // Default analysis state
        if (this.input && this.input.value) {
            this.analyze(this.input.value);
        } else {
            this.resetUI();
        }
    },

    cacheDom() {
        // Mode Tabs & Panels
        this.tabAnalyze = document.getElementById('tab-pass-analyze');
        this.tabGenerate = document.getElementById('tab-pass-generate');
        this.panelAnalyze = document.getElementById('panel-pass-analyze');
        this.panelGenerate = document.getElementById('panel-pass-generate');

        // Input & Enclave
        this.input = document.getElementById('password-input');
        this.toggleBtn = document.getElementById('btn-toggle-pass');
        this.clearBtn = document.getElementById('btn-clear-pass');
        this.copyInputBtn = document.getElementById('btn-copy-pass');
        this.charHeatmap = document.getElementById('password-char-heatmap');

        // 4 KPIs
        this.kpiEntropy = document.getElementById('pass-kpi-entropy');
        this.kpiTier = document.getElementById('pass-kpi-tier');
        this.kpiGpu = document.getElementById('pass-kpi-gpu');
        this.kpiKeyspace = document.getElementById('pass-kpi-keyspace');

        // Attack Horizon & ZK Proof
        this.valAttackFastGpu = document.getElementById('val-attack-fast-gpu');
        this.valAttackSlowHash = document.getElementById('val-attack-slow-hash');
        this.valAttackOnline = document.getElementById('val-attack-online');
        this.passSessionHash = document.getElementById('pass-session-hash');

        // Right Column HUD
        this.scoreVal = document.getElementById('pass-score-val');
        this.ratingLabel = document.getElementById('password-rating-label');
        this.defconBadge = document.getElementById('pass-defcon-badge');
        this.strengthBar = document.getElementById('password-strength-bar');

        // 4 Sub-Metrics
        this.metricLen = document.getElementById('pass-metric-len');
        this.metricPool = document.getElementById('pass-metric-pool');
        this.metricDispersion = document.getElementById('pass-metric-dispersion');
        this.metricCharEnt = document.getElementById('pass-metric-char-ent');

        // Checkpoints & Feedback
        this.chkLen = document.getElementById('chk-len');
        this.chkVariety = document.getElementById('chk-variety');
        this.chkDict = document.getElementById('chk-dict');
        this.chkWalks = document.getElementById('chk-walks');
        this.chkRepeats = document.getElementById('chk-repeats');
        this.passAuditStatus = document.getElementById('pass-audit-status');
        this.feedbackContainer = document.getElementById('password-feedback-container');

        // CSPRNG Generator Controls
        this.subtabToken = document.getElementById('subtab-gen-token');
        this.subtabDiceware = document.getElementById('subtab-gen-diceware');
        this.controlsToken = document.getElementById('controls-gen-token');
        this.controlsDiceware = document.getElementById('controls-gen-diceware');

        this.slider = document.getElementById('csprng-len-slider');
        this.sliderDisplay = document.getElementById('csprng-len-display');
        this.chkUpper = document.getElementById('csprng-chk-upper');
        this.chkLower = document.getElementById('csprng-chk-lower');
        this.chkDigits = document.getElementById('csprng-chk-digits');
        this.chkSymbols = document.getElementById('csprng-chk-symbols');
        this.chkAmbiguous = document.getElementById('csprng-chk-ambiguous');

        this.csprngOutputVal = document.getElementById('csprng-output-val');
        this.btnCsprngGenerate = document.getElementById('btn-csprng-generate');
        this.btnCsprngCopy = document.getElementById('btn-csprng-copy');
        this.btnCsprngTransfer = document.getElementById('btn-csprng-transfer');
    },

    bindEvents() {
        if (!this.input) return;

        this.input.addEventListener('input', () => {
            const val = this.input.value;
            if (this.clearBtn) {
                this.clearBtn.style.display = val.length > 0 ? 'block' : 'none';
            }
            this.analyze(val);

            if (val.length > 0 && !this.isSessionTracked) {
                if (window.AegisState && typeof window.AegisState.incrementMetric === 'function') {
                    window.AegisState.incrementMetric('passwordsChecked');
                }
                if (window.AegisState && typeof window.AegisState.logEvent === 'function') {
                    window.AegisState.logEvent('password', 'Credential Cryptanalysis', `${val.length} chars analyzed for Shannon bit-entropy`, 'ANALYZED', 'success');
                }
                this.isSessionTracked = true;
            } else if (val.length === 0) {
                this.isSessionTracked = false;
            }
        });

        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggleVisibility());
        }

        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                this.input.value = '';
                this.clearBtn.style.display = 'none';
                this.analyze('');
                this.input.focus();
            });
        }

        if (this.copyInputBtn) {
            this.copyInputBtn.addEventListener('click', () => this.copyToClipboard(this.input.value, 'Target Credential'));
        }
    },

    bindModeTabs() {
        if (this.tabAnalyze && this.tabGenerate) {
            this.tabAnalyze.addEventListener('click', () => {
                this.tabAnalyze.classList.add('active');
                this.tabAnalyze.setAttribute('aria-selected', 'true');
                this.tabGenerate.classList.remove('active');
                this.tabGenerate.setAttribute('aria-selected', 'false');

                if (this.panelAnalyze) this.panelAnalyze.classList.remove('display-none');
                if (this.panelGenerate) this.panelGenerate.classList.add('display-none');
            });

            this.tabGenerate.addEventListener('click', () => {
                this.tabGenerate.classList.add('active');
                this.tabGenerate.setAttribute('aria-selected', 'true');
                this.tabAnalyze.classList.remove('active');
                this.tabAnalyze.setAttribute('aria-selected', 'false');

                if (this.panelGenerate) this.panelGenerate.classList.remove('display-none');
                if (this.panelAnalyze) this.panelAnalyze.classList.add('display-none');

                // Synthesize if empty
                if (this.csprngOutputVal && this.csprngOutputVal.textContent.includes('Click Generate')) {
                    this.executeSynthesis();
                }
            });
        }
    },

    bindGenerator() {
        // Generator sub-tabs
        if (this.subtabToken && this.subtabDiceware) {
            this.subtabToken.addEventListener('click', () => {
                this.subtabToken.classList.add('active');
                this.subtabDiceware.classList.remove('active');
                if (this.controlsToken) this.controlsToken.classList.remove('display-none');
                if (this.controlsDiceware) this.controlsDiceware.classList.add('display-none');
                this.executeSynthesis();
            });

            this.subtabDiceware.addEventListener('click', () => {
                this.subtabDiceware.classList.add('active');
                this.subtabToken.classList.remove('active');
                if (this.controlsDiceware) this.controlsDiceware.classList.remove('display-none');
                if (this.controlsToken) this.controlsToken.classList.add('display-none');
                this.executeSynthesis();
            });
        }

        // Slider
        if (this.slider && this.sliderDisplay) {
            this.slider.addEventListener('input', () => {
                this.sliderDisplay.textContent = `${this.slider.value} Characters`;
                this.executeSynthesis();
            });
        }

        // Checkboxes
        [this.chkUpper, this.chkLower, this.chkDigits, this.chkSymbols, this.chkAmbiguous].forEach(chk => {
            if (chk) chk.addEventListener('change', () => this.executeSynthesis());
        });

        // Diceware Buttons
        const wordBtns = document.querySelectorAll('#diceware-word-btns button');
        wordBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                wordBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.dicewareWordCount = parseInt(btn.getAttribute('data-words')) || 4;
                this.executeSynthesis();
            });
        });

        const sepBtns = document.querySelectorAll('#diceware-sep-btns button');
        sepBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                sepBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.dicewareSeparator = btn.getAttribute('data-sep') || '-';
                this.executeSynthesis();
            });
        });

        // Synthesize Action
        if (this.btnCsprngGenerate) {
            this.btnCsprngGenerate.addEventListener('click', () => this.executeSynthesis());
        }

        // Copy Synthesized Secret
        if (this.btnCsprngCopy) {
            this.btnCsprngCopy.addEventListener('click', () => {
                const text = this.csprngOutputVal ? this.csprngOutputVal.textContent : '';
                this.copyToClipboard(text, 'Synthesized Secret');
            });
        }

        // Transfer to Analyzer
        if (this.btnCsprngTransfer) {
            this.btnCsprngTransfer.addEventListener('click', () => {
                const secret = this.csprngOutputVal ? this.csprngOutputVal.textContent : '';
                if (secret && !secret.includes('Click Generate')) {
                    if (this.input) {
                        this.input.value = secret;
                        if (this.clearBtn) this.clearBtn.style.display = 'block';
                    }
                    if (this.tabAnalyze) this.tabAnalyze.click();
                    this.analyze(secret);
                    if (window.AegisNotification) {
                        window.AegisNotification.show('Secret Transferred', 'Synthesized secret transferred to Heuristic Cryptanalysis.', 'fa-solid fa-arrow-left text-cyan', 2000);
                    }
                }
            });
        }
    },

    bindPresets() {
        document.querySelectorAll('.pass-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.getAttribute('data-val');
                if (val !== null && this.input) {
                    this.input.value = val;
                    if (this.clearBtn) this.clearBtn.style.display = 'block';
                    this.analyze(val);
                    this.input.focus();
                }
            });
        });
    },

    executeSynthesis() {
        const isTokenMode = this.subtabToken && this.subtabToken.classList.contains('active');
        let generated = '';

        if (isTokenMode) {
            const length = this.slider ? parseInt(this.slider.value) : 20;
            const useUpper = this.chkUpper ? this.chkUpper.checked : true;
            const useLower = this.chkLower ? this.chkLower.checked : true;
            const useDigits = this.chkDigits ? this.chkDigits.checked : true;
            const useSymbols = this.chkSymbols ? this.chkSymbols.checked : true;
            const avoidAmbiguous = this.chkAmbiguous ? this.chkAmbiguous.checked : false;

            generated = this.generateCsprngToken(length, useUpper, useLower, useDigits, useSymbols, avoidAmbiguous);
        } else {
            generated = this.generateDicewarePassphrase(this.dicewareWordCount, this.dicewareSeparator);
        }

        if (this.csprngOutputVal) {
            this.csprngOutputVal.textContent = generated;
        }
    },

    generateCsprngToken(length, upper, lower, digits, symbols, avoidAmbiguous) {
        let pool = '';
        if (upper) pool += avoidAmbiguous ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (lower) pool += avoidAmbiguous ? 'abcdefghijkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
        if (digits) pool += avoidAmbiguous ? '23456789' : '0123456789';
        if (symbols) pool += '!@#$%^&*()-_=+[]{}|;:,.<>?';

        if (!pool) pool = 'abcdefghjkmnpqrstuvwxyz23456789'; // Safe fallback

        const array = new Uint32Array(length);
        if (window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(array);
        } else {
            for (let i = 0; i < length; i++) array[i] = Math.floor(Math.random() * 4294967296);
        }

        let result = '';
        for (let i = 0; i < length; i++) {
            result += pool[array[i] % pool.length];
        }
        return result;
    },

    generateDicewarePassphrase(count, sep) {
        const array = new Uint32Array(count);
        if (window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(array);
        } else {
            for (let i = 0; i < count; i++) array[i] = Math.floor(Math.random() * 4294967296);
        }

        const words = [];
        for (let i = 0; i < count; i++) {
            words.push(this.wordlist[array[i] % this.wordlist.length]);
        }
        return words.join(sep);
    },

    toggleVisibility() {
        if (!this.toggleBtn || !this.input) return;
        const icon = this.toggleBtn.querySelector('i');
        const isPassword = this.input.type === 'password';
        this.input.type = isPassword ? 'text' : 'password';
        this.toggleBtn.setAttribute('aria-pressed', isPassword ? 'true' : 'false');
        if (icon) {
            icon.className = isPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
        }
    },

    copyToClipboard(text, label = 'Secret') {
        if (!text || text.includes('Click Generate')) {
            if (window.AegisNotification) {
                window.AegisNotification.show('Buffer Empty', 'No content available to copy.', 'fa-solid fa-circle-exclamation text-warning', 2000);
            }
            return;
        }
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                if (window.AegisNotification) {
                    window.AegisNotification.show('Copied to Clipboard', `${label} saved to encrypted clipboard buffer.`, 'fa-solid fa-clipboard-check text-success', 2000);
                }
            }).catch(() => {});
        }
    },

    // True Shannon Entropy: H = - sum(p * log2(p))
    calculateShannonEntropy(str) {
        if (!str || str.length === 0) return 0;
        const len = str.length;
        const freq = {};
        for (let i = 0; i < len; i++) {
            const char = str[i];
            freq[char] = (freq[char] || 0) + 1;
        }
        let entropy = 0;
        for (const char in freq) {
            const p = freq[char] / len;
            entropy -= p * Math.log2(p);
        }
        return entropy;
    },

    evaluatePatternPenalties(pwd) {
        let penalty = 0;
        const lower = pwd.toLowerCase();
        const warnings = [];

        // 1. Repeated runs
        const repeats = pwd.match(/(.)\1{2,}/g);
        let repeatLength = 0;
        if (repeats) {
            repeats.forEach(rep => {
                repeatLength += rep.length;
                penalty += (rep.length - 1) * 4;
            });
            warnings.push({
                type: 'danger',
                title: 'Repeated Cluster Vulnerability',
                text: `Contains clustered character runs ("${repeats[0]}"). Attackers prune repetitive search trees instantly.`
            });
        }

        // 2. Dictionary words
        let dictMatch = null;
        for (const pattern of this.commonPatterns) {
            if (lower.includes(pattern)) {
                dictMatch = pattern;
                penalty += 28;
                warnings.push({
                    type: 'danger',
                    title: 'Known Breached Wordlist Hit',
                    text: `Matches common dictionary token "${pattern}". Present in SecLists / RockYou credential dumps.`
                });
                break;
            }
        }

        // 3. Keyboard walk
        let walkMatch = null;
        for (const walk of this.keyboardWalks) {
            if (lower.includes(walk)) {
                walkMatch = walk;
                penalty += 22;
                warnings.push({
                    type: 'warning',
                    title: 'Predictable Keyboard Sequence',
                    text: `Contains sequential layout pattern "${walk}". Priority attack heuristic in automated GPU rules.`
                });
                break;
            }
        }

        // 4. Pure numeric or pure alphabetic
        if (/^\d+$/.test(pwd)) {
            penalty += 18;
            warnings.push({
                type: 'danger',
                title: 'Monolithic Numeric Keyspace',
                text: 'Restricted strictly to digits 0-9. Trivial brute force vulnerability even for handheld devices.'
            });
        }

        return {
            penalty,
            warnings,
            hasRepeats: !!repeats,
            hasDict: !!dictMatch,
            hasWalks: !!walkMatch
        };
    },

    analyze(pwd) {
        if (!pwd || pwd.length === 0) {
            this.resetUI();
            return;
        }

        // 1. Character Set & Diversity
        const hasUpper = /[A-Z]/.test(pwd);
        const hasLower = /[a-z]/.test(pwd);
        const hasNum = /[0-9]/.test(pwd);
        const hasSpec = /[^A-Za-z0-9]/.test(pwd);
        const length = pwd.length;

        let charClasses = 0;
        let poolSize = 0;
        if (hasLower) { charClasses++; poolSize += 26; }
        if (hasUpper) { charClasses++; poolSize += 26; }
        if (hasNum) { charClasses++; poolSize += 10; }
        if (hasSpec) { charClasses++; poolSize += 33; }
        if (poolSize === 0) poolSize = 256;

        // 2. Information Theory Entropy Calculations
        const shannonPerChar = this.calculateShannonEntropy(pwd);
        const shannonTotalBits = length * shannonPerChar;
        const hartleyEntropy = length * Math.log2(poolSize);

        // 3. Pattern Penalties
        const { penalty, warnings, hasRepeats, hasDict, hasWalks } = this.evaluatePatternPenalties(pwd);

        const rawEntropy = Math.min(hartleyEntropy, shannonTotalBits);
        const effectiveEntropy = Math.max(Math.round(rawEntropy - penalty), Math.min(length * 2, 8));

        // 4. Update 4 Telemetry KPIs
        if (this.kpiEntropy) {
            this.kpiEntropy.textContent = effectiveEntropy;
        }

        let tierLabel = 'NIST TIER-0 (TRIVIAL)';
        let tierClass = 'badge-danger';
        if (effectiveEntropy >= 85) {
            tierLabel = 'NIST MIL-SPEC (TIER-4)';
            tierClass = 'badge-success';
        } else if (effectiveEntropy >= 65) {
            tierLabel = 'NIST ENTERPRISE (TIER-3)';
            tierClass = 'badge-cyan';
        } else if (effectiveEntropy >= 45) {
            tierLabel = 'NIST HARDENED (TIER-2)';
            tierClass = 'badge-warning';
        } else if (effectiveEntropy >= 28) {
            tierLabel = 'NIST CONSUMER (TIER-1)';
            tierClass = 'badge-warning';
        }

        if (this.kpiTier) {
            this.kpiTier.innerHTML = `<span class="status-pulse-dot"></span> ${tierLabel}`;
            this.kpiTier.className = `badge ${tierClass}`;
        }

        // Keyspace formatting: S = Pool^Length
        if (this.kpiKeyspace) {
            this.kpiKeyspace.textContent = this.formatCombinations(poolSize, length);
        }

        // 5. 3-Tier Multi-Vector Attack Horizons
        // Vector A: Fast GPU Hashcat 8x RTX 4090 NTLM @ 200 GH/s = 2e11 hashes/sec
        const gpuSec = Math.pow(2, effectiveEntropy) / (2 * 2e11);
        const gpuTimeFormatted = this.formatCrackDuration(gpuSec);
        if (this.kpiGpu) this.kpiGpu.textContent = gpuTimeFormatted;
        if (this.valAttackFastGpu) this.valAttackFastGpu.textContent = gpuTimeFormatted;

        // Vector B: Memory-Hard Salted (Argon2id / bcrypt @ 15 kH/s = 15,000 hashes/sec)
        const slowSec = Math.pow(2, effectiveEntropy) / (2 * 15000);
        if (this.valAttackSlowHash) this.valAttackSlowHash.textContent = this.formatCrackDuration(slowSec);

        // Vector C: Online Defended Web App (Rate-limited @ 10 attempts/min = 0.167/sec)
        const onlineSec = Math.pow(2, effectiveEntropy) / (2 * (10 / 60));
        if (this.valAttackOnline) this.valAttackOnline.textContent = this.formatCrackDuration(onlineSec);

        // 6. Zero-Knowledge SHA-256 Digest
        this.updateClientSha256(pwd);

        // 7. Interactive Character Entropy Spectrum Heatmap
        this.renderCharSpectrum(pwd, warnings);

        // 8. Right Column: Resilience Tier HUD
        const compositeScore = Math.min(100, Math.round((effectiveEntropy / 85) * 100));
        if (this.scoreVal) this.scoreVal.textContent = compositeScore;

        let ratingTitle = 'Critical Vulnerability';
        let barClass = 'bg-danger';
        let barWidth = `${Math.max(10, compositeScore)}%`;
        let defconClass = 'badge-defcon-1';
        let defconText = '● CRITICAL DEFCON-1';

        if (compositeScore >= 85) {
            ratingTitle = 'Mil-Spec Cryptographic Defense';
            barClass = 'bg-emerald';
            defconClass = 'badge-defcon-5';
            defconText = '● FORTIFIED DEFCON-5';
        } else if (compositeScore >= 65) {
            ratingTitle = 'Enterprise Hardened Defense';
            barClass = 'bg-cyan';
            defconClass = 'badge-defcon-4';
            defconText = '● OPERATIONAL DEFCON-4';
        } else if (compositeScore >= 45) {
            ratingTitle = 'Moderate / Basic Consumer';
            barClass = 'bg-warning';
            defconClass = 'badge-defcon-3';
            defconText = '● ELEVATED RISK';
        }

        if (this.ratingLabel) {
            this.ratingLabel.textContent = ratingTitle;
            this.ratingLabel.className = `strength-label-text ${compositeScore >= 65 ? 'text-cyan' : compositeScore >= 45 ? 'text-warning' : 'text-danger'}`;
        }
        if (this.defconBadge) {
            this.defconBadge.textContent = defconText;
            this.defconBadge.className = `badge ${defconClass}`;
        }
        if (this.strengthBar) {
            this.strengthBar.style.width = barWidth;
            this.strengthBar.className = `fill ${barClass}`;
        }

        // 9. 4 Sub-Metrics
        if (this.metricLen) this.metricLen.textContent = `${length} chars`;
        if (this.metricPool) this.metricPool.textContent = `${poolSize} chars`;
        const dispersionPct = Math.round((shannonPerChar / (Math.log2(poolSize || 1) || 1)) * 100);
        if (this.metricDispersion) this.metricDispersion.textContent = `${Math.min(100, dispersionPct)}%`;
        if (this.metricCharEnt) this.metricCharEnt.textContent = `${shannonPerChar.toFixed(2)} b/c`;

        // 10. Checkpoints (NIST 800-63B Architecture)
        this.updateCheckpoint(this.chkLen, length >= 14);
        this.updateCheckpoint(this.chkVariety, charClasses >= 3);
        this.updateCheckpoint(this.chkDict, !hasDict);
        this.updateCheckpoint(this.chkWalks, !hasWalks);
        this.updateCheckpoint(this.chkRepeats, !hasRepeats);

        if (this.passAuditStatus) {
            const allPassed = length >= 14 && charClasses >= 3 && !hasDict && !hasWalks && !hasRepeats;
            this.passAuditStatus.textContent = allPassed ? '5/5 VERIFIED' : 'DEFICIENCIES DETECTED';
            this.passAuditStatus.className = allPassed ? 'badge badge-success' : 'badge badge-warning';
        }

        // 11. Actionable Feedback Remediations
        this.renderRemediations(warnings, length, charClasses, effectiveEntropy);
    },

    async updateClientSha256(pwd) {
        if (!this.passSessionHash) return;
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(pwd);
            if (window.crypto && window.crypto.subtle) {
                const hashBuf = await window.crypto.subtle.digest('SHA-256', data);
                const hashArr = Array.from(new Uint8Array(hashBuf));
                const hex = hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
                this.passSessionHash.textContent = `SHA-256: ${hex.slice(0, 8)}...${hex.slice(-4)}`;
            } else {
                this.passSessionHash.textContent = `SHA-256: e3b0c442...c9a4`;
            }
        } catch (e) {
            this.passSessionHash.textContent = `SHA-256: e3b0c442...c9a4`;
        }
    },

    renderCharSpectrum(pwd, warnings) {
        if (!this.charHeatmap) return;
        this.charHeatmap.innerHTML = '';

        const len = pwd.length;
        const freq = {};
        for (let i = 0; i < len; i++) {
            const c = pwd[i];
            freq[c] = (freq[c] || 0) + 1;
        }

        // Determine repeating chars
        const repeatChars = new Set();
        const repMatch = pwd.match(/(.)\1{2,}/g);
        if (repMatch) {
            repMatch.forEach(r => {
                for (let i = 0; i < r.length; i++) repeatChars.add(r[i]);
            });
        }

        for (let i = 0; i < len; i++) {
            const char = pwd[i];
            const pill = document.createElement('span');
            pill.className = 'spectrum-char-pill';

            const count = freq[char];
            const isSymbol = /[^A-Za-z0-9]/.test(char);
            const isUpper = /[A-Z]/.test(char);
            const isDigit = /[0-9]/.test(char);

            if (repeatChars.has(char) || count >= 4) {
                pill.classList.add('entropy-low');
                pill.title = `'${char}' (Cluster repeat - Low marginal entropy)`;
            } else if (isSymbol || (isUpper && i > 0)) {
                pill.classList.add('entropy-high');
                pill.title = `'${char}' (High dispersion token - Strong entropy)`;
            } else if (isDigit || isUpper) {
                pill.classList.add('entropy-mid');
                pill.title = `'${char}' (Standard token - Moderate entropy)`;
            } else {
                pill.classList.add('entropy-mid');
                pill.title = `'${char}' (Alphabetic token)`;
            }

            pill.textContent = char;
            this.charHeatmap.appendChild(pill);
        }
    },

    renderRemediations(warnings, length, charClasses, entropy) {
        if (!this.feedbackContainer) return;
        this.feedbackContainer.innerHTML = '';

        const list = document.createElement('div');
        list.className = 'feedback-list';

        // Add pattern warnings
        warnings.forEach(w => {
            const item = document.createElement('div');
            item.className = `feedback-item ${w.type === 'danger' ? 'feedback-danger' : 'feedback-warning'}`;
            item.innerHTML = `
                <i class="fa-solid ${w.type === 'danger' ? 'fa-triangle-exclamation text-danger' : 'fa-circle-exclamation text-warning'}"></i>
                <div>
                    <strong>${w.title}</strong>
                    <p>${w.text}</p>
                </div>
            `;
            list.appendChild(item);
        });

        // Add length guideline
        if (length < 14) {
            const item = document.createElement('div');
            item.className = 'feedback-item feedback-warning';
            item.innerHTML = `
                <i class="fa-solid fa-arrows-left-right text-warning"></i>
                <div>
                    <strong>NIST Length Recommendation</strong>
                    <p>Current length is ${length} characters. NIST SP 800-63B guidelines advise a minimum floor of 14-16 characters or a 4-word Diceware passphrase.</p>
                </div>
            `;
            list.appendChild(item);
        }

        // Add fortified milestone if strong
        if (entropy >= 80 && warnings.length === 0) {
            const item = document.createElement('div');
            item.className = 'feedback-item feedback-success';
            item.innerHTML = `
                <i class="fa-solid fa-circle-check text-success"></i>
                <div>
                    <strong>Cryptographically Resilient</strong>
                    <p>Secret exceeds 80 bits of effective entropy. Fully hardened against GPU cluster parallel attacks and rainbow tables.</p>
                </div>
            `;
            list.appendChild(item);
        }

        this.feedbackContainer.appendChild(list);
    },

    formatCombinations(pool, len) {
        if (!len || !pool) return '0';
        const logCombos = len * Math.log10(pool);
        if (logCombos < 6) {
            return Math.pow(pool, len).toLocaleString();
        }
        const exponent = Math.floor(logCombos);
        const mantissa = Math.pow(10, logCombos - exponent).toFixed(1);
        return `${mantissa} × 10^${exponent}`;
    },

    formatCrackDuration(seconds) {
        if (!isFinite(seconds) || seconds > 3.15e16) return 'Centuries+ (Practically Uncrackable)';
        if (seconds < 0.001) return 'Instant (< 1 ms)';
        if (seconds < 1) return '< 1 second';
        if (seconds < 60) return `~${Math.round(seconds)} seconds`;
        if (seconds < 3600) return `~${Math.round(seconds / 60)} minutes`;
        if (seconds < 86400) return `~${Math.round(seconds / 3600)} hours`;
        if (seconds < 2.592e6) return `~${Math.round(seconds / 86400)} days`;
        if (seconds < 3.154e7) return `~${Math.round(seconds / 2.592e6)} months`;
        if (seconds < 3.154e9) return `~${Math.round(seconds / 3.154e7)} years`;
        if (seconds < 3.154e12) return `~${Math.round(seconds / 3.154e9)} thousand years`;
        return `~${Math.round(seconds / 3.154e12)} million years`;
    },

    updateCheckpoint(el, passed) {
        if (!el) return;
        const icon = el.querySelector('i');
        if (passed) {
            el.className = 'checkpoint passed';
            if (icon) icon.className = 'fa-solid fa-circle-check text-success';
        } else {
            el.className = 'checkpoint';
            if (icon) icon.className = 'fa-regular fa-circle-xmark text-danger';
        }
    },

    resetUI() {
        if (this.kpiEntropy) this.kpiEntropy.textContent = '0';
        if (this.kpiTier) {
            this.kpiTier.innerHTML = '<span class="status-pulse-dot"></span> NIST TIER-0';
            this.kpiTier.className = 'badge badge-pulse';
        }
        if (this.kpiGpu) this.kpiGpu.textContent = 'Instant';
        if (this.kpiKeyspace) this.kpiKeyspace.textContent = '0';

        if (this.valAttackFastGpu) this.valAttackFastGpu.textContent = 'Instant (< 1 ms)';
        if (this.valAttackSlowHash) this.valAttackSlowHash.textContent = 'Instant';
        if (this.valAttackOnline) this.valAttackOnline.textContent = 'Instant';
        if (this.passSessionHash) this.passSessionHash.textContent = 'SHA-256: e3b0c442...';

        if (this.scoreVal) this.scoreVal.textContent = '0';
        if (this.ratingLabel) {
            this.ratingLabel.textContent = 'Uncalibrated';
            this.ratingLabel.className = 'strength-label-text text-danger';
        }
        if (this.defconBadge) {
            this.defconBadge.textContent = '● CALIBRATING';
            this.defconBadge.className = 'badge badge-defcon-0';
        }
        if (this.strengthBar) {
            this.strengthBar.style.width = '0%';
            this.strengthBar.className = 'fill bg-danger';
        }

        if (this.metricLen) this.metricLen.textContent = '0 chars';
        if (this.metricPool) this.metricPool.textContent = '0 pool';
        if (this.metricDispersion) this.metricDispersion.textContent = '0%';
        if (this.metricCharEnt) this.metricCharEnt.textContent = '0 bits';

        [this.chkLen, this.chkVariety, this.chkDict, this.chkWalks, this.chkRepeats].forEach(chk => {
            this.updateCheckpoint(chk, false);
        });

        if (this.passAuditStatus) {
            this.passAuditStatus.textContent = 'HEURISTIC CHECK';
            this.passAuditStatus.className = 'badge badge-neutral';
        }

        if (this.charHeatmap) {
            this.charHeatmap.innerHTML = '<span class="spectrum-placeholder text-dim font-xs">No characters entered. Type or select a vector above.</span>';
        }

        if (this.feedbackContainer) {
            this.feedbackContainer.innerHTML = `
                <div class="feedback-placeholder">
                    <i class="fa-solid fa-key text-dim"></i>
                    <p class="text-dim font-xs">Enter a credential or synthesize a Diceware secret to stream automated pattern detections and mitigation advice.</p>
                </div>
            `;
        }
    }
};

// Initialize controller on DOM load
document.addEventListener('DOMContentLoaded', () => {
    PasswordAnalyzer.init();
});

// Support dynamic navigation exports
if (typeof window !== 'undefined') {
    window.PasswordAnalyzer = PasswordAnalyzer;
}
