import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { parse as parseYaml } from 'yaml';
import { AgentType, getAgentSkillsDir } from '../detectors';
import { getAdapter, UniversalSkill } from '../adapters';

/**
 * Get the skills directory (where universal skills are stored)
 */
function getSkillsSourceDir(): string {
  // Skills are bundled with agent-evolver
  return join(__dirname, '..', '..', 'skills');
}

/**
 * Load a universal skill from disk
 */
async function loadSkill(skillName: string): Promise<UniversalSkill> {
  const skillDir = join(getSkillsSourceDir(), skillName);

  // Load skill.yaml metadata
  const metadataPath = join(skillDir, 'skill.yaml');
  const metadataContent = await readFile(metadataPath, 'utf-8');
  const metadata = parseYaml(metadataContent);

  // Load SKILL.md instructions
  const instructionsPath = join(skillDir, 'SKILL.md');
  const instructions = await readFile(instructionsPath, 'utf-8');

  // Load templates if they exist
  const templates = new Map<string, string>();
  const templatesDir = join(skillDir, 'templates');
  
  try {
    const templateFiles = await readdir(templatesDir);
    for (const file of templateFiles) {
      const content = await readFile(join(templatesDir, file), 'utf-8');
      templates.set(file, content);
    }
  } catch {
    // Templates directory doesn't exist, that's okay
  }

  return {
    name: metadata.name,
    version: metadata.version,
    description: metadata.description,
    metadata,
    instructions,
    templates: templates.size > 0 ? templates : undefined,
  };
}

/**
 * Install skills for a specific agent
 */
export async function installSkills(agent: AgentType, specificSkill?: string): Promise<void> {
  const skillsSourceDir = getSkillsSourceDir();
  const agentSkillsDir = getAgentSkillsDir(agent);
  const adapter = getAdapter(agent);

  console.log(`📦 Installing skills to: ${agentSkillsDir}`);

  // Get list of skills to install
  const skillsToInstall = specificSkill
    ? [specificSkill]
    : await readdir(skillsSourceDir);

  // Install each skill
  for (const skillName of skillsToInstall) {
    try {
      const skill = await loadSkill(skillName);
      const targetDir = join(agentSkillsDir, skillName);
      
      console.log(`📝 Installing: ${skill.name} v${skill.version}`);
      await adapter.convert(skill, targetDir);
    } catch (error) {
      console.error(`❌ Failed to install ${skillName}:`, error);
    }
  }

  console.log('\n✨ Installation complete!');
  console.log(`\n💡 Skills installed to: ${agentSkillsDir}`);
  
  if (agent === 'claude-code') {
    console.log('\n🔄 Restart Claude Code to load new skills');
  }
}

/**
 * List available skills
 */
export async function listSkills(): Promise<void> {
  const skillsSourceDir = getSkillsSourceDir();
  const skills = await readdir(skillsSourceDir);

  console.log('📚 Available skills:\n');

  for (const skillName of skills) {
    try {
      const metadataPath = join(skillsSourceDir, skillName, 'skill.yaml');
      const metadataContent = await readFile(metadataPath, 'utf-8');
      const metadata = parseYaml(metadataContent);

      console.log(`  • ${metadata.name} (v${metadata.version})`);
      console.log(`    ${metadata.description}`);
      console.log('');
    } catch {
      // Skip non-skill directories
    }
  }
}
