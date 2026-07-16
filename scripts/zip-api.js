/**
 * zip-api.js
 * Programmatically zips apps/api/ including node_modules
 */
'use strict';

const fs = require('fs');
const path = require('path');
const archiver = require('C:/Users/WELCOME/AppData/Roaming/npm/node_modules/zcatalyst-cli/node_modules/archiver');

const zipPath = path.resolve(process.env.USERPROFILE, 'Desktop/crimepulse-api.zip');
const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`✅ Created zip successfully: ${zipPath} (${Math.round(archive.pointer() / 1024 / 1024 * 100) / 100} MB)`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Add files and directories
archive.directory(path.resolve(__dirname, '../apps/api/dist'), 'dist');
archive.directory(path.resolve(__dirname, '../apps/api/node_modules'), 'node_modules');
archive.file(path.resolve(__dirname, '../apps/api/package.json'), { name: 'package.json' });
archive.file(path.resolve(__dirname, '../apps/api/package-lock.json'), { name: 'package-lock.json' });

archive.finalize();
