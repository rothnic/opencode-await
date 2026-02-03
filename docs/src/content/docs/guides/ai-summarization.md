---
title: AI Summarization
description: Get AI-powered summaries of command output
---

## Overview

AI summarization generates concise summaries of command output.

## Enable Summarization

```typescript
await_command({
  command: "npm run build",
  maxDuration: 300,
  summarize: { enabled: true }
})
```

## Result

```json
{
  "status": "error",
  "exitCode": 1,
  "output": "... (verbose output) ...",
  "summary": "Build failed due to TypeScript error in src/auth.ts:42"
}
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `false` | Enable summarization |
| `model` | string | `github-copilot/gpt-5-mini` | Model to use |

## Custom Model

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
  errorPattern: "error|Error",
  summarize: { enabled: true }
})
```

### Test Result Summary

```typescript
await_command({
  command: "pytest -v",
  maxDuration: 300,
  summarize: { enabled: true }
})
```
