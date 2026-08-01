const { execSync } = require('child_process');

try {
  execSync('npx tsc -p tsconfig.json && npx tsc-alias', { stdio: 'inherit' });
  execSync('node ./public/dist/index.js', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
  });
} catch (err) {
  process.exit(1);
}
