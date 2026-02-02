# opencode-await

A native OpenCode plugin that provides the `await_command` tool for waiting on command completion with configurable timeout, pattern matching, and output formatting.

## Installation

### Project-Level (recommended)

Copy or symlink to your project:

```bash
mkdir -p .opencode/plugin
ln -s /Users/nroth/workspace/opencode-await .opencode/plugin/opencode-await
```

### Global Installation

```bash
mkdir -p ~/.config/opencode/plugin
ln -s /Users/nroth/workspace/opencode-await ~/.config/opencode/plugin/opencode-await
```

### Build

```bash
cd /Users/nroth/workspace/opencode-await
bun install
bun run build
```

## Usage

The plugin exposes an `await_command` tool that agents can use:

```typescript
await_command({
  command: "gh run watch 12345 --exit-status",
  maxDuration: 600,
  successPattern: "completed.*success",
  errorPattern: "failed|cancelled"
})
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `command` | string | Yes | Command to execute (run via `sh -c`) |
| `maxDuration` | number | Yes | Maximum wait time in seconds (1-1800) |
| `successPattern` | string | No | Regex pattern indicating success in output |
| `errorPattern` | string | No | Regex pattern indicating error in output |
| `exitCodeSuccess` | number[] | No | Exit codes considered success (default: [0]) |
| `outputTemplate` | string | No | Template for formatting output |
| `templateFile` | string | No | Path to template file |
| `onSuccess` | string | No | Command to run on success |
| `onFailure` | string | No | Command to run on failure |

## Template Variables

- `{{status}}` - Completion status (success, error, timeout, cancelled)
- `{{elapsed}}` - Elapsed time in seconds
- `{{output}}` - Command output
- `{{exitCode}}` - Exit code or "N/A"
- `{{matchedPattern}}` - Pattern that triggered completion

## Example: Wait for GitHub Actions

```typescript
await_command({
  command: "gh run watch $(gh run list --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status",
  maxDuration: 900,
  successPattern: "completed successfully",
  errorPattern: "failed|cancelled|timed out",
  onSuccess: "echo 'Build passed!'",
  onFailure: "echo 'Build failed!' && gh run view --log-failed"
})
```

## Architecture

This is a **native OpenCode plugin**, not an MCP server. It integrates directly via:

```
.opencode/plugin/opencode-await/index.ts  # Plugin entry point
src/                                       # Source code
  index.ts                                 # Plugin export
  await-tool.ts                            # Tool implementation
  process-manager.ts                       # Bun.spawn wrapper
  output-formatter.ts                      # Template handling
  types.ts                                 # TypeScript definitions
```

## License

MIT
