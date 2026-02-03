---
title: Installation
description: How to install the opencode-await plugin
---

## Installation

Add the plugin to your OpenCode configuration:

```json title="opencode.json"
{
  "plugin": ["opencode-await"]
}
```

Restart OpenCode and the `await_command` tool will be available.

## Requirements

- [OpenCode](https://opencode.ai) v0.1.0 or later
- [Bun](https://bun.sh) runtime (used internally by OpenCode)

## Verification

After installation, verify the plugin is loaded:

```
What tools do you have available?
```

You should see `await_command` in the list.

## Development Installation

For local development:

```bash
git clone https://github.com/rothnic/opencode-await.git
cd opencode-await
bun install
bun run build
```

Then symlink to your project:

```bash
mkdir -p .opencode/plugin
ln -s /path/to/opencode-await .opencode/plugin/opencode-await
```
