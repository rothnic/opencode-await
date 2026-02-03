import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '../..');

describe('Build Configuration', () => {
  it('should have astro.config.mjs', () => {
    expect(existsSync(join(ROOT, 'astro.config.mjs'))).toBe(true);
  });

  it('should configure correct site URL', () => {
    const config = readFileSync(join(ROOT, 'astro.config.mjs'), 'utf-8');
    expect(config.includes('opencode-await.nickroth.com')).toBe(true);
  });

  it('should have correct sidebar structure in config', () => {
    const config = readFileSync(join(ROOT, 'astro.config.mjs'), 'utf-8');
    expect(config.includes('Getting Started')).toBe(true);
    expect(config.includes('Guides')).toBe(true);
    expect(config.includes('API Reference')).toBe(true);
  });

  it('should have custom CSS configured', () => {
    const config = readFileSync(join(ROOT, 'astro.config.mjs'), 'utf-8');
    expect(config.includes('customCss')).toBe(true);
  });
});

describe('Package Configuration', () => {
  it('should have bun-compatible scripts', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'));
    expect(pkg.scripts.build).toBe('astro build');
    expect(pkg.scripts.dev).toBe('astro dev');
    expect(pkg.scripts.test).toBeDefined();
  });

  it('should have minimal dependencies', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'));
    const deps = Object.keys(pkg.dependencies || {});
    expect(deps.length).toBeLessThanOrEqual(5);
  });
});
