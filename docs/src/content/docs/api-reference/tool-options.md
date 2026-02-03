---
title: Tool Options
description: Complete API reference for await_command tool options
---

## Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `command` | string | Command to execute (run via `sh -c`) |
| `maxDuration` | number | Maximum wait time in seconds (1-1800, capped at 30 min) |

## Pattern Matching

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `successPattern` | string | - | Regex pattern indicating success in output |
| `errorPattern` | string | - | Regex pattern indicating error in output |
| `exitCodeSuccess` | number[] | `[0]` | Exit codes considered success |

## Output Formatting

| Parameter | Type | Description |
|-----------|------|-------------|
| `outputTemplate` | string | Template for formatting output |
| `templateFile` | string | Path to template file (alternative to outputTemplate) |

### Template Variables

- `{{status}}` - Completion status (success, error, timeout, cancelled)
- `{{elapsed}}` - Elapsed time in seconds
- `{{output}}` - Command output
- `{{exitCode}}` - Exit code or "N/A"
- `{{matchedPattern}}` - Pattern that triggered completion
- `{{logPath}}` - Path to log file (if enabled)

## Post-Execution Commands

| Parameter | Type | Description |
|-----------|------|-------------|
| `onSuccess` | string | Command to run on success |
| `onFailure` | string | Command to run on failure/error/timeout |

## Poll Mode

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `pollMode.enabled` | boolean | `false` | Enable polling mode |
| `pollMode.interval` | number | `5` | Seconds between polls (1-60) |
| `pollMode.appendOutput` | boolean | `true` | Append vs replace output each poll |

## Log Capture

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `persistLogs` | boolean | `false` | Write output to temp file |

## AI Summarization

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `summarize.enabled` | boolean | `false` | Enable AI summarization |
| `summarize.model` | string | `github-copilot/gpt-5-mini` | Model to use |

## Complete Example

```typescript
await_command({
  // Required
  command: "npm run test:e2e",
  maxDuration: 600,
  
  // Pattern matching
  successPattern: "All tests passed",
  errorPattern: "FAILED|Error:",
  exitCodeSuccess: [0],
  
  // Poll mode
  pollMode: {
    enabled: true,
    interval: 10
  },
  
  // Log capture
  persistLogs: true,
  
  // AI summarization
  summarize: {
    enabled: true,
    model: "anthropic/claude-3-haiku"
  },
  
  // Output formatting
  outputTemplate: "## {{status}}\n\n{{summary}}\n\nLogs: {{logPath}}",
  
  // Post-execution
  onSuccess: "echo 'Tests passed!'",
  onFailure: "npm run notify-failure"
})
```
