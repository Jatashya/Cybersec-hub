/**
 * Aegis Cybersecurity Hub - Password Analyzer Module
 * Calculations for Shannon Entropy, simulated crack durations, checkpoint filters, and dynamic critiques.
 */

const PasswordAnalyzer = {
    input: null,
    toggleBtn: null,
    ratingLabel: null,
    strengthBar: null,
    entropyVal: null,
    crackTime: null,
    feedbackContainer: null,

    // Checkpoint Elements
    chkLen: null,
    chkUpper: null,
    chkLower: null,
    chkNum: null,
    chkSpec: null,

    // Common weak patterns database
    commonPatterns: [
        '123456', 'password', '123456789', '12345678', '12345', 'qwerty', 
        'password123', 'admin', 'letmein', 'welcome', 'login', 'security', 
        'iloveyou', 'football', 'monkey', 'master', 'shadow', 'trustnoone'
    ],

    // Track if current input session has already counted towards stats to avoid double counting
    isSessionTracked: false,

    init() {
        // Resolve DOM elements lazily
        this.input = document.getElementById('password-input');
        this.toggleBtn = document.getElementById('btn-toggle-pass');
        this.ratingLabel = document.getElementById('password-rating-label');
        this.strengthBar = document.getElementById('password-strength-bar');
        this.entropyVal = document.getElementById('password-entropy-val');
        this.crackTime = document.getElementById('password-crack-time');
        this.feedbackContainer = document.getElementById('password-feedback-container');

        this.chkLen = document.getElementById('chk-len');
        this.chkUpper = document.getElementById('chk-upper');
        this.chkLower = document.getElementById('chk-lower');
        this.chkNum = document.getElementById('chk-num');
        this.chkSpec = document.getElementById('chk-spec');

        if (!this.input) return;
        this.bindEvents();
    },

    bindEvents() {
        if (this.input) {
            this.input.addEventListener('input', () => {
                this.analyze(this.input.value);

                // Increment statistics once per session of typing (safe)
                if (this.input.value.length > 0 && !this.isSessionTracked) {
                    if (typeof AegisState !== 'undefined' && typeof AegisState.incrementMetric === 'function') {
                        try { AegisState.incrementMetric('passwordsChecked'); } catch (e) {}
                    } else {
                        try {
                            const k = 'aegis_passwords_checked';
                            const v = Number(localStorage.getItem(k)) || 0;
                            localStorage.setItem(k, String(v + 1));
                        } catch (e) {}
                    }
                    this.isSessionTracked = true;
                } else if (this.input.value.length === 0) {
                    this.isSessionTracked = false; // Reset when cleared
                }
            });
        }

        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => {
                this.toggleVisibility();
            });
        }
    },

    toggleVisibility() {
        if (!this.toggleBtn || !this.input) return;
        const icon = this.toggleBtn.querySelector('i');
        if (this.input.type === 'password') {
            this.input.type = 'text';
            if (icon) icon.className = 'fa-regular fa-eye-slash';
        } else {
            this.input.type = 'password';
            if (icon) icon.className = 'fa-regular fa-eye';
        }
    },

    analyze(pwd) {
        if (!pwd) {
            this.resetUI();
            return;
        }

        // 1. Evaluate Checkpoints
        const hasLength = pwd.length >= 12;
        const hasUpper = /[A-Z]/.test(pwd);
        const hasLower = /[a-z]/.test(pwd);
        const hasNum = /[0-9]/.test(pwd);
        const hasSpec = /[^A-Za-z0-9]/.test(pwd);

        this.updateCheckpoint(this.chkLen, hasLength);
        this.updateCheckpoint(this.chkUpper, hasUpper);
        this.updateCheckpoint(this.chkLower, hasLower);
        this.updateCheckpoint(this.chkNum, hasNum);
        this.updateCheckpoint(this.chkSpec, hasSpec);

        // 2. Calculate Pool Size and Entropy
        let poolSize = 0;
        if (hasLower) poolSize += 26;
        if (hasUpper) poolSize += 26;
        if (hasNum) poolSize += 10;
        if (hasSpec) poolSize += 33; // standard ASCII special characters pool size approx

        // If characters typed are outside these standard pools, fallback pool size
        if (poolSize === 0 && pwd.length > 0) poolSize = 256; 

        // Shannon Entropy: E = L * log2(R)
        const entropy = Math.round(pwd.length * Math.log2(poolSize));
        if (this.entropyVal) this.entropyVal.innerHTML = `${entropy} <span class="unit">bits</span>`;

        // 3. Compute Crack Time (from entropy to avoid huge pow on exotic inputs)
        const guessesPerSec = 10000000000;
        const secondsToCrack = Math.pow(2, entropy) / (2 * guessesPerSec);
        if (this.crackTime) this.crackTime.textContent = this.formatCrackTime(secondsToCrack);

        // 4. Determine Rating and Strength Bar Width
        let rating = "Weak";
        let barWidth = "15%";
        let barClass = "bg-danger";
        let ratingClass = "text-danger";

        // Scoring rules combining length, characters and entropy
        if (pwd.length < 6) {
            rating = "Extremely Vulnerable";
            barWidth = "10%";
            barClass = "bg-danger";
            ratingClass = "text-danger";
        } else if (entropy < 40) {
            rating = "Weak";
            barWidth = "25%";
            barClass = "bg-danger";
            ratingClass = "text-danger";
        } else if (entropy < 60) {
            rating = "Moderate";
            barWidth = "50%";
            barClass = "bg-warning";
            ratingClass = "text-warning";
        } else if (entropy < 80) {
            rating = "Strong";
            barWidth = "75%";
            barClass = "bg-cyan";
            ratingClass = "text-cyan";
            // Check for minor flaws
            if (this.commonPatterns.includes(pwd.toLowerCase())) {
                rating = "Compromised Phrase";
                barWidth = "30%";
                barClass = "bg-danger";
                ratingClass = "text-danger";
            }
        } else {
            rating = "Military Grade";
            barWidth = "100%";
            barClass = "bg-emerald";
            ratingClass = "text-success";
            
            // Check if common pattern overrides
            if (this.commonPatterns.includes(pwd.toLowerCase())) {
                rating = "Compromised Phrase";
                barWidth = "30%";
                barClass = "bg-danger";
                ratingClass = "text-danger";
            }
        }

        this.ratingLabel.textContent = rating;
        this.ratingLabel.className = `strength-label-text ${ratingClass}`;
        if (this.strengthBar) {
            this.strengthBar.style.width = barWidth;
            this.strengthBar.className = `fill ${barClass}`;
        }

        // 5. Generate Feedback Critiques
        this.generateFeedback(pwd, entropy, hasLength, hasUpper, hasLower, hasNum, hasSpec);
    },

    updateCheckpoint(element, checked) {
        if (!element) return;
        const icon = element.querySelector('i');
        if (checked) {
            element.classList.add('checked');
            if (icon) icon.className = 'fa-solid fa-circle-check text-success';
        } else {
            element.classList.remove('checked');
            if (icon) icon.className = 'fa-regular fa-circle-xmark text-danger';
        }
    },

    formatCrackTime(sec) {
        if (sec === Infinity || sec > 3.154e+22) return "eons (universe death)";
        if (sec > 3.154e+16) return "trillions of years";
        if (sec > 3.154e+7) {
            const yrs = Math.round(sec / 3.154e+7);
            return `${yrs.toLocaleString()} years`;
        }
        if (sec > 2.628e+6) {
            const mos = Math.round(sec / 2.628e+6);
            return `${mos} months`;
        }
        if (sec > 86400) {
            const days = Math.round(sec / 86400);
            return `${days} days`;
        }
        if (sec > 3600) {
            const hrs = Math.round(sec / 3600);
            return `${hrs} hours`;
        }
        if (sec > 60) {
            const mins = Math.round(sec / 60);
            return `${mins} minutes`;
        }
        if (sec > 1) {
            return `${Math.round(sec)} seconds`;
        }
        return "Instant";
    },

    generateFeedback(pwd, entropy, hasLength, hasUpper, hasLower, hasNum, hasSpec) {
        const feedback = [];
        const lowerPwd = pwd.toLowerCase();

        // Check 1: Dictionary check
        let isCommon = false;
        for (const pattern of this.commonPatterns) {
            if (lowerPwd.includes(pattern)) {
                isCommon = true;
                feedback.push({
                    type: 'warning',
                    text: `Contains dictionary match <strong>"${pattern}"</strong>. Attackers will crack this in milliseconds using pre-computed rainbow tables.`
                });
                break;
            }
        }

        // Check 2: Sequential characters
        if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(pwd) ||
            /012|123|234|345|456|567|678|789/.test(pwd)) {
            feedback.push({
                type: 'warning',
                text: 'Contains standard sequential alphabet or numeric sequences. Brute force dictionaries guess these sequences first.'
            });
        }

        // Check 3: Repeat characters
        if (/(.)\1\1/.test(pwd)) {
            feedback.push({
                type: 'warning',
                text: 'Detected repeated identical characters (e.g. "aaa"). This reduces structural complexity and entropy.'
            });
        }

        // Check 4: Keyboard rows
        if (/qwerty|asdf|zxcv|1q2w3e/.test(lowerPwd)) {
            feedback.push({
                type: 'warning',
                text: 'Found common keyboard rows/walks. These are highly guessable configurations.'
            });
        }

        // Check 5: Suggestion on missing parts
        if (!hasLength) {
            feedback.push({
                type: 'tip',
                text: 'Increase character length. Every added character increases entropy exponentially, multiplying guess times.'
            });
        }
        if (!hasUpper || !hasLower) {
            feedback.push({
                type: 'tip',
                text: 'Combine uppercase and lowercase letters. This increases size of pool attackers must scan.'
            });
        }
        if (!hasNum) {
            feedback.push({
                type: 'tip',
                text: 'Inject integers/numbers to create multi-character variations.'
            });
        }
        if (!hasSpec) {
            feedback.push({
                type: 'tip',
                text: 'Add custom symbols/punctuation (e.g., $, !, @, &). This introduces high complexity.'
            });
        }

        // Check 6: Check if excellent
        if (feedback.length === 0 && entropy >= 80) {
            feedback.push({
                type: 'success',
                text: '<span class="text-success"><i class="fa-solid fa-circle-check"></i> Cryptographically Sound!</span> Excellent length, diverse character sets, and high bits of entropy. This passcode is resistant to current offline supercomputing attacks.'
            });
        }

        // Render Feedback
        if (!this.feedbackContainer) return;
        this.feedbackContainer.innerHTML = '';
        if (feedback.length === 0) {
            this.feedbackContainer.innerHTML = `
                <div class="feedback-placeholder">
                    <i class="fa-solid fa-circle-check text-success"></i>
                    <p>Structural guidelines satisfied. Continue adding letters for higher entropy.</p>
                </div>
            `;
            return;
        }

        feedback.forEach(item => {
            const div = document.createElement('div');
            div.className = `feedback-item ${item.type}`;
            
            let iconClass = 'fa-solid fa-circle-exclamation';
            if (item.type === 'tip') iconClass = 'fa-solid fa-lightbulb';
            if (item.type === 'success') iconClass = 'fa-solid fa-circle-check';

            div.innerHTML = `
                <i class="${iconClass}"></i>
                <div>${item.text}</div>
            `;
            this.feedbackContainer.appendChild(div);
        });
    },

    resetUI() {
        if (this.ratingLabel) {
            this.ratingLabel.textContent = 'Empty';
            this.ratingLabel.className = 'strength-label-text text-danger';
        }
        if (this.strengthBar) {
            this.strengthBar.style.width = '0%';
            this.strengthBar.className = 'fill bg-danger';
        }
        if (this.entropyVal) this.entropyVal.innerHTML = `0 <span class="unit">bits</span>`;
        if (this.crackTime) this.crackTime.textContent = 'Instant';

        this.updateCheckpoint(this.chkLen, false);
        this.updateCheckpoint(this.chkUpper, false);
        this.updateCheckpoint(this.chkLower, false);
        this.updateCheckpoint(this.chkNum, false);
        this.updateCheckpoint(this.chkSpec, false);

        if (this.feedbackContainer) {
            this.feedbackContainer.innerHTML = `
                <div class="feedback-placeholder">
                    <i class="fa-solid fa-key"></i>
                    <p>Type a password to receive custom structural and architectural security improvements.</p>
                </div>
            `;
        }
    }
};

// Expose globally
window.PasswordAnalyzer = PasswordAnalyzer;

// Auto initialize on load
document.addEventListener('DOMContentLoaded', () => {
    PasswordAnalyzer.init();
});
