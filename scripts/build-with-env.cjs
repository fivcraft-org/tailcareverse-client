#!/usr/bin/env node
// scripts/build-with-env.js
// Usage: node scripts/build-with-env.js dev
// or add npm scripts to call it

const { spawnSync } = require('child_process');
const { copyFileSync, existsSync, unlinkSync, renameSync, rmSync } = require('fs');
const path = require('path');

function die(msg) {
  console.error(msg);
  process.exit(1);
}

const env = process.argv[2];
if (!env) die('Usage: node scripts/build-with-env.js <dev|stage|prod>');

const allowed = { dev: '.env.dev', stage: '.env.stage', prod: '.env.prod' };
const envFile = allowed[env];
if (!envFile) die(`Unknown env "${env}". Use one of: ${Object.keys(allowed).join(', ')}`);

const root = process.cwd();
const srcEnvPath = path.join(root, envFile);
const tmpEnvPath = path.join(root, '.env');
const distName = 'dist';
const outName = `dist-${env}`;

if (!existsSync(srcEnvPath)) die(`${envFile} not found in project root (${srcEnvPath})`);

// 1) copy selected env to .env
console.log(`Copying ${envFile} -> .env`);
copyFileSync(srcEnvPath, tmpEnvPath);

// 2) run build (assumes npm run build produces "dist/" in project root)
console.log('Running build: npm run build');
const build = spawnSync('npm', ['run', 'build'], { stdio: 'inherit', shell: true });
if (build.status !== 0) {
  // cleanup .env
  try { unlinkSync(tmpEnvPath); } catch (e) { }
  die('Build failed (exit code ' + build.status + ')');
}

// 3) rename dist -> dist-<env> (remove if exists)
const distPath = path.join(root, distName);
const outPath = path.join(root, outName);

if (!existsSync(distPath)) {
  // cleanup .env
  try { unlinkSync(tmpEnvPath); } catch (e) { }
  die(`Expected build output "${distName}/" not found after build.`);
}

if (existsSync(outPath)) {
  console.log(`Removing existing ${outName}/`);
  // node 14+: rmSync(outPath, { recursive:true, force:true })
  rmSync(outPath, { recursive: true, force: true });
}

console.log(`Renaming ${distName} -> ${outName}`);
renameSync(distPath, outPath);

// 4) cleanup temp .env
try {
  unlinkSync(tmpEnvPath);
  console.log('Removed temporary .env');
} catch (e) {
  console.warn('Could not remove temporary .env:', e.message);
}

console.log(`Build complete. Output: ${outName}/`);
process.exit(0);

