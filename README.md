# Agent Evolver

**Give your AI coding agent a memory. Teach it your project's patterns as you build.**

[![npm version](https://img.shields.io/npm/v/@adhd8k/agent-evolver)](https://www.npmjs.com/package/@adhd8k/agent-evolver)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

AI agents start every session knowing nothing about your project. Agent Evolver gives them skills that learn from your work — recording decisions, extracting patterns, and evolving over time.

## Quick Start

```bash
# Run without installing
npx @adhd8k/agent-evolver install

# Or install globally
npm install -g @adhd8k/agent-evolver
agent-evolver install
```

That's it. Agent Evolver detects your coding agent (Claude Code, Cursor, Aider) and installs the skills locally into your project.

---

## What Gets Installed

Five skills your agent can use automatically:

| Skill | What it does |
|-------|-------------|
| `consult-knowledge` | Looks up past decisions and patterns before acting |
| `record-architectural-decision` | Captures why you made a decision, not just what you decided |
| `extract-pattern` | Recognizes when something has been done 3+ times and codifies it |
| `update-skill` | Lets the agent improve its own instructions based on what it learns |
| `autonomy-preferences` | Learns when to ask you vs. decide autonomously |

Skills are installed locally to your project (`.claude/skills/` for Claude Code) and tracked in git — so your whole team benefits.

---

## Autonomy Preferences

Tired of your agent asking permission for everything? Or worried it's making decisions without you?

The `autonomy-preferences` skill lets you configure how autonomous your agent should be. On first use, it asks:

> **How autonomous should I be when making decisions?**
> - **Ask me first** — I want to approve architectural, design, and technical decisions
> - **Suggest then proceed** — Show me what you're thinking, but don't wait for approval
> - **Fully autonomous** — Make reasonable decisions, I'll correct you if needed
> - **Let me customize** — Set different levels per category

### Decision Categories

| Category | Examples |
|----------|----------|
| **Architectural** | Database schema, service boundaries, API architecture |
| **Design** | API design, type definitions, module organization |
| **Technical** | Framework selection, algorithms, performance trade-offs |
| **UI/UX** | Layout, styling, interactions, accessibility |
| **Process** | Branching strategy, commit conventions, release decisions |

### Modes

| Mode | Behavior |
|------|----------|
| `ask` | Agent asks for approval before proceeding |
| `suggest-then-proceed` | Agent states its decision and continues without waiting |
| `autonomous` | Agent decides without asking; you correct if needed |

Preferences are stored in `.agent-evolver/autonomy-preferences.yaml` and persist across sessions.

---

## CLI Commands

```bash
# Install all skills (auto-detects your agent)
agent-evolver install

# Install a specific skill
agent-evolver install -s record-architectural-decision

# Install globally to your agent's home directory
agent-evolver install --global

# Force a specific agent
agent-evolver install -a claude-code

# See what's available
agent-evolver list

# Check which agents are detected
agent-evolver detect
```

---

## Local vs Global

**Local (default, recommended)**
Skills live in `./.claude/skills/` — version controlled, project-specific, shareable with your team.

**Global** (`--global`)
Skills live in `~/.claude/skills/` — available everywhere, but not tied to any project.

---

## Supported Agents

- **Claude Code** (claude)
- **Cursor** (planned)
- **Aider** (planned)

---

## Contributing

```bash
git clone https://github.com/adhd8k/agent-evolver.git
cd agent-evolver
npm install
npm run build
npm test
```

PRs welcome. See [open issues](https://github.com/adhd8k/agent-evolver/issues).

---

MIT License
