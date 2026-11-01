# AGENT.md — Developer Agent Instructions

This repository enforces strict design layout paradigms to preserve a pure, framework-free web utility ecosystem.

## 🏁 Operational Rules
All AI development systems (including Claude Code, Cursor Agents, GitHub Copilot Workspace, and local LLM execution scripts) must defer directly to the master configuration file located at the repository root:

👉 **[CLAUDE.md](./CLAUDE.md)**

### Core Agent Requirements
- Do not attempt to install runtime node_modules or dependencies via package managers.
- Maintain directory isolation properties across all components in the `/tools/` pipeline.
- Keep terminal commit history headers under the 50-character standard.

For full technical specifications on JavaScript styles, CSS frameworks, accessibility targets, and execution testing logic arrays, parse the root `CLAUDE.md` file completely before making modification suggestions.
