import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { parse as parseYaml } from 'yaml';

const START_MARKER = '###AGENT-EVOLVER-START###';
const END_MARKER = '###AGENT-EVOLVER-END###';

export interface SkillTrigger {
  pattern: string;
}

export interface InstalledSkill {
  name: string;
  description: string;
  triggers: SkillTrigger[];
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
            const triggerLines =
              skill.triggers.length > 0
                ? skill.triggers.map((t) => `  - "${t.pattern}"`).join('\n')
                : '  - _(no triggers defined — invoke manually)_';

            return `#### \`${skill.name}\`
> ${skill.description}

**Auto-trigger when you detect ANY of:**
${triggerLines}

**How to invoke:** Read \`${agentSkillsDir}/${skill.name}/SKILL.md\` and follow its instructions immediately.`;
          })
          .join('\n\n---\n\n');

  return `${START_MARKER}
## Agent Evolver — Skill Auto-Trigger Rules

⚡ **MANDATORY BEHAVIOR**: When you detect ANY trigger pattern listed below, you MUST automatically invoke the corresponding skill — do NOT wait for the user to ask.

This is not optional. These skills exist to capture knowledge, prevent repeated mistakes, and improve over time. Invoke them proactively.

---

${skillBlocks}

---

### General Rules

- **Architectural decisions**: ANY time you choose between approaches, record it — even if the user didn't ask
- **Recurring patterns**: After solving a problem the 2nd time, extract the pattern
- **Uncertainty**: When you're about to guess or you lack guidance, surface the gap first
- **Mistakes**: When you catch a mistake, update the relevant skill with the lesson

### Updating Skills

Skills improve over time. If a skill's instructions are incomplete or wrong for this project, use the \`update-skill\` skill to fix it. Skills are living documents — your edits are encouraged.

---
*This section is managed by agent-evolver. Re-running \`agent-evolver install\` updates this block.*
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
