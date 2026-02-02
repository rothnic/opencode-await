import { tmpdir } from "node:os";
import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";

/**
 * Interface for log capture with temp file persistence
 */
export interface LogCapture {
  /** Temp directory path */
  tempDir: string;
  /** Log file path */
  logPath: string;
  /** Append chunk to log file */
  write(chunk: string): Promise<void>;
  /** Finalize and return log path */
  finalize(): Promise<string>;
  /** Clean up temp directory */
  cleanup(): Promise<void>;
}

/**
 * Create a new log capture instance with temp file
 * @param prefix Prefix for temp directory name (default: "opencode-await-")
 */
export async function createLogCapture(prefix = "opencode-await-"): Promise<LogCapture> {
  const tempDir = await mkdtemp(join(tmpdir(), prefix));
  const logPath = join(tempDir, "output.log");
  let buffer = "";
  
  return {
    tempDir,
    logPath,
    async write(chunk: string) {
      buffer += chunk;
      await Bun.write(logPath, buffer);
    },
    async finalize() {
      // Ensure final write
      await Bun.write(logPath, buffer);
      return logPath;
    },
    async cleanup() {
      try {
        await Bun.$`rm -rf ${tempDir}`;
      } catch {
        // Best effort cleanup
      }
    }
  };
}