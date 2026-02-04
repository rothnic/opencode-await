// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

export default defineConfig({
  integrations: [
    starlight({
      title: 'opencode-await',
      social: {
        github: 'https://github.com/rothnic/opencode-await',
      },
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
    mermaid(),
  ],
  site: 'https://opencode-await.nickroth.com',
});
  integrations: [
    starlight({
      title: 'opencode-await',
      description: 'OpenCode plugin for awaiting long-running commands',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/rothnic/opencode-await' },
      ],
      customCss: ['./src/styles/custom.css'],
      expressiveCode: {
        themes: ['github-dark-high-contrast', 'github-light-high-contrast'],
      },
      components: {
        Head: './src/components/Head.astro',
        Header: './src/components/Header.astro',
        Sidebar: './src/components/Sidebar.astro',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Quick Start', slug: 'getting-started/quick-start' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'How It Works', slug: 'guides/how-it-works' },
            { label: 'Poll Mode', slug: 'guides/poll-mode' },
            { label: 'Log Capture', slug: 'guides/log-capture' },
            { label: 'AI Summarization', slug: 'guides/ai-summarization' },
          ],
        },
        {
          label: 'API Reference',
          items: [
            { label: 'Tool Options', slug: 'reference/tool-options' },
            { label: 'Types', slug: 'reference/types' },
          ],
        },
      ],
    }),
  ],
});
