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

Four skills your agent can use automatically:

| Skill | What it does |
|-------|-------------|
| `record-architectural-decision` | Captures why you made a decision, not just what you decided |
| `extract-pattern` | Recognizes when something has been done 3+ times and codifies it |
| `update-skill` | Lets the agent improve its own instructions based on what it learns |
| `consult-knowledge` | Looks up past decisions and patterns before acting |

Skills are installed locally to your project (`.claude/skills/` for Claude Code) and tracked in git — so your whole team benefits.

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
