// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import rehypeMermaid from 'rehype-mermaid';

export default defineConfig({
  markdown: {
    rehypePlugins: [
      [rehypeMermaid, { strategy: 'inline-svg' }]
    ],
  },
  integrations: [
    starlight({
      title: 'opencode-await',
      social: [
        {
          label: 'GitHub',
          href: 'https://github.com/rothnic/opencode-await',
          icon: 'github',
        },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Quick Start', slug: 'getting-started/quick-start' },
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Configuration', slug: 'getting-started/configuration' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'How It Works', slug: 'guides/how-it-works' },
            { label: 'Poll Mode', slug: 'guides/poll-mode' },
          ],
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
      ],
      customCss: [
        './src/styles/custom.css',
      ],
    }),
  ],
  site: 'https://opencode-await.nickroth.com',
});
