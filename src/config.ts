import { z } from 'zod';
import { join } from 'path';

export const AwaitConfigSchema = z.object({
  summarize: z.object({
    enabled: z.boolean().default(false),
    model: z.string().default('github-copilot/gpt-5-mini'),
  }).optional(),
  persistLogs: z.boolean().optional(),
  maxDuration: z.number().min(1).max(1800).optional(),
  pollInterval: z.number().min(1).max(60).optional(),
});

export type AwaitConfig = z.infer<typeof AwaitConfigSchema>;

let projectConfig: AwaitConfig | null = null;

export async function loadProjectConfig(worktree: string): Promise<AwaitConfig | null> {
  const configPath = join(worktree, '.opencode', 'await-config.json');

  try {
    const file = Bun.file(configPath);
    if (await file.exists()) {
      const raw = await file.json();
      projectConfig = AwaitConfigSchema.parse(raw);
      return projectConfig;
    }
  } catch (error) {
    console.warn(`[opencode-await] Failed to load config from ${configPath}:`, error);
  }

  return null;
}

export function getProjectConfig(): AwaitConfig | null {
  return projectConfig;
}

export function applyConfigDefaults(
  args: Record<string, unknown>,
  config: AwaitConfig | null
): Record<string, unknown> {
  if (!config) return args;

  const result = { ...args };

  if (config.summarize && result.summarize === undefined) {
    result.summarize = config.summarize;
  }

  if (config.persistLogs !== undefined && result.persistLogs === undefined) {
    result.persistLogs = config.persistLogs;
  }

  if (config.maxDuration !== undefined && result.maxDuration === undefined) {
    result.maxDuration = config.maxDuration;
  }

  if (config.pollInterval !== undefined && result.pollInterval === undefined) {
    result.pollInterval = config.pollInterval;
  }

  return result;
}
