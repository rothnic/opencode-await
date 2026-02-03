# Benchmark Test Instructions

## Purpose
Compare agent efficiency when running long commands with uncertain duration.

## Test Setup

### The Simulated Command
`./benchmark/simulate-deploy.sh` - A script that:
- Runs for 15-45 seconds (random)
- Produces verbose log output every second
- Has 80% success / 20% failure rate
- Returns exit code 0 (success) or 1 (failure)

### Metrics to Capture
1. **Tool calls** - Count of bash/await_command invocations
2. **Total messages** - Count of turns/messages in the session
3. **Wall clock time** - Time from prompt to final answer
4. **Context size** - Approximate tokens of log output in context
5. **Accuracy** - Did the agent correctly identify success/failure?

---

## Test A: WITHOUT opencode-await

### Setup
Remove opencode-await from opencode.json plugins

### Prompt
```
Run the deployment script at ./benchmark/simulate-deploy.sh

This script deploys our application. I need you to:
1. Execute the script
2. Wait for it to complete (it may take a while)
3. Tell me if it succeeded or failed
4. Summarize any warnings or errors

Important: The script duration is unpredictable. It could take 15-60 seconds.
```

### Expected Behavior
Agent will likely:
- Run the command with bash
- Get timeout or need to poll for status
- Read log files or re-run to check status
- Parse verbose output manually

### Record
- [ ] Number of tool calls: ____
- [ ] Number of messages/turns: ____
- [ ] Wall clock time: ____
- [ ] Log output in context (chars): ____
- [ ] Correct result identified: Yes/No

---

## Test B: WITH opencode-await

### Setup
Add opencode-await to opencode.json plugins

### Prompt
```
Run the deployment script at ./benchmark/simulate-deploy.sh

This script deploys our application. I need you to:
1. Execute the script
2. Wait for it to complete (it may take a while)
3. Tell me if it succeeded or failed
4. Summarize any warnings or errors

Important: The script duration is unpredictable. It could take 15-60 seconds.
```

### Expected Behavior
Agent should:
- Use await_command with the script
- Block until complete
- Receive concise success/failure status
- Optional: AI summary of output

### Record
- [ ] Number of tool calls: ____
- [ ] Number of messages/turns: ____
- [ ] Wall clock time: ____
- [ ] Log output in context (chars): ____
- [ ] Correct result identified: Yes/No

---

## Running the Tests

1. Make script executable:
   ```bash
   chmod +x benchmark/simulate-deploy.sh
   ```

2. Test the script manually first:
   ```bash
   ./benchmark/simulate-deploy.sh
   ```

3. Start OpenCode session WITHOUT plugin, run Test A prompt

4. Start NEW OpenCode session WITH plugin, run Test B prompt

5. Compare metrics

---

## Expected Results

| Metric | Without Plugin | With Plugin | Improvement |
|--------|---------------|-------------|-------------|
| Tool calls | 3-5+ | 1 | 66-80% fewer |
| Messages | 2-4+ | 1 | 50-75% fewer |
| Wall time | ~same | ~same | - |
| Context size | 2000+ chars | 200 chars | 90% smaller |
| Accuracy | Varies | Consistent | More reliable |
