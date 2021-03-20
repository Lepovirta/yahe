const fs = require('fs');

const [version, target, ...sources] = process.argv.slice(2);

// Build manifest from sources
const manifest = {};
sources.forEach((filename) => {
  const data = fs.readFileSync(filename, 'utf-8');
  Object.assign(manifest, JSON.parse(data));
});

// Set version
manifest.version = version;

// Write manifest to target
fs.writeFileSync(target, JSON.stringify(manifest, null, 4));
