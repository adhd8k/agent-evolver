import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export type AgentType = 'claude-code' | 'cursor' | 'aider' | null;

/**
 * Detect which coding agent is installed
 */
export async function detectAgent(): Promise<AgentType> {
  // Check for Claude Code
  if (await isClaudeCodeInstalled()) {
    return 'claude-code';
  }

  // Check for Cursor
  if (await isCursorInstalled()) {
    return 'cursor';
  }

  // Check for Aider
  if (await isAiderInstalled()) {
    return 'aider';
  }

  return null;
}

/**
 * Check if Claude Code (official Anthropic CLI) is installed
 */
async function isClaudeCodeInstalled(): Promise<boolean> {
  try {
    // Check if 'claude' command exists
    await execAsync('which claude');
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if Cursor is installed
 */
async function isCursorInstalled(): Promise<boolean> {
  try {
    // Check if 'cursor' command exists
    await execAsync('which cursor');
    return true;
  } catch {
    // Check common installation paths
    const paths = [
      join(homedir(), '.cursor'),
      join(homedir(), 'Library', 'Application Support', 'Cursor'), // macOS
      join(homedir(), '.config', 'Cursor'), // Linux
    ];

    return paths.some((path) => existsSync(path));
  }
}

/**
 * Check if Aider is installed
 */
async function isAiderInstalled(): Promise<boolean> {
  try {
    // Check if 'aider' command exists
    await execAsync('which aider');
    return true;
  } catch {
    return false;
  }
}

/**
 * Get skills directory for a specific agent
 */
export function getAgentSkillsDir(agent: AgentType): string {
  const home = homedir();

  switch (agent) {
    case 'claude-code':
      // Claude Code uses ~/.claude/skills (assumed)
      return join(home, '.claude', 'skills');
    case 'cursor':
      // Cursor uses custom directory
      return join(home, '.cursor', 'skills');
    case 'aider':
      // Aider uses .aider directory
      return join(home, '.aider', 'skills');
    default:
      throw new Error(`Unknown agent: ${agent}`);
  }
}
