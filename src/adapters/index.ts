import { AgentType } from '../detectors';
import { claudeCodeAdapter } from './claude-code';

export interface UniversalSkill {
  name: string;
  version: string;
  description: string;
  metadata: {
    [key: string]: any;
  };
  instructions: string;
  templates?: Map<string, string>;
}

export interface SkillAdapter {
  /**
   * Convert universal skill format to agent-specific format
   */
  convert(skill: UniversalSkill, targetDir: string): Promise<void>;
}

/**
 * Get the appropriate adapter for an agent
 */
export function getAdapter(agent: AgentType): SkillAdapter {
  switch (agent) {
    case 'claude-code':
      return claudeCodeAdapter;
    case 'cursor':
      throw new Error('Cursor adapter not yet implemented');
    case 'aider':
      throw new Error('Aider adapter not yet implemented');
    default:
      throw new Error(`No adapter for agent: ${agent}`);
  }
}
