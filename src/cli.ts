#!/usr/bin/env node

import { Command } from 'commander';
import { installSkills, listSkills } from './commands';
import { detectAgent } from './detectors';

const program = new Command();

program
  .name('agent-evolver')
  .description('Self-evolving agentic coding system')
  .version('0.1.0');

program
  .command('install')
  .description('Install skills for detected coding agent')
  .option('-a, --agent <type>', 'Force specific agent (claude-code, cursor, aider)')
  .option('-s, --skill <name>', 'Install specific skill (default: all)')
  .action(async (options) => {
    try {
      const agent = options.agent || (await detectAgent());
      if (!agent) {
        console.error('❌ No supported coding agent detected');
        console.error('💡 Supported: Claude Code, Cursor, Aider');
        process.exit(1);
      }

      console.log(`✅ Detected agent: ${agent}`);
      await installSkills(agent, options.skill);
    } catch (error) {
      console.error('❌ Installation failed:', error);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List available skills')
  .action(() => {
    listSkills();
  });

program
  .command('detect')
  .description('Detect installed coding agents')
  .action(async () => {
    const agent = await detectAgent();
    if (agent) {
      console.log(`✅ Detected: ${agent}`);
    } else {
      console.log('❌ No supported agents detected');
    }
  });

program.parse();
