# AI Agent Instructions for ScrewFast Template

This file provides guidance for AI coding agents customizing the ScrewFast template.

## Quick Start

1. **Site Configuration**: Edit `src/data_files/constants.ts` for site name, description, SEO
2. **Navigation**: Edit `src/utils/navigation.ts` for header/footer links
3. **Homepage**: Edit `src/pages/index.astro` for main content
4. **Blog/Insights**: Add content in `src/content/blog/` and `src/content/insights/`

---

## Files to MODIFY (Customize These)

### Core Configuration
| File | Purpose |
|------|---------|
| `src/data_files/constants.ts` | Site name, tagline, description, SEO metadata |
| `src/utils/navigation.ts` | Navigation links, social icons |
| `src/data_files/mega_link.ts` | Mega menu link configurations |

### Main Pages
| File | Purpose |
|------|---------|
| `src/pages/index.astro` | Homepage - hero, features, testimonials |
| `src/pages/services.astro` | Services page |
| `src/pages/contact.astro` | Contact form |
| `src/pages/products/` | Product pages |

### Content Collections
| Location | Purpose |
|----------|---------|
| `src/content/blog/*.md` | Blog posts |
| `src/content/insights/*.md` | Insight articles |
| `src/content/products/*.md` | Product details |

### Branding
| File | Purpose |
|------|---------|
| `src/images/` | Site images and logos |
| `src/data_files/constants.ts` | Partner logos (inline SVGs) |

---

## Files to KEEP (Don't Modify Unless Necessary)

These are reusable components - modifying them may break the site:

```
src/components/ui/           # UI components (buttons, cards, forms)
src/components/sections/     # Page sections
src/layouts/                 # Page layouts
src/utils/                   # Utility functions
src/content.config.ts        # Content collection schema
```

---

## Files You Can DELETE (Demo Content)

```
src/pages/fr/               # French translations (if not needed)
src/content/blog/*.md       # Demo blog posts
src/content/insights/*.md   # Demo insights
src/content/products/*.md   # Demo products
```

---

## Icon System

This template uses **custom inline SVG icons** (NOT tabler icons). Icons are defined in:
- `src/components/ui/icons/icons.ts` - Icon definitions
- `src/components/ui/icons/Icon.astro` - Icon component

To add new icons:
1. Add SVG path data to `icons.ts`
2. Use via `<Icon name="iconName" />`

---

## Multi-language Support

This template supports internationalization:
- English pages: `src/pages/`
- French pages: `src/pages/fr/`

To add a new language:
1. Create a new directory under `src/pages/` (e.g., `src/pages/es/`)
2. Copy and translate page files

---

## constants.ts Structure

```typescript
export const SITE = {
  title: "Your Company",           // CHANGE THIS
  tagline: "Your Tagline",         // CHANGE THIS
  description: "Your description", // CHANGE THIS
  url: "https://your-domain.com",  // CHANGE THIS
  author: "Your Name",             // CHANGE THIS
};

export const SEO = {
  title: SITE.title,
  description: SITE.description,
  structuredData: { /* Schema.org data */ },
};

export const OG = {
  locale: "en_US",
  type: "website",
  url: SITE.url,
  title: `${SITE.title}: Your Tagline`,
  description: "...",
  image: ogImageSrc,
};
```

---

## Build and Test

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Deployment Notes

This template is optimized for static deployment. Output goes to `dist/` folder.

Key deployment files:
- `astro.config.mjs` - Astro configuration
- No `_redirects` needed - Astro generates static HTML
