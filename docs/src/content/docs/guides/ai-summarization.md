---
title: AI Summarization
description: Get AI-powered summaries of command output
---

## Overview

AI summarization uses a language model to generate concise summaries of command output, making it easier to understand build failures, test results, and other verbose output.

## Enabling Summarization

Add the `summarize` option:

```typescript
await_command({
  command: "npm run build",
  maxDuration: 300,
  summarize: {
    enabled: true
  }
})
```

## Result with Summary

When summarization is enabled, the result includes a `summary` field:

```json
{
  "status": "error",
  "exitCode": 1,
  "output": "... (verbose build output) ...",
  "summary": "Build failed due to TypeScript error in src/auth.ts:42 - Property 'token' does not exist on type 'User'. The error suggests a missing interface property."
}
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `false` | Enable AI summarization |
| `model` | string | `github-copilot/gpt-5-mini` | Model to use |

## Custom Model

Specify a different model for summarization:

```typescript
await_command({
  command: "cargo test",
  maxDuration: 300,
  summarize: {
    enabled: true,
    model: "anthropic/claude-3-haiku"
  }
})
```

## Use Cases

### Build Failure Analysis

```typescript
await_command({
  command: "npm run build",
  maxDuration: 300,
  errorPattern: "error|Error|ERROR",
  summarize: {
    enabled: true
  }
})
```

The summary will highlight the key errors without wading through hundreds of lines of output.

### Test Result Summary

```typescript
await_command({
  command: "pytest -v",
  maxDuration: 300,
  summarize: {
    enabled: true
  }
})
```

Get a quick overview: "24 tests passed, 2 failed. Failures in test_auth.py: test_login_invalid_password and test_session_expired due to mock configuration issues."

### Deployment Status

```typescript
await_command({
  command: "kubectl apply -f . && kubectl rollout status deployment/app",
  maxDuration: 300,
  summarize: {
    enabled: true
  }
})
```

## Performance Considerations

- Summarization adds latency (model inference time)
- Large outputs consume more tokens
- Consider using with `persistLogs: true` for full output access

## Combining Features

For comprehensive output handling:

```typescript
await_command({
  command: "npm run test:e2e",
  maxDuration: 600,
  persistLogs: true,      // Full logs to file
  summarize: {
    enabled: true         // AI summary for quick understanding
  },
  outputTemplate: "## {{status}}\n\n{{summary}}\n\nFull logs: {{logPath}}"
})
```
