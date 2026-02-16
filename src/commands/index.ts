import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';
import { parse as parseYaml } from 'yaml';
import { AgentType, getAgentSkillsDir } from '../detectors';
import { getAdapter, UniversalSkill } from '../adapters';
import { injectSkillPrompt } from '../injectors';

/**
 * Get the skills directory (where universal skills are stored)
 */
function getSkillsSourceDir(): string {
  // Skills are bundled with agent-evolver
  return join(__dirname, '..', '..', 'skills');
}

/**
 * Check if a directory is a valid skill directory
 */
async function isValidSkill(skillPath: string): Promise<boolean> {
  try {
    const stats = await stat(skillPath);
    if (!stats.isDirectory()) {
      return false;
    }
    
    // Check if skill.yaml exists
    const metadataPath = join(skillPath, 'skill.yaml');
    await stat(metadataPath);
    return true;
  } catch {
    return false;
  }
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
 * Get the target directory for skill installation
 */
function getTargetSkillsDir(agent: AgentType, global: boolean): string {
  if (global) {
    // Global installation: agent-specific directory
    return getAgentSkillsDir(agent);
  } else {
    // Local installation: current directory
    // Use agent-specific directory if detected, fallback to .agents
    const agentDir = agent === 'claude-code' ? '.claude' : '.agents';
    return join(process.cwd(), agentDir, 'skills');
  }
}

/**
 * Install skills for a specific agent
 */
export async function installSkills(
  agent: AgentType,
  specificSkill?: string,
  global: boolean = false
): Promise<void> {
  const skillsSourceDir = getSkillsSourceDir();
  const targetSkillsDir = getTargetSkillsDir(agent, global);
  const adapter = getAdapter(agent);

  const scope = global ? 'globally' : 'locally';
  console.log(`📦 Installing skills ${scope} to: ${targetSkillsDir}`);

  // Get list of skills to install
  let skillsToInstall: string[];
  if (specificSkill) {
    skillsToInstall = [specificSkill];
  } else {
    // Read all entries in skills directory
    const entries = await readdir(skillsSourceDir);
    
    // Filter to only valid skill directories
    const validSkills = await Promise.all(
      entries.map(async (entry) => {
        const skillPath = join(skillsSourceDir, entry);
        const isValid = await isValidSkill(skillPath);
        return isValid ? entry : null;
      })
    );
    
    skillsToInstall = validSkills.filter((skill): skill is string => skill !== null);
  }

  // Install each skill
  for (const skillName of skillsToInstall) {
    try {
      const skill = await loadSkill(skillName);
      const targetDir = join(targetSkillsDir, skillName);
      
      console.log(`📝 Installing: ${skill.name} v${skill.version}`);
      await adapter.convert(skill, targetDir);
    } catch (error) {
      console.error(`❌ Failed to install ${skillName}:`, error);
    }
  }

  console.log('\n✨ Installation complete!');
  console.log(`\n💡 Skills installed to: ${targetSkillsDir}`);
  
  if (!global && agent) {
    console.log('💡 Skills are project-specific and will be versioned with your repo');
    
    // Inject skill prompt into agent config file for local installations
    try {
      await injectSkillPrompt(process.cwd(), agent);
    } catch (error) {
      console.warn('⚠️  Failed to update agent config file:', error);
      console.warn('   Skills are installed but you may need to manually document them.');
    }
  }
  
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
