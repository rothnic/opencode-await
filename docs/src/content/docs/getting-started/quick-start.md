---
title: Quick Start
description: Get started with opencode-await in minutes
---

## Basic Usage

The `await_command` tool runs a command and waits for it to complete:

```typescript
await_command({
  command: "npm run build",
  maxDuration: 300
})
```

## Wait for GitHub Actions

The most common use case is waiting for CI/CD workflows:

```typescript
await_command({
  command: "gh run watch 12345 --exit-status",
  maxDuration: 600,
  successPattern: "completed.*success",
  errorPattern: "failed|cancelled"
})
```

## Pattern Matching

Use regex patterns to detect success or failure in the output:

```typescript
await_command({
  command: "npm test",
  maxDuration: 120,
  successPattern: "All tests passed",
  errorPattern: "FAILED|Error:"
})
```

Pattern matching ends the command early when a match is found, so you don't have to wait for the full duration.

## Post-Execution Commands

Run follow-up commands based on the result:

```typescript
await_command({
  command: "npm run build",
  maxDuration: 300,
  onSuccess: "npm run deploy",
  onFailure: "npm run notify-failure"
})
```

## Result Structure

The tool returns a JSON object with:

```json
{
  "status": "success",
  "exitCode": 0,
  "elapsedMs": 45230,
  "output": "...",
  "outputTruncated": false,
  "matchedPattern": "completed successfully"
}
```

See [Types](/api-reference/types/) for the complete result structure.
