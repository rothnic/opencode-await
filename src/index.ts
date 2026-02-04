import type { Plugin } from '@opencode-ai/plugin';
import { awaitCommand } from './await-tool';
import { loadProjectConfig } from './config';

const plugin: Plugin = async ({ worktree }) => {
  if (worktree) {
    await loadProjectConfig(worktree);
  }

  return {
    tool: {
      await_command: awaitCommand,
    },
  };
};

export default plugin;
