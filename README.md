# Agent Evolver

**Self-evolving agentic coding system with persistent knowledge and pattern learning.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AgentSkills.io](https://img.shields.io/badge/AgentSkills.io-compliant-blue)](https://agentskills.io)

---

## 🎯 Objectives

**The Problem:**
- When you start a new project, AI coding agents have generic knowledge but lack project-specific patterns
- As projects mature, patterns emerge (coding conventions, architecture decisions, API contracts)
- These patterns exist only in documentation or "tribal knowledge"
- Agents can't automatically learn and update their own skills as patterns solidify

**The Vision:**
- Start a project with **minimal seed skills** - just enough to bootstrap
- As the project evolves and patterns emerge, agents should:
  - **Detect** new patterns automatically
  - **Extract** them into reusable knowledge
  - **Update** their own skill files to encode these patterns
  - **Apply** learned patterns consistently going forward

**Key Innovation:**
- Agents that can modify their own skills (meta-learning)
- Human-controlled delegation (user decides what they decide vs delegate)
- Pattern extraction from code (not just prompts)
- Cross-agent compatibility via [AgentSkills.io](https://agentskills.io) spec

---

## 🏗️ How It Works

### 1. Project Structure

```
my-project/
├── .agent/
│   ├── decisions/          # Architectural Decision Records
│   │   ├── 001-stack.md
│   │   ├── 002-auth.md
│   │   └── 003-database.md
│   │
│   ├── patterns/           # Extracted coding patterns
│   │   ├── error-handling.md
│   │   ├── api-structure.md
│   │   └── testing.md
│   │
│   ├── skills/             # AgentSkills.io-compliant skills
│   │   ├── record-architectural-decision/
│   │   │   ├── SKILL.md
│   │   │   ├── scripts/
│   │   │   └── references/
│   │   │
│   │   ├── extract-coding-pattern/
│   │   │   ├── SKILL.md
│   │   │   └── scripts/
│   │   │
│   │   ├── update-agent-skill/
│   │   │   ├── SKILL.md
│   │   │   └── scripts/
│   │   │
│   │   └── surface-pattern-gap/
│   │       └── SKILL.md
│   │
│   ├── delegation.yaml     # Authority config (user vs agent)
│   └── meta.json           # Project metadata
│
├── src/                    # Actual project code
├── tests/
└── README.md
```

### 2. Core Loop

```
User Request → Load Context → Detect Decision Point → Check Delegation
                                                              │
                    ┌─────────────────────────────────────────┤
                    │                                         │
              USER_AUTHORITY                            AGENT_AUTHORITY
                    │                                         │
                    ▼                                         ▼
              Ask User Choice                        Check Patterns
                    │                                         │
                    │                           ┌─────────────┴──────────┐
                    │                           │                        │
                    │                     PATTERN_EXISTS           NO_PATTERN
                    │                           │                        │
                    ▼                           ▼                        ▼
              Record Decision              Apply Pattern          Surface Gap
                    │                           │                  Ask for Guidance
                    │                           │                        │
                    └───────────────────────────┴────────────────────────┘
                                                │
                                                ▼
                                    Execute Implementation
                                                │
                                                ▼
                                    Pattern Detection
                                   (Repetition >= 3?)
                                                │
                                        ┌───────┴────────┐
                                        │                │
                                       YES              NO
                                        │                │
                                        ▼                │
                                  Extract Pattern        │
                                  Update Skills          │
                                        │                │
                                        └────────────────┘
                                                │
                                                ▼
                                         Task Complete
                                    (Knowledge Evolved)
```

### 3. Decision Schema

Decisions are stored as markdown files with YAML frontmatter:

```yaml
---
id: 001
title: Choose Backend Stack
date: 2026-02-14
status: accepted  # proposed|accepted|deprecated|superseded
authority: user   # who decided: user|agent|consensus
category: architecture
tags: [stack, backend]
---

## Context
Building a marketplace for digital goods. Need to choose backend technology.

## Options Considered
1. **Elixir/Phoenix** - Great for real-time, fault-tolerant
2. **Node.js/Express** - Large ecosystem, familiar
3. **Python/Django** - Batteries included, good for MVP

## Decision
**Elixir/Phoenix** selected

## Rationale
- User preference: Likes Elixir
- Real-time needs: LiveView for dynamic UI
- Scalability: Handles concurrency well

## Consequences
- Positive: Excellent fault tolerance, real-time capabilities
- Negative: Smaller ecosystem than Node/Python, learning curve
- Neutral: Postgres is natural fit

## Downstream Decisions
[Links to decisions this affects]
```

### 4. Pattern Schema

Patterns are extracted from repeated code structures:

```yaml
---
pattern_id: error-001
name: Error Handling Pattern
category: error-handling
created: 2026-02-14
extracted_from: [checkout.ex, user_auth.ex, payment.ex]
confidence: high  # low|medium|high (based on # of examples)
applies_to: [elixir, phoenix]
---

## Pattern
When a function can fail, always return `{:ok, result} | {:error, reason}` tuple.

## Examples
[Code examples]

## When to Use
- Public API functions
- Functions that interact with external systems
- Database operations

## When NOT to Use
- Internal helper functions (can raise)
- Test utilities

## Enforcement
Agent will suggest this pattern when creating new functions that interact with Repo, external APIs, or validate user input.
```

### 5. Skill Schema (AgentSkills.io-Compliant)

Skills follow the [AgentSkills.io specification](https://agentskills.io/specification):

```yaml
---
name: record-architectural-decision
description: Records architectural decisions in a structured, machine-readable format. Use when making decisions about stack, architecture, database, auth, integrations, or any choice that affects future development.
license: MIT
metadata:
  author: agent-evolver
  version: "1.0"
  category: knowledge-management
allowed-tools: Write Read Bash(git:*)
---

# Record Architectural Decision

[Detailed instructions, examples, edge cases...]
```

### 6. Delegation Config

User controls what they decide vs what agent decides:

```yaml
# .agent/delegation.yaml
version: 1.0

# User authority (agent asks for approval)
user_authority:
  - architecture.new_service
  - architecture.major_refactor
  - database.schema_migration
  - auth.strategy
  - integrations.third_party
  - design.system

# Agent authority (agent decides autonomously)
agent_authority:
  - code.implementation
  - code.refactor_internal
  - testing.strategy
  - patterns.naming
  - patterns.error_handling

# Consultation (agent proposes, user approves)
consultation:
  - database.new_table
  - integrations.api_contract
  - architecture.new_module

# Notification (agent decides, user informed)
notification:
  - code.bug_fix
  - dependencies.patch
  - tests.add_coverage
```

---

## 🚀 Usage Example

### Scenario: "Add user authentication"

**User:** "Add user authentication to the project"

**Agent:**
1. **Load context:** No stack chosen yet
2. **Decision check:** `auth.strategy` requires user authority
3. **Ask user:**
   ```
   We need to make some decisions for authentication:
   
   1. Auth strategy?
      a) Traditional (email/password)
      b) Passwordless (magic link)
      c) OAuth (Google, GitHub)
   
   2. Session management?
      a) Stateful (server-side sessions)
      b) Stateless (JWT tokens)
   
   I recommend (b) Passwordless + (a) Stateful because:
   - More secure (no passwords to leak)
   - Better UX
   - Fits your stack well
   
   What's your preference?
   ```

**User:** "Go with your recommendation"

**Agent:**
4. **Record decision:**
   ```yaml
   # .agent/decisions/002-auth.md
   Decision: Passwordless auth with magic links
   Rationale: More secure, better UX, fits Phoenix ecosystem
   ```

5. **Check for auth skill:** Not found!
6. **Surface gap:**
   ```
   I don't have a skill for implementing passwordless auth yet.
   Let me break this down:
   
   - Generate User schema (email, token fields)
   - Create auth context (generate token, verify)
   - Build LiveView login page
   - Email integration for magic links
   
   Should I proceed? I'll document the approach as a reusable skill.
   ```

**User:** "Yes"

**Agent:**
7. **Implement + learn:**
   - Generates User schema
   - Creates auth context
   - Builds LiveView
   - Writes tests
   - **Extracts skill:** `implement-passwordless-auth.md`

8. **Pattern detection:**
   ```
   I noticed you used {:ok, user} | {:error, changeset} tuples
   for the auth functions. Should I make this our error handling pattern?
   
   [Yes] [No] [Decide later]
   ```

**User:** "Yes"

**Agent:**
9. **Codify pattern:** Creates `.agent/patterns/error-handling.md`

**Next time:**
- Agent knows auth pattern
- Can implement similar flows faster
- Suggests consistent error handling
- New team member inherits this knowledge

---

## 🎯 Core Skills

### 1. record-architectural-decision
Records important architectural decisions with:
- Decision context and options
- Rationale and consequences
- Authority tracking (who decided)
- Links to related patterns and downstream decisions

### 2. extract-coding-pattern
Automatically detects code repetition and creates patterns:
- Scans recent commits for repeated structures
- Analyzes patterns (error handling, API calls, DB queries)
- Proposes pattern when repetition >= 3x
- Creates pattern document in `.agent/patterns/`

### 3. update-agent-skill
Safely modifies existing agent skills:
- Detects when patterns/decisions change
- Generates diff preview for user approval
- Updates skill files with git tracking
- Validates YAML frontmatter before applying
- Rollback-friendly (git revert)

### 4. surface-pattern-gap
Identifies missing patterns and asks for guidance:
- Detects situations without established patterns
- Searches existing patterns and codebase
- Surfaces gap to user with options
- Records choice as new pattern

---

## 🔍 Research Foundation

Based on analysis of existing systems:

**Inspirations:**
- **ADRs** (Architectural Decision Records) - Decision documentation pattern
- **Voyager** (Minecraft agent) - Skill learning and library growth
- **Cursor rules** - Project-specific AI behavior
- **DSPy** - Self-optimizing LLM programs
- **AgentSkills.io** - Cross-agent skill specification

**What's Missing (Our Innovation):**
- Self-modifying project skills
- Pattern extraction from code
- Architectural decision automation
- Human delegation framework
- Cross-run knowledge evolution

---

## 🎯 Roadmap

### Phase 1: Core Skills (Current)
- [x] Design system architecture
- [ ] Implement `record-architectural-decision` skill
- [ ] Implement `extract-coding-pattern` skill
- [ ] Implement `surface-pattern-gap` skill
- [ ] Implement `update-agent-skill` skill

### Phase 2: Pattern Detection
- [ ] AST-based repetition detection
- [ ] Pattern confidence scoring
- [ ] Multi-language support (Elixir, Python, JS)

### Phase 3: Real-World Testing
- [ ] Test on greenfield project
- [ ] Test on existing codebase
- [ ] Measure knowledge accumulation
- [ ] Validate cross-agent compatibility

### Phase 4: Advanced Features
- [ ] Pattern similarity detection
- [ ] Skill composition (combine skills)
- [ ] Multi-project knowledge sharing
- [ ] Team collaboration support

---

## 📦 Installation

### Quick Start

```bash
# Install agent-evolver globally
npm install -g agent-evolver

# Navigate to your project
cd my-project

# Install skills locally (default: current directory)
agent-evolver install

# Or install globally to agent directory
agent-evolver install --global
```

### Usage

```bash
# Install all skills locally (project-specific)
agent-evolver install

# Install specific skill locally
agent-evolver install -s record-architectural-decision

# Install globally to agent directory
agent-evolver install --global

# Force specific agent (auto-detect by default)
agent-evolver install -a claude-code

# List available skills
agent-evolver list

# Detect installed agents
agent-evolver detect
```

### Local vs Global Installation

**Local (default):** `agent-evolver install`
- Skills install to `./.agent-evolver/skills/` in your current directory
- ✅ Perfect for project-specific skills
- ✅ Version controlled with your repo
- ✅ Different projects can have different skills
- ✅ Team collaboration (skills tracked in git)

**Global:** `agent-evolver install --global`
- Skills install to agent directory (e.g., `~/.claude/skills/`)
- ✅ Available across all projects
- ❌ Not version controlled
- ❌ Single skill set for all projects

**Recommendation:** Use local installation for most cases. Use global only for truly universal skills (like "explain code" or "write tests").

---

## 🤝 Contributing

This is an experimental project exploring self-evolving AI coding agents. Contributions welcome!

### Development Setup
```bash
git clone git@github.com:moejay/agent-evolver.git
cd agent-evolver
# More setup instructions TBD
```

### Key Principles
1. **Safety First:** All self-modifications require user approval and git tracking
2. **AgentSkills.io Compliance:** All skills follow the specification
3. **Progressive Disclosure:** Efficient context usage
4. **Rollback-Friendly:** Every change is git-tracked

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- [AgentSkills.io](https://agentskills.io) for the skill specification
- Michael Nygard for Architectural Decision Records
- The Voyager team for demonstrating skill learning
- Cursor for proving project-specific AI rules work

---

**Status:** 🚧 Experimental - Active development

**Questions?** Open an issue or start a discussion.
