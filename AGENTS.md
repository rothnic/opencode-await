# Agent Instructions for opencode-await

## Project Overview

OpenCode plugin for awaiting long-running commands with polling, log capture, and AI summarization.

- **Author**: Nick Roth (https://www.nickroth.com)
- **Repo**: https://github.com/rothnic/opencode-await
- **Docs**: https://opencode-await.nickroth.com

## Skills to Load

When working on this project, load these skills:

| Skill | Purpose |
|-------|---------|
| `create-opencode-plugin` | Plugin structure, publishing, hooks, testing |
| `bun-development` | Bun patterns, Bun.spawn, Bun.$, file I/O |
| `screwfast` | Astro Starlight docs setup |

## Key Skill References

### create-opencode-plugin

Location: `~/.config/opencode/skills/create-opencode-plugin/`

Critical files:
- `SKILL.md` - Main workflow
- `references/publishing.md` - npm publishing (package.json, README install)
- `references/hooks.md` - Plugin hooks
- `references/tool-helper.md` - Tool creation patterns
- `references/testing.md` - Test patterns

**Important**: Users install via `opencode.json`, NOT `npm install`:
```json
{
  "plugin": ["opencode-await"]
}
```

### bun-development

Location: `~/.config/opencode/skills/bun-development/`

Key patterns:
- `Bun.$` for simple shell commands (auto-escapes)
- `Bun.spawn` for complex process control with AbortController
- `Bun.file()` and `Bun.write()` for file I/O
- `Bun.sleep(ms)` for async delays
- Temp files: `tmpdir()` from `node:os` + `mkdtemp`

### screwfast

Location: `~/.config/opencode/skills/screwfast/`

Setup:
```bash
git clone --depth 1 https://github.com/Eng0AI/screwfast-template.git docs
cd docs && bun install && bun run dev
```

## Current Implementation Plan

See `.sisyphus/PLAN.md` for the comprehensive Phase 2 enhancement plan.

## Package.json Requirements

- `peerDependencies`: `@opencode-ai/plugin` only (NOT bun)
- `publishConfig.access`: `public`
- `files`: `["dist", "README.md", "LICENSE", "CHANGELOG.md"]`
- `prepublishOnly`: build + test

## Project Structure

```
src/
├── index.ts            # Plugin entry (exports Plugin type)
├── types.ts            # Type definitions
├── process-manager.ts  # Bun.spawn wrapper, polling
├── output-formatter.ts # Template engine
├── log-capture.ts      # Temp file persistence (Phase 2)
├── summarizer.ts       # AI summarization (Phase 2)
└── await-tool.ts       # Main tool implementation

test/
└── *.test.ts           # Bun test files

.opencode/plugin/opencode-await/
└── index.ts            # Re-exports from src for local dev
```

## Testing

```bash
bun test              # Run all tests
bun test --watch      # Watch mode
```

## Building

```bash
bun run build         # Build to dist/
bun run lint          # Check with Biome
```
