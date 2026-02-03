---
title: Types
description: TypeScript type definitions
---

## AwaitCommandOptions

```typescript
interface AwaitCommandOptions {
  command: string;
  maxDuration: number;
  successPattern?: string;
  errorPattern?: string;
  exitCodeSuccess?: number[];
  pollMode?: PollModeOptions;
  persistLogs?: boolean;
  summarize?: SummarizeOptions;
  outputTemplate?: string;
  templateFile?: string;
  onSuccess?: string;
  onFailure?: string;
}
```

## AwaitResult

```typescript
interface AwaitResult {
  status: 'success' | 'error' | 'timeout' | 'cancelled';
  exitCode: number | null;
  elapsedMs: number;
  output: string;
  outputTruncated: boolean;
  matchedPattern: string | null;
  formattedOutput?: string;
  logPath?: string;
  summary?: string;
}
```

## PollModeOptions

```typescript
interface PollModeOptions {
  enabled: boolean;
  interval: number;  // 1-60 seconds
  appendOutput?: boolean;
}
```

## SummarizeOptions

```typescript
interface SummarizeOptions {
  enabled: boolean;
  model?: string;
}
```

## Constants

```typescript
const MAX_OUTPUT_SIZE = 10 * 1024 * 1024;  // 10MB
const MAX_DURATION_SECONDS = 1800;          // 30 min
const DEFAULT_POLL_INTERVAL = 5;
const MIN_POLL_INTERVAL = 1;
const MAX_POLL_INTERVAL = 60;
```
