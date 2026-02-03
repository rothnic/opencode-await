# opencode-await

[![npm version](https://img.shields.io/npm/v/opencode-await.svg)](https://www.npmjs.com/package/opencode-await)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An OpenCode plugin that provides the `await_command` tool for waiting on command completion with configurable timeout, pattern matching, log capture, and AI summarization.

**[Documentation](https://opencode-await.nickroth.com)**

## Installation

Add to your `opencode.json`:

```json
{
  "plugin": ["opencode-await"]
}
```

Restart OpenCode and the `await_command` tool will be available.

## Quick Start

Wait for a GitHub Actions workflow:

```typescript
await_command({
  command: "gh run watch 12345 --exit-status",
  maxDuration: 600,
  successPattern: "completed.*success",
  errorPattern: "failed|cancelled"
})
```

## Features

- **Command Execution** - Run any shell command with configurable timeout (up to 30 min)
- **Pattern Matching** - Detect success/failure via regex patterns in output
- **Poll Mode** - Periodically execute commands for status checks
- **Log Capture** - Persist output to temp files for analysis
- **AI Summarization** - Get AI-powered summaries of verbose output
- **Output Templates** - Custom formatting with template variables
- **Post-Execution** - Run follow-up commands on success/failure

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `command` | string | Yes | Command to execute (via `sh -c`) |
| `maxDuration` | number | Yes | Max wait time in seconds (1-1800) |
| `successPattern` | string | No | Regex indicating success |
| `errorPattern` | string | No | Regex indicating error |
| `pollMode` | object | No | Enable periodic execution |
| `persistLogs` | boolean | No | Write output to temp file |
| `summarize` | object | No | Enable AI summarization |
| `onSuccess` | string | No | Command to run on success |
| `onFailure` | string | No | Command to run on failure |

See [full documentation](https://opencode-await.nickroth.com/api-reference/tool-options/) for all options.

## Example: CI/CD Workflow

```typescript
await_command({
  command: "gh run watch $(gh run list --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status",
  maxDuration: 900,
  successPattern: "completed successfully",
  errorPattern: "failed|cancelled|timed out",
  persistLogs: true,
  summarize: { enabled: true },
  onSuccess: "echo 'Build passed!'",
  onFailure: "gh run view --log-failed"
})
```

## Architecture

This is a **native OpenCode plugin**, not an MCP server:

```
src/
├── index.ts            # Plugin entry
├── await-tool.ts       # Tool implementation
├── process-manager.ts  # Bun.spawn wrapper
├── output-formatter.ts # Template handling
├── log-capture.ts      # Temp file persistence
├── summarizer.ts       # AI summarization
└── types.ts            # TypeScript definitions
```

## Development

```bash
git clone https://github.com/rothnic/opencode-await.git
cd opencode-await
bun install
bun test
bun run build
```

## License

MIT
