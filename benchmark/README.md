# opencode-await Benchmark

Compares agent efficiency when running long commands with uncertain duration.

## The Problem

For **message-based billing** services (Antigravity, GitHub Copilot):
- Each agent turn/message costs money or counts against limits
- Long-running commands may timeout, forcing a resume (extra message)
- Verbose output pollutes context, increasing token usage

## Test Scripts

### simulate-workflow.sh
Simulates a CI/CD pipeline (like GitHub Actions or Docker build):
- **Duration**: 180 seconds (configurable via first arg)
- **Output**: ~500 lines of verbose build logs
- **Result**: Success or failure (configurable via second arg)

```bash
./benchmark/simulate-workflow.sh 180 success   # 3-minute successful build
./benchmark/simulate-workflow.sh 180 fail      # 3-minute failed build
./benchmark/simulate-workflow.sh 60 success    # 1-minute quick test
```

### simulate-deploy.sh (legacy)
Shorter test (15-45s random duration) for quick iteration.

## Running the Benchmark

### Setup

```bash
# Create isolated test directories
mkdir -p /tmp/opencode-benchmark/{without-plugin,with-plugin}

# Copy benchmark script
cp benchmark/simulate-workflow.sh /tmp/opencode-benchmark/

# Create configs (adjust model as needed)
echo '{"model": "antigravity/antigravity-claude-sonnet-4"}' > /tmp/opencode-benchmark/without-plugin/opencode.json

echo '{"model": "antigravity/antigravity-claude-sonnet-4", "plugin": ["/path/to/opencode-await"]}' > /tmp/opencode-benchmark/with-plugin/opencode.json

# Link script to both directories
ln -sf /tmp/opencode-benchmark/simulate-workflow.sh /tmp/opencode-benchmark/without-plugin/
ln -sf /tmp/opencode-benchmark/simulate-workflow.sh /tmp/opencode-benchmark/with-plugin/
```

### Test Prompt

Use the same prompt for both tests:

```
Run the CI/CD workflow script at ./simulate-workflow.sh 180 success

This simulates a deployment pipeline. I need you to:
1. Execute the script and wait for it to complete (takes ~3 minutes)
2. Tell me if it succeeded or failed
3. Summarize any warnings that occurred

Important: The script runs for about 3 minutes. Do not timeout early.
```

### Run Tests

```bash
# Test A: WITHOUT plugin
cd /tmp/opencode-benchmark/without-plugin
time opencode run --format json "Run ./simulate-workflow.sh 180 success, wait for completion, report result"

# Test B: WITH plugin  
cd /tmp/opencode-benchmark/with-plugin
time opencode run --format json "Run ./simulate-workflow.sh 180 success, wait for completion, report result"
```

## Metrics to Compare

| Metric | Description | Why It Matters |
|--------|-------------|----------------|
| **Tool Calls** | Number of bash/await_command invocations | Fewer = simpler session |
| **Messages** | Number of turns in the session | Direct billing impact |
| **Wall Time** | Total time from prompt to answer | Should be similar |
| **Context Size** | Chars of log output in context | Token cost impact |
| **Accuracy** | Correctly identified success/failure | Reliability |
| **Log Persistence** | Was output saved to file? | Enables later analysis |

## Expected Results

### WITHOUT opencode-await
- May timeout and require resume (extra message)
- Full verbose output (~500 lines) in context
- Manual parsing of success/failure from logs
- No log file persistence

### WITH opencode-await
- Single blocking call, no resume needed
- Concise structured result in context
- Pattern matching for success/failure detection
- Logs saved to temp file for later analysis
- Optional AI summarization of output

## Key Differentiators

1. **Timeout Handling**: await_command supports up to 30 minutes; bash may timeout at 2 minutes
2. **Log Persistence**: Output saved to file, not dumped in context
3. **Structured Results**: JSON response with status, exit code, matched patterns
4. **AI Summarization**: Optional summarization via free model (Copilot)
5. **Context Cleanliness**: Concise result instead of 500 lines of logs
