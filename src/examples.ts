export type ExampleName = 'gh-actions' | 'build' | 'deploy' | 'polling' | 'summarize' | 'all';

interface Example {
  name: string;
  description: string;
  code: string;
}

const EXAMPLES: Record<Exclude<ExampleName, 'all'>, Example> = {
  'gh-actions': {
    name: 'Watch GitHub Actions Workflow',
    description: 'Wait for a CI workflow to complete and get the result',
    code: `await_command({
  command: "gh run watch 12345 --exit-status",
  maxDuration: 600,
  successPattern: "completed.*success",
  errorPattern: "failed|cancelled",
  summarize: { enabled: true }
})`,
  },
  'build': {
    name: 'Wait for Build',
    description: 'Run a build command and wait for completion with log capture',
    code: `await_command({
  command: "npm run build",
  maxDuration: 300,
  persistLogs: true,
  summarize: { enabled: true }
})`,
  },
  'deploy': {
    name: 'Wait for Deployment',
    description: 'Deploy and wait for health check confirmation',
    code: `await_command({
  command: "./deploy.sh && curl -f https://myapp.com/health",
  maxDuration: 600,
  successPattern: "healthy|ok",
  errorPattern: "error|failed|unhealthy",
  onSuccess: "echo 'Deployment successful' >> deploy.log",
  onFailure: "./rollback.sh"
})`,
  },
  'polling': {
    name: 'Poll for Status Changes',
    description: 'Repeatedly check a command until a pattern matches',
    code: `await_command({
  command: "kubectl get pods -l app=myapp -o jsonpath='{.items[0].status.phase}'",
  maxDuration: 300,
  pollMode: {
    enabled: true,
    interval: 10
  },
  successPattern: "Running",
  errorPattern: "Failed|CrashLoopBackOff"
})`,
  },
  'summarize': {
    name: 'Summarize Verbose Output',
    description: 'Run a command with verbose output and get an AI summary',
    code: `await_command({
  command: "pytest -v --tb=long",
  maxDuration: 300,
  persistLogs: true,
  summarize: {
    enabled: true,
    model: "github-copilot/gpt-5-mini"
  }
})`,
  },
};

export function getExamples(name: ExampleName): string {
  if (name === 'all') {
    const sections = Object.entries(EXAMPLES).map(([key, ex]) => {
      return `## ${ex.name}\n\n${ex.description}\n\n\`\`\`typescript\n${ex.code}\n\`\`\``;
    });
    return `# await_command Examples\n\n${sections.join('\n\n---\n\n')}`;
  }

  const example = EXAMPLES[name];
  if (!example) {
    return `Unknown example: ${name}. Available: ${Object.keys(EXAMPLES).join(', ')}, all`;
  }

  return `## ${example.name}\n\n${example.description}\n\n\`\`\`typescript\n${example.code}\n\`\`\``;
}
