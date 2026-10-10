const fs = require('fs');
const path = require('path');

const binaryPath = path.resolve(
  __dirname,
  '../node_modules/fb-dotslash/bin/linux-musl.x86_64/dotslash'
);

if (fs.existsSync(binaryPath)) {
  fs.chmodSync(binaryPath, 0o755);
}