import { ProcessOptions, ProcessResult, MAX_OUTPUT_SIZE, PollModeOptions } from './types';

async function readStreamWithLimit(
  stream: ReadableStream<Uint8Array> | null | undefined,
  maxSize: number
): Promise<{ content: string; truncated: boolean }> {
  if (!stream) {
    return { content: '', truncated: false };
  }

  const decoder = new TextDecoder();
  let content = '';
  let truncated = false;

  try {
    for await (const chunk of stream) {
      const text = decoder.decode(chunk, { stream: true });

      if (content.length + text.length > maxSize) {
        const remaining = maxSize - content.length;
        content += text.slice(0, remaining);
        truncated = true;
        break;
      }

      content += text;
    }

    content += decoder.decode(undefined, { stream: false });
  } catch {
    // Stream may be closed or errored - we keep what we captured
  }

  return { content, truncated };
}

export async function spawnProcess(options: ProcessOptions): Promise<ProcessResult> {
  const { cmd, cwd, env, timeout, signal } = options;

  const timeoutController = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let timedOut = false;
  let cancelled = false;

  if (signal?.aborted) {
    return {
      exitCode: null,
      stdout: '',
      stderr: '',
      truncated: false,
      timedOut: false,
      cancelled: true,
    };
  }

  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  if (timeout && timeout > 0) {
    timeoutId = setTimeout(() => {
      timedOut = true;
      timeoutController.abort();
    }, timeout);
  }

  const onExternalAbort = () => {
    cancelled = true;
    timeoutController.abort();
  };
  signal?.addEventListener('abort', onExternalAbort);

  let proc: ReturnType<typeof Bun.spawn> | null = null;

  try {
    proc = Bun.spawn(cmd, {
      cwd: cwd || process.cwd(),
      env: { ...process.env, ...env },
      stdout: 'pipe',
      stderr: 'pipe',
    });

    const stdoutStream = proc.stdout as ReadableStream<Uint8Array> | undefined;
    const stderrStream = proc.stderr as ReadableStream<Uint8Array> | undefined;

    const [stdoutResult, stderrResult] = await Promise.all([
      readStreamWithLimit(stdoutStream, MAX_OUTPUT_SIZE),
      readStreamWithLimit(stderrStream, MAX_OUTPUT_SIZE),
    ]);

    if (combinedSignal.aborted) {
      try {
        proc.kill('SIGTERM');
      } catch {
        // Process may already be dead
      }

      const killTimeout = setTimeout(() => {
        try {
          proc?.kill('SIGKILL');
        } catch {
          // Process may already be dead
        }
      }, 5000);

      const exitCode = await proc.exited;
      clearTimeout(killTimeout);

      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      return {
        exitCode,
        stdout: stdoutResult.content,
        stderr: stderrResult.content,
        truncated: stdoutResult.truncated || stderrResult.truncated,
        timedOut,
        cancelled,
      };
    }

    const exitCode = await proc.exited;

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    return {
      exitCode,
      stdout: stdoutResult.content,
      stderr: stderrResult.content,
      truncated: stdoutResult.truncated || stderrResult.truncated,
      timedOut: false,
      cancelled: false,
    };
  } catch (error) {
    return {
      exitCode: null,
      stdout: '',
      stderr: error instanceof Error ? error.message : String(error),
      truncated: false,
      timedOut,
      cancelled,
    };
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    signal?.removeEventListener('abort', onExternalAbort);

    if (proc && combinedSignal.aborted) {
      try {
        proc.kill('SIGKILL');
      } catch {
        // Process may already be dead
      }
    }
  }
}

export interface PollOptions {
  command: string;
  interval: number;
  maxDuration: number;
  successPattern?: RegExp;
  errorPattern?: RegExp;
  onOutput?: (chunk: string) => void;
  signal?: AbortSignal;
  exitOnComplete?: boolean;
}

export interface PollResult {
  exitCode: number | null;
  output: string;
  reason: 'success' | 'error' | 'timeout' | 'cancelled' | 'completed';
  matchedPattern?: string;
}

export async function pollCommand(options: PollOptions): Promise<PollResult> {
  const startTime = Date.now();
  let output = "";
  let lastExitCode: number | null = 0;
  const exitOnComplete = options.exitOnComplete ?? true;
  
  while (true) {
    const elapsed = (Date.now() - startTime) / 1000;
    if (elapsed >= options.maxDuration) {
      return { exitCode: lastExitCode, output, reason: "timeout" };
    }
    
    if (options.signal?.aborted) {
      return { exitCode: lastExitCode, output, reason: "cancelled" };
    }
    
    const remainingMs = (options.maxDuration * 1000) - (Date.now() - startTime);
    const execTimeout = Math.min(options.interval * 1000, remainingMs, 30000);
    
    const result = await spawnProcess({
      cmd: ['sh', '-c', options.command],
      timeout: execTimeout,
    });
    
    const chunk = result.stdout + result.stderr;
    output += chunk;
    lastExitCode = result.exitCode;
    options.onOutput?.(chunk);
    
    if (options.successPattern?.test(output)) {
      const match = output.match(options.successPattern);
      return { 
        exitCode: 0, 
        output, 
        reason: "success", 
        matchedPattern: match?.[0] 
      };
    }
    
    if (options.errorPattern?.test(output)) {
      const match = output.match(options.errorPattern);
      return { 
        exitCode: 1, 
        output, 
        reason: "error", 
        matchedPattern: match?.[0] 
      };
    }
    
    if (exitOnComplete && result.exitCode !== null && !result.timedOut) {
      return {
        exitCode: result.exitCode,
        output,
        reason: "completed"
      };
    }
    
    await Bun.sleep(options.interval * 1000);
  }
}
