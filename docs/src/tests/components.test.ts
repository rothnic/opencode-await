import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { resolve } from 'path';

describe('Components', () => {
  describe('LazyGif', () => {
    const componentPath = resolve(process.cwd(), 'src/components/LazyGif.astro');

    it('should exist', () => {
      expect(existsSync(componentPath)).toBe(true);
    });

    it('should have proper TypeScript interface', () => {
      const content = readFileSync(componentPath, 'utf-8');
      expect(content).toContain('interface Props');
      expect(content).toContain('staticSrc:');
      expect(content).toContain('gifSrc:');
      expect(content).toContain('enableToggle?:');
    });

    it('should use Astro Image component', () => {
      const content = readFileSync(componentPath, 'utf-8');
      expect(content).toContain('import { Image } from \'astro:assets\'');
    });

    it('should have client-side script', () => {
      const content = readFileSync(componentPath, 'utf-8');
      expect(content).toContain('<script>');
      expect(content).toContain('astro:after-swap');
    });

    it('should have accessibility features', () => {
      const content = readFileSync(componentPath, 'utf-8');
      expect(content).toContain('aria-label');
      expect(content).toContain('type="button"');
    });
  });

  describe('Header', () => {
    const componentPath = resolve(process.cwd(), 'src/components/Header.astro');

    it('should exist', () => {
      expect(existsSync(componentPath)).toBe(true);
    });

    it('should have scroll effect script', () => {
      const content = readFileSync(componentPath, 'utf-8');
      expect(content).toContain('scroll');
      expect(content).toContain('scrolled');
    });

    it('should have transition styles', () => {
      const content = readFileSync(componentPath, 'utf-8');
      expect(content).toContain('transition:');
      expect(content).toContain('backdrop-filter');
    });
  });
});

function readFileSync(path: string, encoding: string): string {
  const { readFileSync: fsReadFileSync } = require('fs');
  return fsReadFileSync(path, encoding);
}
