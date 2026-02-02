---
title: Tool Options
description: API Reference for await_command tool options
---

## Tool Options

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
