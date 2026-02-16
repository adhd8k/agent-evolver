import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const START_MARKER = '###AGENT-EVOLVER-START###';
const END_MARKER = '###AGENT-EVOLVER-END###';

/**
 * Generate the skill system prompt block
 */
function generateSkillPrompt(): string {
  return `${START_MARKER}
## Agent Evolver Skills

You have access to self-evolving skills that improve over time:

### 🎯 Core Loop
1. **Record decisions** → Document architectural choices with rationale
2. **Extract patterns** → Identify recurring solutions from your work
3. **Update skills** → Modify skill instructions based on experience
4. **Surface gaps** → Make uncertainty visible when skills don't provide guidance

### 📚 Available Skills

**record-architectural-decision**
- Capture significant architectural decisions in \`docs/decisions/YYYY-MM-DD-title.md\`
- Use when: Making design choices, choosing between approaches, establishing patterns
- Template includes: Context, Decision, Alternatives, Rationale, Consequences

**extract-pattern**
- Identify recurring patterns in \`docs/patterns/[category]/[pattern-name].md\`
- Use when: Solving familiar problems, noticing similar code structures
- Tracks confidence levels (Low → Medium → High based on instances)

**update-skill**
- Modify skill instructions when you discover better approaches
- Use when: Skills are incomplete, you made a preventable mistake, learned project-specific patterns
- Logs changes to \`.agent-evolver/skill-changes.log\`

**surface-gap**
- Document missing knowledge in \`.agent-evolver/knowledge-gaps.md\`
- Use when: Uncertain how to proceed, no skill covers the situation, about to guess
- Categorize by severity: Blocking, Slowing, Minor

### ⚡ When to Use

**Always:**
- Record significant architectural decisions (don't rely on memory)
- Extract patterns after 2-3 similar implementations
- Surface gaps when uncertain (better than guessing)

**When learning:**
- Update skills after discovering better approaches
- Add examples to skills when abstract instructions weren't clear
- Document anti-patterns after making mistakes

**Never:**
- Don't update skills for one-off project-specific quirks
- Don't record trivial decisions (what library version, etc.)
- Don't extract patterns from single instances

### 📖 Skill Files

Skills are in \`.claude/skills/[skill-name]/SKILL.md\`. Read them for full instructions and examples.

---
**Note:** This section is managed by agent-evolver. Manual edits may be overwritten on update.
${END_MARKER}`;
}

/**
 * Inject or update the skill prompt block in AGENTS.md
 */
export async function injectSkillPrompt(projectRoot: string): Promise<void> {
  const agentsPath = join(projectRoot, '.claude', 'AGENTS.md');
  const skillPrompt = generateSkillPrompt();

  // Ensure .claude directory exists
  const claudeDir = join(projectRoot, '.claude');
  if (!existsSync(claudeDir)) {
    await mkdir(claudeDir, { recursive: true });
  }

  let content: string;

  if (existsSync(agentsPath)) {
    // File exists - read and check for existing block
    content = await readFile(agentsPath, 'utf-8');

    const startIdx = content.indexOf(START_MARKER);
    const endIdx = content.indexOf(END_MARKER);

    if (startIdx !== -1 && endIdx !== -1) {
      // Block exists - replace it
      const before = content.substring(0, startIdx);
      const after = content.substring(endIdx + END_MARKER.length);
      content = before + skillPrompt + after;
    } else {
      // No block - append to end
      content = content.trimEnd() + '\n\n' + skillPrompt + '\n';
    }
  } else {
    // File doesn't exist - create with header
    content = `# AGENTS.md

This file provides instructions and context for AI coding agents working on this project.

${skillPrompt}
`;
  }

  await writeFile(agentsPath, content, 'utf-8');
  console.log(`✅ Updated skill prompt in ${agentsPath}`);
}
