---
title: How It Works
description: State machine diagram and execution flow of opencode-await
---

The `await_command` tool operates as a state machine that handles command execution, monitoring, and result processing. It supports two primary modes: **Blocking** (single execution) and **Polling** (repeated execution).

## State Machine Diagram

```mermaid
stateDiagram-v2
    direction TB
    
    [*] --> Start
    Start --> ModeCheck: Validate Arguments

    state "Blocking Mode (Default)" as Blocking {
        Spawn --> AwaitExit: Execute Command
        AwaitExit --> Analyze: Process Finished
        Analyze --> Match: Check Output & Exit Code
    }

    state "Polling Mode" as Polling {
        Loop --> PollRun: Interval Start
        PollRun --> PollCheck: Run & Capture Output
        PollCheck --> Wait: No Match Found
        Wait --> Loop: Sleep (pollInterval)
    }

    ModeCheck --> Blocking: Poll Disabled
    ModeCheck --> Polling: Poll Enabled

    Match --> Success: Success Pattern / Exit 0
    Match --> Failure: Error Pattern / Non-0 Exit
    
    PollCheck --> Success: Success Pattern Found
    PollCheck --> Failure: Error Pattern Found
    PollCheck --> Failure: Timeout / Max Duration

    state "Result Processing" as Result {
        Success --> Hooks: Run onSuccess
        Failure --> Hooks: Run onFailure
        Hooks --> Summarize: AI Summary (if enabled)
        Summarize --> [*]: Return JSON Result
    }
```

## Execution Flow

### 1. Initialization
The tool validates input arguments, checking for required fields and applying configuration defaults from `.opencode/await-config.json`.

### 2. Execution Mode

#### Blocking Mode
Used for commands that run once and finish (e.g., builds, tests).
- Spawns the process and waits for it to exit naturally.
- Checks exit code (default 0 = success).
- Scans output for `successPattern` or `errorPattern` if provided.

#### Polling Mode
Used for checking status repeatedly (e.g., `kubectl get pods`, `gh run watch`).
- Runs the command in a loop with a defined `pollInterval`.
- Accumulates output across attempts.
- Stops immediately if a pattern matches or timeout is reached.
- Also stops if the command completes successfully without a pattern match (new behavior).

### 3. Result Processing
- **Hooks**: Executes `onSuccess` or `onFailure` commands if defined.
- **Summarization**: If enabled, sends output to the AI model to generate a concise summary and extract keywords.
- **Log Persistence**: Saves full output to a temporary file (auto-cleaned after 30 mins).
- **Return**: Delivers a structured JSON response to the agent.
