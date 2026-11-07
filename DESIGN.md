# AEGIS Design System Specification (`DESIGN.md`)
**Version:** 3.0.0  
**Archetype:** Enterprise Dark-Mode Security Operations Platform  
**Design Influences:** Linear, Cloudflare Radar, Datadog, CrowdStrike Falcon, Vercel  

---

## 1. Spatial Rhythm & Layout Hierarchy

### A. Root Canvas & Density
- **Viewport Canvas:** `#090D16` (Obsidian Slate matte base, zero atmospheric blur cones or consumer gradients).
- **Surface Elevation Hierarchy:**
  - `Surface Level 0 (Canvas):` `#090D16`
  - `Surface Level 1 (Card Default):` `#0F172A` with subtle top highlight `linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)`
  - `Surface Level 2 (Elevated Command & Inset Trays):` `#0B0F19` with recessed `inset 0 2px 6px rgba(0, 0, 0, 0.75)`
  - `Surface Level 3 (Drawers & Modals):` `#0F172A` with `box-shadow: -8px 0 32px rgba(0, 0, 0, 0.8)`
- **Border Treatment:** Hairline 1px borders `rgba(255, 255, 255, 0.07)` on cards, with active focus state `rgba(56, 189, 248, 0.45)`.
- **Concentric Radii System:**
  - Outer Containers & Cards: `12px`
  - Inner Control Groups & Trays: `8px`
  - Buttons, Badges & Chips: `6px`
  - Formula: $R_{\text{outer}} = R_{\text{inner}} + \text{padding}$

---

## 2. Color Palette & Dynamic Accent System

### A. Core Neutral Tokens
- `Canvas Base:` `#090D16`
- `Surface Default:` `#0F172A`
- `Surface Subdued:` `#0B1120`
- `Border Translucent:` `rgba(255, 255, 255, 0.07)`
- `Border Hairline Highlight:` `inset 0 1px 0 rgba(255, 255, 255, 0.08)`
- `Text Primary:` `#F8FAFC` (Slate 50)
- `Text Secondary:` `#94A3B8` (Slate 400)
- `Text Muted:` `#64748B` (Slate 500)
- `Text Dim:` `#475569` (Slate 600)

### B. Functional State & Threat Accents
- **Healthy / Nominal / Passing:**
  - Primary: `#10B981` (Muted Emerald)
  - Badge: `background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25);`
- **Elevated / Warning / Suspicious:**
  - Primary: `#F59E0B` (Warm Amber)
  - Badge: `background: rgba(245, 158, 11, 0.1); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.25);`
- **Critical / Threat / Hostile:**
  - Primary: `#F43F5E` (Rich Crimson/Rose)
  - Badge: `background: rgba(244, 63, 94, 0.12); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3);`
- **Primary Action / Focal Highlight:**
  - Primary: `#0284C7` (Sky 600) / `#6366F1` (Indigo 500)
  - Machined Button: `linear-gradient(180deg, #0284c7 0%, #0369a1 100%)` with top specular highlight `inset 0 1px 0 rgba(255, 255, 255, 0.28)`.

### C. Badge Restraint Strategy
- Eliminate persistent static filler capsule badges (`APPEND-ONLY`, `AIR-GAPPED`, `HEURISTIC CLASSIFIER`).
- Badges are strictly reserved for:
  1. Live DEFCON tier states (`● DEFCON-1 CRITICAL`, `● DEFCON-3 ELEVATED`, `● DEFCON-5 NOMINAL`).
  2. Audit log threat level classification (`CRITICAL`, `WARNING`, `HEALTHY`).
  3. Dynamic heuristic sensor verdicts (`CLEARED`, `WARNING`, `CRITICAL`).

---

## 3. Typography & Numerical Precision

- **UI Labels, Headings & Body:**
  - Primary Font: `Inter`, `Geist Sans`, `Sora`, `-apple-system`, `sans-serif`
  - Headings: `font-weight: 600` or `700`, `letter-spacing: -0.02em`, `text-wrap: balance`
  - Body Text: `font-size: 0.85rem`, `line-height: 1.5`, `color: #94A3B8`, `text-wrap: pretty`
- **Payloads, Hashes, IPs, Numbers & Code:**
  - Monospace Font: `JetBrains Mono`, `Geist Mono`, `Consolas`, monospace
  - Number Metrics: `font-variant-numeric: tabular-nums` enforced on all counts, timers, benchmarks, and percentages.
  - Optical baseline alignment: `display: flex; align-items: baseline; gap: 6px;`

---

## 4. Workstation Architecture: Standardized 2-Column Split (45% / 55%)

All analysis modules (Password Cryptographer, Phishing Link Inspector, Email Scam Scanner) follow a unified split workspace:
```
+-------------------------------------------+-------------------------------------------------------+
|  LEFT PANEL (45% - TACTICAL COMMAND)      |  RIGHT PANEL (55% - DIAGNOSTIC TELEMETRY CANVAS)      |
|  - One-click Test Vector Chips            |  - Concentric or Segmented Real-time Verdict HUD      |
|  - Inset Terminal Input Enclave           |  - Granular Deconstructed IOC Tokens                  |
|  - Parameter Controls & Modifiers         |  - Dynamic Sensor Array Probes                        |
|  - Bottom-Right Aligned Action Button     |  - Actionable SOC Incident Mitigation Runbook         |
+-------------------------------------------+-------------------------------------------------------+
```

---

## 5. Micro-Interactions & Mechanical Motion

- **Transition Timing:** `120ms` to `150ms` cubic-bezier ease-out transitions (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Press Physics:** Active scale `transform: scale(0.975)` with zero-latency spring release.
- **Copy Affordance:** One-click copy buttons on hashes, sinkhole rules, and raw tokens with immediate inline icon state swap and non-blocking toast confirmation.
- **Inspection Drawers:** Zero-layout-shift fixed right slide-over drawers with translucent backdrop dimming (`rgba(0, 0, 0, 0.6)`).
- **Themed Scrollbars:** Minimal 6px stealth scrollbars (`#06080e` track, `#1e293b` thumb with `#334155` hover state).

---

## 6. Accessibility & Quality Gates

- **WCAG AA Compliance:** Strict minimum 4.5:1 contrast on all body text, 3:1 on large text and graphical interactive elements.
- **Icon Labels:** Explicit `aria-label` and `title` attributes on all icon-only buttons.
- **Focus Management:** Visible 2px focus ring `rgba(56, 189, 248, 0.5)` with `outline-offset: 2px` on all interactive keyboard targets.
- **Zero Horizontal Overflow:** Guaranteed `overflow-x: hidden` and `hasHorizontalOverflow === false` across 420px, 768px, 1100px, 1440px, and 4K viewports.
