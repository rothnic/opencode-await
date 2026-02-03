import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const DOCS_DIR = join(__dirname, '../content/docs');

describe('Documentation Structure', () => {
  it('should have index.mdx landing page', () => {
    const indexPath = join(DOCS_DIR, 'index.mdx');
    expect(existsSync(indexPath)).toBe(true);
  });

  it('should have all required getting-started pages', () => {
    const pages = ['installation.md', 'quick-start.md'];
    for (const page of pages) {
      const pagePath = join(DOCS_DIR, 'getting-started', page);
      expect(existsSync(pagePath), `Missing: ${page}`).toBe(true);
    }
  });

  it('should have all required guide pages', () => {
    const pages = ['poll-mode.md', 'log-capture.md', 'ai-summarization.md'];
    for (const page of pages) {
      const pagePath = join(DOCS_DIR, 'guides', page);
      expect(existsSync(pagePath), `Missing: ${page}`).toBe(true);
    }
  });

  it('should have all required reference pages', () => {
    const pages = ['tool-options.md', 'types.md'];
    for (const page of pages) {
      const pagePath = join(DOCS_DIR, 'reference', page);
      expect(existsSync(pagePath), `Missing: ${page}`).toBe(true);
    }
  });
});

describe('Documentation Content', () => {
  it('should have valid frontmatter in all markdown files', () => {
    const checkFrontmatter = (filePath: string) => {
      const content = readFileSync(filePath, 'utf-8');
      expect(content.startsWith('---'), `Missing frontmatter: ${filePath}`).toBe(true);
      expect(content.includes('title:'), `Missing title: ${filePath}`).toBe(true);
    };

    const files = [
      join(DOCS_DIR, 'getting-started/installation.md'),
      join(DOCS_DIR, 'getting-started/quick-start.md'),
      join(DOCS_DIR, 'guides/poll-mode.md'),
      join(DOCS_DIR, 'reference/tool-options.md'),
    ];

    for (const file of files) {
      checkFrontmatter(file);
    }
  });

  it('should have code examples in quick-start', () => {
    const content = readFileSync(join(DOCS_DIR, 'getting-started/quick-start.md'), 'utf-8');
    expect(content.includes('```typescript')).toBe(true);
    expect(content.includes('await_command')).toBe(true);
  });

  it('should document all required tool options', () => {
    const content = readFileSync(join(DOCS_DIR, 'reference/tool-options.md'), 'utf-8');
    const requiredOptions = ['command', 'maxDuration', 'successPattern', 'errorPattern', 'pollMode', 'summarize'];
    for (const opt of requiredOptions) {
      expect(content.includes(opt), `Missing option: ${opt}`).toBe(true);
    }
  });
});
