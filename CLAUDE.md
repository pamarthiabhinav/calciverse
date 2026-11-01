# CLAUDE.md — AI Assistant Guidelines & Codebase Context

Welcome, Claude. This file contains strict operational constraints, architectural standards, and development workflows for the **CalciVerse** project. You must review and adhere to these specifications for every response, code change, or optimization pass.

## 🏗️ Architectural Core Principles

CalciVerse is engineered to be a completely framework-free, zero-dependency ecosystem of micro-utilities.
1. **Zero External Dependencies:** No npm packages, bundlers (Webpack, Vite), preprocessors (SASS, Tailwind), or runtime frameworks (React, Vue) are permitted. Everything must compile natively in modern rendering engines.
2. **Directory Isolation:** Every calculator or tracking tool must live entirely isolated inside its own folder under `/tools/` (e.g., `/tools/interest/index.html`).
3. **Decentralized Runtime:** Each utility must handle its own computations internally. A user must be able to download a single tool directory and run it completely offline by double-clicking the `index.html` file.
4. **Shared Assets Integration:** Tools should use the root `/styles.css` for consistent, mobile-responsive layouts and core design elements, augmenting it locally only when hyper-specific inputs require customized alignment rules.

---

## 💻 Code Styling & Development Standards

### HTML5
- Write semantic HTML5 elements (`<main>`, `<section>`, `<article>`, `<output>`).
- Maintain highly descriptive `id` attributes on computational input fields to ensure precise DOM targeting.
- Ensure all forms have appropriate field labels and ARIA attributes for strict WCAG accessibility compliance.

### CSS3
- Utilize standard CSS custom properties (variables) defined in the root `styles.css` for thematic color cohesion.
- Implement responsive grids and flexbox frameworks. Never hardcode absolute pixel sizing layouts that break on standard mobile devices.
- Adhere to user preferences by implementing standard media queries for accessibility themes (e.g., `prefers-reduced-motion`).

### JavaScript (ES6+)
- Write highly modular, clean, vanilla JavaScript functions.
- Prioritize pure mathematical computation layers separate from DOM mutation operations to simplify upcoming test execution integration scripts.
- Never write `eval()` code blocks or dangerous string execution paths that expose user inputs to local validation injections.
- Implement clear defensive parameter checking on input states (e.g., handling negative compound interest variables, out-of-bound date inputs, or extreme health biometric integers).

---

## 🛠️ Operational Workflows & Commands

### Git Commit Guidelines
- **Strict Limit:** Keep all commit summary headers strictly under **50 characters**.
- Use the active imperative voice (e.g., `Add calculation metric logic`, not `Added calculation metric logic`).
- Separate summary summaries from details using an empty carriage return line space, putting structural reasoning inside punchy bullet fragments within the extended description window.

---

## 🔬 Target Testing & Edge-Case Sweeps

Whenever generating math routines or code corrections, manually verify the following calculation edge cases:
* **Finance:** Handle negative numbers, zero values, floating-point precision adjustments (e.g., use integer conversions or `.toFixed(2)` routines to safely control JavaScript binary rounding anomalies).
* **Time/Date:** Evaluate inclusive calendar limits, leap-year boundaries, dynamic month transitions (28/29/30/31 adjustments), and absolute timestamp changes.
* **Biometrics:** Gracefully trap impossible values or invalid parameters to prevent script exceptions from crashing UI execution loops.
* **Percentage Calculations:** Ensure division by zero is properly handled and that percentage results are clamped within logical bounds (0-100%) where applicable.
