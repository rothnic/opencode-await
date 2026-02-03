---
title: Tool Options
description: Complete API reference for await_command
---

## Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `command` | string | Command to execute via `sh -c` |
| `maxDuration` | number | Max wait time in seconds (1-1800) |

## Pattern Matching

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `successPattern` | string | - | Regex indicating success |
| `errorPattern` | string | - | Regex indicating error |
| `exitCodeSuccess` | number[] | `[0]` | Exit codes considered success |

## Output Formatting

| Parameter | Type | Description |
|-----------|------|-------------|
| `outputTemplate` | string | Template for formatting output |
| `templateFile` | string | Path to template file |

### Template Variables

- `{{status}}` - success, error, timeout, cancelled
- `{{elapsed}}` - Elapsed time in seconds
- `{{output}}` - Command output
- `{{exitCode}}` - Exit code or "N/A"
- `{{matchedPattern}}` - Pattern that triggered completion
- `{{logPath}}` - Path to log file

## Post-Execution Commands

| Parameter | Type | Description |
|-----------|------|-------------|
| `onSuccess` | string | Command to run on success |
| `onFailure` | string | Command to run on failure |

## Poll Mode

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `pollMode.enabled` | boolean | `false` | Enable polling |
| `pollMode.interval` | number | `5` | Seconds between polls (1-60) |
| `pollMode.appendOutput` | boolean | `true` | Append vs replace output |

## Log Capture

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `persistLogs` | boolean | `false` | Write to temp file |

## AI Summarization

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `summarize.enabled` | boolean | `false` | Enable summarization |
| `summarize.model` | string | `github-copilot/gpt-5-mini` | Model |
