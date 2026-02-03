---
title: Log Capture
description: Persist command output to files for later analysis
---

## Overview

Log capture writes command output to a temporary file, enabling analysis of large outputs and post-mortem debugging.

## Enabling Log Capture

Set `persistLogs: true` to capture output:

```typescript
await_command({
  command: "npm run build",
  maxDuration: 300,
  persistLogs: true
})
```

## Result with Log Path

When log capture is enabled, the result includes the log file path:

```json
{
  "status": "success",
  "exitCode": 0,
  "output": "...",
  "logPath": "/tmp/opencode-await-abc123/command.log"
}
```

## Use Cases

### Large Build Outputs

Build commands can produce megabytes of output. Log capture preserves the full output while the `output` field may be truncated:

```typescript
await_command({
  command: "cargo build --release 2>&1",
  maxDuration: 600,
  persistLogs: true
})
```

### Test Failure Analysis

Capture test output for detailed failure analysis:

```typescript
await_command({
  command: "pytest -v --tb=long",
  maxDuration: 300,
  persistLogs: true,
  errorPattern: "FAILED"
})
```

### Deployment Logs

Keep a record of deployment operations:

```typescript
await_command({
  command: "kubectl apply -f deployment.yaml",
  maxDuration: 120,
  persistLogs: true
})
```

## Log File Location

Logs are stored in the system temp directory:

```
/tmp/opencode-await-{random}/command.log
```

The directory is created fresh for each command. Logs persist until system temp cleanup.

## Combining with AI Summarization

Log capture works well with AI summarization for large outputs:

```typescript
await_command({
  command: "npm run test:integration",
  maxDuration: 600,
  persistLogs: true,
  summarize: {
    enabled: true
  }
})
```

This gives you:
- **Full log file** for detailed analysis
- **AI summary** for quick understanding
- **Truncated output** in the immediate result
