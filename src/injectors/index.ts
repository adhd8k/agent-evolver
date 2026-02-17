import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { parse as parseYaml } from 'yaml';

const START_MARKER = '###AGENT-EVOLVER-START###';
const END_MARKER = '###AGENT-EVOLVER-END###';

export interface SkillTrigger {
  /** Phrase-based: fired when user says this */
  pattern?: string;
  /** Action-based: fired when Claude is silently doing this */
  action?: string;
}

export interface InstalledSkill {
  name: string;
  description: string;
  triggers: SkillTrigger[];
  completionCheck?: string;
}

/**
 * Get the installed skills directory path for a given agent
 */
function getInstalledSkillsDir(projectRoot: string, agent: string): string {
  const agentDir = agent === 'claude-code' ? '.claude' : '.agents';
  return join(projectRoot, agentDir, 'skills');
}

/**
 * Read installed skills from disk, returning their metadata and triggers
 */
async function readInstalledSkills(skillsDir: string): Promise<InstalledSkill[]> {
  if (!existsSync(skillsDir)) {
    return [];
  }

  const skills: InstalledSkill[] = [];

  try {
    const entries = await readdir(skillsDir);

    for (const entry of entries) {
      const metadataPath = join(skillsDir, entry, 'skill.yaml');
      if (!existsSync(metadataPath)) continue;

      try {
        const content = await readFile(metadataPath, 'utf-8');
        const metadata = parseYaml(content);

        skills.push({
          name: metadata.name || entry,
          description: metadata.description || '',
          triggers: Array.isArray(metadata.triggers) ? metadata.triggers : [],
          completionCheck: metadata.completion_check ?? undefined,
        });
      } catch {
        // Skip malformed skill.yaml files
      }
    }
  } catch {
    // Skills dir unreadable
  }

  return skills;
}

/**
 * Generate the skill system prompt block dynamically from installed skills.
 * Uses imperative language so Claude auto-triggers skills without being asked.
 */
function generateSkillPrompt(skills: InstalledSkill[], agentSkillsDir: string): string {
  const skillBlocks =
    skills.length === 0
      ? '_No skills installed yet. Run `agent-evolver install` to add skills._'
      : skills
          .map((skill) => {
            const phraseLines = skill.triggers
              .filter((t) => t.pattern)
              .map((t) => `  - "${t.pattern}"`)
              .join('\n');

            const actionLines = skill.triggers
              .filter((t) => t.action)
              .map((t) => `  - ${t.action}`)
              .join('\n');

            const triggerSection = [
              phraseLines
                ? `**Phrase triggers** (user or Claude says):\n${phraseLines}`
                : null,
              actionLines
                ? `**Action triggers** (Claude is silently doing this):\n${actionLines}`
                : null,
            ]
              .filter(Boolean)
              .join('\n\n');

            return `#### \`${skill.name}\`
> ${skill.description}

${triggerSection || '_(no triggers defined — invoke manually)_'}

**How to invoke:** Read \`${agentSkillsDir}/${skill.name}/SKILL.md\` and follow its instructions immediately.`;
          })
          .join('\n\n---\n\n');

  // Build checklist items per skill (for completion checklist)
  const checklistItems = skills
    .filter((s) => s.completionCheck)
    .map((s) => `- [ ] ${s.completionCheck} → \`${s.name}\``)
    .join('\n') || '- [ ] _(no skills with completion checks installed)_';

  return `${START_MARKER}
## Agent Evolver — Skill Auto-Trigger Rules

⚡ **MANDATORY BEHAVIOR**: When you detect ANY trigger below, you MUST automatically invoke the corresponding skill — do NOT wait for the user to ask. This is not optional.

### The Loop

    consult-knowledge → plan → implement → record-architectural-decision
                                         → extract-pattern
                                         → surface-gap
                                         → update-skill
                            (repeat: next task starts with consult-knowledge)

Every task starts with retrieval. Every task ends with capture. That's the loop.

### ⚠️ Silent Decisions

**You make architectural decisions even when you don't say "I'm choosing between X and Y."**
If you wrote code one way when another way was possible, that's a decision. Record it.
Phrase-based triggers assume you'll narrate your thinking. You often just do without narrating.
**The action-based triggers below exist specifically for this.** Check them even when silent.

---

${skillBlocks}

---

### Workflow Checkpoints

Run these internal checks at each stage — no user prompt needed:

**Before planning (first thing, always):**
- Run \`consult-knowledge\`: scan \`docs/decisions/\`, \`docs/patterns/\`, \`.agent-evolver/knowledge-gaps.md\`
- Find anything related to the current task's keywords and let it shape the plan
- If a prior decision applies → follow it (or explicitly revisit it)
- If a prior pattern applies → use it without being asked
- If a blocking gap applies → surface it before writing code

**Before writing code:**
- Am I choosing between approaches? → \`record-architectural-decision\`
- Am I implementing something with no prior example in this codebase? → \`surface-gap\`

**After implementing a feature:**
- Could this pattern appear again in this project? → \`extract-pattern\`
- Did I learn something non-obvious? Did a skill mislead me? → \`update-skill\`
- Did I make any design choices, even silently? → \`record-architectural-decision\`

---

### Feature Completion Checklist

**A feature is NOT complete until you've answered these:**

${checklistItems}

If the answer to any is "yes" — invoke the skill before marking the task done.
If the answer is "no" or "not applicable" — note why briefly and move on.

---

### Updating Skills

Skills are living documents. If a skill's guidance is wrong, incomplete, or doesn't fit this project — fix it using \`update-skill\`. Your edits are encouraged.

---
*Managed by agent-evolver. Re-running \`agent-evolver install\` updates this block.*
${END_MARKER}`;
}

/**
 * Get the target file for skill prompt injection based on agent type
 */
function getPromptFilePath(projectRoot: string, agent: string): string {
  switch (agent) {
    case 'claude-code':
      return join(projectRoot, 'CLAUDE.md');
    case 'cursor':
      return join(projectRoot, '.cursorrules');
    case 'aider':
      return join(projectRoot, '.aider.md');
    default:
      return join(projectRoot, 'AGENTS.md');
  }
}

/**
 * Inject or update the skill prompt block in the agent's config file.
 * Reads installed skills dynamically so triggers are always up to date.
 */
export async function injectSkillPrompt(
  projectRoot: string,
  agent: string,
  preloadedSkills?: InstalledSkill[]
): Promise<void> {
  const promptPath = getPromptFilePath(projectRoot, agent);
  const skillsDir = getInstalledSkillsDir(projectRoot, agent);

  // Use preloaded skills (passed from installSkills after fresh install) or read from disk
  const skills = preloadedSkills ?? (await readInstalledSkills(skillsDir));

  // Compute the relative path for skill references in the prompt
  const agentDir = agent === 'claude-code' ? '.claude' : '.agents';
  const relativeSkillsDir = `${agentDir}/skills`;

  const skillPrompt = generateSkillPrompt(skills, relativeSkillsDir);

  let content: string;

  if (existsSync(promptPath)) {
    content = await readFile(promptPath, 'utf-8');

    const startIdx = content.indexOf(START_MARKER);
    const endIdx = content.indexOf(END_MARKER);

    if (startIdx !== -1 && endIdx !== -1) {
      // Block exists — replace it
      const before = content.substring(0, startIdx);
      const after = content.substring(endIdx + END_MARKER.length);
      content = before + skillPrompt + after;
    } else {
      // No block — append
      content = content.trimEnd() + '\n\n' + skillPrompt + '\n';
    }
  } else {
    const header =
      agent === 'claude-code'
        ? '# CLAUDE.md\n\nProject-specific instructions for Claude Code.\n\n'
        : '# Agent Instructions\n\nProject-specific instructions for AI coding agents.\n\n';

    content = header + skillPrompt + '\n';
  }

  await writeFile(promptPath, content, 'utf-8');
  console.log(`✅ Updated skill prompt in ${promptPath}`);
  if (skills.length > 0) {
    console.log(
      `   ${skills.length} skill(s) with auto-trigger rules: ${skills.map((s) => s.name).join(', ')}`
    );
  }
}
