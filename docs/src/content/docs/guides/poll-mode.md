---
title: Poll Mode
description: Periodically execute commands and capture output
---

## Overview

Poll mode repeatedly executes a command at intervals until a pattern matches or timeout.

## Basic Poll Mode

```typescript
await_command({
  command: "kubectl get pods -o wide",
  maxDuration: 300,
  pollMode: {
    enabled: true,
    interval: 10
  },
  successPattern: "Running",
  errorPattern: "CrashLoopBackOff|Error"
})
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `false` | Enable poll mode |
| `interval` | number | `5` | Seconds between polls (1-60) |
| `appendOutput` | boolean | `true` | Append vs replace output |

## Use Cases

### Kubernetes Deployment

```typescript
await_command({
  command: "kubectl rollout status deployment/myapp",
  maxDuration: 300,
  pollMode: { enabled: true, interval: 5 },
  successPattern: "successfully rolled out"
})
```

### Health Check

```typescript
await_command({
  command: "curl -s http://localhost:3000/health",
  maxDuration: 120,
  pollMode: { enabled: true, interval: 5 },
  successPattern: '"status":"healthy"'
})
```

## Comparison

| Aspect | Standard Mode | Poll Mode |
|--------|--------------|-----------|
| Execution | Once | Repeated |
| Best for | Long-running commands | Status checks |
| Pattern check | At completion | After each poll |
