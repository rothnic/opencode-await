import type { Plugin } from '@opencode-ai/plugin';
import { awaitCommand } from './await-tool';

const plugin: Plugin = async ({ project }) => {
  return {
    tool: {
      await_command: awaitCommand,
    },
  };
};

export default plugin;
