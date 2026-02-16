import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { SkillAdapter, UniversalSkill } from './index';

/**
 * Adapter for Claude Code (Anthropic's official CLI)
 * 
 * Claude Code format:
 * - Skills directory: ~/.claude/skills/[skill-name]/
 * - Main file: SKILL.md (Markdown instructions)
 * - Templates/assets: [skill-name]/templates/, [skill-name]/scripts/, etc.
 */
export const claudeCodeAdapter: SkillAdapter = {
  async convert(skill: UniversalSkill, targetDir: string): Promise<void> {
    // Create skill directory
    await mkdir(targetDir, { recursive: true });

    // Write SKILL.md (main instructions)
    const skillPath = join(targetDir, 'SKILL.md');
    await writeFile(skillPath, skill.instructions, 'utf-8');

    // Write templates if they exist
    if (skill.templates && skill.templates.size > 0) {
      const templatesDir = join(targetDir, 'templates');
      await mkdir(templatesDir, { recursive: true });

      for (const [filename, content] of skill.templates.entries()) {
        const templatePath = join(templatesDir, filename);
        await writeFile(templatePath, content, 'utf-8');
      }
    }

    console.log(`✅ Installed: ${skill.name} → ${targetDir}`);
  },
};
