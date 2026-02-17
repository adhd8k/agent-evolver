import { injectSkillPrompt, InstalledSkill } from './index';
import { writeFile, readFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { tmpdir } from 'os';

describe('injectSkillPrompt', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create a unique temp directory for each test
    testDir = join(tmpdir(), `agent-evolver-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up temp directory
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  it('creates CLAUDE.md for claude-code agent when file does not exist', async () => {
    const skills: InstalledSkill[] = [
      {
        name: 'test-skill',
        description: 'A test skill',
        triggers: [{ pattern: 'test trigger' }],
        completionCheck: 'Did I test?',
      },
    ];

    await injectSkillPrompt(testDir, 'claude-code', skills);

    const claudeMdPath = join(testDir, 'CLAUDE.md');
    expect(existsSync(claudeMdPath)).toBe(true);

    const content = await readFile(claudeMdPath, 'utf-8');
    expect(content).toContain('# CLAUDE.md');
    expect(content).toContain('test-skill');
    expect(content).toContain('A test skill');
    expect(content).toContain('test trigger');
    expect(content).toContain('Did I test?');
  });

  it('creates AGENTS.md for unknown agent types', async () => {
    const skills: InstalledSkill[] = [];

    await injectSkillPrompt(testDir, 'unknown-agent', skills);

    const agentsMdPath = join(testDir, 'AGENTS.md');
    expect(existsSync(agentsMdPath)).toBe(true);

    const content = await readFile(agentsMdPath, 'utf-8');
    expect(content).toContain('# Agent Instructions');
  });

  it('creates .cursorrules for cursor agent', async () => {
    const skills: InstalledSkill[] = [];

    await injectSkillPrompt(testDir, 'cursor', skills);

    const cursorPath = join(testDir, '.cursorrules');
    expect(existsSync(cursorPath)).toBe(true);
  });

  it('creates .aider.md for aider agent', async () => {
    const skills: InstalledSkill[] = [];

    await injectSkillPrompt(testDir, 'aider', skills);

    const aiderPath = join(testDir, '.aider.md');
    expect(existsSync(aiderPath)).toBe(true);
  });

  it('includes autonomy preferences checkpoint in generated content', async () => {
    const skills: InstalledSkill[] = [];

    await injectSkillPrompt(testDir, 'claude-code', skills);

    const content = await readFile(join(testDir, 'CLAUDE.md'), 'utf-8');
    expect(content).toContain('autonomy-preferences');
    expect(content).toContain('Before asking user for approval');
  });

  it('updates existing file with markers', async () => {
    const claudeMdPath = join(testDir, 'CLAUDE.md');
    const existingContent = `# My Project

Some existing content.

###AGENT-EVOLVER-START###
Old content
###AGENT-EVOLVER-END###

More content after.
`;
    await writeFile(claudeMdPath, existingContent, 'utf-8');

    const skills: InstalledSkill[] = [
      {
        name: 'new-skill',
        description: 'A new skill',
        triggers: [],
      },
    ];

    await injectSkillPrompt(testDir, 'claude-code', skills);

    const content = await readFile(claudeMdPath, 'utf-8');
    expect(content).toContain('# My Project');
    expect(content).toContain('Some existing content.');
    expect(content).toContain('More content after.');
    expect(content).toContain('new-skill');
    expect(content).not.toContain('Old content');
  });

  it('appends to existing file without markers', async () => {
    const claudeMdPath = join(testDir, 'CLAUDE.md');
    const existingContent = `# My Project

Some existing content without markers.
`;
    await writeFile(claudeMdPath, existingContent, 'utf-8');

    await injectSkillPrompt(testDir, 'claude-code', []);

    const content = await readFile(claudeMdPath, 'utf-8');
    expect(content).toContain('# My Project');
    expect(content).toContain('Some existing content without markers.');
    expect(content).toContain('###AGENT-EVOLVER-START###');
  });

  it('shows message when no skills installed', async () => {
    await injectSkillPrompt(testDir, 'claude-code', []);

    const content = await readFile(join(testDir, 'CLAUDE.md'), 'utf-8');
    expect(content).toContain('No skills installed yet');
  });

  it('formats phrase triggers correctly', async () => {
    const skills: InstalledSkill[] = [
      {
        name: 'phrase-skill',
        description: 'Skill with phrases',
        triggers: [
          { pattern: 'first phrase' },
          { pattern: 'second phrase' },
        ],
      },
    ];

    await injectSkillPrompt(testDir, 'claude-code', skills);

    const content = await readFile(join(testDir, 'CLAUDE.md'), 'utf-8');
    expect(content).toContain('**Phrase triggers**');
    expect(content).toContain('"first phrase"');
    expect(content).toContain('"second phrase"');
  });

  it('formats action triggers correctly', async () => {
    const skills: InstalledSkill[] = [
      {
        name: 'action-skill',
        description: 'Skill with actions',
        triggers: [
          { action: 'Starting implementation' },
          { action: 'Making a decision' },
        ],
      },
    ];

    await injectSkillPrompt(testDir, 'claude-code', skills);

    const content = await readFile(join(testDir, 'CLAUDE.md'), 'utf-8');
    expect(content).toContain('**Action triggers**');
    expect(content).toContain('Starting implementation');
    expect(content).toContain('Making a decision');
  });

  it('builds completion checklist from skills', async () => {
    const skills: InstalledSkill[] = [
      {
        name: 'skill-with-check',
        description: 'Has completion check',
        triggers: [],
        completionCheck: 'Did I complete the check?',
      },
      {
        name: 'skill-without-check',
        description: 'No completion check',
        triggers: [],
      },
    ];

    await injectSkillPrompt(testDir, 'claude-code', skills);

    const content = await readFile(join(testDir, 'CLAUDE.md'), 'utf-8');
    expect(content).toContain('Did I complete the check?');
    expect(content).toContain('skill-with-check');
  });
});
