/**
 * Configuration for AI summarizer
 */
export interface SummarizerConfig {
  /** LLM model to use for summarization */
  model: string;
  /** Prompt template with {{output}} placeholder */
  promptTemplate: string;
}

/**
 * Default summarizer configuration
 */
export const DEFAULT_SUMMARIZER_CONFIG: SummarizerConfig = {
  model: "github-copilot/gpt-5-mini",
  promptTemplate: `You are a log summarizer. Analyze the following command output.

RULES:
1. Summarize the outcome (success/failure)
2. List any errors or warnings
3. Include key metrics if present
4. Keep summary under 500 words
5. Do NOT perform additional research or actions

OUTPUT:
{{output}}

SUMMARY:`
};

/**
 * Truncate text for LLM context window
 * Keeps beginning and end, removes middle with marker
 */
export function truncateForContext(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const half = Math.floor(maxChars / 2);
  return text.slice(0, half) + "\n\n[...truncated...]\n\n" + text.slice(-half);
}

/**
 * Summarize command output using configured LLM
 * 
 * NOTE: This is a placeholder that returns a formatted prompt.
 * Actual LLM invocation requires OpenCode plugin context which 
 * will be integrated in await-tool.ts during Wave 2.
 * 
 * @param output Command output to summarize
 * @param config Optional summarizer configuration
 * @returns Prepared prompt for LLM (or summary when integrated)
 */
export async function summarizeOutput(
  output: string,
  config: Partial<SummarizerConfig> = {}
): Promise<string> {
  const { model, promptTemplate } = { ...DEFAULT_SUMMARIZER_CONFIG, ...config };
  const truncated = truncateForContext(output, 50000);
  const prompt = promptTemplate.replace("{{output}}", truncated);
  
  // TODO: Integrate with OpenCode LLM context in Wave 2
  // For now, return the prepared prompt as placeholder
  // Actual invocation: return await ctx.llm.complete(model, prompt);
  
  return `[Summarizer prepared for model: ${model}]\n${prompt.slice(0, 200)}...`;
}