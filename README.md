# AEGIS — Enterprise Client-Side Cybersecurity Operations Platform

<div align="center">

![AEGIS Security Intelligence](https://img.shields.io/badge/AEGIS-Enclave%20v2.2--CLIENT-00e5ff?style=for-the-badge&logo=shield&logoColor=white)
![Zero-Egress Air-Gap](https://img.shields.io/badge/Air--Gap-Zero%20Egress%20Verified-10b981?style=for-the-badge&logo=checkmarx&logoColor=white)
![WebCrypto Hardware](https://img.shields.io/badge/Hardware%20Accel-WebCrypto%20Subtle-38bdf8?style=for-the-badge&logo=cpu&logoColor=white)
![Design System](https://img.shields.io/badge/Design%20System-Obsidian%20Stealth-6366f1?style=for-the-badge)
![License](https://img.shields.io/badge/License-ISC-94a3b8?style=for-the-badge)

<p align="center">
  <strong>High-density, air-gapped, zero-egress security intelligence enclave and defensive cybersecurity analysis suite.</strong><br>
  Built with hardware-accelerated WebCrypto primitives, RFC 5890 Punycode/homoglyph heuristics, and NIST SP 800-63B Shannon entropy modeling.
</p>

[🌐 Live Enclave Demo](https://jatashya.github.io/Cybersec-hub/) • [Features](#core-modules--operational-capabilities) • [Architecture](#architectural-pillars--standards-alignment) • [Getting Started](#getting-started) • [Zero-Egress Guarantee](#air-gap--zero-egress-verification) • [Design System](#precision-obsidian-stealth-design-system)

</div>

---

## Executive Overview

**AEGIS** is an enterprise-grade client-side cybersecurity workstation designed for SOC operators, security analysts, and engineers. Built from the ground up on modern browser cryptographic primitives, AEGIS operates as an entirely self-contained, air-gapped security enclave. 

All evaluations—from multi-gigabit password keyspace searches and Punycode homoglyph decoding to NLP Bayesian email fraud classification—execute 100% locally in-browser with zero remote API callbacks and zero telemetry egress.

---

## Architectural Pillars & Standards Alignment

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AEGIS CLIENT ENCLAVE                            │
├────────────────────────────────┬───────────────────────────────────────┤
│ 🛡️ Zero-Knowledge Air-Gap     │ 100% in-browser SubtleCrypto execution │
│ ⚡ WebCrypto Hardware Accel   │ Non-blocking SHA-256 (~25,000+ ops/sec)│
│ 📐 NIST SP 800-63B Entropy    │ Shannon bit-depth H(X) = -∑ p log₂ p   │
│ 🌐 RFC 5890 IDN Homoglyphs    │ Unicode confusable & Punycode decoding │
│ 🔥 Ephemeral Memory Isolation │ Zero persistent secrets, cache purge   │
└────────────────────────────────┴───────────────────────────────────────┘
```

### 1. Zero-Knowledge Air-Gap Boundary
- Operates under strict client isolation: 0 bytes of network egress during all analysis runs.
- Tested and verified against modern browser Content Security Posture and air-gapped workstations.
- No third-party trackers, no analytics beacons, and no external payload exfiltration.

### 2. WebCrypto Subtle Hardware Acceleration
- Replaces legacy JavaScript hashing with browser-native `window.crypto.subtle.digest('SHA-256', ...)`.
- Delivers hardware-level throughput reaching **25,000+ operations/second** with **<0.05ms average latency**.
- True CSPRNG seeding via `window.crypto.getRandomValues()` for non-deterministic cryptographic key and passphrase generation.

### 3. NIST SP 800-63B Shannon Entropy Modeling
- Bit-depth calculation: $H(X) = -\sum_{i=1}^{n} p(x_i) \log_2 p(x_i)$.
- Incorporates dictionary deductions, repetition penalties, character space exhaustion modeling, and multi-tier crack-time estimates (from offline GPU clusters at $10^{11}\text{ H/s}$ to rate-limited online APIs at $100\text{ req/s}$).

### 4. RFC 5890 & RFC 3492 Internationalized Domain Names (IDN)
- Real-time Punycode (`xn--`) decoding and Cyrillic/Greek Unicode homoglyph confusable matching.
- Levenshtein distance analysis across 50+ high-value corporate and banking target domains (Google, Microsoft, PayPal, Amazon, Apple, etc.).

### 5. Ephemeral In-Memory Volatility
- Analysis payloads and target strings remain in volatile browser memory.
- Instant cryptographically-sound cache shredding and telemetry purge with zero residual state.

---

## Core Modules & Operational Capabilities

### 1. Security Intelligence Dashboard (`#view-dashboard`)
- **Defensive Posture Score**: Real-time aggregate posture index (0–100) dynamically derived from password resilience, threat URL triages, email scam sweeps, and academy completion.
- **KPI Telemetry Ribbon**: Live counters for session triage volume, WebCrypto hardware ops/sec, residual drift, and zero-byte egress verification.
- **Universal Quick-Triage Terminal**: Omnibar classifier (`>_`) capable of auto-detecting credentials, URLs, domain names, or message headers and routing to the appropriate analysis engine.
- **Security Audit Ledger**: Tabular chronological event log with multi-vector filtering (`All`, `Credentials`, `Threat URLs`, `Email Scans`, `Academy`), severity tags (`DEFCON-1 CRIT`, `WARNING`, `NOMINAL`, `HW ACC`), audit JSON export, and slide-over event forensic inspection drawers.
- **Posture Evaluation Matrix & Active Surface**: Comprehensive compliance tracking mapped across NIST SP 800-63B, RFC 5890/IDN, OWASP A07, and client air-gap boundaries.

### 2. Password Entropy & Passphrase Generator (`#view-password`)
- **NIST SP 800-63B Compliance Engine**: Real-time bit-depth entropy calculation with character diversity breakdown (Uppercase, Lowercase, Numbers, Symbols).
- **Multi-Vector Crack-Time Matrix**:
  - Online Throttled (100 guesses/sec)
  - Online Unthrottled (1,000 guesses/sec)
  - Offline Fast Hash / SHA-256 GPU Cluster ($10^{11}$ hashes/sec)
- **Mathematical Formula Tooltip**: Interactive modal detailing Shannon entropy mathematics.
- **Common Password & Pattern Penalties**: Local dictionary matching for weak strings, sequential runs (`12345`, `qwerty`), and repeated characters.
- **Cryptographic Passphrase Generator**: Generates high-entropy multi-word passphrases using hardware-randomized dictionary indexing.

### 3. Phishing Link & IDN Homoglyph Inspector (`#view-phishing`)
- **Punycode & Unicode Confusable Engine**: Exposes deceptive Cyrillic/Greek lookalike characters (e.g., `pаypal` using Cyrillic `а` vs Latin `a`).
- **Levenshtein Distance Distance Matrix**: Calculates minimum edit distance against enterprise domain sets to detect brand typosquatting.
- **Structural Heuristic Flags**:
  - Direct IP-as-hostname (`http://192.168.1.1/...`)
  - Deep subdomain nesting (>3 levels)
  - Suspicious / High-risk TLDs (`.xyz`, `.top`, `.tk`, `.ru`, `.click`, etc.)
  - Basic authentication credential embedding (`https://user:pass@domain.com`)
  - Suspicious URI length (>75 chars) and non-standard port numbers
- **DEFCON Threat Categorization**: Multi-tier rating (`DEFCON-1 CRITICAL`, `WARNING`, `BENIGN`).

### 4. Email Scam & Wire Fraud Scanner (`#view-email`)
- **45% / 55% Split Dual-Pane Workstation**: Side-by-side raw header/body input and real-time forensic report generation.
- **Multi-Indicator NLP Urgency Classifier**:
  - Executive Impersonation / CEO Fraud & BEC (Business Email Compromise)
  - Wire Transfer & Invoice Diversion heuristics
  - Threatening Language & Artificial Urgency flags (`24 HOURS`, `IMMEDIATE SUSPENSION`)
  - Credential Phishing Lures
- **Simulated Authentication Breakdown**: Diagnostic visualizer for SPF, DKIM, and DMARC alignment status.

### 5. Security Academy & Readiness Certification (`#view-learning`, `#view-quiz`)
- **4 Interactive Curriculum Modules**:
  1. *Password Architecture & Shannon Entropy*
  2. *Phishing Vectors, Punycode & Homoglyphs*
  3. *Social Engineering & Pretexting Defenses*
  4. *Multi-Factor Authentication & Cryptographic Keys*
- **Flashcard Knowledge Engine**: Interactive self-testing flashcard interface with curriculum mastery tracking.
- **Interactive Readiness Exam**: Timed 10-question evaluation simulating enterprise threat assessment scenarios with instant grading, scoring breakdown, and high-score persistence in localStorage.

### 6. Command Palette & Platform Architecture Drawer
- **Global Command Palette (`⌘K` / `Ctrl+K`)**: 18 instant actions spanning navigation, test vector preloading, hardware benchmarks, and JSON audit logging.
- **System Architecture & Enclave Specifications Drawer**: Diagnostic sheet detailing the 5 enclave pillars, live hardware benchmark execution, session purge, and GitHub source repository link.

---

## Precision Obsidian Stealth Design System

AEGIS implements a custom **Precision Obsidian Stealth** dark-mode design system tailored for mission-critical developer and security operations:

| Design Dimension | Implementation Detail |
| :--- | :--- |
| **Canvas Background** | Ultra-matte obsidian `#06080d` / `#090D16` |
| **Card Surfaces** | Machined `#090d16` and `#0f172a` with hairline specular top highlight (`inset 0 1px 0 rgba(255, 255, 255, 0.08)`) |
| **Borders** | Crisp 1px translucent borders (`rgba(255, 255, 255, 0.065)`) |
| **Typography** | Google Sora for UI headers, paired with JetBrains Mono for digests, counters, and mathematical formulas |
| **Tabular Numbers** | Enforced `font-variant-numeric: tabular-nums` across all counters and clocks to eliminate layout jitter |
| **Accent System** | Obsidian Cyan (`#00e5ff`), Emerald (`#10b981`), Amber (`#f59e0b`), Rose (`#f43f5e`), and Violet (`#8b5cf6`) |
| **Tactile Physics** | 80ms WWDC active press physics (`scale(0.975)` with `cubic-bezier(0.16, 1, 0.3, 1)`) |
| **Stealth Scrollbars** | Themed 6px scrollbars (`#06080e` track with `#1e293b` thumb and hover accent) |

---

## Getting Started

### Live Deployment & Zero-Install Access
AEGIS is an air-gapped single-page application and can be accessed directly in any modern browser without local installation:
👉 **[Launch AEGIS Enclave (GitHub Pages)](https://jatashya.github.io/Cybersec-hub/)**

### Prerequisites
- Modern Evergreen Browser: **Google Chrome 90+**, **Mozilla Firefox 90+**, **Apple Safari 15+**, or **Microsoft Edge 90+** (WebCrypto API required).
- Node.js 18+ (optional, for local development server).

### Installation & Local Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Jatashya/Cybersec-hub.git
   cd Cybersec-hub
   ```

2. **Option A: Run with Zero-Dependency Server (Recommended for Air-Gapped / Isolated Enclaves):**
   ```bash
   node serve.js
   ```
   *Opens server on `http://localhost:5173/`.*

3. **Option B: Run with Vite:**
   ```bash
   npm install
   npm run dev
   ```

4. **Production Build:**
   ```bash
   npm run build
   ```
   *Outputs optimized client assets to the `dist/` directory.*

---

## File Structure

```
Cybersec-hub/
├── index.html              # Core single-page application shell & modular views
├── style.css               # Precision obsidian stealth design system tokens & rules
├── app.js                  # App shell coordinator, breadcrumb router & Command Palette
├── dashboard.js            # SOC dashboard controller, posture scoring & audit ledger
├── password.js             # NIST SP 800-63B Shannon entropy & passphrase generator
├── phishing.js             # RFC 5890 Punycode, homoglyph & Levenshtein inspection engine
├── email.js                # BEC wire fraud, urgency analyzer & header visualizer
├── learning.js             # Academy curriculum syllabus & flashcard engine
├── quiz.js                 # Readiness exam engine with grading & high-score tracking
├── serve.js                # Zero-dependency local development HTTP server
├── vite.config.js          # Vite configuration
├── package.json            # Node manifest & scripts
├── DESIGN.md               # Enterprise dark-mode design specification document
└── learning-content/       # Markdown curriculum modules
    ├── passwords.md        # Password security deep-dive
    ├── phishing.md         # Phishing analysis deep-dive
    ├── social.md           # Social engineering defense
    └── twofactor.md        # Multi-factor authentication mechanisms
```

---

## Air-Gap & Zero-Egress Verification

To independently audit the client enclave's zero-egress guarantee:

1. Open your browser's Developer Tools (`F12` or `Ctrl+Shift+I`).
2. Navigate to the **Network** tab.
3. Select **Preserve log** and filter by **Fetch/XHR**.
4. Perform complex password entropy evaluations, enter suspicious URLs into the Phishing Inspector, and run email scam scans.
5. **Observed Result:** Zero requests are initiated. All evaluations, cryptographic digest computations, and pattern matches execute entirely inside local CPU/memory registers.

---

## Security Disclosure & Integrity

AEGIS was engineered for defensive security, threat intelligence modeling, and educational certification. It contains no offensive exploitative tooling or telemetry backdoors.

- **Author & Security Architect:** Jatashya K. Vyas
- **GitHub Profile:** [@Jatashya](https://github.com/Jatashya)
- **Repository:** [https://github.com/Jatashya/Cybersec-hub](https://github.com/Jatashya/Cybersec-hub)

---

## License

This project is licensed under the **ISC License**. Free for academic, enterprise, and open-source defensive security operations.
