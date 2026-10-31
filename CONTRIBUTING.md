# Contributing to CalciVerse

Thank you for your interest in improving CalciVerse! We welcome contributions to help make this the ultimate bundle of lightweight web utilities.

## Our Philosophy

1. **Zero Dependencies:** All tools must be built using pure, vanilla HTML5, CSS3, and JavaScript. No npm packages, external frameworks, or build steps.
2. **Directory Isolation:** Every tool must live in its own subfolder under `/tools/` with a self-contained `index.html`.
3. **Performance First:** Keep code clean, fast, and accessible.

## How to Add a New Tool

If you want to add a new calculator or utility, please follow this folder structure:

```text
tools/
└── your-new-tool-name/
    └── index.html
```

- Link your new tool to the main landing page (`/index.html`).
- Utilize the global shared assets (`/assets/` and `/styles.css`) where possible to maintain visual consistency.

## Pull Request Process

1. Fork the repository and create your branch from `main`.
2. Ensure your code is thoroughly tested for mathematical edge cases.
3. Keep your commit summaries under 50 characters, placing any structural explanations in the extended commit description.
4. Submit your Pull Request and wait for review!
