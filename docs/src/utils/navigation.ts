// An array of links for navigation bar
const navBarLinks = [
  { name: "Home", url: "/" },
  { name: "Docs", url: "/getting-started/installation/" },
];
// An array of links for footer
const footerLinks = [
  {
    section: "Plugin",
    links: [
      { name: "Documentation", url: "/getting-started/installation/" },
      { name: "Quick Start", url: "/getting-started/quick-start/" },
    ],
  },
  {
    section: "Source",
    links: [
      { name: "GitHub", url: "https://github.com/rothnic/opencode-await" },
    ],
  },
];
// An object of links for social icons
const socialLinks = {
  github: "https://github.com/rothnic/opencode-await",
};

export default {
  navBarLinks,
  footerLinks,
  socialLinks,
};