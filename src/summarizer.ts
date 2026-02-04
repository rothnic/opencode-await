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
  keywords?: string[];
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

export function extractKeywords(output: string): string[] {
  const words = output.toLowerCase().split(/[\s\n\r\t:=,;|>]+/);
  const wordFreq = new Map<string, number>();
  
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
    'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'and', 'or', 'but', 'if', 'then', 'else', 'when', 'up', 'down',
    'out', 'off', 'over', 'under', 'again', 'further', 'once', 'here',
    'there', 'all', 'each', 'few', 'more', 'most', 'other', 'some',
    'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
    'too', 'very', 'just', 'it', 'its', 'this', 'that', 'these', 'those'
  ]);
  
  for (const word of words) {
    const cleaned = word.replace(/[^a-z0-9_\-\.]/g, '');
    if (cleaned.length >= 3 && !stopWords.has(cleaned) && !/^\d+$/.test(cleaned)) {
      wordFreq.set(cleaned, (wordFreq.get(cleaned) || 0) + 1);
    }
  }
  
  return Array.from(wordFreq.entries())
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

export function findSimilarTerms(pattern: string, output: string): string[] {
  const patternLower = pattern.toLowerCase();
  const words = new Set(output.toLowerCase().split(/[\s\n\r\t:=,;|>]+/)
    .map(w => w.replace(/[^a-z0-9_\-\.]/g, ''))
    .filter(w => w.length >= 3));
  
  const similar: Array<{ word: string; score: number }> = [];
  
  for (const word of words) {
    if (word.includes(patternLower) || patternLower.includes(word)) {
      similar.push({ word, score: 0.8 });
    } else {
      const distance = levenshteinDistance(patternLower, word);
      const maxLen = Math.max(patternLower.length, word.length);
      const similarity = 1 - distance / maxLen;
      if (similarity >= 0.5) {
        similar.push({ word, score: similarity });
      }
    }
  }
  
  return similar
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.word);
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
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
  config: Partial<SummarizerConfig> = {},
  searchPattern?: string
): Promise<SummarizeResult> {
  const { model, promptTemplate } = { ...DEFAULT_SUMMARIZER_CONFIG, ...config };
  const keywords = extractKeywords(output);
  
  try {
    const truncated = truncateForContext(output, 50000);
    const prompt = promptTemplate.replace("{{output}}", truncated);
    
    // TODO: Integrate with OpenCode LLM context
    // Actual invocation: const result = await ctx.llm.complete(model, prompt);
    
    let summary = `[Summarization pending - model: ${model}] Output captured (${output.length} chars). View full logs at logPath.`;
    
    if (searchPattern) {
      const similar = findSimilarTerms(searchPattern, output);
      if (similar.length > 0 && !output.toLowerCase().includes(searchPattern.toLowerCase())) {
        summary += ` Pattern '${searchPattern}' not found. Did you mean: ${similar.map(s => `'${s}'`).join(', ')}?`;
      }
    }
    
    return {
      success: true,
      summary,
      keywords
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
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
        error: `Summarization skipped: Model '${model}' unavailable. Output saved to log file.`,
        keywords
      };
    }
    
    return {
      success: false,
      error: `Summarization failed: ${errorMessage}. Output saved to log file.`,
      keywords
    };
  }
}