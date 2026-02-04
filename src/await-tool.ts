import { tool } from '@opencode-ai/plugin';
import { spawnProcess, pollCommand } from './process-manager';
import { formatOutput, createTemplateContext, DEFAULT_TEMPLATE } from './output-formatter';
import { createLogCapture, type LogCapture } from './log-capture';
import { summarizeOutput } from './summarizer';
import { getExamples, type ExampleName } from './examples';
import { getProjectConfig, applyConfigDefaults } from './config';
import type {
  AwaitCommandOptions,
  AwaitResult,
  CompletionReason,
} from './types';
import {
  MAX_DURATION_SECONDS,
  DEFAULT_POLL_INTERVAL,
  MIN_POLL_INTERVAL,
  MAX_POLL_INTERVAL,
} from './types';

function tryCompileRegex(pattern: string | undefined): RegExp | null {
  if (!pattern) return null;
  try {
    return new RegExp(pattern);
  } catch {
    return null;
  }
}

async function getTemplate(
  outputTemplate: string | undefined,
  templateFile: string | undefined
): Promise<string> {
  if (outputTemplate) {
    return outputTemplate;
  }
  
  if (templateFile) {
    try {
      const file = Bun.file(templateFile);
      if (await file.exists()) {
        return await file.text();
      }
    } catch {
      // Template file not found or unreadable
    }
  }
  
  return DEFAULT_TEMPLATE;
}

async function executePostCommand(command: string | undefined): Promise<void> {
  if (!command) return;
  
  try {
    await spawnProcess({
      cmd: ['sh', '-c', command],
      timeout: 30000,
    });
  } catch {
    // Post commands are fire-and-forget
  }
}

export const awaitCommand: ReturnType<typeof tool> = tool({
  description: `Wait for a long-running task to complete instead of polling for status.

Use this tool when you need to:
- Wait for a build, deployment, or CI workflow to finish
- Run a command that takes unpredictable time to complete
- Avoid repeated polling that wastes context and API calls
- Search for a pattern in command output with "did you mean" suggestions if not found

Returns a clean, structured result with status, exit code, log path, and optional AI summary with searchable keywords. Logs auto-cleanup after 30 minutes.

Call with examples: 'all' to see usage patterns.`,

  args: {
    examples: tool.schema.enum(['gh-actions', 'build', 'deploy', 'polling', 'summarize', 'all']).optional()
      .describe('Return usage examples instead of executing. Options: gh-actions, build, deploy, polling, summarize, all'),
    command: tool.schema.string().optional().describe('Command to execute (run via sh -c). Required unless using examples.'),
    maxDuration: tool.schema.number().describe('Maximum wait time in seconds (1-1800, capped at 30 min)'),
    pollInterval: tool.schema.number().optional().describe('Not used - command runs once until completion'),
    successPattern: tool.schema.string().optional().describe('Regex pattern indicating success in output'),
    errorPattern: tool.schema.string().optional().describe('Regex pattern indicating error in output'),
    exitCodeSuccess: tool.schema.array(tool.schema.number()).optional().describe('Exit codes considered success (default: [0])'),
    outputTemplate: tool.schema.string().optional().describe('Template for formatting output. Variables: {{status}}, {{elapsed}}, {{output}}, {{exitCode}}, {{matchedPattern}}'),
    templateFile: tool.schema.string().optional().describe('Path to template file (alternative to outputTemplate)'),
    onSuccess: tool.schema.string().optional().describe('Command to run on success'),
    onFailure: tool.schema.string().optional().describe('Command to run on failure/error/timeout'),
    pollMode: tool.schema.object({
      enabled: tool.schema.boolean().describe('Enable polling mode'),
      interval: tool.schema.number().optional().describe('Poll interval in seconds (1-60, default: 5)'),
      appendOutput: tool.schema.boolean().optional().describe('Append vs replace output each poll'),
    }).optional().describe('Polling mode options'),
    persistLogs: tool.schema.boolean().optional().describe('Write output to temp file'),
    summarize: tool.schema.object({
      enabled: tool.schema.boolean().describe('Enable AI summarization'),
      model: tool.schema.string().optional().describe('Model to use (default: github-copilot/gpt-5-mini)'),
    }).optional().describe('AI summarization options'),
  },

  async execute(args, ctx) {
    if (args.examples) {
      return getExamples(args.examples as ExampleName);
    }

    if (!args.command) {
      return 'Error: command is required when not using examples parameter';
    }

    const config = getProjectConfig();
    const effectiveArgs = applyConfigDefaults(args as Record<string, unknown>, config);

    const startTime = Date.now();
    
    const options: AwaitCommandOptions = {
      command: effectiveArgs.command as string,
      maxDuration: Math.min(Math.max(effectiveArgs.maxDuration as number, 1), MAX_DURATION_SECONDS),
      pollInterval: effectiveArgs.pollInterval 
        ? Math.min(Math.max(effectiveArgs.pollInterval as number, MIN_POLL_INTERVAL), MAX_POLL_INTERVAL)
        : DEFAULT_POLL_INTERVAL,
      successPattern: effectiveArgs.successPattern as string | undefined,
      errorPattern: effectiveArgs.errorPattern as string | undefined,
      exitCodeSuccess: (effectiveArgs.exitCodeSuccess as number[] | undefined) ?? [0],
      outputTemplate: effectiveArgs.outputTemplate as string | undefined,
      templateFile: effectiveArgs.templateFile as string | undefined,
      onSuccess: effectiveArgs.onSuccess as string | undefined,
      onFailure: effectiveArgs.onFailure as string | undefined,
      pollMode: effectiveArgs.pollMode ? {
        enabled: (effectiveArgs.pollMode as Record<string, unknown>).enabled as boolean,
        interval: ((effectiveArgs.pollMode as Record<string, unknown>).interval as number | undefined) ?? DEFAULT_POLL_INTERVAL,
        appendOutput: (effectiveArgs.pollMode as Record<string, unknown>).appendOutput as boolean | undefined
      } : undefined,
      persistLogs: effectiveArgs.persistLogs as boolean | undefined,
      summarize: effectiveArgs.summarize as { enabled: boolean; model?: string; promptTemplate?: string } | undefined,
    };

    const successRegex = tryCompileRegex(options.successPattern);
    const errorRegex = tryCompileRegex(options.errorPattern);
    const template = await getTemplate(options.outputTemplate, options.templateFile);
    const timeoutMs = options.maxDuration * 1000;
    
    let logCapture: LogCapture | null = null;
    if (options.persistLogs) {
      logCapture = await createLogCapture();
    }

    let processResult: {
      exitCode: number | null;
      stdout: string;
      stderr: string;
      truncated: boolean;
      timedOut: boolean;
      cancelled: boolean;
    };
    
    let matchedPattern: string | null = null;
    let status: CompletionReason = 'error';

    if (options.pollMode?.enabled) {
      const pollResult = await pollCommand({
        command: options.command,
        interval: options.pollMode.interval ?? DEFAULT_POLL_INTERVAL,
        maxDuration: options.maxDuration,
        successPattern: successRegex ?? undefined,
        errorPattern: errorRegex ?? undefined,
        onOutput: async (chunk) => {
          if (logCapture) await logCapture.write(chunk);
        },
      });

      processResult = {
        exitCode: pollResult.exitCode,
        stdout: pollResult.output,
        stderr: '', // Poll mode combines output
        truncated: false,
        timedOut: pollResult.reason === 'timeout',
        cancelled: pollResult.reason === 'cancelled',
      };
      
      matchedPattern = pollResult.matchedPattern ?? null;
      status = pollResult.reason as CompletionReason;

    } else {
      processResult = await spawnProcess({
        cmd: ['sh', '-c', options.command],
        timeout: timeoutMs,
      });

      if (logCapture) {
         await logCapture.write(processResult.stdout + processResult.stderr);
      }

      const combinedOutput = processResult.stdout + processResult.stderr;
      
      if (processResult.cancelled) {
        status = 'cancelled';
      } else if (processResult.timedOut) {
        status = 'timeout';
      } else {
        if (successRegex) {
          const match = combinedOutput.match(successRegex);
          if (match) {
            status = 'success';
            matchedPattern = match[0];
          }
        }
        
        if (!matchedPattern && errorRegex) {
          const match = combinedOutput.match(errorRegex);
          if (match) {
            status = 'error';
            matchedPattern = match[0];
          }
        }

        if (!matchedPattern) {
          const exitCodeIsSuccess = options.exitCodeSuccess!.includes(processResult.exitCode ?? -1);
          status = exitCodeIsSuccess ? 'success' : 'error';
        }
      }
    }

    const elapsedMs = Date.now() - startTime;
    const combinedOutput = processResult.stdout + processResult.stderr;

    if (logCapture) {
      await logCapture.finalize();
    }

    let summary: string | undefined;
    let summarizeError: string | undefined;
    let searchableKeywords: string[] | undefined;
    if (options.summarize?.enabled && combinedOutput) {
       const summarizeResult = await summarizeOutput(
         combinedOutput, 
         { model: options.summarize.model },
         options.successPattern
       );
       if (summarizeResult.success) {
         summary = summarizeResult.summary;
       } else {
         summarizeError = summarizeResult.error;
       }
       searchableKeywords = summarizeResult.keywords;
    }

    const result: AwaitResult = {
      status,
      exitCode: processResult.exitCode,
      elapsedMs,
      output: combinedOutput,
      outputTruncated: processResult.truncated,
      matchedPattern,
      logPath: logCapture?.logPath,
      summary,
      summarizeError,
      searchableKeywords,
    };

    const templateContext = createTemplateContext(result);
    result.formattedOutput = formatOutput(template, templateContext);

    if (status === 'success') {
      await executePostCommand(options.onSuccess);
    } else {
      await executePostCommand(options.onFailure);
    }

    return JSON.stringify(result, null, 2);
  },
});
