# Agent Evolver Skills

This directory contains **universal skills** in a cross-agent compatible format. The installer (`agent-evolver install`) converts these to agent-specific formats.

## Available Skills

### 1. record-architectural-decision
Capture significant architectural decisions, design choices, and their rationale in a structured format that persists across sessions.

**Use when:**
- Making significant architectural choices
- Choosing between multiple approaches
- Establishing patterns or conventions
- Learning hard lessons that shouldn't be repeated

### 2. extract-pattern
Identify recurring patterns in code, problems, or solutions and document them for reuse. Build a pattern library that grows smarter over time.

**Use when:**
- Solving a problem you've encountered before
- Noticing similar code structures across modules
- Applying the same solution strategy repeatedly
- Finding bugs that follow a pattern

### 3. update-skill
Modify existing agent skills based on learned patterns, mistakes, and new knowledge. Create a feedback loop where experience improves future performance.

**Use when:**
- Discovering a better approach than what's documented
- A skill's instructions are incomplete or unclear
- Making a mistake that could be prevented
- Learning project-specific conventions

### 4. surface-gap
Identify missing knowledge, unclear instructions, or situations where existing skills don't provide guidance. Make uncertainty visible so it can be addressed.

**Use when:**
- Encountering an unfamiliar problem
- Existing skills are vague or incomplete
- Multiple approaches seem equally valid
- About to guess or make assumptions

## Universal Skill Format

Each skill directory contains:

```
[skill-name]/
├── skill.yaml          # Metadata (name, version, description, compatibility)
├── SKILL.md            # Main instructions (what the agent reads)
└── templates/          # Optional templates referenced by SKILL.md
    └── *.md
```

### skill.yaml

```yaml
name: skill-name
version: 1.0.0
description: Brief description of the skill
author: adhd8k
agentCompatibility:
  - claude-code
  - cursor
  - aider
  - openclaw
triggers:
  - pattern: "keyword or phrase"
variables:
  someVar: "{{projectRoot}}/path"
files:
  - path: "SKILL.md"
    type: "instructions"
  - path: "templates/example.md"
    type: "template"
```

### SKILL.md

Markdown instructions that the agent reads. Should include:
- Purpose
- When to use
- Process/steps
- Examples
- Integration points with other skills
- Success metrics

### Templates

Optional template files referenced by the skill. Use variable substitution:
- `{{date}}` - Current date
- `{{projectRoot}}` - Project root directory
- Custom variables defined in `skill.yaml`

## Installation

```bash
# Install all skills locally (default: current directory)
agent-evolver install

# Install specific skill locally
agent-evolver install -s record-architectural-decision

# Install globally to agent directory
agent-evolver install --global

# Force specific agent (auto-detect by default)
agent-evolver install -a claude-code

# List available skills
agent-evolver list
```

**Local vs Global:**
- **Local (default):** `./.agent-evolver/skills/` - Project-specific, version controlled
- **Global (`--global`):** `~/.claude/skills/` - Available across all projects

## Adding New Skills

1. Create skill directory: `skills/[skill-name]/`
2. Add `skill.yaml` with metadata
3. Add `SKILL.md` with instructions
4. (Optional) Add templates in `templates/`
5. Test with `agent-evolver install -s [skill-name]`

## Agent Compatibility

### Claude Code
- Skills directory: `~/.claude/skills/[skill-name]/`
- Format: SKILL.md + templates/

### Cursor (planned)
- Skills directory: `~/.cursor/skills/[skill-name]/`
- Format: TBD

### Aider (planned)
- Skills directory: `~/.aider/skills/[skill-name]/`
- Format: TBD

### OpenClaw (planned)
- Skills directory: `~/.openclaw/skills/[skill-name]/`
- Format: SKILL.md + metadata

## Philosophy

These skills embody the core loop:
1. **Record decisions** → Document choices and rationale
2. **Extract patterns** → Recognize recurring solutions
3. **Update skills** → Improve instructions based on experience
4. **Surface gaps** → Make uncertainty visible

Over time, agents become more capable by learning from themselves.
