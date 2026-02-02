import { tool } from '@opencode-ai/plugin';
import { spawnProcess, pollCommand } from './process-manager';
import { formatOutput, createTemplateContext, DEFAULT_TEMPLATE } from './output-formatter';
import { createLogCapture, type LogCapture } from './log-capture';
import { summarizeOutput } from './summarizer';
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
  description: `Wait for a command to complete with configurable timeout, pattern matching, and output formatting.

Use this tool to:
- Run a command and wait for it to complete
- Detect success/error conditions via regex patterns in output
- Get immediate notification when the command finishes (don't wait full duration)
- Execute follow-up commands on success or failure

Key use case: Wait for GitHub Actions workflows to complete:
\`\`\`
await_command({
  command: "gh run watch 12345 --exit-status",
  maxDuration: 600,
  successPattern: "completed.*success",
  errorPattern: "failed|cancelled"
})
\`\`\``,

  args: {
    command: tool.schema.string().describe('Command to execute (run via sh -c)'),
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
    const startTime = Date.now();
    
    const options: AwaitCommandOptions = {
      command: args.command,
      maxDuration: Math.min(Math.max(args.maxDuration, 1), MAX_DURATION_SECONDS),
      pollInterval: args.pollInterval 
        ? Math.min(Math.max(args.pollInterval, MIN_POLL_INTERVAL), MAX_POLL_INTERVAL)
        : DEFAULT_POLL_INTERVAL,
      successPattern: args.successPattern,
      errorPattern: args.errorPattern,
      exitCodeSuccess: args.exitCodeSuccess ?? [0],
      outputTemplate: args.outputTemplate,
      templateFile: args.templateFile,
      onSuccess: args.onSuccess,
      onFailure: args.onFailure,
      pollMode: args.pollMode ? {
        enabled: args.pollMode.enabled,
        interval: args.pollMode.interval ?? DEFAULT_POLL_INTERVAL,
        appendOutput: args.pollMode.appendOutput
      } : undefined,
      persistLogs: args.persistLogs,
      summarize: args.summarize,
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
    if (options.summarize?.enabled && combinedOutput) {
       summary = await summarizeOutput(combinedOutput, {
         model: options.summarize.model
       });
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
