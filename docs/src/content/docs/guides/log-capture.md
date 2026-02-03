---
title: Log Capture
description: Persist command output to files
---

## Overview

Log capture writes command output to a temporary file for analysis of large outputs.

## Enable Log Capture

```typescript
await_command({
  command: "npm run build",
  maxDuration: 300,
  persistLogs: true
})
```

## Result

```json
{
  "status": "success",
  "output": "...",
  "logPath": "/tmp/opencode-await-abc123/command.log"
}
```

## Use Cases

### Large Build Outputs

```typescript
await_command({
  command: "cargo build --release 2>&1",
  maxDuration: 600,
  persistLogs: true
})
```

### Test Failure Analysis

```typescript
await_command({
  command: "pytest -v --tb=long",
  maxDuration: 300,
  persistLogs: true,
  errorPattern: "FAILED"
})
```

## Combining with AI Summarization

```typescript
await_command({
  command: "npm run test:integration",
  maxDuration: 600,
  persistLogs: true,
  summarize: { enabled: true }
})
```

This gives you:
- Full log file for detailed analysis
- AI summary for quick understanding
