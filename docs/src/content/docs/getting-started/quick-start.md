---
title: Quick Start
description: Start using opencode-await quickly
---

## Quick Start

The plugin exposes an `await_command` tool that agents can use:

```typescript
await_command({
  command: "gh run watch 12345 --exit-status",
  maxDuration: 600,
  successPattern: "completed.*success",
  errorPattern: "failed|cancelled"
})
```
