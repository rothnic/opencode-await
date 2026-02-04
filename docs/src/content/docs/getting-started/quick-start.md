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

## Realistic Example: GitHub Actions Workflow

### Tool Call

```typescript
await_command({
  command: "gh run watch 9847321 --exit-status",
  maxDuration: 600,
  successPattern: "completed.*success",
  errorPattern: "failed|cancelled",
  persistLogs: true,
  summarize: { enabled: true }
})
```

### Tool Response

```json
{
  "status": "success",
  "exitCode": 0,
  "elapsedMs": 127450,
  "logPath": "/tmp/opencode-await-a1b2c3/output.log",
  "summary": "Workflow completed successfully in 2m 7s. All 3 jobs passed: lint (12s), test (45s), build (68s). No warnings or errors detected.",
  "searchableKeywords": ["lint", "test", "build", "success", "passed"],
  "output": "Refreshing run status every 3 seconds...\n✓ lint completed (12s)\n✓ test completed (45s)\n✓ build completed (68s)\nRun 9847321 completed with 'success'",
  "outputTruncated": false,
  "matchedPattern": "completed with 'success'"
}
```

## Pattern Matching with "Did You Mean" Suggestions

When searching for a specific pattern that doesn't match, the summarizer identifies similar matches:

### Tool Call

```typescript
await_command({
  command: "docker ps -a",
  maxDuration: 30,
  successPattern: "my-web-app",
  summarize: { enabled: true }
})
```

### Tool Response (Pattern Not Found)

```json
{
  "status": "error",
  "exitCode": 0,
  "elapsedMs": 1250,
  "logPath": "/tmp/opencode-await-x7y8z9/output.log",
  "summary": "Pattern 'my-web-app' not found in output. Did you mean: 'my-webapp' (container running), 'mywebapp-redis' (container exited)?",
  "searchableKeywords": ["my-webapp", "mywebapp-redis", "nginx", "postgres"],
  "matchedPattern": null
}
```

## Wait for Build with Log Capture

```typescript
await_command({
  command: "npm run build",
  maxDuration: 300,
  persistLogs: true,
  summarize: { enabled: true }
})
```

### Response

```json
{
  "status": "success",
  "exitCode": 0,
  "elapsedMs": 45230,
  "logPath": "/tmp/opencode-await-d4e5f6/output.log",
  "summary": "Build completed. 142 modules bundled (1.2MB). 2 warnings: unused import in src/utils.ts:12, deprecated API in src/api.ts:45.",
  "searchableKeywords": ["modules", "bundled", "warnings", "utils.ts", "api.ts"]
}
```

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

## Response Structure Reference

| Field | Type | Description |
|-------|------|-------------|
| `status` | `"success"` \| `"error"` \| `"timeout"` | Outcome of the command |
| `exitCode` | `number` | Process exit code |
| `elapsedMs` | `number` | Execution time in milliseconds |
| `logPath` | `string?` | Path to persisted log file (if `persistLogs: true`) |
| `summary` | `string?` | AI-generated summary (if `summarize.enabled: true`) |
| `searchableKeywords` | `string[]?` | Keywords for searching the log file |
| `summarizeError` | `string?` | Error if summarization failed |
| `output` | `string` | Command output (truncated if large) |
| `outputTruncated` | `boolean` | Whether output was truncated |
| `matchedPattern` | `string?` | The pattern that matched (if any) |
