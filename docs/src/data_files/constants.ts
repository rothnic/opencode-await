import ogImageSrc from "@images/social.png";



export const SITE = {
  title: "opencode-await",
  tagline: "Monitor long-running commands with intelligence",
  description: "OpenCode plugin for awaiting long-running commands with polling, log capture, and AI summarization.",
  description_short: "OpenCode plugin for awaiting long-running commands.",
  url: "https://opencode-await.nickroth.com",
  author: "Nick Roth",
};

export const SEO = {
  title: SITE.title,
  description: SITE.description,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    inLanguage: "en-US",
    "@id": SITE.url,
    url: SITE.url,
    name: SITE.title,
    description: SITE.description,
    isPartOf: {
      "@type": "WebSite",
      url: SITE.url,
      name: SITE.title,
      description: SITE.description,
    },
  },
};

export const OG = {
  locale: "en_US",
  type: "website",
  url: SITE.url,
  title: `${SITE.title}: Monitor long-running commands with intelligence`,
  description: "OpenCode plugin for awaiting long-running commands with polling, log capture, and AI summarization. Monitor and summarize slow processes automatically.",
  image: ogImageSrc,
};

export const partnersData = [];