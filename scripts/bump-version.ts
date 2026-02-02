#!/usr/bin/env bun

/**
 * Version bump utility for opencode-await
 * Usage: bun scripts/bump-version.ts [major|minor|patch]
 */

async function main() {
  const args = Bun.argv.slice(2);
  const bumpType = args[0];

  if (!bumpType || bumpType === '--help' || !['major', 'minor', 'patch'].includes(bumpType)) {
    console.log(`
Usage: bun scripts/bump-version.ts [major|minor|patch]

Examples:
  bun scripts/bump-version.ts patch  # 0.1.0 -> 0.1.1
  bun scripts/bump-version.ts minor  # 0.1.0 -> 0.2.0
  bun scripts/bump-version.ts major  # 0.1.0 -> 1.0.0
`);
    process.exit(bumpType === '--help' ? 0 : 1);
  }

  const pkgPath = new URL('../package.json', import.meta.url).pathname;
  const pkg = await Bun.file(pkgPath).json();
  const currentVersion = pkg.version;

  const [major, minor, patch] = currentVersion.split('.').map(Number);

  let newVersion: string;
  switch (bumpType) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
    default:
      throw new Error(`Invalid bump type: ${bumpType}`);
  }

  pkg.version = newVersion;
  await Bun.write(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

  console.log(`Bumped version: ${currentVersion} -> ${newVersion}`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});