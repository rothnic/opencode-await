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
 * Result of summarization attempt
 */
export interface SummarizeResult {
  success: boolean;
  summary?: string;
  error?: string;
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
 * Gracefully handles model unavailability
 * 
 * @param output Command output to summarize
 * @param config Optional summarizer configuration
 * @returns SummarizeResult with success status and summary or error message
 */
export async function summarizeOutput(
  output: string,
  config: Partial<SummarizerConfig> = {}
): Promise<SummarizeResult> {
  const { model, promptTemplate } = { ...DEFAULT_SUMMARIZER_CONFIG, ...config };
  
  try {
    const truncated = truncateForContext(output, 50000);
    const prompt = promptTemplate.replace("{{output}}", truncated);
    
    // TODO: Integrate with OpenCode LLM context
    // For now, return a placeholder indicating summarization is pending integration
    // Actual invocation: const result = await ctx.llm.complete(model, prompt);
    
    return {
      success: true,
      summary: `[Summarization pending - model: ${model}] Output captured (${output.length} chars). View full logs at logPath.`
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check for common model unavailability patterns
    const isModelUnavailable = 
      errorMessage.includes('model not found') ||
      errorMessage.includes('model not available') ||
      errorMessage.includes('rate limit') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('authentication') ||
      errorMessage.includes('quota exceeded') ||
      errorMessage.includes('503') ||
      errorMessage.includes('502');
    
    if (isModelUnavailable) {
      return {
        success: false,
        error: `Summarization skipped: Model '${model}' unavailable. Output saved to log file.`
      };
    }
    
    return {
      success: false,
      error: `Summarization failed: ${errorMessage}. Output saved to log file.`
    };
  }
}