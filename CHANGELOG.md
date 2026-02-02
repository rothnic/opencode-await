# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-02-02

### Added
- Core `await_command` tool for running and monitoring long-running commands
- Poll mode for interval-based command monitoring with `pollCommand()`
- Log capture with temp file persistence via `createLogCapture()`
- AI summarization infrastructure with `summarizeOutput()` (placeholder)
- Pattern matching with success/error regex patterns
- Post-command hooks: `onSuccess` and `onFailure` commands
- Template-based output formatting with `{{status}}`, `{{elapsed}}`, `{{output}}`, etc.
- Comprehensive smoke tests for all modules
- Publishing infrastructure: lefthook, CHANGELOG, example config

### Changed
- Enhanced `AwaitCommandOptions` with poll mode, log persistence, and summarization options
- Enhanced `AwaitResult` with `logPath` and `summary` fields
- Enhanced `TemplateContext` with `logPath` variable

[Unreleased]: https://github.com/rothnic/opencode-await/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/rothnic/opencode-await/releases/tag/v0.1.0