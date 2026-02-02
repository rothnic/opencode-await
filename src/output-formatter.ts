import type { TemplateContext, AwaitResult } from './types.ts';

/**
 * Escape HTML special characters to prevent injection
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Format output using template with variable substitution
 * Variables: {{status}}, {{elapsed}}, {{output}}, {{exitCode}}, {{matchedPattern}}
 */
export function formatOutput(template: string, context: TemplateContext): string {
  if (!template) return '';

  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key in context) {
      const value = context[key as keyof TemplateContext];
      // Escape output content but not other fields
      if (key === 'output') {
        return escapeHtml(value);
      }
      return value;
    }
    return ''; // Unknown variable → empty string
  });
}

/**
 * Create template context from await result
 */
export function createTemplateContext(result: AwaitResult): TemplateContext {
  return {
    status: result.status,
    elapsed: (result.elapsedMs / 1000).toFixed(2),
    output: result.output,
    exitCode: result.exitCode !== null ? String(result.exitCode) : 'N/A',
    matchedPattern: result.matchedPattern ?? '',

    logPath: result.logPath ?? '',
  };
}

/**
 * Default template used when no custom template is provided
 */
export const DEFAULT_TEMPLATE = `Status: {{status}}
Elapsed: {{elapsed}}s
Exit Code: {{exitCode}}
Output:
{{output}}`;