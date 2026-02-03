---
title: Types
description: TypeScript type definitions for opencode-await
---

## AwaitCommandOptions

Options passed to the `await_command` tool:

```typescript
interface AwaitCommandOptions {
  /** Command to execute */
  command: string;
  
  /** Maximum duration to wait in seconds (1-1800) */
  maxDuration: number;
  
  /** Regex pattern indicating success in output */
  successPattern?: string;
  
  /** Regex pattern indicating error in output */
  errorPattern?: string;
  
  /** Exit codes considered successful (default: [0]) */
  exitCodeSuccess?: number[];
  
  /** Poll mode options */
  pollMode?: PollModeOptions;
  
  /** Persist logs to temp file */
  persistLogs?: boolean;
  
  /** AI summarization options */
  summarize?: SummarizeOptions;
  
  /** Template for formatting output */
  outputTemplate?: string;
  
  /** Path to template file */
  templateFile?: string;
  
  /** Command to run on success */
  onSuccess?: string;
  
  /** Command to run on failure */
  onFailure?: string;
}
```

## AwaitResult

Result returned by `await_command`:

```typescript
interface AwaitResult {
  /** Final status: 'success' | 'error' | 'timeout' | 'cancelled' */
  status: CompletionReason;
  
  /** Process exit code (null if process didn't exit normally) */
  exitCode: number | null;
  
  /** Time elapsed in milliseconds */
  elapsedMs: number;
  
  /** Captured stdout/stderr output */
  output: string;
  
  /** True if output was truncated (>10MB) */
  outputTruncated: boolean;
  
  /** Pattern that triggered completion */
  matchedPattern: string | null;
  
  /** Formatted output (if template provided) */
  formattedOutput?: string;
  
  /** Path to log file (if persistLogs enabled) */
  logPath?: string;
  
  /** AI-generated summary (if summarize enabled) */
  summary?: string;
}
```

## CompletionReason

```typescript
type CompletionReason = 'success' | 'error' | 'timeout' | 'cancelled';
```

## PollModeOptions

```typescript
interface PollModeOptions {
  /** Enable poll mode */
  enabled: boolean;
  
  /** Poll interval in seconds (1-60) */
  interval: number;
  
  /** Append vs replace output each poll (default: true) */
  appendOutput?: boolean;
}
```

## SummarizeOptions

```typescript
interface SummarizeOptions {
  /** Enable AI summarization */
  enabled: boolean;
  
  /** Model to use (default: github-copilot/gpt-5-mini) */
  model?: string;
}
```

## TemplateContext

Variables available in output templates:

```typescript
interface TemplateContext {
  /** Status: 'success', 'error', 'timeout', 'cancelled' */
  status: string;
  
  /** Elapsed time in seconds */
  elapsed: string;
  
  /** Command output */
  output: string;
  
  /** Exit code or "N/A" */
  exitCode: string;
  
  /** Matched pattern or empty string */
  matchedPattern: string;
  
  /** Path to log file or empty string */
  logPath: string;
}
```

## Constants

```typescript
/** Maximum output size: 10MB */
const MAX_OUTPUT_SIZE = 10 * 1024 * 1024;

/** Maximum duration: 30 minutes */
const MAX_DURATION_SECONDS = 1800;

/** Default poll interval: 5 seconds */
const DEFAULT_POLL_INTERVAL = 5;

/** Poll interval range: 1-60 seconds */
const MIN_POLL_INTERVAL = 1;
const MAX_POLL_INTERVAL = 60;
```
