#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function bundleAndMinify(entryPoint, format) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bundle-'));
  const outFile = path.join(tempDir, 'bundle.js');
  
  const result = spawnSync('bun', [
    'build',
    entryPoint,
    '--outfile', outFile,
    '--format', format,
    '--minify',
    '--target', 'browser'
  ], { encoding: 'utf8' });
  
  if (result.status !== 0) {
    console.error(`Failed to bundle ${format}:`, result.stderr);
    fs.rmSync(tempDir, { recursive: true, force: true });
    return 0;
  }
  
  const stats = fs.statSync(outFile);
  const size = stats.size;
  
  fs.rmSync(tempDir, { recursive: true, force: true });
  return size;
}

const srcPath = path.join(__dirname, '..', 'src', 'index.ts');

if (!fs.existsSync(srcPath)) {
  console.error('❌ Error: src/index.ts not found.');
  process.exit(1);
}

console.log('\n📦 Bundling and minifying...\n');

const esmSize = bundleAndMinify(srcPath, 'esm');
const cjsSize = bundleAndMinify(srcPath, 'cjs');

console.log('📦 Bundle Size Report\n');
console.log('━'.repeat(50));
console.log(`ESM (minified):         ${formatBytes(esmSize)}`);
console.log(`CJS (minified):         ${formatBytes(cjsSize)}`);
console.log('━'.repeat(50));
console.log('');

const warningThreshold = 20 * 1024; // 20 KB
const maxSize = Math.max(esmSize, cjsSize);
if (maxSize > warningThreshold) {
  console.log(`⚠️  Warning: Bundle size exceeds ${formatBytes(warningThreshold)}`);
  process.exit(1);
}

console.log('✅ Bundle size check passed');
