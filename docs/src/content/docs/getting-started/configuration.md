---
title: Configuration
description: Project-specific configuration for opencode-await
---

## Project Configuration

Configure default settings for your project by creating `.opencode/await-config.json`:

```json title=".opencode/await-config.json"
{
  "summarize": {
    "enabled": true,
    "model": "github-copilot/gpt-5-mini"
  },
  "persistLogs": true,
  "maxDuration": 600,
  "pollInterval": 5
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `summarize.enabled` | boolean | `false` | Enable AI summarization by default |
| `summarize.model` | string | `github-copilot/gpt-5-mini` | LLM model for summarization |
| `persistLogs` | boolean | `false` | Save command output to temp file |
| `maxDuration` | number | `300` | Default max wait time (1-1800 seconds) |
| `pollInterval` | number | `5` | Default poll interval (1-60 seconds) |

## How It Works

1. When the plugin loads, it reads `.opencode/await-config.json` from your project root
2. These settings become defaults for all `await_command` calls
3. Tool parameters always override config defaults

## Graceful Error Handling

If the configured summarization model is unavailable:

- The command still executes successfully
- A `summarizeError` field is returned instead of `summary`
- The full output is preserved in the log file

Example response when model is unavailable:

```json
{
  "status": "success",
  "exitCode": 0,
  "logPath": "/tmp/await-cmd-abc123/output.log",
  "summarizeError": "Summarization skipped: Model 'github-copilot/gpt-5-mini' unavailable. Output saved to log file."
}
```

## Getting Examples

The tool includes built-in examples. Call with the `examples` parameter:

```typescript
await_command({ examples: "all" })
```

Available examples: `gh-actions`, `build`, `deploy`, `polling`, `summarize`, `all`
