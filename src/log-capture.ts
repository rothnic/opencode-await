import { tmpdir } from "node:os";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";

const DEFAULT_TTL_MS = 30 * 60 * 1000;

export interface LogCapture {
  tempDir: string;
  logPath: string;
  write(chunk: string): Promise<void>;
  finalize(): Promise<string>;
  cleanup(): Promise<void>;
}

export async function createLogCapture(
  prefix = "opencode-await-",
  ttlMs = DEFAULT_TTL_MS
): Promise<LogCapture> {
  const tempDir = await mkdtemp(join(tmpdir(), prefix));
  const logPath = join(tempDir, "output.log");
  let buffer = "";
  let cleanupScheduled = false;
  
  const scheduleCleanup = () => {
    if (cleanupScheduled) return;
    cleanupScheduled = true;
    
    setTimeout(async () => {
      try {
        await rm(tempDir, { recursive: true, force: true });
      } catch {
        // Best effort cleanup
      }
    }, ttlMs).unref();
  };
  
  return {
    tempDir,
    logPath,
    async write(chunk: string) {
      buffer += chunk;
      await Bun.write(logPath, buffer);
    },
    async finalize() {
      await Bun.write(logPath, buffer);
      scheduleCleanup();
      return logPath;
    },
    async cleanup() {
      try {
        await rm(tempDir, { recursive: true, force: true });
        cleanupScheduled = true;
      } catch {
        // Best effort cleanup
      }
    }
  };
}
