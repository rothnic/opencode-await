/**
 * Completion reason for await_command
 */
export type CompletionReason = 'success' | 'error' | 'timeout' | 'cancelled';

/**
 * Options for poll mode execution
 */
export interface PollModeOptions {
  /** Whether poll mode is enabled */
  enabled: boolean;
  /** Poll interval in seconds (1-60) */
  interval: number;
  /** Optional: separate tail command */
  tailCommand?: string;
  /** Append vs replace each poll (default: true) */
  appendOutput?: boolean;
}

/**
 * Options for AI summarization
 */
export interface SummarizeOptions {
  /** Whether summarization is enabled */
  enabled: boolean;
  /** Model to use for summarization (default: github-copilot/gpt-5-mini) */
  model?: string;
  /** Custom prompt template */
  promptTemplate?: string;
}

/**
 * Configuration for log capture
 */
export interface LogCaptureConfig {
  /** Temporary directory for logs */
  tempDir: string;
  /** Path to log file */
  logPath: string;
}

/**
 * Options for await_command tool
 */
export interface AwaitCommandOptions {
  /** Command to execute */
  command: string;
  /** Maximum duration to wait in seconds (1-1800, capped at 30 min) */
  maxDuration: number;
  /** Polling interval in seconds (default: 5, min: 1, max: 60) */
  pollInterval?: number;
  /** Regex pattern that indicates success when matched in output */
  successPattern?: string;
  /** Regex pattern that indicates error when matched in output */
  errorPattern?: string;
  /** Exit codes considered successful (default: [0]) */
  exitCodeSuccess?: number[];

  /** Poll mode options */
  pollMode?: PollModeOptions;

  /** Whether to persist logs to temp file (default: false) */
  persistLogs?: boolean;

  /** Custom log path (optional) */
  logPath?: string;

  /** AI summarization options */
  summarize?: SummarizeOptions;
  /** Template string for formatting output */
  outputTemplate?: string;
  /** Path to template file (alternative to outputTemplate) */
  templateFile?: string;
  /** Command to execute on success */
  onSuccess?: string;
  /** Command to execute on failure/error/timeout */
  onFailure?: string;
}

/**
 * Result returned by await_command tool
 */
export interface AwaitResult {
  /** Final status of the await operation */
  status: CompletionReason;
  /** Process exit code (null if process didn't exit normally) */
  exitCode: number | null;
  /** Time elapsed in milliseconds */
  elapsedMs: number;
  /** Captured stdout/stderr output */
  output: string;
  /** True if output was truncated due to size limit (10MB) */
  outputTruncated: boolean;
  /** Pattern that matched (if successPattern or errorPattern triggered completion) */
  matchedPattern: string | null;
  /** Formatted output using template (if template was provided) */
  formattedOutput?: string;

  /** Path to persisted log file */
  logPath?: string;

  /** AI-generated summary */
  summary?: string;

  /** Error message if summarization failed (model unavailable, etc.) */
  summarizeError?: string;

  /** Searchable keywords extracted from the log for querying */
  searchableKeywords?: string[];
}

/**
 * Options for spawning a process via Bun
 */
export interface ProcessOptions {
  /** Command to execute (as array of strings) */
  cmd: string[];
  /** Working directory */
  cwd?: string;
  /** Environment variables */
  env?: Record<string, string>;
  /** Timeout in milliseconds */
  timeout?: number;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
}

/**
 * Result from process execution
 */
export interface ProcessResult {
  /** Exit code (null if killed/crashed) */
  exitCode: number | null;
  /** Combined stdout output */
  stdout: string;
  /** Combined stderr output */
  stderr: string;
  /** True if output was truncated */
  truncated: boolean;
  /** True if process timed out */
  timedOut: boolean;
  /** True if process was cancelled via signal */
  cancelled: boolean;
}

/**
 * Context for template variable substitution
 */
export interface TemplateContext {
  /** Status as string: 'success', 'error', 'timeout', 'cancelled' */
  status: string;
  /** Elapsed time in seconds (formatted) */
  elapsed: string;
  /** Process output */
  output: string;
  /** Exit code as string */
  exitCode: string;
  /** Matched pattern or empty string */
  matchedPattern: string;

  /** Path to log file or empty string */
  logPath: string;
}

/** Maximum output size in bytes (10MB) */
export const MAX_OUTPUT_SIZE = 10 * 1024 * 1024;

/** Maximum duration in seconds (30 minutes) */
export const MAX_DURATION_SECONDS = 1800;

/** Default poll interval in seconds */
export const DEFAULT_POLL_INTERVAL = 5;

/** Minimum poll interval in seconds */
export const MIN_POLL_INTERVAL = 1;

/** Maximum poll interval in seconds */
export const MAX_POLL_INTERVAL = 60;